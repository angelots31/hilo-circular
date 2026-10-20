import Garment from './Garment.jsx'

/** Primera foto válida de la prenda (Cloudinary, data URL o ruta local). */
export function fotoPrincipal(prenda) {
  return prenda?.fotos?.find((f) => typeof f === 'string' && /^(https?:|data:|blob:|\/)/.test(f)) ?? null
}

/**
 * Miniatura de prenda para tablas, chats e intercambios: usa la foto real
 * cuando existe y cae en la ilustración vectorial cuando no.
 */
export default function PrendaMini({
  prenda,
  tamano = 'md',
  className = '',
  onClick,
  alt,
  etiqueta = 'Ver detalle de la prenda',
}) {
  const foto = fotoPrincipal(prenda)
  const contenido = foto ? (
    <img src={foto} alt={alt || prenda?.titulo || ''} loading="lazy" draggable="false" />
  ) : (
    <Garment tipo={prenda?.tipo} paleta={prenda?.paleta} alt={alt || prenda?.titulo || ''} />
  )
  const clases = `prenda-mini ${tamano} ${className}`.trim()

  if (onClick) {
    return (
      <button type="button" className={clases} onClick={onClick} aria-label={etiqueta} title={etiqueta}>
        {contenido}
      </button>
    )
  }
  return <span className={clases}>{contenido}</span>
}
