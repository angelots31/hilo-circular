import { Router } from 'express'
import { q } from '../db.js'
import { asincrono, camelizarFilas } from '../util.js'

const router = Router()

/** Devuelve YYYY-MM-DD en la zona horaria del servidor. */
const hoy = () => new Date().toISOString().slice(0, 10)

const listaSlugs = (valor) => String(valor || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter((s) => /^[a-z-]{2,40}$/.test(s))

/** Consulta con marcadores $1..$n (más portable que ANY con arreglos). */
const porSlugs = (slugs) =>
  q(`SELECT * FROM telas WHERE slug IN (${slugs.map((_, i) => `$${i + 1}`).join(',')})`, slugs)

// GET /api/telas?m=algodon,poliester  (público, cacheable 1 hora)
router.get('/telas', asincrono(async (req, res) => {
  const pedidas = listaSlugs(req.query.m)
  const { rows } = pedidas.length
    ? await porSlugs(pedidas)
    : await q('SELECT * FROM telas ORDER BY nombre ASC')

  // Respeta el orden en que llegaron los materiales del QR.
  const fichas = camelizarFilas(rows)
  if (pedidas.length) {
    fichas.sort((a, b) => pedidas.indexOf(a.slug) - pedidas.indexOf(b.slug))
  }

  res.set('Cache-Control', 'public, max-age=3600')
  res.json({ telas: fichas })
}))

// POST /api/qr/visita  → suma uno al contador del día. No guarda datos personales.
router.post('/qr/visita', asincrono(async (_req, res) => {
  await q(
    `INSERT INTO qr_visitas (dia, conteo) VALUES ($1, 1)
     ON CONFLICT (dia) DO UPDATE SET conteo = qr_visitas.conteo + 1`,
    [hoy()],
  )
  res.status(201).json({ ok: true })
}))

export default router
