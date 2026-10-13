import { Router } from 'express'
import { q } from '../db.js'
import { authRequerida } from '../auth.js'
import { asincrono, camelizar, errorHttp } from '../util.js'

const router = Router()

const generarGuia = () => `HC-${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(10 + Math.random() * 89)}`

async function notificar(usuarioId, tipo, texto, destino = null) {
  if (!usuarioId) return
  await q(
    'INSERT INTO notificaciones (usuario_id, tipo, texto, fecha, destino) VALUES ($1,$2,$3,$4,$5)',
    [usuarioId, tipo, texto, 'Ahora', destino],
  )
}

async function recalcularReputacion(usuarioId) {
  await q(
    `UPDATE usuarios SET reputacion = COALESCE((SELECT ROUND(AVG(estrellas)::numeric, 1) FROM resenas WHERE para_id = $1), 5.0)
      WHERE id = $1`,
    [usuarioId],
  )
}

/* ------------------------------------------------------------- reseñas */

// POST /api/resenas
router.post('/resenas', authRequerida, asincrono(async (req, res) => {
  const { paraId, prendaId, estrellas, texto } = req.body || {}
  const nota = Number(estrellas)
  if (!paraId) throw errorHttp(400, 'Elige a quién le quieres dejar la reseña.')
  if (paraId === req.usuario.id) throw errorHttp(400, 'No puedes calificarte a ti misma/o.')
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) throw errorHttp(400, 'La calificación debe ser de 1 a 5 estrellas.')
  if (String(texto || '').trim().length < 20) throw errorHttp(400, 'Cuéntanos un poco más: mínimo 20 caracteres.')

  const { rows } = await q(
    `INSERT INTO resenas (autor_id, para_id, prenda_id, estrellas, texto)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [req.usuario.id, paraId, prendaId || null, nota, String(texto).trim()],
  )
  await recalcularReputacion(paraId)
  await notificar(paraId, 'resena', `${req.usuario.nombre} dejó una reseña de ${nota} ${nota === 1 ? 'estrella' : 'estrellas'} en tu perfil.`, '/resenas')
  res.status(201).json({ resena: camelizar(rows[0]) })
}))

// PUT /api/resenas/:id/respuesta
router.put('/resenas/:id/respuesta', authRequerida, asincrono(async (req, res) => {
  const { rows: previas } = await q('SELECT * FROM resenas WHERE id = $1', [req.params.id])
  const resena = previas[0]
  if (!resena) throw errorHttp(404, 'Esa reseña no existe.')
  if (resena.para_id !== req.usuario.id && req.usuario.rol !== 'admin') throw errorHttp(403, 'Solo la persona reseñada puede responder.')
  const { rows } = await q('UPDATE resenas SET respuesta = $2 WHERE id = $1 RETURNING *', [resena.id, String(req.body?.respuesta || '').trim()])
  res.json({ resena: camelizar(rows[0]) })
}))

// PATCH /api/resenas/:id/reportada
router.patch('/resenas/:id/reportada', authRequerida, asincrono(async (req, res) => {
  const valor = typeof req.body?.valor === 'boolean' ? req.body.valor : null
  const { rows } = await q(
    'UPDATE resenas SET reportada = COALESCE($2, NOT reportada) WHERE id = $1 RETURNING *',
    [req.params.id, valor],
  )
  if (!rows[0]) throw errorHttp(404, 'Esa reseña no existe.')
  res.json({ resena: camelizar(rows[0]) })
}))

// POST /api/resenas/:id/util
router.post('/resenas/:id/util', asincrono(async (req, res) => {
  const { rows } = await q('UPDATE resenas SET util = util + 1 WHERE id = $1 RETURNING *', [req.params.id])
  if (!rows[0]) throw errorHttp(404, 'Esa reseña no existe.')
  res.json({ resena: camelizar(rows[0]) })
}))

/* --------------------------------------------------------- intercambios */

// POST /api/intercambios
router.post('/intercambios', authRequerida, asincrono(async (req, res) => {
  const { prendaId, ofreceId, mensaje } = req.body || {}
  if (!prendaId || !ofreceId) throw errorHttp(400, 'Faltan la prenda solicitada o la que ofreces.')

  const { rows: pedida } = await q('SELECT * FROM prendas WHERE id = $1', [prendaId])
  const objetivo = pedida[0]
  const { rows: ofrecida } = await q('SELECT * FROM prendas WHERE id = $1', [ofreceId])
  const mia = ofrecida[0]
  if (!objetivo || !mia) throw errorHttp(404, 'Alguna de las prendas ya no existe.')
  if (objetivo.dueno_id === req.usuario.id) throw errorHttp(400, 'Esa prenda ya es tuya.')
  if (mia.dueno_id !== req.usuario.id) throw errorHttp(403, 'Solo puedes ofrecer prendas de tu clóset.')
  if (!objetivo.disponible) throw errorHttp(409, 'La prenda que quieres ya no está disponible.')

  const { rows } = await q(
    `INSERT INTO intercambios (prenda_id, ofrece_id, solicitante_id, receptor_id, mensaje)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [prendaId, ofreceId, req.usuario.id, objetivo.dueno_id, String(mensaje || '')],
  )
  await notificar(objetivo.dueno_id, 'solicitud', `${req.usuario.nombre} quiere intercambiar ${mia.titulo} por ${objetivo.titulo}.`, '/intercambios')
  res.status(201).json({ intercambio: camelizar(rows[0]) })
}))

