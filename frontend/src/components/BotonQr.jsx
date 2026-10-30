import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { navigate, useRoute } from '../lib/router.jsx'
import { EVENTO_QR, esRutaSinQr, urlConciencia } from '../lib/qr.js'
import { compartirEnlace } from '../lib/compartir.js'
import { nombreMaterial } from '../lib/seed.js'

/**
 * Botón flotante con el QR de la micropágina de concientización.
 * Se monta una sola vez; el contenido del QR cambia según la prenda o el
 * intercambio que se esté mirando.
 */
export function BotonQr() {
  const { prendas, intercambios, buscarPrenda, avisar } = useStore()
  const { path, segments, query } = useRoute()
  const [abierto, setAbierto] = useState(false)
  const [qr, setQr] = useState('')
  const [fallo, setFallo] = useState(false)
  const [contexto, setContexto] = useState({ materiales: [], texto: '' })
  const botonRef = useRef(null)
  const cajaRef = useRef(null)
  const cerrarRef = useRef(null)

  const materialesRuta = useCallback(() => {
    if (segments[0] === 'prenda' && segments[1]) {
      return buscarPrenda(segments[1])?.composicion ?? []
    }
    if (segments[0] === 'intercambios') {
      const id = query.get('chat')
      const cambio = id ? intercambios.find((x) => x.id === id) : null
      if (cambio) {
        const materiales = [
          ...(buscarPrenda(cambio.ofreceId)?.composicion ?? []),
          ...(buscarPrenda(cambio.prendaId)?.composicion ?? []),
        ]
        return [...new Set(materiales)]
      }
    }
    return []
  }, [segments, query, intercambios, prendas, buscarPrenda])

  const abrir = useCallback((materiales) => {
    const lista = [...new Set((materiales || []).filter(Boolean))]
    setContexto({
      materiales: lista,
      texto: lista.length
        ? `Al escanearlo verás cómo reutilizar ${lista.map(nombreMaterial).join(', ')} ayuda al medio ambiente.`
        : 'Al escanearlo verás la guía completa de materiales y cómo reutilizarlos ayuda al medio ambiente.',
    })
    setFallo(false)
    setQr('')
    setAbierto(true)
  }, [])

  // Otros componentes (por ejemplo el intercambio) pueden pedir el QR con materiales.
  useEffect(() => {
    const alPedir = (evento) => abrir(evento.detail?.materiales || [])
    addEventListener(EVENTO_QR, alPedir)
    return () => removeEventListener(EVENTO_QR, alPedir)
  }, [abrir])

  // Genera el QR solo al abrir la ventana: la librería se carga bajo demanda.
  useEffect(() => {
    if (!abierto) return undefined
    const url = urlConciencia(contexto.materiales, { qr: true })
    let vigente = true
    import('qrcode')
      .then(({ default: QRCode }) => QRCode.toDataURL(url, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 640,
        color: { dark: '#1b1a36', light: '#ffffff' },
      }))
      .then((dataUrl) => { if (vigente) setQr(dataUrl) })
      .catch(() => { if (vigente) setFallo(true) })
    return () => { vigente = false }
  }, [abierto, contexto.materiales])

  // Escape cierra, clic fuera cierra y el foco queda atrapado dentro.
  useEffect(() => {
    if (!abierto) return undefined
    const anterior = document.activeElement
    document.body.style.overflow = 'hidden'
    cerrarRef.current?.focus()

    const alTeclear = (evento) => {
      if (evento.key === 'Escape') {
        setAbierto(false)
        return
      }
      if (evento.key !== 'Tab' || !cajaRef.current) return
      const enfocables = cajaRef.current.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      if (!enfocables.length) return
      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primero.focus()
      }
    }

    addEventListener('keydown', alTeclear)
    return () => {
      document.body.style.overflow = ''
      removeEventListener('keydown', alTeclear)
      // Devuelve el foco al botón que abrió la ventana.
      ;(anterior instanceof HTMLElement ? anterior : botonRef.current)?.focus?.()
    }
  }, [abierto])

  const compartir = async () => {
    const resultado = await compartirEnlace({
      titulo: 'Hilo Circular · concientización',
      texto: 'Esto es lo que estás reutilizando.',
      url: urlConciencia(contexto.materiales, { qr: true }),
    })
    if (resultado === 'compartido') avisar('QR compartido.', 'ok')
    else if (resultado === 'copiado') avisar('Enlace de la micropágina copiado.', 'ok')
    else if (resultado === 'error') avisar('No pudimos compartir el enlace.', 'aviso')
  }

  const descargar = () => {
    if (!qr) return
    const enlace = document.createElement('a')
    enlace.href = qr
    enlace.download = 'hilo-circular-qr.png'
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
  }

  if (esRutaSinQr(path)) return null

  const url = urlConciencia(materialesRuta())

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        className="boton-qr clicable"
        onClick={() => abrir(materialesRuta())}
        aria-label="Abrir el código QR de concientización"
        aria-haspopup="dialog"
        title={url}
      >
        <span className="boton-qr-anillo" aria-hidden="true" />
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M14 14h3v3h-3zM19 19h1M14 20h2M20 14h.01" fill="none" stroke="currentColor" strokeWidth="1.7" />
        </svg>
        <span className="boton-qr-texto">Escanea</span>
      </button>

      {abierto && (
        <div className="modal-fondo" role="presentation" onClick={() => setAbierto(false)}>
          <div
            className="modal modal-qr"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-titulo"
            ref={cajaRef}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-cabeza">
              <div>
                <h3 id="qr-titulo">Escanea y descubre el impacto</h3>
                <p className="modal-descripcion">{contexto.texto}</p>
              </div>
              <button
                ref={cerrarRef}
                type="button"
                className="modal-cerrar"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar ventana"
              >
                ×
              </button>
            </header>

            <div className="modal-cuerpo qr-cuerpo">
              {fallo && <p className="campo-error" role="alert">No pudimos generar el QR. Prueba a recargar la página.</p>}
              {!fallo && !qr && <p className="qr-cargando">Generando el código…</p>}
              {qr && <img className="qr-imagen" src={qr} alt="Código QR de la micropágina de concientización" width="280" height="280" />}
              {contexto.materiales.length > 0 && (
                <ul className="chips qr-materiales">
                  {contexto.materiales.map((m) => <li key={m} className="etiqueta lavanda">{nombreMaterial(m)}</li>)}
                </ul>
              )}
            </div>

            <footer className="modal-pie qr-acciones">
              <button
                type="button"
                className="boton solido md"
                onClick={() => { setAbierto(false); navigate(`/conciencia${contexto.materiales.length ? `?m=${encodeURIComponent(contexto.materiales.join(','))}` : ''}`) }}
              >
                <span>Abrir aquí</span>
              </button>
              <button type="button" className="boton fantasma md" onClick={descargar} disabled={!qr}>
                <span>Descargar</span>
              </button>
              <button type="button" className="boton fantasma md" onClick={compartir}>
                <span>Compartir</span>
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  )
}

export default BotonQr
