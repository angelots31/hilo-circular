import { Router } from 'express'
import { q, tx } from '../db.js'
import { authRequerida, soloAdmin } from '../auth.js'
import { asincrono, camelizar, errorHttp, LIMITE_FOTOS } from '../util.js'
import { prendaProtegida } from './datos.js'

const router = Router()

const aNumero = (v, def = 0) => {
  const n = Number(String(v ?? '').replace(/[^0-9.,-]/g, '').replace(/\.(?=.*\.)/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : def
}
const aArray = (v, max = 99) => (Array.isArray(v) ? v.slice(0, max).map(String) : [])

const MAX_MATERIALES = 4
const MATERIAL_VALIDO = /^[a-z-]{2,40}$/

/**
 * Materiales de la prenda: hasta 4 claves que existan en la wiki de telas.
 * Es opcional: una prenda sin datos también se publica.
 */
async function normalizarComposicion(valor) {
  if (valor == null) return []
  if (!Array.isArray(valor)) throw errorHttp(400, 'Los materiales deben venir en una lista.')
  const claves = [...new Set(valor.map((v) => String(v).trim().toLowerCase()))].filter(Boolean)
  if (!claves.length) return []
  if (claves.length > MAX_MATERIALES) throw errorHttp(400, `Puedes indicar hasta ${MAX_MATERIALES} materiales.`)
  if (claves.some((c) => !MATERIAL_VALIDO.test(c))) throw errorHttp(400, 'Hay un material que no reconocemos.')
  const { rows } = await q(
    `SELECT slug FROM telas WHERE slug IN (${claves.map((_, i) => `$${i + 1}`).join(',')})`,
    claves,
  )
  if (rows.length !== claves.length) throw errorHttp(400, 'Hay un material que no está en la wiki de telas.')
  return claves
}

/** Comprueba que quien pide sea el dueño de la prenda o un admin. */
async function exigeDueno(req, id) {
  const { rows } = await q('SELECT * FROM prendas WHERE id = $1', [id])
  const prenda = rows[0]
  if (!prenda) throw errorHttp(404, 'Esa prenda no existe.')
  if (prenda.dueno_id !== req.usuario.id && req.usuario.rol !== 'admin') {
    throw errorHttp(403, 'No puedes modificar una prenda que no es tuya.')
  }
  return prenda
}

// POST /api/prendas
router.post('/', authRequerida, asincrono(async (req, res) => {
  const b = req.body || {}
  if (String(b.titulo || '').trim().length < 6) throw errorHttp(400, 'El título debe tener al menos 6 caracteres.')
  if (!b.categoria || !b.talla) throw errorHttp(400, 'Faltan la categoría o la talla.')

  // Audio explicativo opcional: debe ser una URL de la nube (Cloudinary).
  const audio = typeof b.audio === 'string' && /^https?:\/\//.test(b.audio.trim()) ? b.audio.trim() : null
  const composicion = await normalizarComposicion(b.composicion)

  const { rows } = await q(
    `INSERT INTO prendas
      (titulo, tipo, categoria, talla, estado, color, marca, valor, descripcion,
       dueno_id, ciudad, barrio, disponible, destacada, fotos, paleta, audio, composicion)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     RETURNING *`,
    [
      String(b.titulo).trim(),
      b.tipo || 'camiseta',
      b.categoria,
      b.talla,
      b.estado || 'Buen estado',
      b.color || null,
      b.marca || null,
      aNumero(b.valor),
      String(b.descripcion || ''),
      req.usuario.id,
      'Medellín',
      b.barrio || req.usuario.barrio || null,
      b.disponible !== false,
      // Solo el equipo puede publicar una prenda ya destacada; el resto queda
      // como candidata para la curaduría.
      req.usuario.rol === 'admin' && Boolean(b.destacada),
      aArray(b.fotos, LIMITE_FOTOS),
      aArray(b.paleta, 4),
      audio,
      composicion,
    ],
  )
  // Si la persona pide curaduría al publicar, se crea la solicitud para el equipo.
  if (req.usuario.rol !== 'admin' && Boolean(b.destacada)) {
    await q(
      "INSERT INTO reportes (tipo, motivo, prenda_id, usuario_id, estado) VALUES ('Prenda', 'Postulación a destacado', $1, $2, 'En revisión')",
      [rows[0].id, req.usuario.id],
    )
    const { rows: admins } = await q("SELECT id FROM usuarios WHERE rol = 'admin' AND estado = 'activo'")
    for (const admin of admins) {
      await q(
        'INSERT INTO notificaciones (usuario_id, tipo, texto, fecha, destino) VALUES ($1,$2,$3,$4,$5)',
        [admin.id, 'sistema', `${req.usuario.nombre} postuló «${rows[0].titulo}» para el catálogo destacado.`, 'Ahora', '/admin/reportes'],
      )
    }
  }
  res.status(201).json({ prenda: camelizar(rows[0]) })
}))

// POST /api/prendas/importar  (admin)
router.post('/importar', authRequerida, soloAdmin, asincrono(async (req, res) => {
  const lista = Array.isArray(req.body?.prendas) ? req.body.prendas : []
  if (!lista.length) throw errorHttp(400, 'No hay prendas para importar.')

  const creadas = await tx(async (cliente) => {
    const salida = []
    for (const p of lista.slice(0, 500)) {
      if (!String(p?.titulo || '').trim()) continue
      const composicion = Array.isArray(p.composicion) ? p.composicion.slice(0, MAX_MATERIALES).map(String) : []
      const { rows } = await cliente.query(
        `INSERT INTO prendas
          (titulo, tipo, categoria, talla, estado, color, marca, valor, descripcion,
           dueno_id, ciudad, barrio, disponible, destacada, fotos, paleta, composicion)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         RETURNING *`,
        [
          String(p.titulo).trim(), p.tipo || 'camiseta', p.categoria || 'Accesorios', p.talla || 'Única',
          p.estado || 'Buen estado', p.color || null, p.marca || null, aNumero(p.valor),
          String(p.descripcion || 'Prenda importada.'), p.duenoId || req.usuario.id,
          'Medellín', p.barrio || null, p.disponible !== false, Boolean(p.destacada),
          aArray(p.fotos, LIMITE_FOTOS), aArray(p.paleta, 4), composicion,
        ],
      )
      salida.push(camelizar(rows[0]))
    }
    return salida
  })
  res.status(201).json({ prendas: creadas, total: creadas.length })
}))

// PATCH /api/prendas/:id/disponible
router.patch('/:id/disponible', authRequerida, asincrono(async (req, res) => {
  const prenda = await exigeDueno(req, req.params.id)
  const { rows } = await q('UPDATE prendas SET disponible = $2 WHERE id = $1 RETURNING *', [prenda.id, !prenda.disponible])
  res.json({ prenda: camelizar(rows[0]) })
}))

// PATCH /api/prendas/:id/destacada  (admin)
router.patch('/:id/destacada', authRequerida, asincrono(async (req, res) => {
  const esAdmin = req.usuario.rol === 'admin'
  const { rows: previas } = await q('SELECT * FROM prendas WHERE id = $1', [req.params.id])
  const actual = previas[0]
  if (!actual) throw errorHttp(404, 'Esa prenda no existe.')
  // Un admin puede destacar cualquier prenda; el dueño solo puede postular la suya.
  if (!esAdmin && actual.dueno_id !== req.usuario.id) throw errorHttp(403, 'Esta prenda no es tuya.')

  const quiereDestacar = typeof req.body?.valor === 'boolean' ? req.body.valor : !actual.destacada
  if (!esAdmin && quiereDestacar) {
    const { rows: abiertas } = await q(
      "SELECT id FROM reportes WHERE prenda_id = $1 AND tipo = 'Prenda' AND motivo = 'Postulación a destacado' AND estado <> 'Resuelto' LIMIT 1",
      [actual.id],
    )
    if (abiertas.length) throw errorHttp(409, 'Esta prenda ya está postulada para la curaduría.')
    await q(
      "INSERT INTO reportes (tipo, motivo, prenda_id, usuario_id, estado) VALUES ('Prenda', 'Postulación a destacado', $1, $2, 'En revisión')",
      [actual.id, req.usuario.id],
    )
    const { rows: admins } = await q("SELECT id FROM usuarios WHERE rol = 'admin' AND estado = 'activo'")
    for (const admin of admins) {
      await q(
        'INSERT INTO notificaciones (usuario_id, tipo, texto, fecha, destino) VALUES ($1,$2,$3,$4,$5)',
        [admin.id, 'sistema', `${req.usuario.nombre} postuló «${actual.titulo}» para el catálogo destacado.`, 'Ahora', '/admin/reportes'],
      )
    }
    return res.json({ prenda: camelizar(actual), solicitud: true })
  }

  const { rows } = await q('UPDATE prendas SET destacada = $2 WHERE id = $1 RETURNING *', [actual.id, quiereDestacar])
  res.json({ prenda: camelizar(rows[0]) })
}))

// DELETE /api/prendas/:id
router.delete('/:id', authRequerida, asincrono(async (req, res) => {
  await exigeDueno(req, req.params.id)
  if (await prendaProtegida(req.params.id)) {
    throw errorHttp(409, 'Esta prenda tiene pedidos o intercambios registrados y no se puede eliminar. Puedes pausarla.')
  }
  await q('DELETE FROM prendas WHERE id = $1', [req.params.id])
  res.json({ ok: true })
}))

// POST /api/prendas/:id/favorito  (alterna)
router.post('/:id/favorito', authRequerida, asincrono(async (req, res) => {
  const { rows } = await q('SELECT 1 FROM favoritos WHERE usuario_id = $1 AND prenda_id = $2', [req.usuario.id, req.params.id])
  if (rows.length) {
    await q('DELETE FROM favoritos WHERE usuario_id = $1 AND prenda_id = $2', [req.usuario.id, req.params.id])
    return res.json({ activo: false })
  }
  await q('INSERT INTO favoritos (usuario_id, prenda_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.usuario.id, req.params.id])
  res.json({ activo: true })
}))

// POST /api/prendas/:id/vista
router.post('/:id/vista', asincrono(async (req, res) => {
  await q('UPDATE prendas SET vistas = vistas + 1 WHERE id = $1', [req.params.id])
  res.json({ ok: true })
}))

export default router
