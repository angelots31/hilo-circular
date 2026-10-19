import { useEffect, useState } from 'react'
import Icono from './Iconos.jsx'
import { Avatar, Boton, Etiqueta, Modal } from './ui.jsx'
import { href, useRoute } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'
import { ESLOGAN, REDES, SITIO_URL } from '../lib/seed.js'

const ENLACES = [
  { to: '/', texto: 'Inicio' },
  { to: '/catalogo', texto: 'Catálogo' },
  { to: '/como-funciona', texto: 'Cómo funciona' },
  { to: '/resenas', texto: 'Reseñas' },
  { to: '/domicilio', texto: 'Talleres' },
  { to: '/nosotros', texto: 'Nosotros' },
]

export function Encabezado() {
  const { usuario, esAdmin, salir, notificaciones = [] } = useStore()
  const { path } = useRoute()
  const [abierto, setAbierto] = useState(false)
  const [pegada, setPegada] = useState(false)
  const [menu, setMenu] = useState(false)
  const [aviso, setAviso] = useState(false)
  const notificacionesVista = notificaciones
  const [leidas, setLeidas] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`hilo-notificaciones-leidas-${usuario?.id ?? 'visitante'}`) || '[]') } catch { return [] }
  })
  useEffect(() => {
    try { setLeidas(JSON.parse(localStorage.getItem(`hilo-notificaciones-leidas-${usuario?.id ?? 'visitante'}`) || '[]')) } catch { setLeidas([]) }
  }, [usuario?.id])
  const sinLeer = notificacionesVista.filter((n) => !n.leida && !leidas.includes(n.id)).length
  const marcarNotificacionesLeidas = () => {
    const ids = [...new Set([...leidas, ...notificacionesVista.map((n) => n.id)])]
    setLeidas(ids)
    try { localStorage.setItem(`hilo-notificaciones-leidas-${usuario?.id ?? 'visitante'}`, JSON.stringify(ids)) } catch { /* No bloquear la interfaz. */ }
  }

  useEffect(() => {
    setAbierto(false)
    setMenu(false)
    setAviso(false)
  }, [path])

  useEffect(() => {
    const onScroll = () => setPegada(scrollY > 24)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`cabecera ${pegada ? 'pegada' : ''}`}>
      <a className="marca clicable" href={href('/')} data-cursor="inicio">
        <img className="marca-logo" src="/icono-redondo.png" alt="" width="42" height="42" decoding="async" />
        <span className="marca-texto">
          <b>Hilo Circular</b>
          <small>{ESLOGAN}</small>
        </span>
      </a>

      <nav className="nav-principal" aria-label="Navegación principal">
        {ENLACES.map((e) => (
          <a key={e.to} href={href(e.to)} className={path === e.to ? 'activo' : ''}>
            {e.texto}
          </a>
        ))}
      </nav>

      <div className="nav-acciones">
        {usuario && <button
          className="campana clicable"
          aria-label={`Notificaciones: ${sinLeer} sin leer`}
          onClick={() => setAviso((v) => !v)}
          data-cursor="avisos"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9.5 19a2.5 2.5 0 0 0 5 0" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          {sinLeer > 0 && <i className="campana-punto" />}
        </button>}

        {aviso && usuario && (
          <div className="panel-avisos">
            <div className="panel-avisos-cabeza">
              <p className="panel-avisos-titulo">Notificaciones</p>
              {sinLeer > 0 && <button type="button" onClick={marcarNotificacionesLeidas}>Marcar leídas</button>}
            </div>
            <ul>
              {notificacionesVista.length ? notificacionesVista.map((n) => (
                <li key={n.id} className={n.leida || leidas.includes(n.id) ? '' : 'nueva'}>
                  <span className={`aviso-icono ${n.tipo}`} aria-hidden="true" />
                  <div>
                    <p>{n.texto}</p>
                    <small>{n.fecha}</small>
                  </div>
                </li>
              )) : <li className="sin-notificaciones"><p>No tienes actividad nueva por ahora.</p></li>}
            </ul>
            <a className="panel-avisos-pie" href={href(esAdmin ? '/admin' : '/panel')}>{esAdmin ? 'Ver panel de administración →' : 'Ver todo en mi panel →'}</a>
          </div>
        )}

        {usuario ? (
          <div className="sesion">
            <button className="sesion-boton clicable" onClick={() => setMenu((v) => !v)} aria-expanded={menu} data-cursor="mi cuenta">
              <Avatar nombre={usuario.nombre} tamano={34} />
              <span className="sesion-nombre">{usuario.nombre.split(' ')[0]}</span>
              <svg viewBox="0 0 24 24" className="chev" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            </button>
            {menu && (
              <div className="menu-sesion">
                <p className="menu-sesion-cabeza">
                  <Avatar nombre={usuario.nombre} tamano={40} />
                  <span>
                    <b>{usuario.nombre}</b>
                    <small>{usuario.email}</small>
                  </span>
                </p>
                <a href={href('/panel')}>Mi panel</a>
                <a href={href('/subir')}>Subir una prenda</a>
                <a href={href('/intercambios')}>Mis intercambios</a>
                <a href={href('/panel?seccion=envios')}>Mis envíos</a>
                {esAdmin && (
                  <a href={href('/admin')} className="menu-sesion-admin">
                    Panel de administración
                    <Etiqueta tono="lavanda">Admin</Etiqueta>
                  </a>
                )}
                <button onClick={salir}>Cerrar sesión</button>
              </div>
            )}
          </div>
        ) : (
          <div className="sesion sesion-visitante">
            <Boton to="/entrar" variante="lavanda" tamano="sm">Entrar</Boton>
          </div>
        )}

        <button className="burguer clicable" aria-label="Abrir menú" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto}>
          <span /><span /><span />
        </button>
      </div>

      {abierto && (
        <div className="nav-movil">
          {ENLACES.map((e) => (
            <a key={e.to} href={href(e.to)}>{e.texto}</a>
          ))}
          <div className="nav-movil-pie">
            {usuario ? (
              <>
                <Boton to="/panel" variante="claro">Mi panel</Boton>
                <Boton onClick={salir} variante="fantasma">Cerrar sesión</Boton>
              </>
            ) : (
              <>
                <Boton to="/entrar" variante="lavanda">Entrar</Boton>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export function Pie() {
  const { avisar } = useStore()
  const [correo, setCorreo] = useState('')
  const [qrAbierto, setQrAbierto] = useState(false)

  // En computador el QR abre una versión grande para fotografiar desde el celular;
  // en pantallas táctiles el enlace navega directamente a la web.
  const abrirQr = (evento) => {
    if (!matchMedia('(pointer: fine)').matches) return
    evento.preventDefault()
    setQrAbierto(true)
  }

  return (
    <footer className="pie tono-oscuro" data-tono="oscuro">
      <div className="pie-rejilla">
        <div className="pie-marca">
          <div className="pie-marca-cabeza">
            <img className="pie-logo" src="/icono-redondo.png" alt="" width="44" height="44" loading="lazy" decoding="async" />
            <h2>Hilo Circular</h2>
          </div>
          <p className="pie-eslogan">{ESLOGAN}</p>
          <p>
            Una experiencia phygital que le da una segunda vida a la ropa que ya no usas: retos en redes, talleres
            relámpago y una comunidad universitaria en Medellín que repara, transforma e intercambia.
          </p>
          <form
            className="pie-correo"
            onSubmit={(e) => {
              e.preventDefault()
              if (!correo.includes('@')) return avisar('Escribe un correo válido para suscribirte.', 'aviso')
              avisar('¡Listo! Te enviamos la agenda de talleres y los retos de la semana.', 'ok')
              setCorreo('')
            }}
          >
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tu@correo.com"
              aria-label="Correo para la agenda de talleres"
            />
            <Boton tamano="sm" variante="claro" type="submit">Recibir la agenda</Boton>
          </form>
        </div>

        <nav className="pie-columna" aria-label="Explorar">
          <h3>Explorar</h3>
          <a href={href('/catalogo')}>Catálogo</a>
          <a href={href('/como-funciona')}>Cómo funciona</a>
          <a href={href('/resenas')}>Reseñas</a>
          <a href={href('/domicilio')}>Talleres y entregas</a>
          <a href={href('/nosotros')}>Sobre la marca</a>
        </nav>

        <nav className="pie-columna" aria-label="Comunidad">
          <h3>Comunidad</h3>
          <a href={href('/panel')}>Mi panel</a>
          <a href={href('/intercambios')}>Mis intercambios</a>
          <a href={href('/subir')}>Subir una prenda</a>
          <a href={href('/admin')}>Administración</a>
        </nav>

        <div className="pie-columna pie-redes">
          <h3>Síguenos</h3>
          {REDES.map((red) => (
            <a
              key={red.nombre}
              className="pie-red"
              href={red.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${red.nombre} de Hilo Circular (se abre en otra pestaña)`}
            >
              <span className="pie-red-icono" aria-hidden="true"><Icono nombre={red.nombre.toLowerCase()} /></span>
              <span className="pie-red-texto">
                <b>{red.nombre}</b>
                <small>{red.usuario}</small>
              </span>
            </a>
          ))}
          <p className="pie-redes-nota">Retos, antes y después, y la agenda de talleres relámpago.</p>

          <a
            className="pie-qr"
            href={SITIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={abrirQr}
            aria-label="Código QR de Hilo Circular para abrir la web en el celular"
          >
            <span className="pie-qr-marco" aria-hidden="true">
              <img src="/qr-hilo-circular.svg" alt="" width="68" height="68" loading="lazy" decoding="async" />
            </span>
            <span className="pie-qr-texto">
              <b>Escanea</b>
              <small>y ábrela en tu celular</small>
            </span>
          </a>
        </div>
      </div>

      <div className="pie-legal">
        <p>© {new Date().getFullYear()} Hilo Circular · Moda circular para universitarios en Medellín.</p>
        <p>Proyecto académico · ODS 12 · Encuesta de campo 2026.</p>
      </div>

      <Modal
        abierto={qrAbierto}
        onCerrar={() => setQrAbierto(false)}
        titulo="Escanea y entra desde tu celular"
        descripcion="Apunta la cámara al código y toca el aviso que aparece. Te llevará a la misma web que estás viendo."
        ancho="min(25rem, 92vw)"
        pie={
          <>
            <Boton variante="fantasma" onClick={() => setQrAbierto(false)}>Cerrar</Boton>
            <a className="boton solido" href={SITIO_URL} target="_blank" rel="noopener noreferrer">
              Abrir en una pestaña
            </a>
          </>
        }
      >
        <div className="qr-modal">
          <span className="qr-modal-ceja">Escanéame</span>
          <div className="qr-modal-marco">
            <img src="/qr-hilo-circular.svg" alt="Código QR grande de Hilo Circular" width="300" height="300" decoding="async" />
          </div>
          <a className="qr-modal-url" href={SITIO_URL} target="_blank" rel="noopener noreferrer">
            hilo-circular.vercel.app <span aria-hidden="true">↗</span>
          </a>
          <p className="qr-modal-nota">También puedes escribir esa dirección en el navegador del celular.</p>
        </div>
      </Modal>
    </footer>
  )
}

export function Avisos() {
  const { avisos } = useStore()
  return (
    <div className="avisos" aria-live="polite">
      {avisos.map((a) => (
        <div key={a.id} className={`aviso ${a.tono}`}>
          <span className="aviso-punto" aria-hidden="true" />
          <p>{a.texto}</p>
        </div>
      ))}
    </div>
  )
}

