import { useMemo, useState } from 'react'
import Mascot from '../components/Mascot.jsx'
import PrendaMini from '../components/PrendaMini.jsx'
import {
  Aparece, Area, Avatar, Barra, Boton, Campo, Estrellas, EstadoVacio,
  Etiqueta, Modal, Seccion, Selector, TituloSeccion,
} from '../components/ui.jsx'
import { navigate } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'

export default function Resenas() {
  const { resenas, usuarios, prendas, usuario, buscarUsuario, publicarResena, responderResena, marcarResena, utilResena, fecha, avisar, intercambios } = useStore()
  const [filtro, setFiltro] = useState('todas')
  const [soloVerificadas, setSoloVerificadas] = useState(false)
  const [escribir, setEscribir] = useState(false)
  const [respondiendo, setRespondiendo] = useState(null)
  const [textoRespuesta, setTextoRespuesta] = useState('')
  const [borrador, setBorrador] = useState({ paraId: '', estrellas: 5, texto: '', prendaId: '' })
  const [alertas, setAlertas] = useState(() => {
    try { return localStorage.getItem('hilo-alertas-resenas') === '1' } catch { return false }
  })

  const visibles = useMemo(() => {
    let lista = resenas
    if (filtro !== 'todas') lista = lista.filter((r) => Math.round(r.estrellas) === Number(filtro))
    if (soloVerificadas) lista = lista.filter((r) => buscarUsuario(r.autorId)?.verificado)
    return lista
  }, [resenas, filtro, soloVerificadas, buscarUsuario])

  const promedio = resenas.length ? resenas.reduce((s, r) => s + r.estrellas, 0) / resenas.length : 0
  const distribucion = [5, 4, 3, 2, 1].map((n) => ({
    n,
    cantidad: resenas.filter((r) => Math.round(r.estrellas) === n).length,
  }))

  const relacionados = useMemo(() => {
    if (!usuario) return []
    return intercambios
      .filter((x) => ['Aceptado', 'Completado'].includes(x.estado) && (x.solicitanteId === usuario.id || x.receptorId === usuario.id))
      .map((x) => ({ paraId: x.solicitanteId === usuario.id ? x.receptorId : x.solicitanteId, prendas: [x.prendaId, x.ofreceId] }))
  }, [intercambios, usuario])
  const candidatos = useMemo(() => {
    const ids = [...new Set(relacionados.map((r) => r.paraId))]
    return usuarios.filter((u) => ids.includes(u.id))
  }, [usuarios, relacionados])
  const prendasRelacionadas = prendas.filter((p) => relacionados.some((r) => r.paraId === borrador.paraId && r.prendas.includes(p.id)))
  const abrirResena = () => {
    if (!usuario) return navigate('/entrar?volver=/resenas')
    if (!candidatos.length) return avisar('Podrás dejar una reseña cuando tengas un intercambio aceptado o completado.', 'aviso')
    setEscribir(true)
  }

  const [publicando, setPublicando] = useState(false)

  const enviar = async () => {
    if (!borrador.paraId) return avisar('Elige a quién le quieres dejar la reseña.', 'aviso')
    if (borrador.texto.trim().length < 20) return avisar('Cuéntanos un poco más: mínimo 20 caracteres.', 'aviso')
    setPublicando(true)
    const ok = await publicarResena({
      paraId: borrador.paraId,
      estrellas: borrador.estrellas,
      texto: borrador.texto,
      prendaId: borrador.prendaId || null,
    })
    setPublicando(false)
    if (!ok) return
    setEscribir(false)
    setBorrador({ paraId: '', estrellas: 5, texto: '', prendaId: '' })
  }

  return (
    <>
      <Seccion tono="claro">
        <div className="contenedor">
          <TituloSeccion
            nivel={1}
            ceja="Reseñas y reputación"
            titulo="La confianza se construye intercambio a intercambio"
            texto="Aquí se reúnen las experiencias de la comunidad. El 60 % de las personas encuestadas confía más en los testimonios de otros participantes que en cifras aisladas, así que cada reseña se puede responder y moderar."
            accion={<Boton tamano="lg" onClick={abrirResena}>Escribir una reseña</Boton>}
          />

          <div className="resumen-resenas">
            <div className="resumen-nota">
              <b>{promedio.toFixed(1).replace('.', ',')}</b>
              <Estrellas valor={Math.round(promedio)} />
              <p style={{ fontSize: '0.85rem', opacity: 0.72, marginTop: '0.4rem' }}>{resenas.length} reseñas publicadas</p>
            </div>
            <div className="resumen-barras">
              {distribucion.map((d) => (
                <div key={d.n}>
                  <span>{d.n} estrellas</span>
                  <Barra valor={d.cantidad} maximo={resenas.length || 1} tono={d.n >= 4 ? 'lavanda' : 'rosa'} />
                  <b>{d.cantidad}</b>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              <Etiqueta tono="verde">Solo tras un intercambio aceptado</Etiqueta>
              <Etiqueta tono="neutro">Texto revisado antes de publicar</Etiqueta>
              <Etiqueta tono="ambar">Una respuesta por persona</Etiqueta>
              <Boton
                variante="texto"
                onClick={() => {
                  const nuevo = !alertas
                  setAlertas(nuevo)
                  try { localStorage.setItem('hilo-alertas-resenas', nuevo ? '1' : '0') } catch { /* Sin almacenamiento, la preferencia dura la sesión. */ }
                  avisar(nuevo ? 'Alertas de reseñas activadas en este dispositivo.' : 'Alertas de reseñas desactivadas.', nuevo ? 'ok' : 'info')
                }}
              >
                {alertas ? 'Alertas de reseñas activadas' : 'Recibir alertas de reseñas'}
              </Boton>
            </div>
          </div>

          <div className="chips" style={{ marginBottom: '1.6rem' }}>
            <button className={`chip ${filtro === 'todas' ? 'activo' : ''}`} onClick={() => setFiltro('todas')}>Todas</button>
            {[5, 4, 3, 2, 1].map((n) => (
              <button key={n} className={`chip ${filtro === String(n) ? 'activo' : ''}`} onClick={() => setFiltro(String(n))}>
                {n} estrella{n > 1 ? 's' : ''}
              </button>
            ))}
            <button className={`chip ${soloVerificadas ? 'activo' : ''}`} onClick={() => setSoloVerificadas((v) => !v)}>
              Solo personas verificadas
            </button>
          </div>

          {visibles.length === 0 ? (
            <EstadoVacio
              pose="duerme"
              titulo="No hay reseñas con este filtro"
              texto="Puede que todavía nadie haya calificado con esas estrellas. Prueba otro filtro o deja tú la primera reseña."
              accion={<Boton onClick={() => setFiltro('todas')}>Ver todas las reseñas</Boton>}
            />
          ) : (
            <div className="rejilla dos">
              {visibles.map((r, i) => {
                const autor = buscarUsuario(r.autorId)
                const para = buscarUsuario(r.paraId)
                const prenda = prendas.find((p) => p.id === r.prendaId)
                const esMia = r.paraId === usuario?.id
                return (
                  <Aparece key={r.id} retraso={(i % 4) * 60}>
                    <article className="resena">
                      <Avatar nombre={autor?.nombre ?? ''} tamano={46} />
                      <div>
                        <div className="resena-cabeza">
                          <span className="resena-autor">
                            <b>{autor?.nombre}</b>
                            <small>
                              {fecha(r.fecha)} · para {para?.nombre}
                            </small>
                          </span>
                          <span style={{ display: 'grid', gap: '0.3rem', justifyItems: 'end' }}>
                            <Estrellas valor={r.estrellas} tamano={15} />
                            {r.reportada && <Etiqueta tono="ambar">En moderación</Etiqueta>}
                          </span>
                        </div>

                        <p className="resena-texto">{r.texto}</p>

                        {prenda && (
                          <a className="resena-prenda clicable" href={`#/prenda/${prenda.id}`}>
                            <PrendaMini prenda={prenda} tamano="xs" />
                            {prenda.titulo}
                          </a>
                        )}

                        {r.respuesta && (
                          <div className="resena-respuesta">
                            <b>Respuesta de {para?.nombre}</b>
                            {r.respuesta}
                          </div>
                        )}

                        <div className="resena-pie">
                          <button onClick={() => utilResena(r.id)}>Útil ({r.util})</button>
                          {esMia && !r.respuesta && (
                            <button onClick={() => { setRespondiendo(r.id); setTextoRespuesta('') }}>Responder</button>
                          )}
                          {esMia && r.respuesta && (
                            <button onClick={() => { setRespondiendo(r.id); setTextoRespuesta(r.respuesta) }}>Editar respuesta</button>
                          )}
                          {usuario && (
                            <button onClick={() => marcarResena(r.id, !r.reportada)}>
                              {r.reportada ? 'Restaurar' : 'Reportar'}
                            </button>
                          )}
                        </div>

                        {respondiendo === r.id && (
                          <div style={{ marginTop: '0.9rem', display: 'grid', gap: '0.6rem' }}>
                            <Area value={textoRespuesta} onChange={(e) => setTextoRespuesta(e.target.value)} placeholder="Gracias por el intercambio…" />
                            <div className="intercambio-acciones">
                              <Boton variante="fantasma" tamano="sm" onClick={() => setRespondiendo(null)}>Cancelar</Boton>
                              <Boton
                                tamano="sm"
                                onClick={async () => {
                                  const ok = await responderResena(r.id, textoRespuesta)
                                  if (ok) setRespondiendo(null)
                                }}
                              >
                                Publicar respuesta
                              </Boton>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  </Aparece>
                )
              })}
            </div>
          )}
        </div>
      </Seccion>

      <Seccion tono="rosa">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>¿Cómo cuidamos las reseñas?</h2>
              <p style={{ marginTop: '1rem', maxWidth: '34rem' }}>
                Solo se puede calificar después de un intercambio real, el texto pasa por revisión automática y cada
                persona puede responder una vez. La evidencia visible —fotos del antes y el después, estado real de la
                prenda— pesa más que cualquier promesa de sostenibilidad.
              </p>
              <div className="chips" style={{ marginTop: '1.4rem' }}>
                <Etiqueta tono="claro">Solo tras un intercambio</Etiqueta>
                <Etiqueta tono="claro">Una respuesta por persona</Etiqueta>
                <Etiqueta tono="claro">Reporte en un clic</Etiqueta>
              </div>
            </div>
            <div className="mascota-panel" style={{ display: 'grid', placeItems: 'center' }}>
              <Mascot pose="sentado" />
            </div>
          </div>
        </div>
      </Seccion>

      <Modal
        abierto={escribir}
        onCerrar={() => setEscribir(false)}
        titulo="Escribir una reseña"
        descripcion="Comparte cómo fue el intercambio: estado real de la prenda, tiempos de entrega y comunicación."
        pie={
          <>
            <Boton variante="fantasma" onClick={() => setEscribir(false)}>Cancelar</Boton>
            <Boton onClick={enviar} disabled={publicando}>{publicando ? 'Publicando…' : 'Publicar reseña'}</Boton>
          </>
        }
      >
        <div className="form-columnas">
          <Campo etiqueta="¿A quién calificas?" id="para">
            <Selector id="para" value={borrador.paraId} onChange={(e) => setBorrador({ ...borrador, paraId: e.target.value, prendaId: '' })}>
              <option value="">Elige una persona</option>
              {candidatos.map((u) => (
                <option key={u.id} value={u.id}>{u.nombre} · {u.ciudad}</option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Prenda del intercambio" id="prenda-resena">
            <Selector id="prenda-resena" value={borrador.prendaId} onChange={(e) => setBorrador({ ...borrador, prendaId: e.target.value })}>
              <option value="">Sin prenda asociada</option>
              {prendasRelacionadas.map((p) => (
                <option key={p.id} value={p.id}>{p.titulo}</option>
              ))}
            </Selector>
          </Campo>
        </div>

        <Campo etiqueta="Calificación" id="estrellas">
          <Estrellas valor={borrador.estrellas} tamano={30} onCambio={(n) => setBorrador({ ...borrador, estrellas: n })} />
        </Campo>

        <Campo etiqueta="Tu experiencia" ayuda="Mínimo 20 caracteres. Cuenta el estado real, la comunicación y el envío." id="texto-resena">
          <Area
            id="texto-resena"
            value={borrador.texto}
            onChange={(e) => setBorrador({ ...borrador, texto: e.target.value })}
            placeholder="La prenda llegó tal como estaba descrita y…"
          />
        </Campo>

      </Modal>
    </>
  )
}
