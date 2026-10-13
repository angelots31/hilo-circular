import { useMemo, useState } from 'react'
import Garment from '../components/Garment.jsx'
import Mascot from '../components/Mascot.jsx'
import {
  Aparece, Area, Avatar, Boton, Dato, Entrada, EstadoVacio, Etiqueta,
  Modal, Pestanas, Seccion, TituloSeccion,
} from '../components/ui.jsx'
import { navigate } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'
import { mensajes as MENSAJES } from '../lib/seed.js'

const TONO = { Pendiente: 'ambar', Aceptado: 'verde', Rechazado: 'rojo', Completado: 'lavanda' }

export default function Intercambios() {
  const { intercambios, usuario, buscarPrenda, buscarUsuario, responderSolicitud, crearPedido, fecha, avisar } = useStore()
  const [pestana, setPestana] = useState('recibidas')
  const [charla, setCharla] = useState(null)
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [conversacion, setConversacion] = useState(MENSAJES)

  const recibidas = intercambios.filter((x) => x.receptorId === usuario.id)
  const enviadas = intercambios.filter((x) => x.solicitanteId === usuario.id)
  const completadas = intercambios.filter(
    (x) => x.estado === 'Completado' && (x.receptorId === usuario.id || x.solicitanteId === usuario.id),
  )

  const lista = useMemo(() => {
    if (pestana === 'recibidas') return recibidas
    if (pestana === 'enviadas') return enviadas
    return completadas
  }, [pestana, recibidas, enviadas, completadas])

  const aceptar = (x) => {
    responderSolicitud(x.id, 'Aceptado')
    const prenda = buscarPrenda(x.prendaId)
    crearPedido({
      prendaId: x.prendaId,
      usuarioId: x.receptorId,
      receptorId: x.solicitanteId,
      metodo: 'Domicilio',
      ciudad: prenda?.ciudad,
      costo: 11900,
      transportadora: 'Servientrega',
    })
  }

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim()) return
    setConversacion((c) => [...c, { id: `m${c.length + 1}`, de: usuario.id, para: charla, texto: nuevoMensaje, hora: 'ahora' }])
    setNuevoMensaje('')
  }

  const totalPendientes = recibidas.filter((x) => x.estado === 'Pendiente').length

  return (
    <>
      <Seccion tono="claro">
        <div className="contenedor">
          <TituloSeccion
            nivel={1}
            ceja="Mis intercambios"
            titulo="Solicitudes que llegan y que enviaste"
            texto="Acepta una propuesta y el sistema habilita el envío. Si algo cambia de planes, puedes cancelar antes de enviar."
            accion={<Boton to="/catalogo">Buscar más prendas</Boton>}
          />

          <div className="datos-rejilla">
            <Dato etiqueta="Solicitudes recibidas" valor={recibidas.length} nota={`${totalPendientes} por responder`} icono="📥" />
            <Dato etiqueta="Solicitudes enviadas" valor={enviadas.length} nota="Esperando respuesta" icono="📤" />
            <Dato etiqueta="Intercambios completados" valor={completadas.length} nota="Historial verificado" icono="✓" />
            <Dato etiqueta="Reputación" valor={usuario.reputacion.toFixed(1).replace('.', ',')} nota="Según las reseñas" icono="★" />
          </div>

          <Pestanas
            items={[
              { valor: 'recibidas', texto: 'Recibidas', cuenta: recibidas.length },
              { valor: 'enviadas', texto: 'Enviadas', cuenta: enviadas.length },
              { valor: 'completadas', texto: 'Completadas', cuenta: completadas.length },
            ]}
            activo={pestana}
            onChange={setPestana}
            className="pestanas-intercambios"
          />

          <div className="rejilla" style={{ marginTop: '1.6rem' }}>
            {lista.length === 0 ? (
              <EstadoVacio
                pose="duerme"
                titulo={pestana === 'recibidas' ? 'Todavía no tienes solicitudes' : 'Aún no has enviado solicitudes'}
                texto={
                  pestana === 'recibidas'
                    ? 'Cuando alguien quiera una de tus prendas, aparece aquí con la propuesta completa.'
                    : 'Explora el catálogo y propón un intercambio por la prenda que te guste.'
                }
                accion={
                  pestana === 'recibidas'
                    ? <Boton to="/subir">Publicar más prendas</Boton>
                    : <Boton to="/catalogo">Explorar el catálogo</Boton>
                }
              />
            ) : (
              lista.map((x, i) => {
                const ofrece = buscarPrenda(x.ofreceId)
                const pide = buscarPrenda(x.prendaId)
                const otra = buscarUsuario(x.solicitanteId === usuario.id ? x.receptorId : x.solicitanteId)
                const soyReceptor = x.receptorId === usuario.id
                return (
                  <Aparece key={x.id} retraso={(i % 3) * 70}>
                    <article className="intercambio">
                      <div>
                        <p style={{ fontSize: '0.78rem', opacity: 0.65, marginBottom: '0.35rem' }}>
                          {soyReceptor ? 'Solicitud recibida' : 'Solicitud enviada'} · {fecha(x.fecha)}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <Avatar nombre={otra?.nombre ?? ''} tamano={40} />
                          <div>
                            <b style={{ fontFamily: 'var(--fuente-titulo)' }}>{otra?.nombre}</b>
                            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{otra?.ciudad} · {otra?.intercambios} intercambios</p>
                          </div>
                        </div>
                      </div>

                      <div className="intercambio-prendas">
                        <div style={{ textAlign: 'center' }}>
                          <Garment tipo={ofrece?.tipo} paleta={ofrece?.paleta} alt="" />
                          <small style={{ fontSize: '0.72rem', opacity: 0.7 }}>Ofrece</small>
                        </div>
                        <span className="intercambio-flecha" aria-hidden="true">⇄</span>
                        <div style={{ textAlign: 'center' }}>
                          <Garment tipo={pide?.tipo} paleta={pide?.paleta} alt="" />
                          <small style={{ fontSize: '0.72rem', opacity: 0.7 }}>Quiere</small>
                        </div>
                      </div>

                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.92rem' }}>{ofrece?.titulo}</p>
                        <p style={{ fontSize: '0.82rem', opacity: 0.72 }}>por {pide?.titulo}</p>
                        <div className="chips" style={{ marginTop: '0.5rem' }}>
                          <Etiqueta tono={TONO[x.estado]}>{x.estado}</Etiqueta>
                          <Etiqueta tono="neutro">Valores de referencia: {ofrece?.valor} / {pide?.valor}</Etiqueta>
                        </div>
                      </div>

                      <div className="intercambio-acciones">
                        <Boton tamano="sm" variante="fantasma" onClick={() => setCharla(otra?.id)}>Mensajes</Boton>
                        {soyReceptor && x.estado === 'Pendiente' && (
                          <>
                            <Boton tamano="sm" onClick={() => aceptar(x)}>Aceptar</Boton>
                            <Boton tamano="sm" variante="fantasma" onClick={() => responderSolicitud(x.id, 'Rechazado')}>Rechazar</Boton>
                          </>
                        )}
                        {!soyReceptor && x.estado === 'Pendiente' && (
                          <Boton tamano="sm" variante="fantasma" onClick={() => responderSolicitud(x.id, 'Rechazado')}>Cancelar</Boton>
                        )}
                        {x.estado === 'Aceptado' && (
                          <Boton tamano="sm" onClick={() => navigate(`/domicilio?intercambio=${x.id}`)}>Coordinar domicilio</Boton>
                        )}
                        {x.estado === 'Completado' && (
                          <Boton tamano="sm" variante="texto" onClick={() => navigate('/resenas')}>Dejar reseña</Boton>
                        )}
                      </div>

                      {x.mensaje && (
                        <p style={{ gridColumn: '1 / -1', fontSize: '0.88rem', opacity: 0.82, borderTop: '1px dashed var(--línea)', paddingTop: '0.8rem' }}>
                          «{x.mensaje}»
                        </p>
                      )}
                    </article>
                  </Aparece>
                )
              })
            )}
          </div>
        </div>
      </Seccion>

      <Seccion tono="niebla">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.6vw, 2.6rem)' }}>Buena comunicación, mejores intercambios</h2>
              <p style={{ marginTop: '1rem', maxWidth: '34rem', opacity: 0.8 }}>
                Responde en menos de 24 horas: las solicitudes sin respuesta se archivan automáticamente a los cinco días.
                Si el estado de la prenda cambió, avísalo antes de enviar y ofrece una alternativa.
              </p>
              <div className="chips" style={{ marginTop: '1.2rem' }}>
                <Etiqueta tono="claro">Chat dentro de la plataforma</Etiqueta>
                <Etiqueta tono="claro">Cancelación sin penalización</Etiqueta>
                <Etiqueta tono="claro">Historial de cada acuerdo</Etiqueta>
              </div>
            </div>
            <div style={{ display: 'grid', placeItems: 'center' }}>
              <Mascot pose="sentado" />
            </div>
          </div>
        </div>
      </Seccion>

      <Modal
        abierto={!!charla}
        onCerrar={() => setCharla(null)}
        titulo="Conversación del intercambio"
        descripcion="Por seguridad, no compartas teléfonos ni direcciones por fuera de la plataforma."
      >
        <div className="charla">
          {conversacion.map((m) => (
            <div key={m.id} className={`mensaje ${m.de === usuario.id ? 'mio' : ''}`}>
              {m.texto}
              <small>{buscarUsuario(m.de)?.nombre ?? '—'} · {m.hora}</small>
            </div>
          ))}
        </div>
        <div className="charla-enviar">
          <Entrada
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
            placeholder="Escribe un mensaje…"
            aria-label="Mensaje"
          />
          <Boton onClick={enviarMensaje}>Enviar</Boton>
        </div>
        <Area placeholder="Adjunta una nota sobre el empaque o el estado (opcional)" rows={2} />
        <div className="chips">
          <button className="chip" onClick={() => avisar('Propuesta de punto de encuentro enviada.', 'ok')}>Proponer punto de encuentro</button>
          <button className="chip" onClick={() => avisar('Recordatorio enviado a la otra persona.', 'info')}>Recordar respuesta</button>
          <button className="chip" onClick={() => avisar('Solicitud escalada al equipo de soporte.', 'aviso')}>Escalar a soporte</button>
        </div>
      </Modal>
    </>
  )
}
