import { useEffect, useMemo, useRef, useState } from 'react'
import PrendaMini from './PrendaMini.jsx'
import { Avatar, Boton, Entrada, Etiqueta, Modal } from './ui.jsx'
import { useStore } from '../lib/store.jsx'
import { abrirQrCon } from '../lib/qr.js'

const SUGERENCIAS = [
  '¿Sigue disponible?',
  'Me interesa, ¿coordinamos el intercambio?',
  'Te propongo un punto de encuentro público.',
]

/**
 * Conversación ligada a un intercambio. Solo la ven sus dos participantes
 * (el backend también valida esa pertenencia antes de devolver mensajes).
 */
export default function ChatIntercambio({ intercambio, abierto, onCerrar, onVerPrenda }) {
  const {
    mensajes, usuario, buscarUsuario, buscarPrenda, enviarMensaje, fechaHora,
  } = useStore()
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const fin = useRef(null)
  const entrada = useRef(null)

  const lista = useMemo(() => {
    if (!intercambio) return []
    return mensajes
      .filter((m) => m.intercambioId === intercambio.id)
      .slice()
      .sort((a, b) => String(a.creada).localeCompare(String(b.creada)))
  }, [mensajes, intercambio])

  const ofrece = buscarPrenda(intercambio?.ofreceId)
  const pide = buscarPrenda(intercambio?.prendaId)
  const otra = buscarUsuario(
    intercambio?.solicitanteId === usuario?.id ? intercambio?.receptorId : intercambio?.solicitanteId,
  )

  useEffect(() => {
    if (!abierto) return
    const t = setTimeout(() => {
      fin.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
      entrada.current?.focus()
    }, 80)
    return () => clearTimeout(t)
  }, [abierto, lista.length])

  const enviar = async (evento) => {
    evento?.preventDefault()
    const limpio = texto.trim()
    if (!limpio || !intercambio || enviando) return
    setEnviando(true)
    const ok = await enviarMensaje(intercambio.id, limpio)
    if (ok) setTexto('')
    setEnviando(false)
    entrada.current?.focus()
  }

  if (!intercambio) return null

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={`Conversación con ${otra?.nombre?.split(' ')[0] ?? 'la otra persona'}`}
      descripcion="Canal privado del intercambio. No compartas teléfonos ni direcciones fuera de la plataforma."
      ancho="46rem"
    >
      <div className="chat-contexto">
        <div className="chat-prendas">
          <div>
            <PrendaMini prenda={ofrece} tamano="sm" onClick={onVerPrenda ? () => onVerPrenda(ofrece) : undefined} />
            <small>{ofrece?.titulo ?? 'Prenda ofrecida'}</small>
          </div>
          <span aria-hidden="true">⇄</span>
          <div>
            <PrendaMini prenda={pide} tamano="sm" onClick={onVerPrenda ? () => onVerPrenda(pide) : undefined} />
            <small>{pide?.titulo ?? 'Prenda solicitada'}</small>
          </div>
        </div>
        <div className="chat-persona">
          <Avatar nombre={otra?.nombre ?? ''} tamano={40} />
          <span>
            <b>{otra?.nombre ?? 'Miembro de la comunidad'}</b>
            <small>{otra?.ciudad} · {otra?.intercambios ?? 0} intercambios</small>
          </span>
          <Etiqueta tono={intercambio.estado === 'Completado' ? 'verde' : 'ambar'}>{intercambio.estado}</Etiqueta>
        </div>
        <button
          type="button"
          className="chat-impacto"
          onClick={() => abrirQrCon([
            ...new Set([...(ofrece?.composicion ?? []), ...(pide?.composicion ?? [])]),
          ])}
        >
          Ver el impacto de este intercambio
        </button>
      </div>

      <div className="charla" role="log" aria-live="polite" aria-label="Mensajes del intercambio">
        {lista.length === 0 ? (
          <div className="charla-vacia">
            <b>Todavía no hay mensajes</b>
            <p>Saluda, confirma el estado real de la prenda y acuerden cómo coordinarse.</p>
          </div>
        ) : (
          lista.map((m) => {
            const mio = m.autorId === usuario?.id
            return (
              <div key={m.id} className={`mensaje ${mio ? 'mio' : ''}`}>
                <span className="mensaje-texto">{m.texto}</span>
                <small>
                  {mio ? 'Tú' : buscarUsuario(m.autorId)?.nombre?.split(' ')[0] ?? 'Alguien'} · {fechaHora(m.creada)}
                </small>
              </div>
            )
          })
        )}
        <div ref={fin} />
      </div>

      <div className="charla-sugerencias" aria-label="Respuestas rápidas">
        {SUGERENCIAS.map((s) => (
          <button key={s} type="button" className="chip" onClick={() => { setTexto(s); entrada.current?.focus() }}>
            {s}
          </button>
        ))}
      </div>

      <form className="charla-enviar" onSubmit={enviar}>
        <Entrada
          ref={entrada}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje…"
          aria-label="Mensaje"
          maxLength={1200}
          disabled={enviando}
        />
        <Boton type="submit" disabled={!texto.trim() || enviando}>
          {enviando ? 'Enviando…' : 'Enviar'}
        </Boton>
      </form>
      <p className="charla-nota">
        Los mensajes quedan guardados en el historial de este intercambio. El equipo puede revisarlos si se abre un reporte.
      </p>
    </Modal>
  )
}
