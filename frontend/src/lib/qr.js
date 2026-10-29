/** Evento global para abrir la ventana del QR con unos materiales concretos. */
export const EVENTO_QR = 'hilo:abrir-qr'

export function abrirQrCon(materiales = []) {
  dispatchEvent(new CustomEvent(EVENTO_QR, { detail: { materiales } }))
}

/**
 * Dirección de la micropágina con los materiales en la propia URL.
 * `qr: true` añade `o=qr`, la marca con la que se cuenta un escaneo sin
 * guardar nada personal.
 */
export function urlConciencia(materiales = [], { qr = false } = {}) {
  const base = `${location.origin}${location.pathname}#/conciencia`
  const parametros = []
  if (materiales.length) parametros.push(`m=${encodeURIComponent(materiales.join(','))}`)
  if (qr) parametros.push('o=qr')
  return parametros.length ? `${base}?${parametros.join('&')}` : base
}

export const esRutaSinQr = (path = '') =>
  ['/entrar', '/registro', '/panel', '/admin'].some((ruta) => path === ruta || path.startsWith(`${ruta}/`))
