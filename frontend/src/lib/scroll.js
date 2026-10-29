import { prefiereMenosMovimiento } from './movimiento.js'

let lenis = null

/**
 * Activa el scroll suave con inercia. Se pausa mientras haya un modal abierto
 * (el modal bloquea el scroll del body) y no se activa si el sistema pide
 * reducir movimiento. Devuelve una función para limpiarlo.
 */
export function activarScrollSuave() {
  if (prefiereMenosMovimiento()) return () => {}
  let cancelado = false
  let frame = 0
  let observador = null

  import('lenis')
    .then(({ default: Lenis }) => {
      if (cancelado) return
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9 })
      const bucle = (tiempo) => {
        lenis?.raf(tiempo)
        frame = requestAnimationFrame(bucle)
      }
      frame = requestAnimationFrame(bucle)

      // Los modales bloquean el body; mientras tanto el scroll suave se detiene.
      observador = new MutationObserver(() => {
        if (document.body.style.overflow === 'hidden') lenis?.stop()
        else lenis?.start()
      })
      observador.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    })
    .catch(() => {})

  return () => {
    cancelado = true
    cancelAnimationFrame(frame)
    observador?.disconnect()
    lenis?.destroy()
    lenis = null
  }
}

/** Vuelve arriba al cambiar de ruta, respetando el scroll suave. */
export function subirAlInicio() {
  if (lenis) lenis.scrollTo(0, { immediate: true })
  else scrollTo({ top: 0, behavior: 'auto' })
}
