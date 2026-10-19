import { useState } from 'react'
import PanelShell from '../components/PanelShell.jsx'
import Garment from '../components/Garment.jsx'
import Mascot from '../components/Mascot.jsx'
import PrendaCard from '../components/PrendaCard.jsx'
import {
  Aparece, Area, Avatar, Barra, Boton, Campo, Dato, Entrada, EstadoVacio,
  Estrellas, Etiqueta, Modal, Pasos, Pestanas, Selector,
} from '../components/ui.jsx'
import { navigate } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'
import { subirImagen } from '../lib/api.js'
import { BARRIOS, CATEGORIAS, CIUDAD, ESTADOS, TALLAS } from '../lib/seed.js'
import { descargarJSON } from '../lib/descargas.js'

const SECCIONES = [
  { valor: 'resumen', texto: 'Resumen', icono: 'resumen' },
  { valor: 'prendas', texto: 'Mis prendas', icono: 'prendas' },
  { valor: 'intercambios', texto: 'Intercambios', icono: 'intercambios' },
  { valor: 'envios', texto: 'Envíos', icono: 'envios' },
  { valor: 'resenas', texto: 'Reseñas', icono: 'resenas' },
  { valor: 'favoritos', texto: 'Favoritos', icono: 'favoritos' },
  { valor: 'ajustes', texto: 'Ajustes', icono: 'ajustes' },
]

const ESTADOS_SEGUIMIENTO = ['Preparando', 'En camino', 'Entregado']
const ESTADOS_CERRADOS = new Set(['Rechazado', 'Completado', 'Cancelado'])

