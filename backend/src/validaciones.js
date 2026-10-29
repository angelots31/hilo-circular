/**
 * Reglas de validación de Hilo Circular.
 * El frontend tiene una copia equivalente en `src/lib/validar.js`; si cambia
 * una regla aquí, cambia también allá (y al revés).
 */

export const BARRIOS = [
  'El Poblado', 'Laureles', 'Belén', 'Robledo', 'Aranjuez', 'Castilla',
  'Guayabal', 'La Candelaria', 'Buenos Aires', 'San Javier', 'Manrique', 'Villa Hermosa',
]

export const INTERESES = ['Chaquetas', 'Vestidos', 'Calzado', 'Punto', 'Accesorios', 'Reparación', 'Vintage', 'Deportivo']

export const LIMITE_NOMBRE = 60
export const LIMITE_BIO = 280
export const MAX_INTERESES = 8
export const LIMITE_CORREO = 254
export const MIN_CLAVE = 8
export const MAX_CLAVE = 72 // bcrypt ignora lo que pase de 72 bytes
export const MAX_INTENTOS = 5
export const MINUTOS_BLOQUEO = 15

const CLAVES_COMUNES = ['12345678', 'password', 'hilocircular', '123456789', 'contraseña', 'qwerty123']

/** Recorta y unifica espacios dobles del nombre. */
export function normalizarNombre(valor) {
  return String(valor ?? '').replace(/\s+/g, ' ').trim()
}

/** Letras (con tildes y ñ), espacios, guion y apóstrofo. */
const NOMBRE_VALIDO = /^[\p{L}\p{M}][\p{L}\p{M}  '-]*[\p{L}\p{M}.]$/u

export function validarNombre(valor) {
  const nombre = normalizarNombre(valor)
  if (nombre.length < 3) return 'Escribe tu nombre completo (mínimo 3 caracteres).'
  if (nombre.length > LIMITE_NOMBRE) return `El nombre no puede pasar de ${LIMITE_NOMBRE} caracteres.`
  if (!NOMBRE_VALIDO.test(nombre)) return 'El nombre solo admite letras, espacios, guion y apóstrofo.'
  return null
}

/** Minúsculas, sin espacios, máximo 254 caracteres y dominio con punto. */
export function normalizarCorreo(valor) {
  return String(valor ?? '').trim().toLowerCase()
}

export function validarCorreo(valor) {
  const correo = normalizarCorreo(valor)
  if (!correo) return 'Escribe tu correo electrónico.'
  if (correo.length > LIMITE_CORREO) return `El correo no puede pasar de ${LIMITE_CORREO} caracteres.`
  if (/\s/.test(correo)) return 'El correo no puede llevar espacios.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return 'Escribe un correo electrónico válido (nombre@dominio.com).'
  return null
}

/** 8–72 caracteres, al menos una letra y un número; no puede ser el correo, el nombre ni una clave común. */
export function validarClave(valor, { nombre = '', email = '' } = {}) {
  const clave = String(valor ?? '')
  if (clave.length < MIN_CLAVE) return `La contraseña debe tener al menos ${MIN_CLAVE} caracteres.`
  if (Buffer.byteLength(clave, 'utf8') > MAX_CLAVE) return `La contraseña no puede pasar de ${MAX_CLAVE} caracteres.`
  if (!/\p{L}/u.test(clave) || !/\d/.test(clave)) return 'La contraseña debe combinar letras y números.'
  const enMinusculas = clave.toLowerCase()
  if (CLAVES_COMUNES.includes(enMinusculas)) return 'Esa contraseña es demasiado común. Elige otra.'
  if (enMinusculas === normalizarCorreo(email)) return 'La contraseña no puede ser igual a tu correo.'
  if (normalizarNombre(nombre) && enMinusculas === normalizarNombre(nombre).toLowerCase()) {
    return 'La contraseña no puede ser igual a tu nombre.'
  }
  return null
}

/** Solo las claves de la lista oficial. */
export function validarBarrio(valor) {
  if (!valor) return 'Elige tu barrio.'
  if (!BARRIOS.includes(String(valor))) return 'Elige un barrio de la lista.'
  return null
}

export function validarBio(valor) {
  if (String(valor ?? '').length > LIMITE_BIO) return `La biografía no puede pasar de ${LIMITE_BIO} caracteres.`
  return null
}

/** Hasta 8 intereses y solo de la lista. */
export function validarIntereses(valor) {
  if (valor == null) return null
  if (!Array.isArray(valor)) return 'Los intereses deben venir en una lista.'
  if (valor.length > MAX_INTERESES) return `Puedes elegir hasta ${MAX_INTERESES} intereses.`
  if (valor.some((i) => !INTERESES.includes(String(i)))) return 'Hay un interés que no está en la lista.'
  return null
}

export function validarTerminos(valor) {
  if (valor !== true) return 'Debes aceptar las condiciones y el tratamiento de datos.'
  return null
}

/**
 * Aplica todas las reglas del registro.
 * Devuelve `{ errores, valores }`: `errores` va por campo para que el frontend
 * pinte cada mensaje donde corresponde.
 */
export function validarRegistro(datos = {}) {
  const nombre = normalizarNombre(datos.nombre)
  const email = normalizarCorreo(datos.email)
  const errores = {}

  const nombreError = validarNombre(nombre)
  if (nombreError) errores.nombre = nombreError

  const correoError = validarCorreo(email)
  if (correoError) errores.email = correoError

  const claveError = validarClave(datos.clave, { nombre, email })
  if (claveError) errores.clave = claveError

  if (datos.confirmar != null && String(datos.confirmar) !== String(datos.clave ?? '')) {
    errores.confirmar = 'Las contraseñas no coinciden.'
  }

  if (datos.barrio != null) {
    const barrioError = validarBarrio(datos.barrio)
    if (barrioError) errores.barrio = barrioError
  }

  const bioError = validarBio(datos.bio)
  if (bioError) errores.bio = bioError

  const interesesError = validarIntereses(datos.intereses)
  if (interesesError) errores.intereses = interesesError

  const terminosError = validarTerminos(datos.terminos)
  if (terminosError) errores.terminos = terminosError

  return {
    errores,
    valores: {
      nombre,
      email,
      barrio: datos.barrio || null,
      bio: String(datos.bio ?? '').trim(),
      intereses: Array.isArray(datos.intereses) ? [...new Set(datos.intereses.map(String))] : [],
    },
  }
}
