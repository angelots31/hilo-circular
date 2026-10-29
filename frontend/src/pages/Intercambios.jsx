import { useEffect, useMemo, useState } from 'react'
import ChatIntercambio from '../components/ChatIntercambio.jsx'
import DetallePrenda from '../components/DetallePrenda.jsx'
import Mascot from '../components/Mascot.jsx'
import PrendaMini from '../components/PrendaMini.jsx'
import {
  Aparece, Avatar, Boton, Dato, EstadoVacio, Etiqueta, Pestanas, Seccion, TituloSeccion,
} from '../components/ui.jsx'
import { navigate, useRoute } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'
import { abrirQrCon } from '../lib/qr.js'
import { celebrar } from '../lib/movimiento.js'

const TONO = { Pendiente: 'ambar', Aceptado: 'verde', Rechazado: 'rojo', Completado: 'lavanda', Cancelado: 'neutro' }

export default function Intercambios() {
  const {
    intercambios, prendas, usuario, buscarPrenda, buscarUsuario, responderSolicitud, fecha,
  } = useStore()
  const { query } = useRoute()
  const [pestana, setPestana] = useState('recibidas')
  const [charla, setCharla] = useState(null)
  const [detalle, setDetalle] = useState(null)

  const recibidas = useMemo(() => intercambios.filter((x) => x.receptorId === usuario.id), [intercambios, usuario.id])
  const enviadas = useMemo(() => intercambios.filter((x) => x.solicitanteId === usuario.id), [intercambios, usuario.id])
  const completadas = useMemo(
    () => intercambios.filter(
      (x) => x.estado === 'Completado' && (x.receptorId === usuario.id || x.solicitanteId === usuario.id),
    ),
    [intercambios, usuario.id],
  )

  const lista = useMemo(() => {
    if (pestana === 'recibidas') return recibidas
    if (pestana === 'enviadas') return enviadas
    return completadas
  }, [pestana, recibidas, enviadas, completadas])

  // Una notificación puede abrir directamente la conversación de un intercambio.
  const chatId = query.get('chat')
  useEffect(() => {
    if (!chatId) return
    const encontrado = intercambios.find((x) => x.id === chatId)
    if (encontrado) setCharla(encontrado)
  }, [chatId, intercambios])

  const cerrarChat = () => {
    setCharla(null)
    if (chatId) navigate('/intercambios', { replace: true })
  }

  const totalPendientes = recibidas.filter((x) => x.estado === 'Pendiente').length
  const reputacion = Number(usuario.reputacion ?? 0)
  const charlaActual = charla ? intercambios.find((x) => x.id === charla.id) ?? charla : null
  const detalleActual = detalle ? prendas.find((p) => p.id === detalle.id) ?? detalle : null

  return (
    <>
      <Seccion tono="claro">
        <div className="contenedor">
          <TituloSeccion
            nivel={1}
            ceja="Mis intercambios"
            titulo="Solicitudes que llegan y que enviaste"
            texto="Acepta una propuesta y coordina el envío o el punto de encuentro. Toda la conversación queda en el chat privado del intercambio."
            accion={<Boton to="/catalogo">Buscar más prendas</Boton>}
          />

          <div className="datos-rejilla">
            <Dato etiqueta="Solicitudes recibidas" valor={recibidas.length} nota={`${totalPendientes} por responder`} />
            <Dato etiqueta="Solicitudes enviadas" valor={enviadas.length} nota="Esperando respuesta" />
            <Dato etiqueta="Intercambios completados" valor={completadas.length} nota="Historial verificado" />
            <Dato etiqueta="Reputación" valor={reputacion.toFixed(1).replace('.', ',')} nota="Según las reseñas" />
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
                    <article className="intercambio intercambio-publico">
                      <div className="intercambio-contacto">
                        <p className="intercambio-tipo">
                          {soyReceptor ? 'Solicitud recibida' : 'Solicitud enviada'} · {fecha(x.fecha)}
                        </p>
                        <div className="intercambio-persona">
                          <Avatar nombre={otra?.nombre ?? ''} tamano={42} />
                          <div>
                            <b>{otra?.nombre ?? 'Miembro de la comunidad'}</b>
                            <p>{otra?.ciudad} · {otra?.intercambios ?? 0} intercambios</p>
                          </div>
                        </div>
                      </div>

                      <div className="intercambio-prendas-contexto">
                        <div className="intercambio-prenda">
                          <PrendaMini prenda={ofrece} onClick={() => setDetalle(ofrece)} />
                          <small>{ofrece?.titulo ?? 'Prenda ofrecida'}</small>
                          <em>{soyReceptor ? 'Ofrece' : 'Ofreces'}</em>
                        </div>
                        <span className="intercambio-flecha" aria-hidden="true">⇄</span>
                        <div className="intercambio-prenda">
                          <PrendaMini prenda={pide} onClick={() => setDetalle(pide)} />
                          <small>{pide?.titulo ?? 'Prenda solicitada'}</small>
                          <em>{soyReceptor ? 'Quiere' : 'Solicitas'}</em>
                        </div>
                      </div>

                      <div className="intercambio-resumen">
                        <div className="chips">
                          <Etiqueta tono={TONO[x.estado] ?? 'neutro'}>{x.estado}</Etiqueta>
                          <Etiqueta tono="neutro">Ref. {ofrece?.valor ?? '—'} / {pide?.valor ?? '—'}</Etiqueta>
                        </div>
                        <p>{ofrece?.titulo ?? 'Prenda ofrecida'} por <b>{pide?.titulo ?? 'prenda solicitada'}</b></p>
                      </div>

                      <div className="intercambio-acciones">
                        <Boton tamano="sm" variante="fantasma" onClick={() => setCharla(x)}>
                          Abrir chat
                        </Boton>
                        <Boton tamano="sm" variante="texto" onClick={() => setDetalle(pide ?? ofrece)}>
                          Ver prendas
                        </Boton>
                        <Boton
                          tamano="sm"
                          variante="texto"
                          onClick={() => abrirQrCon([
                            ...new Set([...(ofrece?.composicion ?? []), ...(pide?.composicion ?? [])]),
                          ])}
                        >
                          Ver el impacto de este intercambio
                        </Boton>
                        {soyReceptor && x.estado === 'Pendiente' && (
                          <>
                            <Boton tamano="sm" onClick={() => responderSolicitud(x.id, 'Aceptado')}>Aceptar</Boton>
                            <Boton tamano="sm" variante="fantasma" onClick={() => responderSolicitud(x.id, 'Rechazado')}>Rechazar</Boton>
                          </>
                        )}
                        {!soyReceptor && x.estado === 'Pendiente' && (
                          <Boton tamano="sm" variante="fantasma" onClick={() => responderSolicitud(x.id, 'Cancelado')}>Cancelar</Boton>
                        )}
                        {x.estado === 'Aceptado' && (
                          <>
                            <Boton tamano="sm" onClick={() => navigate(`/domicilio?intercambio=${x.id}`)}>Coordinar domicilio</Boton>
                            <Boton tamano="sm" variante="fantasma" onClick={async () => {
                              const ok = await responderSolicitud(x.id, 'Completado')
                              if (ok) celebrar()
                            }}>
                              Marcar completado
                            </Boton>
                          </>
                        )}
                        {x.estado === 'Completado' && (
                          <Boton tamano="sm" variante="texto" onClick={() => navigate('/resenas')}>Dejar reseña</Boton>
                        )}
                      </div>

                      {x.mensaje && <p className="intercambio-mensaje">«{x.mensaje}»</p>}
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
                Usa el chat privado del intercambio para confirmar el estado de la prenda, acordar el punto de
                encuentro y coordinar la entrega. No compartas teléfonos ni direcciones por fuera de la plataforma.
              </p>
              <div className="chips" style={{ marginTop: '1.2rem' }}>
                <Etiqueta tono="claro">Chat privado</Etiqueta>
                <Etiqueta tono="claro">Historial de cada acuerdo</Etiqueta>
                <Etiqueta tono="claro">Cancelación sin penalización</Etiqueta>
              </div>
            </div>
            <div className="mascota-panel" style={{ display: 'grid', placeItems: 'center' }}>
              <Mascot pose="sentado" />
            </div>
          </div>
        </div>
      </Seccion>

      <ChatIntercambio
        intercambio={charlaActual}
        abierto={Boolean(charla)}
        onCerrar={cerrarChat}
        onVerPrenda={(prenda) => prenda && setDetalle(prenda)}
      />
      <DetallePrenda
        prenda={detalleActual}
        abierto={Boolean(detalle)}
        onCerrar={() => setDetalle(null)}
      />
    </>
  )
}
