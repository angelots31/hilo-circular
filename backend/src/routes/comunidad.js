import { Router } from 'express'
import { q } from '../db.js'
import { authRequerida } from '../auth.js'
import { asincrono, camelizar, camelizarFilas, errorHttp } from '../util.js'

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
  const { rows } = await q('SELECT AVG(estrellas)::numeric AS promedio FROM resenas WHERE para_id = $1', [usuarioId])
  const promedio = rows[0]?.promedio == null ? 5 : Math.round(Number(rows[0].promedio) * 10) / 10
  await q('UPDATE usuarios SET reputacion = $2 WHERE id = $1', [usuarioId, promedio])
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

  // Solo se califica a alguien con quien ya existe un intercambio aceptado.
  const { rows: vinculos } = await q(
    `SELECT 1 FROM intercambios
      WHERE ((solicitante_id = $1 AND receptor_id = $2) OR (solicitante_id = $2 AND receptor_id = $1))
        AND estado IN ('Aceptado', 'Completado')
      LIMIT 1`,
    [req.usuario.id, paraId],
  )
  if (!vinculos.length) throw errorHttp(403, 'Solo puedes reseñar a alguien con quien ya hayas aceptado un intercambio.')

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
  if (!mia.disponible) throw errorHttp(409, 'La prenda que ofreces está pausada. Actívala antes de proponer el intercambio.')

  const { rows } = await q(
    `INSERT INTO intercambios (prenda_id, ofrece_id, solicitante_id, receptor_id, mensaje)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [prendaId, ofreceId, req.usuario.id, objetivo.dueno_id, String(mensaje || '')],
  )
  // El mensaje de la propuesta también abre la conversación del intercambio.
  const textoInicial = String(mensaje || '').trim()
  if (textoInicial) {
    await q(
      'INSERT INTO mensajes (intercambio_id, autor_id, texto) VALUES ($1,$2,$3)',
      [rows[0].id, req.usuario.id, textoInicial],
    )
  }
  await notificar(objetivo.dueno_id, 'solicitud', `${req.usuario.nombre} quiere intercambiar ${mia.titulo} por ${objetivo.titulo}.`, '/intercambios')
  res.status(201).json({ intercambio: camelizar(rows[0]) })
}))

/* ------------------------------------------------------------- mensajes */

/** Comprueba que la persona participe en el intercambio (o sea admin). */
async function intercambioVisible(req, id) {
  const { rows } = await q('SELECT * FROM intercambios WHERE id = $1', [id])
  const x = rows[0]
  if (!x) throw errorHttp(404, 'Ese intercambio no existe.')
  const participa = x.solicitante_id === req.usuario.id || x.receptor_id === req.usuario.id
  if (!participa && req.usuario.rol !== 'admin') throw errorHttp(403, 'No participas en este intercambio.')
  return x
}

// GET /api/intercambios/:id/mensajes
router.get('/intercambios/:id/mensajes', authRequerida, asincrono(async (req, res) => {
  const x = await intercambioVisible(req, req.params.id)
  const { rows } = await q(
    'SELECT * FROM mensajes WHERE intercambio_id = $1 ORDER BY creada ASC, id ASC',
    [x.id],
  )
  res.json({ mensajes: camelizarFilas(rows) })
}))

// POST /api/intercambios/:id/mensajes
router.post('/intercambios/:id/mensajes', authRequerida, asincrono(async (req, res) => {
  const x = await intercambioVisible(req, req.params.id)
  const texto = String(req.body?.texto || '').trim()
  if (!texto) throw errorHttp(400, 'Escribe un mensaje antes de enviarlo.')
  if (texto.length > 1200) throw errorHttp(400, 'El mensaje es demasiado largo (máximo 1200 caracteres).')

  const { rows } = await q(
    'INSERT INTO mensajes (intercambio_id, autor_id, texto) VALUES ($1,$2,$3) RETURNING *',
    [x.id, req.usuario.id, texto],
  )
  const otro = x.solicitante_id === req.usuario.id ? x.receptor_id : x.solicitante_id
  const resumen = texto.length > 90 ? `${texto.slice(0, 87)}…` : texto
  await notificar(otro, 'mensaje', `${req.usuario.nombre}: ${resumen}`, `/intercambios?chat=${x.id}`)
  res.status(201).json({ mensaje: camelizar(rows[0]) })
}))

/* ------------------------------------------------------------ suscripciones */

// POST /api/suscripciones  → agenda de talleres desde el pie
router.post('/suscripciones', asincrono(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw errorHttp(400, 'Escribe un correo electrónico válido.')
  await q('INSERT INTO suscriptores (email) VALUES ($1) ON CONFLICT (email) DO NOTHING', [email])
  res.status(201).json({ ok: true })
}))

/* --------------------------------------------------------- notificaciones */

// PATCH /api/notificaciones/leidas  → marca todas como leídas
router.patch('/notificaciones/leidas', authRequerida, asincrono(async (req, res) => {
  await q('UPDATE notificaciones SET leida = true WHERE usuario_id = $1', [req.usuario.id])
  res.json({ ok: true })
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
  if (x.estado === 'Completado') throw errorHttp(409, 'Este intercambio ya está completado.')
  if (x.estado === 'Cancelado' || x.estado === 'Rechazado') throw errorHttp(409, 'Este intercambio ya está cerrado.')
  if (soyReceptor && !['Aceptado', 'Rechazado', 'Completado'].includes(estado)) {
    throw errorHttp(403, 'Quien recibe solo puede aceptar, rechazar o completar el intercambio.')
  }
  if (soySolicitante && !soyReceptor && !['Cancelado', 'Completado'].includes(estado)) {
    throw errorHttp(403, 'Quien solicita solo puede cancelar o completar el intercambio.')
  }
  if (estado === 'Completado' && x.estado !== 'Aceptado') {
    throw errorHttp(409, 'Primero deben aceptar el intercambio antes de completarlo.')
  }
  if (estado === 'Aceptado' && x.estado !== 'Pendiente') {
    throw errorHttp(409, 'Esta solicitud ya no está pendiente.')
  }

  const { rows } = await q(
    `UPDATE intercambios SET estado = $2 WHERE id = $1 RETURNING *`,
    [x.id, estado],
  )
  const otro = soyReceptor ? x.solicitante_id : x.receptor_id
  const mensajes = { Aceptado: 'Tu solicitud fue aceptada.', Rechazado: 'Tu solicitud fue rechazada.', Cancelado: 'La solicitud fue cancelada.' }
  await notificar(
    otro,
    'solicitud',
    estado === 'Completado'
      ? 'El intercambio quedó completado. Ya pueden dejar su reseña.'
      : (mensajes[estado] || `Tu intercambio quedó en estado «${estado}».`),
    estado === 'Completado' ? '/resenas' : '/intercambios',
  )
  if (estado === 'Completado') {
    await q('UPDATE usuarios SET intercambios = intercambios + 1 WHERE id IN ($1,$2)', [x.solicitante_id, x.receptor_id])
    // Las prendas del trueque salen del catálogo activo al cerrar el ciclo.
    await q('UPDATE prendas SET disponible = false WHERE id IN ($1,$2)', [x.prenda_id, x.ofrece_id])
  }
  res.json({ intercambio: camelizar(rows[0]) })
}))

/* ------------------------------------------------------------- pedidos */

// POST /api/pedidos
router.post('/pedidos', authRequerida, asincrono(async (req, res) => {
  const b = req.body || {}
  if (!b.prendaId) throw errorHttp(400, 'Falta la prenda del envío.')
  const { rows: prendas } = await q('SELECT * FROM prendas WHERE id = $1', [b.prendaId])
  if (!prendas[0]) throw errorHttp(404, 'La prenda del envío ya no existe.')
  if (b.intercambioId) {
    const { rows: acuerdos } = await q('SELECT * FROM intercambios WHERE id = $1', [b.intercambioId])
    const acuerdo = acuerdos[0]
    if (!acuerdo) throw errorHttp(404, 'El intercambio del envío no existe.')
    if (![acuerdo.solicitante_id, acuerdo.receptor_id].includes(req.usuario.id)) {
      throw errorHttp(403, 'No participas en el intercambio de este envío.')
    }
    const prendaEsperada = acuerdo.solicitante_id === req.usuario.id ? acuerdo.ofrece_id : acuerdo.prenda_id
    if (b.prendaId !== prendaEsperada) {
      throw errorHttp(409, 'La prenda del envío no corresponde con tu parte del intercambio.')
    }
    const { rows: yaEnviado } = await q(
      'SELECT 1 FROM pedidos WHERE intercambio_id = $1 AND usuario_id = $2 LIMIT 1',
      [acuerdo.id, req.usuario.id],
    )
    if (yaEnviado.length) throw errorHttp(409, 'Ya programaste un envío para este intercambio.')
  }
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

  // Cuando la entrega se confirma, el intercambio asociado se cierra solo.
  if (estado === 'Entregado' && pedido.intercambio_id) {
    const { rows: acuerdos } = await q('SELECT * FROM intercambios WHERE id = $1', [pedido.intercambio_id])
    const acuerdo = acuerdos[0]
    const { rows: otrosEnvios } = await q(
      "SELECT 1 FROM pedidos WHERE intercambio_id = $1 AND id <> $2 AND estado <> 'Entregado' LIMIT 1",
      [pedido.intercambio_id, pedido.id],
    )
    if (acuerdo && acuerdo.estado === 'Aceptado' && !otrosEnvios.length) {
      await q("UPDATE intercambios SET estado = 'Completado' WHERE id = $1", [acuerdo.id])
      await q('UPDATE usuarios SET intercambios = intercambios + 1 WHERE id IN ($1,$2)', [acuerdo.solicitante_id, acuerdo.receptor_id])
      await q('UPDATE prendas SET disponible = false WHERE id IN ($1,$2)', [acuerdo.prenda_id, acuerdo.ofrece_id])
      await notificar(acuerdo.solicitante_id, 'solicitud', 'La entrega se confirmó y el intercambio quedó completado. Ya pueden dejar su reseña.', '/resenas')
      await notificar(acuerdo.receptor_id, 'solicitud', 'La entrega se confirmó y el intercambio quedó completado. Ya pueden dejar su reseña.', '/resenas')
    }
  }
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
  // Resolver una solicitud de verificación marca la cuenta como verificada.
  if (estado === 'Resuelto' && rows[0].tipo === 'Verificación' && rows[0].usuario_id) {
    await q('UPDATE usuarios SET verificado = true WHERE id = $1', [rows[0].usuario_id])
    await notificar(
      rows[0].usuario_id,
      'sistema',
      'Tu identidad fue verificada por el equipo. Ya tienes la insignia en tu perfil.',
      '/panel?seccion=ajustes',
    )
  }
  // Resolver una postulación de curaduría deja la prenda destacada.
  if (estado === 'Resuelto' && rows[0].tipo === 'Prenda' && rows[0].motivo === 'Postulación a destacado' && rows[0].prenda_id) {
    await q('UPDATE prendas SET destacada = true WHERE id = $1', [rows[0].prenda_id])
    if (rows[0].usuario_id) {
      await notificar(rows[0].usuario_id, 'sistema', 'Tu prenda fue aprobada y ya aparece como destacada en el catálogo.', '/panel?seccion=prendas')
    }
  }
  res.json({ reporte: camelizar(rows[0]) })
}))

export default router
