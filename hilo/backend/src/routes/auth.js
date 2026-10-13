import { Router } from 'express'
import { q } from '../db.js'
import { comparar, hashear, firmarToken } from '../auth.js'
import { asincrono, correoValido, errorHttp, usuarioSeguro } from '../util.js'

const router = Router()

// POST /api/auth/registro
router.post('/registro', asincrono(async (req, res) => {
  const { nombre, email, clave, barrio, bio, intereses } = req.body || {}
  if (String(nombre || '').trim().length < 3) throw errorHttp(400, 'Escribe tu nombre completo.')
  if (!correoValido(email)) throw errorHttp(400, 'Escribe un correo electrónico válido.')
  if (String(clave || '').length < 6) throw errorHttp(400, 'La contraseña debe tener al menos 6 caracteres.')

  const correo = String(email).trim().toLowerCase()
  const existente = await q('SELECT 1 FROM usuarios WHERE email = $1', [correo])
  if (existente.rowCount) throw errorHttp(409, 'Ya existe una cuenta con ese correo. Inicia sesión o usa otro.')

  const hash = await hashear(String(clave))
  const { rows } = await q(
    `INSERT INTO usuarios (nombre, email, clave_hash, barrio, bio, intereses)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      String(nombre).trim(),
      correo,
      hash,
      barrio || null,
      String(bio || ''),
      Array.isArray(intereses) ? intereses : [],
    ],
  )
  const usuario = rows[0]
  res.status(201).json({ usuario: usuarioSeguro(usuario), token: firmarToken(usuario) })
}))

// POST /api/auth/login
router.post('/login', asincrono(async (req, res) => {
  const { email, clave } = req.body || {}
  if (!correoValido(email)) throw errorHttp(400, 'Escribe un correo válido.')
  if (!clave) throw errorHttp(400, 'Escribe tu contraseña.')

  const { rows } = await q('SELECT * FROM usuarios WHERE email = $1', [String(email).trim().toLowerCase()])
  const usuario = rows[0]
  if (!usuario) throw errorHttp(401, 'No encontramos esa cuenta. Revisa el correo o crea una cuenta.')
  if (usuario.estado === 'suspendido') throw errorHttp(403, 'Esta cuenta está suspendida. Contacta al equipo de Hilo Circular.')

  const coincide = await comparar(String(clave), usuario.clave_hash)
  if (!coincide) throw errorHttp(401, 'La contraseña no coincide. Inténtalo de nuevo.')

  res.json({ usuario: usuarioSeguro(usuario), token: firmarToken(usuario) })
}))

// GET /api/auth/me
router.get('/me', asincrono(async (req, res) => {
  if (!req.usuario) throw errorHttp(401, 'No hay una sesión activa.')
  res.json({ usuario: usuarioSeguro(req.usuario) })
}))

export default router
