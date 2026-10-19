import { useMemo, useState } from 'react'
import Icono from './Iconos.jsx'
import { Avatar } from './ui.jsx'
import { href, navigate } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'

/**
 * Estructura de los paneles (cliente y administración): barra lateral fija,
 * sin navbar ni footer del sitio público.
 */
export default function PanelShell({
  ceja, titulo, texto, acciones, secciones, vista, onCambiar,
  insignias = {}, extras = [], usuarioNombre, usuarioId, rol, children, mostrarEncabezado = true,
  tituloSeccion = '', textoSeccion = '', notificaciones = [],
}) {
  const { salir } = useStore()
  const [abierto, setAbierto] = useState(false)
  const [avisosAbiertos, setAvisosAbiertos] = useState(false)
  const [leidas, setLeidas] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`hilo-notificaciones-leidas-${usuarioId}`) || '[]') } catch { return [] }
  })
  const numeroSinLeer = useMemo(() => notificaciones.filter((n) => !n.leida && !leidas.includes(n.id)).length, [notificaciones, leidas])
  const marcarLeidas = () => {
    const ids = [...new Set([...leidas, ...notificaciones.map((n) => n.id)])]
    setLeidas(ids)
    try { localStorage.setItem(`hilo-notificaciones-leidas-${usuarioId}`, JSON.stringify(ids)) } catch { /* El panel sigue usable si el navegador bloquea almacenamiento. */ }
  }

  return (
    <div className="panel-app">
      <button type="button" className="panel-menu-movil" aria-label="Abrir menú" aria-expanded={abierto} onClick={() => setAbierto((v) => !v)}>
        {abierto ? '×' : '☰'}
      </button>
      {abierto && <div className="panel-velo" onClick={() => setAbierto(false)} />}

      <aside className={`panel-lateral${abierto ? ' abierto' : ''}`} aria-label={`Menú de ${ceja}`}>
        <a className="panel-marca" href={href('/')} title="Ir al sitio">
          <img className="panel-marca-mascota" src="/icono-redondo.png" alt="" width="38" height="38" decoding="async" />
          <span>
            <b>Hilo Circular</b>
            <small>{ceja}</small>
          </span>
        </a>

        <nav className="panel-nav">
          {secciones.map((s) => (
            <a
              key={s.valor}
              href={href(ceja.toLowerCase().includes('admin') ? `/admin/${s.valor}` : `/panel?seccion=${s.valor}`)}
              className={vista === s.valor ? 'activo' : ''}
              aria-current={vista === s.valor ? 'page' : undefined}
              onClick={() => setAbierto(false)}
            >
              <span className="panel-nav-icono" aria-hidden="true"><Icono nombre={s.icono} /></span>
              <span>{s.texto}</span>
              {insignias[s.valor] > 0 && <em className="panel-insignia">{insignias[s.valor]}</em>}
            </a>
          ))}
          {extras.length > 0 && <hr />}
          {extras.map((e) => (
            <button key={e.texto} type="button" onClick={e.onClick}>
              <span className="panel-nav-icono" aria-hidden="true"><Icono nombre={e.icono} /></span>
              <span>{e.texto}</span>
            </button>
          ))}
        </nav>

        <div className="panel-lateral-pie">
          <div className="panel-usuario">
            <Avatar nombre={usuarioNombre} tamano={38} />
            <span>
              <b>{usuarioNombre}</b>
              <small>{rol}</small>
            </span>
          </div>
          <a className="panel-enlace panel-volver-sitio" href={href('/')} onClick={() => setAbierto(false)}>
            <span className="panel-nav-icono" aria-hidden="true"><Icono nombre="volver" /></span> Volver al sitio
          </a>
          <button type="button" className="panel-enlace" onClick={() => { salir(); navigate('/') }}>
            <span className="panel-nav-icono" aria-hidden="true"><Icono nombre="salir" /></span> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="panel-contenido">
        <header className={`panel-encabezado${mostrarEncabezado ? '' : ' panel-encabezado-seccion'}`}>
          <div className="panel-encabezado-texto">
            <p className="ceja">{ceja}</p>
            <h1>{mostrarEncabezado ? titulo : (tituloSeccion || vista)}</h1>
            {(mostrarEncabezado ? texto : textoSeccion) && <p>{mostrarEncabezado ? texto : textoSeccion}</p>}
          </div>
          <div className="panel-herramientas">
            <div className="panel-notificaciones-wrap">
              <button
                type="button"
                className="panel-campana"
                aria-label={`Notificaciones: ${numeroSinLeer} sin leer`}
                aria-expanded={avisosAbiertos}
                aria-controls="panel-notificaciones-lista"
                onClick={() => setAvisosAbiertos((abierta) => !abierta)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6Z" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M9.5 19a2.5 2.5 0 0 0 5 0" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>
                {numeroSinLeer > 0 && <span className="panel-campana-contador">{numeroSinLeer > 9 ? '9+' : numeroSinLeer}</span>}
              </button>
              {avisosAbiertos && <section className="panel-notificaciones" id="panel-notificaciones-lista" aria-label="Notificaciones de tu cuenta">
                <div className="panel-notificaciones-cabeza">
                  <div><b>Notificaciones</b><small>{numeroSinLeer ? `${numeroSinLeer} sin leer` : 'Todo al día'}</small></div>
                  {numeroSinLeer > 0 && <button type="button" onClick={marcarLeidas}>Marcar leídas</button>}
                </div>
                <ul>
                  {notificaciones.length ? notificaciones.map((n) => {
                    const leida = n.leida || leidas.includes(n.id)
                    return <li key={n.id} className={leida ? '' : 'nueva'}>
                      <span className={`aviso-icono ${n.tipo || 'sistema'}`} aria-hidden="true" />
                      <div><p>{n.texto}</p><small>{n.fecha}</small>
                        {n.destino && <a href={href(n.destino)} onClick={() => setAvisosAbiertos(false)}>Ver detalle →</a>}
                      </div>
                    </li>
                  }) : <li className="sin-notificaciones"><p>No tienes notificaciones por ahora.</p></li>}
                </ul>
              </section>}
            </div>
            {acciones && <div className="chips">{acciones}</div>}
          </div>
        </header>
        <div className="panel-cuerpo">{children}</div>
      </div>
    </div>
  )
}
