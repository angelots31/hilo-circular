import { Router } from 'express'
import { q } from '../db.js'
import { authRequerida } from '../auth.js'
import { asincrono, errorHttp, usuarioSeguro } from '../util.js'

const router = Router()

// PUT /api/usuarios/me
router.put('/me', authRequerida, asincrono(async (req, res) => {
  const b = req.body || {}
  if (String(b.nombre || '').trim().length < 3) throw errorHttp(400, 'Escribe tu nombre completo.')
  const { rows } = await q(
    `UPDATE usuarios
        SET nombre = $2, barrio = $3, direccion = $4, bio = $5, intereses = $6
      WHERE id = $1
      RETURNING *`,
    [
      req.usuario.id,
      String(b.nombre).trim(),
      b.barrio ?? req.usuario.barrio,
      b.direccion ?? req.usuario.direccion,
      String(b.bio ?? req.usuario.bio ?? ''),
      Array.isArray(b.intereses) ? b.intereses : req.usuario.intereses,
    ],
  )
  res.json({ usuario: usuarioSeguro(rows[0]) })
}))

// PATCH /api/usuarios/:id/estado  (admin, alterna activo/suspendido)
router.patch('/:id/estado', authRequerida, asincrono(async (req, res) => {
  if (req.usuario.rol !== 'admin') throw errorHttp(403, 'Esta acción es solo para el equipo.')
  const { rows: previos } = await q('SELECT * FROM usuarios WHERE id = $1', [req.params.id])
  const objetivo = previos[0]
  if (!objetivo) throw errorHttp(404, 'Esa cuenta no existe.')
  if (objetivo.rol === 'admin') throw errorHttp(400, 'No se puede suspender a un administrador.')
  const nuevo = objetivo.estado === 'activo' ? 'suspendido' : 'activo'
  const { rows } = await q('UPDATE usuarios SET estado = $2 WHERE id = $1 RETURNING *', [objetivo.id, nuevo])
  res.json({ usuario: usuarioSeguro(rows[0]) })
}))

// PATCH /api/usuarios/:id/verificado  (admin, alterna)
router.patch('/:id/verificado', authRequerida, asincrono(async (req, res) => {
  if (req.usuario.rol !== 'admin') throw errorHttp(403, 'Esta acción es solo para el equipo.')
  const { rows } = await q(
    'UPDATE usuarios SET verificado = NOT verificado WHERE id = $1 RETURNING *',
    [req.params.id],
  )
  if (!rows[0]) throw errorHttp(404, 'Esa cuenta no existe.')
  res.json({ usuario: usuarioSeguro(rows[0]) })
}))

export default router
