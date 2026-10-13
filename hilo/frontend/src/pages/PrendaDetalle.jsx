import { useState } from 'react'
import Garment from '../components/Garment.jsx'
import { Vista, vistasDe } from '../components/Carrusel.jsx'
import Mascot from '../components/Mascot.jsx'
import PrendaCard from '../components/PrendaCard.jsx'
import { Avatar, Area, Boton, Campo, Estrellas, Etiqueta, Modal, Seccion, Selector, TituloSeccion, Aparece } from '../components/ui.jsx'
import { navigate } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'

export default function PrendaDetalle({ id }) {
  const [vistaIdx, setVistaIdx] = useState(0)
  const { prendas, usuarios, resenas, usuario, buscarPrenda, buscarUsuario, alternarFavorito, favoritos, solicitar, avisar, fecha } = useStore()
  const prenda = buscarPrenda(id)
  const vistas = vistasDe(prenda)
  const [abierto, setAbierto] = useState(false)
  const [ofrecida, setOfrecida] = useState('')
  const [mensaje, setMensaje] = useState('')

  if (!prenda) {
    return (
      <Seccion tono="claro">
        <div className="contenedor">
          <div className="vacio">
            <Mascot pose="duerme" className="vacio-mascota" flota />
            <h3>No encontramos esta prenda</h3>
            <p>Puede que ya tenga nuevo dueño o que el enlace esté mal escrito. Te dejamos el catálogo completo.</p>
            <div className="vacio-acciones">
              <Boton to="/catalogo" tamano="lg">Volver al catálogo</Boton>
            </div>
          </div>
        </div>
      </Seccion>
    )
  }

  const dueno = buscarUsuario(prenda.duenoId)
  const mias = prendas.filter((p) => p.duenoId === usuario?.id && p.disponible)
  const deLaPersona = [...resenas].filter((r) => r.paraId === prenda.duenoId)
  const similares = prendas.filter((p) => p.id !== prenda.id && p.categoria === prenda.categoria && p.disponible).slice(0, 3)
  const promedio = deLaPersona.length ? deLaPersona.reduce((s, r) => s + r.estrellas, 0) / deLaPersona.length : dueno?.reputacion ?? 0
  const esMia = prenda.duenoId === usuario?.id

  const enviarSolicitud = () => {
    if (!usuario) return navigate(`/entrar?volver=/prenda/${id}`)
    if (!ofrecida) return avisar('Elige cuál de tus prendas quieres ofrecer.', 'aviso')
    solicitar({ prendaId: prenda.id, ofreceId: ofrecida, receptorId: prenda.duenoId, mensaje })
    setAbierto(false)
    setMensaje('')
    navigate('/intercambios')
  }

  return (
    <>
      <Seccion tono="claro">
        <div className="contenedor">
          <p className="migas">
            <a href="#/catalogo">Catálogo</a> <span aria-hidden="true">/</span>
            <a href={`#/catalogo?cat=${encodeURIComponent(prenda.categoria)}`}>{prenda.categoria}</a> <span aria-hidden="true">/</span>
            <b>{prenda.titulo}</b>
          </p>

          <div className="detalle">
            <div>
              <div className="detalle-arte">
                <Vista vista={vistas[vistaIdx] ?? vistas[0]} prenda={prenda} alt={prenda.titulo} />
                <div className="prenda-etiquetas">
                  <Etiqueta tono="claro">{prenda.estado}</Etiqueta>
                  {!prenda.disponible && <Etiqueta tono="rojo">No disponible</Etiqueta>}
                </div>
              </div>
              <div className="miniaturas">
                {vistas.map((v, i) => (
                  <button key={v.clave} className={`miniatura ${i === vistaIdx ? 'activa' : ''}`} aria-label={`Ver ${v.etiqueta}`} onClick={() => setVistaIdx(i)}>
                    <Vista vista={v} prenda={prenda} />
                  </button>
                ))}
              </div>
            </div>

            <div className="detalle-info">
              <div className="chips" style={{ marginBottom: '0.9rem' }}>
                <Etiqueta tono="lavanda">{prenda.categoria}</Etiqueta>
                <Etiqueta tono="neutro">Talla {prenda.talla}</Etiqueta>
                <Etiqueta tono="rosa">{prenda.color}</Etiqueta>
                {prenda.destacada && <Etiqueta tono="destacada">Curada por el equipo</Etiqueta>}
              </div>

              <h1>{prenda.titulo}</h1>
              <p style={{ opacity: 0.8 }}>{prenda.descripcion}</p>

              <div className="detalle-precio">
                <b>Valor ref. {prenda.valor}</b>
                <span style={{ opacity: 0.7 }}>valor de referencia para el intercambio</span>
              </div>

              <ul className="detalle-lista">
                <li><span>Marca</span><b>{prenda.marca}</b></li>
                <li><span>Estado</span><b>{prenda.estado}</b></li>
                <li><span>Ciudad</span><b>{prenda.ciudad}</b></li>
                <li><span>Publicada</span><b>{fecha(prenda.creada)}</b></li>
                <li><span>Visitas</span><b>{prenda.vistas}</b></li>
              </ul>

              <article className="tarjeta" style={{ marginTop: '1.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                  <Avatar nombre={dueno?.nombre ?? ''} tamano={52} />
                  <div>
                    <b style={{ fontFamily: 'var(--fuente-titulo)', fontSize: '1.1rem' }}>{dueno?.nombre}</b>
                    <p style={{ fontSize: '0.85rem', opacity: 0.72 }}>
                      {dueno?.ciudad} · {dueno?.intercambios} intercambios
                      {dueno?.verificado && ' · identidad verificada'}
                    </p>
                  </div>
                  <span style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <Estrellas valor={Math.round(promedio)} tamano={16} />
                    <small style={{ display: 'block', fontSize: '0.78rem', opacity: 0.7 }}>
                      {promedio.toFixed(1).replace('.', ',')} · {deLaPersona.length} reseñas
                    </small>
                  </span>
                </div>
                <p style={{ marginTop: '0.9rem', fontSize: '0.9rem', opacity: 0.85 }}>{dueno?.bio}</p>
              </article>

              <div className="detalle-acciones">
                <Boton tamano="lg" onClick={() => (usuario ? setAbierto(true) : navigate(`/entrar?volver=/prenda/${id}`))} disabled={!prenda.disponible || esMia}>
                  {esMia ? 'Esta prenda es tuya' : 'Proponer un intercambio'}
                </Boton>
                <Boton variante={favoritos.includes(prenda.id) ? 'lavanda' : 'fantasma'} tamano="lg" className={favoritos.includes(prenda.id) ? 'prenda-guardada' : ''} onClick={() => alternarFavorito(prenda.id)}>
                  {favoritos.includes(prenda.id) ? '★ Guardada' : '☆ Guardar'}
                </Boton>
                <Boton variante="texto" tamano="lg" onClick={() => avisar('Enlace copiado para compartir esta prenda.', 'ok')}>
                  Compartir
                </Boton>
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.68 }}>
                Domicilio o punto de encuentro a coordinar en {prenda.ciudad}. Envío con guía y seguimiento desde el panel.
              </p>
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion tono="niebla">
        <div className="contenedor">
          <TituloSeccion
            ceja="Opiniones de la comunidad"
            titulo={`Lo que dicen de ${dueno?.nombre.split(' ')[0]}`}
            accion={<Boton to="/resenas" variante="fantasma">Ver todas las reseñas</Boton>}
          />
          <div className="rejilla dos">
            {deLaPersona.slice(0, 2).map((r) => {
              const autor = buscarUsuario(r.autorId)
              return (
                <article className="resena" key={r.id}>
                  <Avatar nombre={autor?.nombre ?? ''} tamano={44} />
                  <div>
                    <div className="resena-cabeza">
                      <span className="resena-autor">
                        <b>{autor?.nombre}</b>
                        <small>{fecha(r.fecha)}</small>
                      </span>
                      <Estrellas valor={r.estrellas} tamano={15} />
                    </div>
                    <p className="resena-texto">{r.texto}</p>
                  </div>
                </article>
              )
            })}
            {deLaPersona.length === 0 && (
              <p style={{ opacity: 0.75 }}>Todavía no hay reseñas de esta persona. Después del primer intercambio podrás dejar la tuya.</p>
            )}
          </div>
        </div>
      </Seccion>

      {similares.length > 0 && (
        <Seccion tono="claro">
          <div className="contenedor">
            <TituloSeccion ceja="Puede interesarte" titulo={`Más prendas en ${prenda.categoria}`} />
            <div className="catalogo-rejilla">
              {similares.map((p) => (
                <Aparece key={p.id}>
                  <PrendaCard prenda={p} />
                </Aparece>
              ))}
            </div>
          </div>
        </Seccion>
      )}

      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo="Proponer un intercambio"
        descripcion={`Ofrece una prenda tuya y cuéntale a ${dueno?.nombre.split(' ')[0]} por qué te interesa.`}
        pie={
          <>
            <Boton variante="fantasma" onClick={() => setAbierto(false)}>Cancelar</Boton>
            <Boton onClick={enviarSolicitud}>Enviar solicitud</Boton>
          </>
        }
      >
        <div className="tarjeta" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Garment tipo={prenda.tipo} paleta={prenda.paleta} alt="" className="mini-arte" />
          <div>
            <b style={{ fontFamily: 'var(--fuente-titulo)' }}>{prenda.titulo}</b>
            <p style={{ fontSize: '0.85rem', opacity: 0.72 }}>Valor ref. {prenda.valor} · Talla {prenda.talla}</p>
          </div>
        </div>

        {mias.length === 0 ? (
          <div className="auth-demo">
            <b>Aún no tienes prendas publicadas</b>
            <p>Para proponer un intercambio necesitas al menos una prenda disponible en tu clóset.</p>
            <Boton to="/subir" tamano="sm" style={{ justifySelf: 'start' }}>Subir una prenda</Boton>
          </div>
        ) : (
          <Campo etiqueta="¿Qué prenda ofreces?" id="ofrecer">
            <Selector id="ofrecer" value={ofrecida} onChange={(e) => setOfrecida(e.target.value)}>
              <option value="">Elige una prenda de tu clóset</option>
              {mias.map((p) => (
                <option key={p.id} value={p.id}>{p.titulo} · Valor ref. {p.valor}</option>
              ))}
            </Selector>
          </Campo>
        )}

        <Campo etiqueta="Mensaje" ayuda="Cuéntale el estado real de tu prenda y cómo te gustaría coordinar." id="mensaje">
          <Area id="mensaje" value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Hola, me encanta tu prenda. Te ofrezco…" />
        </Campo>

        <div className="auth-demo">
          <b>Cómo sigue el proceso</b>
          <ol style={{ margin: 0, paddingLeft: '1.1rem', opacity: 0.85 }}>
            <li>La otra persona recibe tu solicitud y decide si acepta.</li>
            <li>Si acepta, cada quien programa el envío desde su panel.</li>
            <li>Al recibir, las dos partes se califican con una reseña.</li>
          </ol>
        </div>
      </Modal>
    </>
  )
}
