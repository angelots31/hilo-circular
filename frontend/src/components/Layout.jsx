import { useEffect, useState } from 'react'
import Icono from './Iconos.jsx'
import { Avatar, Boton, Etiqueta } from './ui.jsx'
import { href, useRoute } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'
import { ESLOGAN, REDES, SITIO_URL } from '../lib/seed.js'

/**
 * Firma de autoría en caracteres de ancho cero: invisible al leer, pero queda
 * al copiar la frase legal. Cada letra son 8 bits (U+200B = 0, U+200C = 1)
 * separados por U+200D. Decodificada, dice `angelots`.
 */
const FIRMA_CERO = [...'angelots']
  .map((letra) => letra
    .charCodeAt(0)
    .toString(2)
    .padStart(8, '0')
    .replace(/0/g, '\u200B')
    .replace(/1/g, '\u200C'))
  .join('\u200D')

const ENLACES = [
  { to: '/', texto: 'Inicio' },
  { to: '/catalogo', texto: 'Catálogo' },
  { to: '/como-funciona', texto: 'Cómo funciona' },
  { to: '/resenas', texto: 'Reseñas' },
  { to: '/domicilio', texto: 'Talleres' },
  { to: '/nosotros', texto: 'Nosotros' },
]

export function Encabezado() {
  const { usuario, esAdmin, salir, notificaciones = [], marcarNotificacionesLeidas } = useStore()
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
  const marcarLeidas = () => {
    const ids = [...new Set([...leidas, ...notificacionesVista.map((n) => n.id)])]
    setLeidas(ids)
    try { localStorage.setItem(`hilo-notificaciones-leidas-${usuario?.id ?? 'visitante'}`, JSON.stringify(ids)) } catch { /* No bloquear la interfaz. */ }
    marcarNotificacionesLeidas?.()
  }

  useEffect(() => {
    setAbierto(false)
    setMenu(false)
    setAviso(false)
  }, [path])

  // Cierra los menús flotantes al tocar fuera de las acciones de la cabecera.
  useEffect(() => {
    const alTocarFuera = (evento) => {
      if (!evento.target.closest?.('.nav-acciones')) {
        setMenu(false)
        setAviso(false)
      }
    }
    document.addEventListener('pointerdown', alTocarFuera)
    return () => document.removeEventListener('pointerdown', alTocarFuera)
  }, [])

  useEffect(() => {
    const onScroll = () => setPegada(scrollY > 24)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`cabecera ${pegada ? 'pegada' : ''}`}>
      <a className="marca clicable" href={href('/')}>
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
              {sinLeer > 0 && <button type="button" onClick={marcarLeidas}>Marcar leídas</button>}
            </div>
            <ul>
              {notificacionesVista.length ? notificacionesVista.map((n) => (
                <li key={n.id} className={n.leida || leidas.includes(n.id) ? '' : 'nueva'}>
                  <span className={`aviso-icono ${n.tipo || 'sistema'}`} aria-hidden="true" />
                  <div>
                    <p>{n.texto}</p>
                    <small>{n.fecha}</small>
                    {n.destino && <a href={href(n.destino)} onClick={() => setAviso(false)}>Ver detalle →</a>}
                  </div>
                </li>
              )) : <li className="sin-notificaciones"><p>No tienes actividad nueva por ahora.</p></li>}
            </ul>
            <a className="panel-avisos-pie" href={href(esAdmin ? '/admin' : '/panel')}>{esAdmin ? 'Ver panel de administración →' : 'Ver todo en mi panel →'}</a>
          </div>
        )}

        {usuario ? (
          <div className="sesion">
            <button className="sesion-boton clicable" onClick={() => setMenu((v) => !v)} aria-expanded={menu}>
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
  const { avisar, suscribir } = useStore()
  const [correo, setCorreo] = useState('')
  const [qrAbierto, setQrAbierto] = useState(false)

  useEffect(() => {
    if (!qrAbierto) return
    const onKey = (e) => e.key === 'Escape' && setQrAbierto(false)
    document.body.style.overflow = 'hidden'
    addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      removeEventListener('keydown', onKey)
    }
  }, [qrAbierto])

  const abrirQr = (evento) => {
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
            onSubmit={async (e) => {
              e.preventDefault()
              if (!correo.includes('@')) return avisar('Escribe un correo válido para suscribirte.', 'aviso')
              const ok = await suscribir(correo.trim())
              if (ok) setCorreo('')
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
        <p>
          © {new Date().getFullYear()} Hilo Circular · Moda circular para universitarios en Medellín.
          <span className="firma-cero" aria-hidden="true">{FIRMA_CERO}</span>
        </p>
        <p>Proyecto académico · ODS 12 · Encuesta de campo 2026.</p>
      </div>

      {qrAbierto && (
        <div
          className="modal-fondo"
          onClick={() => setQrAbierto(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Código QR de Hilo Circular"
          style={{ alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              display: 'inline-flex',
              background: '#ffffff',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              borderRadius: '24px',
              boxShadow: '0 25px 60px -15px rgba(27, 26, 54, 0.45)',
              animation: 'entrar-arriba 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
              maxWidth: '92vw',
              maxHeight: '92vh',
            }}
          >
            <button
              type="button"
              className="modal-cerrar"
              onClick={() => setQrAbierto(false)}
              aria-label="Cerrar ventana"
              style={{
                position: 'absolute',
                top: '-14px',
                right: '-14px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
            <img
              src="/qr-hilo-circular.svg"
              alt="Código QR de Hilo Circular"
              decoding="async"
              style={{
                width: 'min(420px, 80vw, 80vh)',
                height: 'min(420px, 80vw, 80vh)',
                display: 'block',
              }}
            />
          </div>
        </div>
      )}
    </footer>
  )
}

const ICONO_AVISO = {
  ok: '✓',
  aviso: '!',
  info: 'i',
}

export function Avisos() {
  const { avisos, cerrarAviso } = useStore()
  return (
    <div className="avisos" aria-live="polite" aria-atomic="false">
      {avisos.map((a) => (
        <div key={a.id} className={`aviso ${a.tono}`} role="status">
          <span className="aviso-icono-toast" aria-hidden="true">{ICONO_AVISO[a.tono] ?? 'i'}</span>
          <p>{a.texto}</p>
          <button
            type="button"
            className="aviso-cerrar"
            aria-label="Cerrar mensaje"
            onClick={() => cerrarAviso(a.id)}
          >
            ×
          </button>
          <span className="aviso-barra" aria-hidden="true" />
        </div>
      ))}
    </div>
  )
}

