/** Copia texto al portapapeles con respaldo para navegadores antiguos. */
export async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = texto
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(area)
      return ok
    } catch {
      return false
    }
  }
}

/** Enlace absoluto de la vista actual (el router vive en el hash). */
export function enlaceActual() {
  return `${location.origin}${location.pathname}${location.hash || '#/'}`
}

/**
 * Abre el menú nativo de compartir cuando existe; si no, copia el enlace.
 * Devuelve 'compartido', 'copiado', 'cancelado' o 'error'.
 */
export async function compartirEnlace({ titulo, texto, url } = {}) {
  const enlace = url || enlaceActual()
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: titulo, text: texto, url: enlace })
      return 'compartido'
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelado'
      // Si el sistema rechaza el menú nativo, seguimos con el portapapeles.
    }
  }
  const ok = await copiarTexto(enlace)
  return ok ? 'copiado' : 'error'
}