export default function Panel({ seccion = 'resumen' }) {
  const {
    usuario, usuarios, prendas, pedidos, intercambios, resenas, favoritos, buscarPrenda, buscarUsuario, notificaciones,
    fecha, precio, actualizarPerfil, destacar, eliminarPrenda, alternarDisponible,
    responderResena, avisar, responderSolicitud, crearPedido, publicarPrenda,
  } = useStore()

  const [vista, setVista] = useState(SECCIONES.some((s) => s.valor === seccion) ? seccion : 'resumen')
  const [perfil, setPerfil] = useState({ ...usuario, direccion: usuario.direccion ?? '' })
  const [respuesta, setRespuesta] = useState({ id: '', texto: '' })
  const [preferencias, setPreferencias] = useState(() => {
    const base = { solicitudes: true, envios: true, resenas: true, novedades: false }
    try { return { ...base, ...JSON.parse(localStorage.getItem(`hilo-preferencias-${usuario.id}`) || '{}') } } catch { return base }
  })
  const [subirAbierto, setSubirAbierto] = useState(false)
  const [envioDetalle, setEnvioDetalle] = useState(null)
  const [filtroIntercambios, setFiltroIntercambios] = useState('todos')
  const [nuevaPrenda, setNuevaPrenda] = useState({ titulo: '', categoria: 'Camisetas', talla: 'M', estado: 'Como nuevo', color: 'Lavanda', descripcion: '', foto: '' })
  const [archivoFoto, setArchivoFoto] = useState(null)
  const [subiendoPrenda, setSubiendoPrenda] = useState(false)
  const [resenaAmpliada, setResenaAmpliada] = useState('')

  const mias = prendas.filter((p) => p.duenoId === usuario.id)
  const misPedidos = pedidos.filter((p) => p.usuarioId === usuario.id || p.receptorId === usuario.id)
  const misResenas = resenas.filter((r) => r.paraId === usuario.id)
  const misIntercambios = intercambios.filter((x) => x.receptorId === usuario.id || x.solicitanteId === usuario.id)
  const pendientes = misIntercambios.filter((x) => x.receptorId === usuario.id && x.estado === 'Pendiente')
  const intercambiosFiltrados = misIntercambios.filter((x) => {
    if (filtroIntercambios === 'por-responder') return x.receptorId === usuario.id && x.estado === 'Pendiente'
    if (filtroIntercambios === 'enviados') return x.solicitanteId === usuario.id
    if (filtroIntercambios === 'cerrados') return ESTADOS_CERRADOS.has(x.estado)
    return true
  })
  const misFavoritos = prendas.filter((p) => favoritos.includes(p.id))
  const promedio = misResenas.length ? misResenas.reduce((s, r) => s + r.estrellas, 0) / misResenas.length : usuario.reputacion

  const notificacionesUsuario = notificaciones

  const subirDesdePanel = async (e) => {
    e.preventDefault()
    if (nuevaPrenda.titulo.trim().length < 6) return avisar('El título debe tener al menos 6 caracteres.', 'aviso')
    if (nuevaPrenda.descripcion.trim().length < 20) return avisar('Describe un poco más el estado y uso de la prenda.', 'aviso')
    const colores = { Lavanda: '#6872aa', Ciruela: '#5d4655', Rosa: '#e5c4c6', Niebla: '#e2deea' }
    const tiposPorCategoria = { Calzado: 'zapatillas', Chaquetas: 'chaqueta', Vestidos: 'vestido', Pantalones: 'pantalon', Faldas: 'falda', Abrigos: 'abrigo', Punto: 'sueter', Accesorios: 'bolso' }
    const tipo = tiposPorCategoria[nuevaPrenda.categoria] ?? 'camiseta'
    setSubiendoPrenda(true)
    try {
      const fotos = archivoFoto ? [await subirImagen(archivoFoto)] : []
      const ok = await publicarPrenda({
        ...nuevaPrenda, tipo, marca: '', valor: 45, fotos,
        barrio: usuario.barrio, paleta: [colores[nuevaPrenda.color] || '#6872aa', '#5d4655'],
      })
      if (!ok) return
      setNuevaPrenda({ titulo: '', categoria: 'Camisetas', talla: 'M', estado: 'Como nuevo', color: 'Lavanda', descripcion: '', foto: '' })
      setArchivoFoto(null)
      setSubirAbierto(false)
      setVista('prendas')
      navigate('/panel?seccion=prendas')
    } catch (error) {
      avisar(error.message || 'No pudimos subir la foto.', 'aviso')
    } finally {
      setSubiendoPrenda(false)
    }
  }

  const aceptarSolicitud = (x) => {
    if (x.estado !== 'Pendiente' || x.receptorId !== usuario.id) return
    responderSolicitud(x.id, 'Aceptado')
    const prenda = buscarPrenda(x.prendaId)
    crearPedido({ prendaId: x.prendaId, intercambioId: x.id, usuarioId: x.receptorId, receptorId: x.solicitanteId, metodo: 'Domicilio', ciudad: prenda?.ciudad ?? usuario.ciudad, costo: 11900, transportadora: 'Servientrega' })
  }

  const cambiar = (valor) => {
    setVista(valor)
    navigate(`/panel?seccion=${valor}`)
  }

  return (
    <PanelShell
      ceja="Mi panel"
      titulo={`Hola, ${usuario.nombre.split(' ')[0]}`}
      texto={`${usuario.ciudad} · ${usuario.intercambios} intercambios · reputación ${promedio.toFixed(1).replace('.', ',')}${usuario.verificado ? ' · identidad verificada' : ''}`}
      mostrarEncabezado={vista === 'resumen'}
      tituloSeccion={SECCIONES.find((s) => s.valor === vista)?.texto ?? 'Mi panel'}
      textoSeccion={{ prendas: 'Organiza tus publicaciones y su disponibilidad.', intercambios: 'Gestiona las propuestas que recibes y las que envías.', envios: 'Consulta guías, costos y estado de tus envíos.', resenas: 'Lee y responde las opiniones que la comunidad deja en tu perfil.', favoritos: 'Tus prendas guardadas para revisar después.', ajustes: 'Mantén actualizados tus datos de cuenta.' }[vista] ?? ''}
      notificaciones={notificacionesUsuario}
      usuarioId={usuario.id}
      secciones={SECCIONES}
      vista={vista}
      onCambiar={cambiar}
      insignias={{ intercambios: pendientes.length }}
      usuarioNombre={usuario.nombre}
      rol="Cuenta de cliente"
    >
          <div>
            {vista === 'resumen' && (
              <>
                <div className="datos-rejilla">
                  <Dato etiqueta="Prendas publicadas" valor={mias.length} nota={`${mias.filter((p) => p.disponible).length} disponibles`} />
                  <Dato etiqueta="Solicitudes por responder" valor={pendientes.length} nota="Responden en 24 h" />
                  <Dato etiqueta="Envíos activos" valor={misPedidos.filter((p) => p.estado !== 'Entregado').length} nota="Con seguimiento" />
                  <Dato etiqueta="Reputación" valor={promedio.toFixed(1).replace('.', ',')} nota={`${misResenas.length} reseñas`} />
                </div>

                <div className="rejilla dos">
                  <article className="panel-tarjeta">
                    <h3>Próximos pasos</h3>
                    <p>Lo que conviene hacer esta semana para mover tu clóset.</p>
                    <ul className="lista-tareas">
                      {[
                        { texto: 'Responder las solicitudes pendientes', hecho: pendientes.length === 0 },
                        { texto: 'Completar las fotos de tus prendas', hecho: mias.length > 0 },
                        { texto: 'Dejar la reseña del último intercambio', hecho: misResenas.length > 0 },
                        { texto: 'Verificar tu identidad', hecho: usuario.verificado },
                      ].map((t) => (
                        <li key={t.texto} className={t.hecho ? 'hecho' : ''}>
                          <span aria-hidden="true">{t.hecho ? '✓' : '○'}</span>
                          {t.texto}
                        </li>
                      ))}
                    </ul>
                  </article>

                  <article className="panel-tarjeta">
                    <h3>Actividad reciente</h3>
                    <p>Últimos movimientos de tu cuenta.</p>
                    <ul className="lista-actividad">
                      {notificacionesUsuario.length ? notificacionesUsuario.map((n) => (
                        <li key={n.id}>
                          <span className={`aviso-icono ${n.tipo}`} aria-hidden="true" />
                          <div><p>{n.texto}</p><small>{n.fecha}</small></div>
                        </li>
                      )) : <li><p>No hay actividad reciente para tu cuenta.</p></li>}
                    </ul>
                  </article>

                  <article className="panel-tarjeta">
                    <h3>Tu clóset en números</h3>
                    <p>Distribución por categoría de las prendas que publicaste.</p>
                    <div style={{ display: 'grid', gap: '0.8rem', marginTop: '0.6rem' }}>
                      {[...new Set(mias.map((p) => p.categoria))].map((c) => (
                        <div key={c} style={{ display: 'grid', gap: '0.35rem' }}>
                          <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span>{c}</span>
                            <b>{mias.filter((p) => p.categoria === c).length}</b>
                          </span>
                          <Barra
                            valor={mias.filter((p) => p.categoria === c).length}
                            maximo={mias.length || 1}
                            titulo={`${c}: ${mias.filter((p) => p.categoria === c).length} de ${mias.length} prendas`}
                          />
                        </div>
                      ))}
                      {mias.length === 0 && <p style={{ opacity: 0.7, fontSize: '0.88rem' }}>Aún no has publicado prendas.</p>}
                    </div>
                  </article>

                  <article className="panel-tarjeta">
                    <h3>Impacto circular</h3>
                    <p>Lo que has aportado a la comunidad.</p>
                    <div className="chips">
                      <Etiqueta tono="verde">{usuario.intercambios * 3} kg de ropa reutilizada</Etiqueta>
                      <Etiqueta tono="lavanda">{usuario.intercambios} prendas con nueva vida</Etiqueta>
                      <Etiqueta tono="rosa">{Math.round(usuario.intercambios * 1.4)} envíos con empaque reutilizado</Etiqueta>
                    </div>
                    <div style={{ display: 'grid', placeItems: 'center', marginTop: '1rem' }}>
                      <Mascot pose="duerme" style={{ width: 'min(190px, 46vw)' }} />
                    </div>
                  </article>
                </div>
              </>
            )}

            {vista === 'prendas' && (
              <>
                <div className="panel-cabeza">
                  <div>
                    <h2 style={{ fontSize: '1.7rem' }}>Mis prendas</h2>
                    <p>{mias.length} publicaciones · {mias.filter((p) => p.disponible).length} activas</p>
                  </div>
                  <Boton onClick={() => setSubirAbierto(true)}>Subir nueva prenda</Boton>
                </div>

                {mias.length === 0 ? (
                  <EstadoVacio
                    pose="saluda"
                    titulo="Tu clóset circular está vacío"
                    texto="Publica tu primera prenda y empieza a recibir propuestas de personas de tu ciudad."
                    accion={<Boton tamano="lg" onClick={() => setSubirAbierto(true)}>Subir mi primera prenda</Boton>}
                  />
                ) : (
                  <div className="catalogo-rejilla">
                    {mias.map((p, i) => (
                      <Aparece key={p.id} retraso={(i % 4) * 60}>
                        <PrendaCard
                          prenda={p}
                          onEliminar={eliminarPrenda}
                          acciones={
                            <div className="chips" style={{ marginTop: '0.6rem' }}>
                              <button className="chip" onClick={() => alternarDisponible(p.id)}>
                                {p.disponible ? 'Pausar' : 'Activar'}
                              </button>
                              <button className="chip" onClick={() => destacar(p.id)}>
                                {p.destacada ? 'Quitar destacado' : 'Postular a destacado'}
                              </button>
                            </div>
                          }
                        />
                      </Aparece>
                    ))}
                  </div>
                )}
              </>
            )}

            {vista === 'intercambios' && (
              <>
                <div className="panel-cabeza">
                  <div>
                    <h2 style={{ fontSize: '1.7rem' }}>Intercambios</h2>
                    <p>{pendientes.length} solicitudes por responder · {misIntercambios.length} movimientos en total</p>
                  </div>
                  <Pestanas
                    items={[
                      { valor: 'todos', texto: 'Todos', cuenta: misIntercambios.length },
                      { valor: 'por-responder', texto: 'Por responder', cuenta: pendientes.length },
                      { valor: 'enviados', texto: 'Enviados' },
                      { valor: 'cerrados', texto: 'Finalizados' },
                    ]}
                    activo={filtroIntercambios}
                    onChange={setFiltroIntercambios}
                  />
                </div>
                {intercambiosFiltrados.length === 0 ? (
                  <EstadoVacio
                    compacto
                    pose="duerme"
                    titulo={filtroIntercambios === 'por-responder' ? 'No tienes solicitudes por responder' : 'No hay intercambios en esta vista'}
                    texto={filtroIntercambios === 'enviados' ? 'Aquí aparecerán las propuestas que envíes desde el catálogo.' : 'Cuando haya novedades, podrás consultar el estado y gestionar cada propuesta desde aquí.'}
                  />
                ) : (
                  <div className="rejilla dos">
                    {intercambiosFiltrados.map((x) => {
                      const ofrece = buscarPrenda(x.ofreceId)
                      const pide = buscarPrenda(x.prendaId)
                      const esEntrante = x.receptorId === usuario.id
                      const otraPersona = buscarUsuario(esEntrante ? x.solicitanteId : x.receptorId)
                      const tonoEstado = x.estado === 'Aceptado' || x.estado === 'Completado' ? 'verde' : x.estado === 'Rechazado' || x.estado === 'Cancelado' ? 'rojo' : 'ambar'
                      return (
                        <article className="intercambio intercambio-panel" key={x.id}>
                          <div className="intercambio-panel-cabeza">
                            <div>
                              <b style={{ fontFamily: 'var(--fuente-titulo)' }}>{otraPersona?.nombre ?? 'Miembro de la comunidad'}</b>
                              <p style={{ fontSize: '0.82rem', opacity: 0.7 }}>{fecha(x.fecha)} · {esEntrante ? 'Recibido' : 'Enviado por ti'}</p>
                            </div>
                            <Etiqueta tono={tonoEstado}>{x.estado}</Etiqueta>
                          </div>
                          <div className="intercambio-prendas">
                            <Garment tipo={ofrece?.tipo} paleta={ofrece?.paleta} alt="" />
                            <span className="intercambio-flecha" aria-hidden="true">⇄</span>
                            <Garment tipo={pide?.tipo} paleta={pide?.paleta} alt="" />
                          </div>
                          <p className="intercambio-panel-descripcion">{ofrece?.titulo ?? 'Prenda ofrecida'} por <b>{pide?.titulo ?? 'prenda solicitada'}</b></p>
                          {x.mensaje && <p className="intercambio-panel-mensaje">“{x.mensaje}”</p>}
                          {x.estado === 'Pendiente' && esEntrante && (
                            <div className="intercambio-acciones">
                              <Boton tamano="sm" onClick={() => aceptarSolicitud(x)}>Aceptar y crear envío</Boton>
                              <Boton tamano="sm" variante="fantasma" onClick={() => responderSolicitud(x.id, 'Rechazado')}>Rechazar</Boton>
                            </div>
                          )}
                          {x.estado === 'Pendiente' && !esEntrante && (
                            <div className="intercambio-acciones">
                              <Boton tamano="sm" variante="fantasma" onClick={() => responderSolicitud(x.id, 'Cancelado')}>Cancelar solicitud</Boton>
                            </div>
                          )}
                          {x.estado === 'Aceptado' && <div className="intercambio-acciones"><Boton tamano="sm" variante="lavanda" onClick={() => cambiar('envios')}>Ver envíos</Boton></div>}
                        </article>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {vista === 'envios' && (
              <>
                <div className="panel-cabeza">
                  <div>
                    <h2 style={{ fontSize: '1.7rem' }}>Mis envíos</h2>
                    <p>Cada envío tiene guía, transportadora y tres estados.</p>
                  </div>
                  <Boton to="/domicilio" variante="fantasma">Ver talleres y entregas</Boton>
                </div>

                <div className="datos-rejilla panel-envios-resumen">
                  <Dato etiqueta="Preparando" valor={misPedidos.filter((p) => p.estado === 'Preparando').length} nota="Listos para salir" />
                  <Dato etiqueta="En camino" valor={misPedidos.filter((p) => p.estado === 'En camino').length} nota="Seguimiento activo" />
                  <Dato etiqueta="Entregados" valor={misPedidos.filter((p) => p.estado === 'Entregado').length} nota="Entrega confirmada" />
                  <Dato etiqueta="Incidencias" valor={misPedidos.filter((p) => p.estado === 'Incidencia').length} nota="Necesitan revisión" />
                </div>

                {misPedidos.length === 0 ? (
                  <EstadoVacio compacto pose="camina" titulo="Todavía no has programado envíos" texto="Cuando aceptes un intercambio podrás programar la recolección." accion={<Boton to="/intercambios">Ver intercambios</Boton>} />
                ) : (
                  <div className="tabla-envoltorio">
                    <table className="tabla">
                      <thead>
                        <tr>
                          <th>Prenda</th>
                          <th>Guía</th>
                          <th>Método</th>
                          <th>Costo</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {misPedidos.map((p) => {
                          const prenda = buscarPrenda(p.prendaId)
                          return (
                            <tr key={p.id}>
                              <td><b>{prenda?.titulo ?? 'Prenda'}</b><br /><small style={{ opacity: 0.7 }}>{fecha(p.fecha)}</small></td>
                              <td>{p.guia}<br /><small style={{ opacity: 0.7 }}>{p.transportadora}</small></td>
                              <td>{p.metodo}</td>
                              <td>{precio(p.costo)}</td>
                              <td><Etiqueta tono={p.estado === 'Entregado' ? 'verde' : p.estado === 'Incidencia' ? 'rojo' : 'ambar'}>{p.estado}</Etiqueta></td>
                              <td>
                                <div className="acciones-celda">
                                  <Boton className="mini" variante="fantasma" onClick={() => setEnvioDetalle(p)}>
                                    Ver seguimiento
                                  </Boton>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {vista === 'resenas' && (
              <>
                <div className="panel-cabeza">
                  <div>
                    <h2 style={{ fontSize: '1.7rem' }}>Reseñas sobre ti</h2>
                    <p>{misResenas.length} opiniones · promedio {promedio.toFixed(1).replace('.', ',')}</p>
                  </div>
                  <Estrellas valor={Math.round(promedio)} tamano={22} />
                </div>

                {misResenas.length === 0 ? (
                  <EstadoVacio pose="duerme" titulo="Aún no tienes reseñas" texto="Después del primer intercambio completado, la otra persona podrá calificarte." accion={<Boton to="/catalogo">Buscar un intercambio</Boton>} />
                ) : (
                  <div className="rejilla dos">
                    {misResenas.map((r) => {
                      const autor = buscarUsuario(r.autorId)
                      return (
                        <article className={`resena resena-panel-mini ${resenaAmpliada === r.id ? 'expandida' : ''}`} key={r.id}>
                          <Avatar nombre={autor?.nombre ?? ''} tamano={44} />
                          <div>
                            <div className="resena-cabeza">
                              <span className="resena-autor">
                                <b>{autor?.nombre}</b>
                                <small>{fecha(r.fecha)}</small>
                              </span>
                              <Estrellas valor={r.estrellas} tamano={15} />
                            </div>
                            <p className={`resena-texto ${resenaAmpliada === r.id ? 'expandida' : ''}`}>{r.texto}</p>
                            <button className="resena-expandir" type="button" onClick={() => setResenaAmpliada(resenaAmpliada === r.id ? '' : r.id)}>
                              {resenaAmpliada === r.id ? 'Ver menos' : 'Ampliar reseña'}
                            </button>
                            {r.respuesta ? (
                              <div className="resena-respuesta">
                                <b>Tu respuesta</b>
                                {r.respuesta}
                              </div>
                            ) : (
                              <div style={{ display: 'grid', gap: '0.6rem' }}>
                                {respuesta.id === r.id ? (
                                  <>
                                    <Area value={respuesta.texto} onChange={(e) => setRespuesta({ ...respuesta, texto: e.target.value })} placeholder="Gracias por el intercambio…" rows={3} />
                                    <div className="intercambio-acciones">
                                      <Boton tamano="sm" variante="fantasma" onClick={() => setRespuesta({ id: '', texto: '' })}>Cancelar</Boton>
                                      <Boton
                                        tamano="sm"
                                        disabled={!respuesta.texto.trim()}
                                        onClick={() => {
                                          responderResena(r.id, respuesta.texto.trim())
                                          setRespuesta({ id: '', texto: '' })
                                        }}
                                      >
                                        Publicar respuesta
                                      </Boton>
                                    </div>
                                  </>
                                ) : (
                                  <Boton tamano="sm" variante="texto" onClick={() => setRespuesta({ id: r.id, texto: '' })}>Responder reseña</Boton>
                                )}
                              </div>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {vista === 'favoritos' && (
              <>
                <div className="panel-cabeza">
                  <div>
                    <h2 style={{ fontSize: '1.7rem' }}>Favoritos</h2>
                    <p>Prendas que guardaste para pensarlo con calma.</p>
                  </div>
                  <Boton to="/catalogo" variante="fantasma">Buscar más</Boton>
                </div>

                {misFavoritos.length === 0 ? (
                  <EstadoVacio pose="duerme" titulo="No tienes favoritos todavía" texto="Toca el corazón en cualquier prenda del catálogo para guardarla aquí." accion={<Boton to="/catalogo">Ir al catálogo</Boton>} />
                ) : (
                  <div className="catalogo-rejilla">
                    {misFavoritos.map((p, i) => (
                      <Aparece key={p.id} retraso={(i % 4) * 60}>
                        <PrendaCard prenda={p} />
                      </Aparece>
                    ))}
                  </div>
                )}
              </>
            )}

            {vista === 'ajustes' && (
              <>
                <div className="panel-cabeza">
                  <div>
                    <h2 style={{ fontSize: '1.7rem' }}>Ajustes de la cuenta</h2>
                    <p>Estos datos se usan para coordinar recolectas y mostrar tu perfil.</p>
                  </div>
                </div>

                <div className="rejilla dos" style={{ alignItems: 'start' }}>
                  <form
                    className="tarjeta-form"
                    onSubmit={(e) => {
                      e.preventDefault()
                      actualizarPerfil({ nombre: perfil.nombre.trim(), ciudad: CIUDAD, barrio: perfil.barrio, direccion: perfil.direccion.trim(), bio: perfil.bio })
                    }}
                  >
                    <h3 style={{ fontSize: '1.2rem' }}>Datos personales</h3>
                    <Campo etiqueta="Nombre completo" id="perfil-nombre">
                      <Entrada id="perfil-nombre" value={perfil.nombre} onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })} />
                    </Campo>
                    <Campo etiqueta="Correo electrónico" id="perfil-correo">
                      <Entrada id="perfil-correo" value={perfil.email} readOnly />
                    </Campo>
                    <div className="form-columnas">
                      <div className="campo">
                        <span className="campo-etiqueta">Ciudad</span>
                        <div className="campo-ciudad-fija">Medellín · cobertura única</div>
                      </div>
                      <Campo etiqueta="Barrio" id="perfil-barrio">
                        <Selector id="perfil-barrio" value={perfil.barrio ?? BARRIOS[0]} onChange={(e) => setPerfil({ ...perfil, barrio: e.target.value })}>
                          {BARRIOS.map((b) => <option key={b} value={b}>{b}</option>)}
                        </Selector>
                      </Campo>
                    </div>
                    <Campo etiqueta="Dirección de recolección" ayuda="Solo la vemos para coordinar el domicilio." id="perfil-direccion">
                      <Entrada id="perfil-direccion" value={perfil.direccion} onChange={(e) => setPerfil({ ...perfil, direccion: e.target.value })} placeholder="Cra. 35 #8A-12, apto 402" />
                    </Campo>
                    <Campo etiqueta="Sobre mi estilo" id="perfil-bio">
                      <Area id="perfil-bio" value={perfil.bio} onChange={(e) => setPerfil({ ...perfil, bio: e.target.value })} rows={3} />
                    </Campo>
                    <div className="chips">
                      <Boton type="submit">Guardar cambios</Boton>
                      <Boton type="button" variante="fantasma" onClick={() => setPerfil({ ...usuario })}>Descartar</Boton>
                    </div>
                  </form>

                  <div style={{ display: 'grid', gap: '1.2rem' }}>
                    <div className="panel-tarjeta">
                      <h3>Notificaciones</h3>
                      <p>Elige qué novedades quieres recibir por correo.</p>
                      <div style={{ display: 'grid', gap: '0.6rem' }}>
                        {[
                          ['solicitudes', 'Nuevas solicitudes de intercambio'],
                          ['envios', 'Cambios de estado en mis envíos'],
                          ['resenas', 'Reseñas nuevas sobre mi perfil'],
                          ['novedades', 'Novedades y prendas destacadas'],
                        ].map(([clave, texto]) => (
                          <label className="campo-terminos" key={clave}>
                            <input
                              type="checkbox"
                              checked={preferencias[clave]}
                              onChange={(e) => setPreferencias({ ...preferencias, [clave]: e.target.checked })}
                            />
                            <span>{texto}</span>
                          </label>
                        ))}
                      </div>
                      <div style={{ marginTop: '1rem' }}>
                        <Boton tamano="sm" onClick={() => { localStorage.setItem(`hilo-preferencias-${usuario.id}`, JSON.stringify(preferencias)); avisar('Preferencias de notificación guardadas en este dispositivo.', 'ok') }}>Guardar preferencias</Boton>
                      </div>
                    </div>

                    <div className="panel-tarjeta">
                      <h3>Verificación de identidad</h3>
                      <p>Las cuentas verificadas reciben más propuestas de intercambio.</p>
                      <div className="chips">
                        <Etiqueta tono={usuario.verificado ? 'verde' : 'ambar'}>
                          {usuario.verificado ? 'Verificada' : 'Sin verificar'}
                        </Etiqueta>
                        {!usuario.verificado && (
                          <Boton tamano="sm" onClick={() => avisar('Te enviamos el enlace para verificar tu identidad.', 'ok')}>
                            Verificar ahora
                          </Boton>
                        )}
                      </div>
                    </div>

                    <div className="panel-tarjeta">
                      <h3>Privacidad y datos</h3>
                      <p>Descarga una copia de tu perfil, prendas, intercambios y reseñas. Para cerrar la sesión usa el botón del menú lateral.</p>
                      <div className="chips">
                        <Boton tamano="sm" variante="fantasma" onClick={() => descargarJSON('hilo-circular-mis-datos', { perfil: { nombre: usuario.nombre, email: usuario.email, ciudad: usuario.ciudad, barrio: usuario.barrio, bio: usuario.bio }, prendas: mias, intercambios: misIntercambios, envios: misPedidos, resenas: misResenas, favoritos: misFavoritos.map((p) => ({ id: p.id, titulo: p.titulo })) })}>
                          Descargar mis datos
                        </Boton>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
      <Modal abierto={subirAbierto} onCerrar={() => setSubirAbierto(false)} titulo="Subir nueva prenda" descripcion="Completa los datos principales para añadirla a tu clóset circular." ancho="48rem" pie={
        <><Boton variante="fantasma" onClick={() => setSubirAbierto(false)}>Cancelar</Boton><Boton disabled={subiendoPrenda} onClick={() => document.getElementById('form-subir-panel')?.requestSubmit()}>{subiendoPrenda ? 'Publicando…' : 'Publicar prenda'}</Boton></>
      }>
        <form id="form-subir-panel" className="form-rejilla" onSubmit={subirDesdePanel}>
          <Campo etiqueta="Nombre de la prenda" id="panel-prenda-titulo"><Entrada id="panel-prenda-titulo" value={nuevaPrenda.titulo} onChange={(e) => setNuevaPrenda({ ...nuevaPrenda, titulo: e.target.value })} placeholder="Ej. Chaqueta de denim azul" required /></Campo>
          <div className="form-columnas">
            <Campo etiqueta="Categoría" id="panel-prenda-categoria"><Selector id="panel-prenda-categoria" value={nuevaPrenda.categoria} onChange={(e) => setNuevaPrenda({ ...nuevaPrenda, categoria: e.target.value })}>{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</Selector></Campo>
            <Campo etiqueta="Talla" id="panel-prenda-talla"><Selector id="panel-prenda-talla" value={nuevaPrenda.talla} onChange={(e) => setNuevaPrenda({ ...nuevaPrenda, talla: e.target.value })}>{TALLAS.map((t) => <option key={t}>{t}</option>)}</Selector></Campo>
            <Campo etiqueta="Estado" id="panel-prenda-estado"><Selector id="panel-prenda-estado" value={nuevaPrenda.estado} onChange={(e) => setNuevaPrenda({ ...nuevaPrenda, estado: e.target.value })}>{ESTADOS.map((e) => <option key={e}>{e}</option>)}</Selector></Campo>
          </div>
          <Campo etiqueta="Color principal" id="panel-prenda-color"><Selector id="panel-prenda-color" value={nuevaPrenda.color} onChange={(e) => setNuevaPrenda({ ...nuevaPrenda, color: e.target.value })}>{['Lavanda', 'Ciruela', 'Rosa', 'Niebla'].map((c) => <option key={c}>{c}</option>)}</Selector></Campo>
          <Campo etiqueta="Foto de portada (opcional)" ayuda="Puedes añadir una foto ahora o usar la ilustración de prenda." id="panel-prenda-foto">
            <Entrada id="panel-prenda-foto" type="file" accept="image/*" onChange={(e) => { const archivo = e.target.files?.[0]; if (archivo) { setArchivoFoto(archivo); setNuevaPrenda({ ...nuevaPrenda, foto: URL.createObjectURL(archivo) }) } }} />
          </Campo>
          {nuevaPrenda.foto && <img className="panel-prenda-foto-preview" src={nuevaPrenda.foto} alt="Vista previa de la foto de portada" />}
          <Campo etiqueta="Descripción" ayuda="Describe el uso, el estado y los detalles visibles (mínimo 20 caracteres)." id="panel-prenda-descripcion"><Area id="panel-prenda-descripcion" value={nuevaPrenda.descripcion} onChange={(e) => setNuevaPrenda({ ...nuevaPrenda, descripcion: e.target.value })} rows={4} required /></Campo>
        </form>
      </Modal>
      <Modal abierto={Boolean(envioDetalle)} onCerrar={() => setEnvioDetalle(null)} titulo={envioDetalle ? `Seguimiento ${envioDetalle.guia}` : 'Seguimiento del envío'} descripcion="Consulta la información registrada para este domicilio." ancho="42rem" pie={<Boton onClick={() => setEnvioDetalle(null)}>Cerrar</Boton>}>
        {envioDetalle && (() => {
          const prenda = buscarPrenda(envioDetalle.prendaId)
          const destino = buscarUsuario(envioDetalle.receptorId)
          const actual = ESTADOS_SEGUIMIENTO.indexOf(envioDetalle.estado)
          return (
            <div className="panel-seguimiento-detalle">
              <div className="panel-seguimiento-cifras">
                <div><small>Prenda</small><b>{prenda?.titulo ?? 'Prenda del intercambio'}</b></div>
                <div><small>Transportadora</small><b>{envioDetalle.transportadora}</b></div>
                <div><small>Guía</small><b>{envioDetalle.guia}</b></div>
                <div><small>Costo</small><b>{precio(envioDetalle.costo)}</b></div>
                <div><small>Origen</small><b>{prenda?.ciudad ?? usuario.ciudad}</b></div>
                <div><small>Destino</small><b>{destino?.ciudad ?? envioDetalle.ciudad}</b></div>
              </div>
              {envioDetalle.estado === 'Incidencia' ? (
                <div className="panel-envio-incidencia" role="status"><b>Este envío tiene una incidencia.</b><p>El equipo de Hilo Circular debe revisar el movimiento antes de continuar con el seguimiento.</p></div>
              ) : <Pasos pasos={ESTADOS_SEGUIMIENTO} actual={Math.max(0, actual)} />}
              <p className="panel-seguimiento-fecha">Última fecha registrada: {fecha(envioDetalle.fecha)} · Estado actual: <b>{envioDetalle.estado}</b></p>
            </div>
          )
        })()}
      </Modal>
    </PanelShell>
  )
}
