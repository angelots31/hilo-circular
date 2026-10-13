// Mascota de la marca: cada pose es una imagen WebP con fondo transparente en
// /public/mascota (PNG originales en /fuente/png).

const POSES = [
  'sentado', 'saluda', 'alerta', 'asoma', 'camina', 'camina-2', 'lengua',
  'colgado', 'colgado-2', 'duerme', 'salta',
]

/**
 * @param {string} pose  una de POSES (si no existe se usa "sentado")
 * @param {boolean} flota  animación suave de respiración
 * @param {string} className estilos extra (tamaño, posición)
 * @param {string} title texto alternativo
 */
export default function Mascot({
  pose = 'sentado',
  flota = false,
  className = '',
  style,
  title = 'Camaleón, mascota de Hilo Circular',
}) {
  const archivo = POSES.includes(pose) ? pose : 'sentado'
  return (
    <img
      className={`mascota${flota ? ' flota' : ''} ${className}`.trim()}
      src={`/mascota/${archivo}.webp`}
      alt={title}
      style={style}
      draggable="false"
      decoding="async"
    />
  )
}
