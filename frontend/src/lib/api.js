/**
 * Cliente de la API de Hilo Circular.
 * La URL del backend se define en la variable de entorno VITE_API_URL.
 */
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')
const CLAVE_TOKEN = 'hilo-token'

let token = typeof localStorage !== 'undefined' ? localStorage.getItem(CLAVE_TOKEN) : null

export function fijarToken(nuevo) {
  token = nuevo || null
  try {
    if (nuevo) localStorage.setItem(CLAVE_TOKEN, nuevo)
    else localStorage.removeItem(CLAVE_TOKEN)
  } catch { /* almacenamiento bloqueado: la sesión vive en memoria */ }
}
export const leerToken = () => token

export class ApiError extends Error {
  constructor(mensaje, estado) {
    super(mensaje)
    this.name = 'ApiError'
    this.estado = estado
  }
}

async function pedir(ruta, { method = 'GET', body, auth = true } = {}) {
  const cabeceras = {}
  if (body !== undefined) cabeceras['Content-Type'] = 'application/json'
  if (auth && token) cabeceras.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${BASE}${ruta}`, {
      method,
      headers: cabeceras,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('No pudimos conectar con el servidor. Revisa tu conexión.', 0)
  }

  const texto = await res.text()
  let datos = null
  if (texto) { try { datos = JSON.parse(texto) } catch { datos = null } }
  if (!res.ok) throw new ApiError(datos?.error || `Error ${res.status}`, res.status)
  return datos
}

export const api = {
  datos: () => pedir('/api/datos'),
  registro: (cuerpo) => pedir('/api/auth/registro', { method: 'POST', body: cuerpo, auth: false }),
  login: (email, clave) => pedir('/api/auth/login', { method: 'POST', body: { email, clave }, auth: false }),

  actualizarPerfil: (cuerpo) => pedir('/api/usuarios/me', { method: 'PUT', body: cuerpo }),
  solicitarVerificacion: () => pedir('/api/usuarios/me/verificacion', { method: 'POST' }),
  suscribir: (email) => pedir('/api/suscripciones', { method: 'POST', body: { email }, auth: false }),
  suspenderUsuario: (id) => pedir(`/api/usuarios/${id}/estado`, { method: 'PATCH' }),
  verificarUsuario: (id) => pedir(`/api/usuarios/${id}/verificado`, { method: 'PATCH' }),

  publicarPrenda: (cuerpo) => pedir('/api/prendas', { method: 'POST', body: cuerpo }),
  importarPrendas: (prendas) => pedir('/api/prendas/importar', { method: 'POST', body: { prendas } }),
  eliminarPrenda: (id) => pedir(`/api/prendas/${id}`, { method: 'DELETE' }),
  alternarDisponible: (id) => pedir(`/api/prendas/${id}/disponible`, { method: 'PATCH' }),
  destacar: (id, valor) => pedir(`/api/prendas/${id}/destacada`, { method: 'PATCH', body: { valor } }),
  alternarFavorito: (id) => pedir(`/api/prendas/${id}/favorito`, { method: 'POST' }),
  registrarVista: (id) => pedir(`/api/prendas/${id}/vista`, { method: 'POST' }),

  solicitar: (cuerpo) => pedir('/api/intercambios', { method: 'POST', body: cuerpo }),
  responderSolicitud: (id, estado) => pedir(`/api/intercambios/${id}/estado`, { method: 'PATCH', body: { estado } }),
  mensajes: (id) => pedir(`/api/intercambios/${id}/mensajes`),
  enviarMensaje: (id, texto) => pedir(`/api/intercambios/${id}/mensajes`, { method: 'POST', body: { texto } }),
  marcarNotificacionesLeidas: () => pedir('/api/notificaciones/leidas', { method: 'PATCH' }),

  publicarResena: (cuerpo) => pedir('/api/resenas', { method: 'POST', body: cuerpo }),
  responderResena: (id, respuesta) => pedir(`/api/resenas/${id}/respuesta`, { method: 'PUT', body: { respuesta } }),
  marcarResena: (id, valor) => pedir(`/api/resenas/${id}/reportada`, { method: 'PATCH', body: { valor } }),
  utilResena: (id) => pedir(`/api/resenas/${id}/util`, { method: 'POST' }),

  crearPedido: (cuerpo) => pedir('/api/pedidos', { method: 'POST', body: cuerpo }),
  moverPedido: (id, estado) => pedir(`/api/pedidos/${id}/estado`, { method: 'PATCH', body: { estado } }),
  resolverReporte: (id, estado) => pedir(`/api/reportes/${id}/estado`, { method: 'PATCH', body: { estado } }),

  firmaCloudinary: () => pedir('/api/uploads/firma'),
}

/** Sube una imagen a Cloudinary usando la firma del backend y devuelve su URL. */
export async function subirImagen(archivo) {
  const firma = await api.firmaCloudinary()
  const datos = new FormData()
  datos.append('file', archivo)
  datos.append('api_key', firma.apiKey)
  datos.append('timestamp', firma.timestamp)
  datos.append('folder', firma.folder)
  datos.append('signature', firma.signature)

  const res = await fetch(firma.uploadUrl, { method: 'POST', body: datos })
  if (!res.ok) throw new ApiError('No pudimos subir la imagen a la nube.', res.status)
  const subida = await res.json()
  return subida.secure_url
}
