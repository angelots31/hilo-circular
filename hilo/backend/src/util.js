/** Envuelve un handler async para que los errores lleguen a Express. */
export const asincrono = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const aCamel = (clave) => clave.replace(/_([a-z])/g, (_m, c) => c.toUpperCase())

/** Convierte claves snake_case de Postgres a camelCase para el frontend. */
export function camelizar(fila) {
  if (!fila) return fila
  const salida = {}
  for (const [clave, valor] of Object.entries(fila)) salida[aCamel(clave)] = valor
  return salida
}
export const camelizarFilas = (filas) => filas.map(camelizar)

const CAMPOS_USUARIO_PUBLICO = [
  'id', 'nombre', 'ciudad', 'barrio', 'bio', 'intereses',
  'rol', 'verificado', 'reputacion', 'intercambios', 'desde', 'estado',
]

/** Quita datos sensibles. `propio` incluye correo/dirección (perfil y admin). */
export function usuarioSeguro(fila, propio = true) {
  if (!fila) return fila
  const base = propio
    ? fila
    : Object.fromEntries(Object.entries(fila).filter(([k]) => CAMPOS_USUARIO_PUBLICO.includes(k)))
  const { clave_hash: _omitido, ...resto } = base
  return camelizar(resto)
}

/** Lanza un error HTTP con estado. */
export function errorHttp(estado, mensaje) {
  const e = new Error(mensaje)
  e.estado = estado
  return e
}

export const correoValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo || '').trim())
export const LIMITE_FOTOS = 6
