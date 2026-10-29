import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { q } from './db.js'

export const hashear = (clave) => bcrypt.hash(clave, 10)
export const comparar = (clave, hash) => bcrypt.compare(clave, hash)

export function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRA || '7d' },
  )
}

function leerToken(req) {
  const cabecera = req.headers.authorization || ''
  if (!cabecera.startsWith('Bearer ')) return null
  try {
    return jwt.verify(cabecera.slice(7), process.env.JWT_SECRET)
  } catch {
    return null
  }
}

/** Carga req.usuario si hay token válido; nunca falla. */
export async function authOpcional(req, _res, next) {
  const payload = leerToken(req)
  if (payload?.id) {
    const { rows } = await q('SELECT * FROM usuarios WHERE id = $1', [payload.id])
    const usuario = rows[0]
    // Un cambio de contraseña invalida los tokens emitidos antes de ese momento.
    const cambiada = usuario?.clave_cambiada ? Math.floor(new Date(usuario.clave_cambiada).getTime() / 1000) : 0
    if (usuario && !(cambiada && Number(payload.iat) < cambiada)) req.usuario = usuario
  }
  next()
}

/** Exige sesión activa y cuenta no suspendida. */
export function authRequerida(req, res, next) {
  if (!req.usuario) return res.status(401).json({ error: 'Necesitas iniciar sesión.' })
  if (req.usuario.estado === 'suspendido') return res.status(403).json({ error: 'Esta cuenta está suspendida.' })
  next()
}

/** Exige rol de administración. */
export function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') return res.status(403).json({ error: 'Esta acción es solo para el equipo.' })
  next()
}
