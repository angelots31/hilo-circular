/**
 * Reglas de validación del frontend.
 * Espejo de `backend/src/validaciones.js`: si cambia una regla, cámbiala en los dos.
 */
import { BARRIOS } from './seed.js'

export const INTERESES = ['Chaquetas', 'Vestidos', 'Calzado', 'Punto', 'Accesorios', 'Reparación', 'Vintage', 'Deportivo']

export const LIMITE_NOMBRE = 60
export const LIMITE_BIO = 280
export const MAX_INTERESES = 8
export const LIMITE_CORREO = 254
export const MIN_CLAVE = 8
export const MAX_CLAVE = 72

const CLAVES_COMUNES = ['12345678', 'password', 'hilocircular', '123456789', 'contraseña', 'qwerty123']

export const normalizarNombre = (valor) => String(valor ?? '').replace(/\s+/g, ' ').trim()
export const normalizarCorreo = (valor) => String(valor ?? '').trim().toLowerCase()

const NOMBRE_VALIDO = /^[\p{L}\p{M}][\p{L}\p{M}  '-]*[\p{L}\p{M}.]$/u

export function validarNombre(valor) {
  const nombre = normalizarNombre(valor)
  if (nombre.length < 3) return 'Escribe tu nombre completo (mínimo 3 caracteres).'
  if (nombre.length > LIMITE_NOMBRE) return `El nombre no puede pasar de ${LIMITE_NOMBRE} caracteres.`
  if (!NOMBRE_VALIDO.test(nombre)) return 'El nombre solo admite letras, espacios, guion y apóstrofo.'
  return null
}

export function validarCorreo(valor) {
  const correo = normalizarCorreo(valor)
  if (!correo) return 'Escribe tu correo electrónico.'
  if (correo.length > LIMITE_CORREO) return `El correo no puede pasar de ${LIMITE_CORREO} caracteres.`
  if (/\s/.test(correo)) return 'El correo no puede llevar espacios.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return 'Escribe un correo electrónico válido (nombre@dominio.com).'
  return null
}

export function validarClave(valor, { nombre = '', email = '' } = {}) {
  const clave = String(valor ?? '')
  if (clave.length < MIN_CLAVE) return `La contraseña debe tener al menos ${MIN_CLAVE} caracteres.`
  if (clave.length > MAX_CLAVE) return `La contraseña no puede pasar de ${MAX_CLAVE} caracteres.`
  if (!/\p{L}/u.test(clave) || !/\d/.test(clave)) return 'La contraseña debe combinar letras y números.'
  const enMinusculas = clave.toLowerCase()
  if (CLAVES_COMUNES.includes(enMinusculas)) return 'Esa contraseña es demasiado común. Elige otra.'
  if (enMinusculas === normalizarCorreo(email)) return 'La contraseña no puede ser igual a tu correo.'
  if (normalizarNombre(nombre) && enMinusculas === normalizarNombre(nombre).toLowerCase()) {
    return 'La contraseña no puede ser igual a tu nombre.'
  }
  return null
}

export function validarConfirmar(valor, clave) {
  if (!valor) return 'Repite tu contraseña.'
  if (String(valor) !== String(clave ?? '')) return 'Las contraseñas no coinciden.'
  return null
}

export function validarBarrio(valor) {
  if (!valor) return 'Elige tu barrio.'
  if (!BARRIOS.includes(String(valor))) return 'Elige un barrio de la lista.'
  return null
}

export function validarBio(valor) {
  if (String(valor ?? '').length > LIMITE_BIO) return `La biografía no puede pasar de ${LIMITE_BIO} caracteres.`
  return null
}

export function validarIntereses(valor) {
  if (!Array.isArray(valor)) return 'Los intereses deben venir en una lista.'
  if (valor.length > MAX_INTERESES) return `Puedes elegir hasta ${MAX_INTERESES} intereses.`
  return null
}

/** Medidor simple: débil, aceptable o fuerte. */
export function fuerzaClave(valor) {
  const clave = String(valor ?? '')
  if (!clave) return { nivel: '', porcentaje: 0 }
  let puntos = 0
  if (clave.length >= MIN_CLAVE) puntos += 1
  if (clave.length >= 12) puntos += 1
  if (/\p{L}/u.test(clave) && /\d/.test(clave)) puntos += 1
  if (/[^\p{L}\d]/u.test(clave) || (/[A-ZÁÉÍÓÚÑ]/.test(clave) && /[a-záéíóúñ]/.test(clave))) puntos += 1
  if (puntos <= 1) return { nivel: 'débil', porcentaje: 33 }
  if (puntos === 2) return { nivel: 'aceptable', porcentaje: 66 }
  return { nivel: 'fuerte', porcentaje: 100 }
}

/** Valida todo el formulario de registro y devuelve un error por campo. */
export function validarRegistro(formulario) {
  const errores = {}
  const nombre = validarNombre(formulario.nombre)
  if (nombre) errores.nombre = nombre
  const correo = validarCorreo(formulario.email)
  if (correo) errores.email = correo
  const clave = validarClave(formulario.clave, { nombre: formulario.nombre, email: formulario.email })
  if (clave) errores.clave = clave
  const confirmar = validarConfirmar(formulario.confirmar, formulario.clave)
  if (confirmar) errores.confirmar = confirmar
  const barrio = validarBarrio(formulario.barrio)
  if (barrio) errores.barrio = barrio
  const bio = validarBio(formulario.bio)
  if (bio) errores.bio = bio
  const intereses = validarIntereses(formulario.intereses)
  if (intereses) errores.intereses = intereses
  if (!formulario.terminos) errores.terminos = 'Debes aceptar las condiciones y el tratamiento de datos.'
  return errores
}

/** Validación mínima para entrar: el servidor da el mensaje definitivo. */
export function validarAcceso(formulario) {
  const errores = {}
  const correo = validarCorreo(formulario.email)
  if (correo) errores.email = correo
  if (!formulario.clave) errores.clave = 'Escribe tu contraseña.'
  return errores
}
