import { Router } from 'express'
import { q } from '../db.js'
import { comparar, hashear, firmarToken } from '../auth.js'
import { asincrono, errorHttp, usuarioSeguro } from '../util.js'
import {
  MAX_INTENTOS, MINUTOS_BLOQUEO, normalizarCorreo, validarRegistro,
} from '../validaciones.js'

const router = Router()

// Un solo mensaje para cualquier fallo evita averiguar qué correos existen.
const MENSAJE_LOGIN = 'Correo o contraseña incorrectos.'
const MENSAJE_BLOQUEO = `Demasiados intentos fallidos. Vuelve a intentarlo en ${MINUTOS_BLOQUEO} minutos.`

// Hash falso para comparar cuando el correo no existe: el tiempo de respuesta
// no debe delatar si la cuenta está registrada.
const HASH_FALSO = '$2a$10$abcdefghijklmnopqrstuvwxyz012345678901234567890123456789'

const bloqueado = (usuario) => Boolean(usuario?.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date())

// POST /api/auth/registro
router.post('/registro', asincrono(async (req, res) => {
  const { errores, valores } = validarRegistro(req.body || {})
  if (Object.keys(errores).length) {
    const error = errorHttp(400, Object.values(errores)[0])
    error.campos = errores
    throw error
  }

  const existente = await q('SELECT 1 FROM usuarios WHERE email = $1', [valores.email])
  if (existente.rowCount) {
    const error = errorHttp(409, 'Ya existe una cuenta con ese correo. Inicia sesión o usa otro.')
    error.campos = { email: 'Ya existe una cuenta con este correo.' }
    throw error
  }

  const hash = await hashear(String(req.body.clave))
  const { rows } = await q(
    `INSERT INTO usuarios (nombre, email, clave_hash, barrio, bio, intereses)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [valores.nombre, valores.email, hash, valores.barrio, valores.bio, valores.intereses],
  )
  const usuario = rows[0]
  res.status(201).json({ usuario: usuarioSeguro(usuario), token: firmarToken(usuario) })
}))

// POST /api/auth/login
router.post('/login', asincrono(async (req, res) => {
  const email = normalizarCorreo(req.body?.email)
  const clave = String(req.body?.clave ?? '')
  if (!email || !clave) throw errorHttp(401, MENSAJE_LOGIN)

  const { rows } = await q('SELECT * FROM usuarios WHERE email = $1', [email])
  const usuario = rows[0]

  if (bloqueado(usuario)) throw errorHttp(429, MENSAJE_BLOQUEO)

  // Si el correo no existe se compara igual contra un hash falso.
  const coincide = await comparar(clave, usuario?.clave_hash ?? HASH_FALSO)
  if (!usuario || !coincide) {
    if (usuario) {
      const fallos = Number(usuario.intentos_fallidos ?? 0) + 1
      if (fallos >= MAX_INTENTOS) {
        const hasta = new Date(Date.now() + MINUTOS_BLOQUEO * 60 * 1000)
        await q('UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = $2 WHERE id = $1', [usuario.id, hasta])
      } else {
        await q('UPDATE usuarios SET intentos_fallidos = $2 WHERE id = $1', [usuario.id, fallos])
      }
    }
    throw errorHttp(401, MENSAJE_LOGIN)
  }

  // La suspensión se comprueba solo después de acertar la contraseña.
  if (usuario.estado === 'suspendido') {
    throw errorHttp(403, 'Esta cuenta está suspendida. Contacta al equipo de Hilo Circular.')
  }

  if (usuario.intentos_fallidos || usuario.bloqueado_hasta) {
    await q('UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = $1', [usuario.id])
  }

  res.json({ usuario: usuarioSeguro(usuario), token: firmarToken(usuario) })
}))

// GET /api/auth/me
router.get('/me', asincrono(async (req, res) => {
  if (!req.usuario) throw errorHttp(401, 'No hay una sesión activa.')
  res.json({ usuario: usuarioSeguro(req.usuario) })
}))

export default router
