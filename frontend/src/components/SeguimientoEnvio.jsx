import PrendaMini from './PrendaMini.jsx'
import { Boton, Etiqueta } from './ui.jsx'
import { useStore } from '../lib/store.jsx'
import { copiarTexto } from '../lib/compartir.js'

const PASOS = ['Preparando', 'En camino', 'Entregado']

/**
 * Línea de tiempo del envío. Solo muestra datos de las personas que
 * participan en el pedido (el backend ya filtra esa información).
 */
export default function SeguimientoEnvio({ pedido, onVerPrenda, onAvanzar, compacto = false }) {
  const { buscarPrenda, buscarUsuario, fecha, precio, avisar, usuario } = useStore()
  if (!pedido) return null

  const prenda = buscarPrenda(pedido.prendaId)
  const origen = buscarUsuario(pedido.usuarioId)
  const destino = buscarUsuario(pedido.receptorId)
  const soyReceptor = Boolean(pedido.receptorId && pedido.receptorId === usuario?.id)
  const incidencia = pedido.estado === 'Incidencia'
  const actual = PASOS.indexOf(pedido.estado)
  const siguiente = !incidencia && actual >= 0 && actual < PASOS.length - 1 ? PASOS[actual + 1] : null

  const copiar = async () => {
    const ok = await copiarTexto(pedido.guia || '')
    avisar(ok ? `Guía ${pedido.guia} copiada.` : 'No pudimos copiar la guía.', ok ? 'ok' : 'aviso')
  }

  return (
    <article className={`seguimiento-envio${compacto ? ' compacto' : ''}`}>
      <header className="seguimiento-envio-cabeza">
        <div className="seguimiento-prenda">
          <PrendaMini prenda={prenda} tamano="md" onClick={onVerPrenda} />
          <div>
            <b>{prenda?.titulo ?? 'Prenda del intercambio'}</b>
            <p>Guía <strong>{pedido.guia}</strong> · {pedido.transportadora || 'Transportadora'}</p>
            <small>
              {soyReceptor
                ? `Enviado por ${origen?.nombre ?? 'la otra persona'}`
                : `Para ${destino?.nombre ?? 'la otra persona'}`}
              {' · '}{fecha(pedido.fecha)}
            </small>
          </div>
        </div>
        <Etiqueta tono={incidencia ? 'rojo' : pedido.estado === 'Entregado' ? 'verde' : 'ambar'}>
          {pedido.estado}
        </Etiqueta>
      </header>

      {incidencia ? (
        <div className="seguimiento-incidencia" role="status">
          <b>El envío tiene una incidencia.</b>
          <p>El equipo debe revisar el movimiento antes de continuar. Si necesitas ayuda, abre el chat del intercambio.</p>
        </div>
      ) : (
        <ol className="seguimiento-linea" aria-label="Estado del envío">
          {PASOS.map((paso, i) => (
            <li key={paso} className={i < actual ? 'hecho' : i === actual ? 'actual' : ''}>
              <span className="seguimiento-punto" aria-hidden="true">{i < actual ? '✓' : i + 1}</span>
              <span>
                <b>{paso}</b>
                <small>
                  {i === 0 && `Registrado el ${fecha(pedido.fecha)}`}
                  {i === 1 && (i <= actual ? 'El paquete salió a ruta' : 'Pendiente de salida')}
                  {i === 2 && (i <= actual ? 'Entrega confirmada' : 'Pendiente de confirmar')}
                </small>
              </span>
            </li>
          ))}
        </ol>
      )}

      <footer className="seguimiento-envio-pie">
        <div className="chips">
          <Etiqueta tono="neutro">{pedido.metodo || 'Domicilio'}</Etiqueta>
          <Etiqueta tono="neutro">{precio(pedido.costo)}</Etiqueta>
          {pedido.ciudad && <Etiqueta tono="neutro">{pedido.ciudad}</Etiqueta>}
        </div>
        <div className="intercambio-acciones">
          <Boton tamano="sm" variante="fantasma" onClick={copiar}>Copiar guía</Boton>
          {onVerPrenda && <Boton tamano="sm" variante="fantasma" onClick={onVerPrenda}>Ver prenda</Boton>}
          {siguiente && onAvanzar && (
            <Boton tamano="sm" onClick={() => onAvanzar(pedido, siguiente)}>Marcar {siguiente.toLowerCase()}</Boton>
          )}
        </div>
      </footer>
    </article>
  )
}
