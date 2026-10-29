import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { q } from '../db.js'
import { asincrono, errorHttp } from '../util.js'
import { responderPregunta } from '../ia.js'

const router = Router()

const MAX_PREGUNTA = 300
const TOPE_DIARIO = () => Math.max(1, Number(process.env.IA_TOPE_DIARIO) || 300)

const hoy = () => new Date().toISOString().slice(0, 10)
const MENSAJE_LIMITE = 'Llegaste al límite de preguntas por ahora. El asistente vuelve a estar disponible más tarde.'

// 5 preguntas cada 10 minutos por IP.
const limiteCorto = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Hiciste varias preguntas seguidas. Espera unos minutos y vuelve a intentarlo.' },
})

// 30 preguntas al día por IP.
const limiteDiario = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: MENSAJE_LIMITE },
})

const listaSlugs = (valor) => String(valor || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter((s) => /^[a-z-]{2,40}$/.test(s))
  .slice(0, 6)

// POST /api/conciencia/pregunta
router.post('/conciencia/pregunta', limiteCorto, limiteDiario, asincrono(async (req, res) => {
  const pregunta = String(req.body?.pregunta ?? '').replace(/\s+/g, ' ').trim()
  if (pregunta.length < 3) throw errorHttp(400, 'Escribe una pregunta un poco más larga.')
  if (pregunta.length > MAX_PREGUNTA) throw errorHttp(400, `La pregunta no puede pasar de ${MAX_PREGUNTA} caracteres.`)

  // Solo se aceptan materiales que existan en la wiki.
  const pedidas = listaSlugs(req.body?.materiales)
  const { rows } = pedidas.length
    ? await q(`SELECT * FROM telas WHERE slug IN (${pedidas.map((_, i) => `$${i + 1}`).join(',')})`, pedidas)
    : await q('SELECT * FROM telas ORDER BY nombre ASC LIMIT 4')

  // Tope diario global: se cuenta antes de llamar a la API.
  const { rows: uso } = await q(
    `INSERT INTO ia_uso (dia, preguntas) VALUES ($1, 1)
     ON CONFLICT (dia) DO UPDATE SET preguntas = ia_uso.preguntas + 1
     RETURNING preguntas`,
    [hoy()],
  )
  if ((uso[0]?.preguntas ?? 0) > TOPE_DIARIO()) {
    throw errorHttp(429, 'El asistente alcanzó su límite de preguntas por hoy. Vuelve mañana.')
  }

  let texto
  try {
    texto = await responderPregunta({ pregunta, fichas: rows })
  } catch (error) {
    if (error.codigo === 'sin-llave') {
      throw errorHttp(503, 'El asistente todavía no está configurado. Mientras tanto, las fichas de abajo tienen la información.')
    }
    console.error('[ia]', error.message)
    throw errorHttp(502, 'El asistente no pudo responder ahora. Inténtalo de nuevo en un momento.')
  }

  res.json({
    respuesta: texto,
    fuentes: rows.map((f) => ({ slug: f.slug, nombre: f.nombre, fuentes: f.fuentes })),
  })
}))

export default router
