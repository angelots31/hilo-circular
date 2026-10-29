/** ¿La persona pidió reducir el movimiento en su sistema? */
export const prefiereMenosMovimiento = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Confeti corto para los momentos de éxito. Se carga solo cuando hace falta y
 * no se lanza si el sistema pide reducir movimiento.
 */
export async function celebrar(opciones = {}) {
  if (prefiereMenosMovimiento()) return
  try {
    const { default: confetti } = await import('canvas-confetti')
    confetti({
      particleCount: 60,
      spread: 72,
      startVelocity: 28,
      gravity: 0.9,
      ticks: 140,
      origin: { y: 0.68 },
      colors: ['#6872aa', '#e5c4c6', '#c8a179', '#5d4655', '#e2deea'],
      ...opciones,
    })
  } catch {
    // El confeti es un extra: si la librería no carga, no pasa nada.
  }
}