// PATCH /api/intercambios/:id/estado
router.patch('/intercambios/:id/estado', authRequerida, asincrono(async (req, res) => {
  const estado = String(req.body?.estado || '')
  const permitidos = ['Aceptado', 'Rechazado', 'Completado', 'Cancelado']
  if (!permitidos.includes(estado)) throw errorHttp(400, 'Estado de intercambio no válido.')

  const { rows: previas } = await q('SELECT * FROM intercambios WHERE id = $1', [req.params.id])
  const x = previas[0]
  if (!x) throw errorHttp(404, 'Ese intercambio no existe.')
  const soyReceptor = x.receptor_id === req.usuario.id
  const soySolicitante = x.solicitante_id === req.usuario.id
  if (!soyReceptor && !soySolicitante) throw errorHttp(403, 'No participas en este intercambio.')
  if (soyReceptor && !['Aceptado', 'Rechazado'].includes(estado)) throw errorHttp(403, 'Quien recibe solo puede aceptar o rechazar.')
  if (soySolicitante && estado !== 'Cancelado' && !soyReceptor) throw errorHttp(403, 'Quien solicita solo puede cancelar.')

  const { rows } = await q(
    `UPDATE intercambios SET estado = $2 WHERE id = $1 RETURNING *`,
    [x.id, estado],
  )
  const otro = soyReceptor ? x.solicitante_id : x.receptor_id
  const mensajes = { Aceptado: 'Tu solicitud fue aceptada.', Rechazado: 'Tu solicitud fue rechazada.', Cancelado: 'La solicitud fue cancelada.' }
  if (estado !== 'Completado') await notificar(otro, 'solicitud', mensajes[estado] || `Tu intercambio quedó en estado «${estado}».`, '/intercambios')
  if (estado === 'Completado') {
    await q('UPDATE usuarios SET intercambios = intercambios + 1 WHERE id IN ($1,$2)', [x.solicitante_id, x.receptor_id])
  }
  res.json({ intercambio: camelizar(rows[0]) })
}))

/* ------------------------------------------------------------- pedidos */

// POST /api/pedidos
router.post('/pedidos', authRequerida, asincrono(async (req, res) => {
  const b = req.body || {}
  if (!b.prendaId) throw errorHttp(400, 'Falta la prenda del envío.')
  const { rows } = await q(
    `INSERT INTO pedidos
      (prenda_id, usuario_id, receptor_id, intercambio_id, metodo, ciudad, costo, transportadora, guia)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      b.prendaId,
      req.usuario.id,
      b.receptorId || null,
      b.intercambioId || null,
      b.metodo || 'Domicilio',
      'Medellín',
      Number(b.costo) || 0,
      b.transportadora || 'Servientrega',
      b.guia || generarGuia(),
    ],
  )
  await notificar(b.receptorId, 'envio', `Se programó el envío de una prenda con guía ${rows[0].guia}.`, '/panel?seccion=envios')
  res.status(201).json({ pedido: camelizar(rows[0]) })
}))

// PATCH /api/pedidos/:id/estado
router.patch('/pedidos/:id/estado', authRequerida, asincrono(async (req, res) => {
  const estado = String(req.body?.estado || '')
  if (!['Preparando', 'En camino', 'Entregado', 'Incidencia'].includes(estado)) throw errorHttp(400, 'Estado de envío no válido.')
  const { rows: previos } = await q('SELECT * FROM pedidos WHERE id = $1', [req.params.id])
  const pedido = previos[0]
  if (!pedido) throw errorHttp(404, 'Ese envío no existe.')
  const participa = [pedido.usuario_id, pedido.receptor_id].includes(req.usuario.id)
  if (!participa && req.usuario.rol !== 'admin') throw errorHttp(403, 'No participas en este envío.')
  const { rows } = await q('UPDATE pedidos SET estado = $2 WHERE id = $1 RETURNING *', [pedido.id, estado])
  const otro = pedido.usuario_id === req.usuario.id ? pedido.receptor_id : pedido.usuario_id
  await notificar(otro, 'envio', `El envío ${pedido.guia} quedó en estado «${estado}».`, '/panel?seccion=envios')
  res.json({ pedido: camelizar(rows[0]) })
}))

/* ------------------------------------------------------------ reportes */

// PATCH /api/reportes/:id/estado  (admin)
router.patch('/reportes/:id/estado', authRequerida, asincrono(async (req, res) => {
  if (req.usuario.rol !== 'admin') throw errorHttp(403, 'Esta acción es solo para el equipo.')
  const estado = String(req.body?.estado || '')
  if (!['En revisión', 'Escalado', 'Resuelto'].includes(estado)) throw errorHttp(400, 'Estado de reporte no válido.')
  const { rows } = await q('UPDATE reportes SET estado = $2 WHERE id = $1 RETURNING *', [req.params.id, estado])
  if (!rows[0]) throw errorHttp(404, 'Ese reporte no existe.')
  res.json({ reporte: camelizar(rows[0]) })
}))

export default router
