import { useEffect, useRef, useState } from 'react'
import Mascot from './Mascot.jsx'
import { Adornos } from './Adornos.jsx'
import { href } from '../lib/router.jsx'

/* ---------------------------------------------------------------- Botones */

export function Boton({ to, variante = 'solido', tamano = 'md', className = '', children, icono, ...resto }) {
  const clases = `boton ${variante} ${tamano} ${className}`.trim()
  const contenido = (
    <>
      {icono && <span className="boton-icono" aria-hidden="true">{icono}</span>}
      <span>{children}</span>
    </>
  )
  if (to) {
    return (
      <a className={clases} href={href(to)} {...resto}>
        {contenido}
      </a>
    )
  }
  return (
    <button className={clases} {...resto}>
      {contenido}
    </button>
  )
}

/* ---------------------------------------------------------------- Etiquetas */

export function Etiqueta({ tono = 'neutro', children, className = '', ...resto }) {
  return (
    <span className={`etiqueta ${tono} ${className}`.trim()} {...resto}>
      {children}
    </span>
  )
}

const TONO_ESTADO = {
  Pendiente: 'ambar',
  Aceptado: 'verde',
  Cancelado: 'neutro',
  Escalado: 'lavanda',
  Rechazado: 'rojo',
  Completado: 'lavanda',
  Preparando: 'ambar',
  'En camino': 'lavanda',
  Entregado: 'verde',
  Incidencia: 'rojo',
  'En revisión': 'ambar',
  Resuelto: 'verde',
  activo: 'verde',
  suspendido: 'rojo',
}

/* ----------------------------------------------------------------- Estrellas */

export function Estrellas({ valor = 0, tamano = 18, onCambio, className = '' }) {
  const [encima, setEncima] = useState(null)
  const pintado = encima ?? valor
  const interactivo = typeof onCambio === 'function'
  return (
    <span
      className={`estrellas ${interactivo ? 'interactivo' : ''} ${className}`.trim()}
      style={{ '--tam': `${tamano}px` }}
      role={interactivo ? 'radiogroup' : undefined}
      aria-label={`${valor} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`estrella ${pintado >= n ? 'llena' : ''} ${pintado > 0 && pintado >= n - 0.5 && pintado < n ? 'media' : ''}`}
          disabled={!interactivo}
          onClick={() => onCambio?.(n)}
          onMouseEnter={() => interactivo && setEncima(n)}
          onMouseLeave={() => interactivo && setEncima(null)}
          aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 1.6l3.2 6.6 7.2 1-5.2 5.1 1.2 7.2L12 18.1 5.6 21.5l1.2-7.2L1.6 9.2l7.2-1z" />
          </svg>
        </button>
      ))}
    </span>
  )
}

/* ------------------------------------------------------------------ Campos */

export function Campo({ etiqueta, ayuda, error, id, children, className = '' }) {
  return (
    <label className={`campo ${className}`.trim()} htmlFor={id}>
      {etiqueta && <span className="campo-etiqueta">{etiqueta}</span>}
      {children}
      {ayuda && !error && <span className="campo-ayuda">{ayuda}</span>}
      {error && <span className="campo-error" role="alert">{error}</span>}
    </label>
  )
}

export const Entrada = ({ className = '', ...resto }) => <input className={`entrada ${className}`.trim()} {...resto} />
export const Selector = ({ children, className = '', ...resto }) => (
  <select className={`entrada selector ${className}`.trim()} {...resto}>
    {children}
  </select>
)
export const Area = ({ className = '', ...resto }) => <textarea className={`entrada area ${className}`.trim()} rows={4} {...resto} />

/* ------------------------------------------------------------------- Modal */

export function Modal({ abierto, onCerrar, titulo, descripcion, children, pie, ancho = '38rem' }) {
  useEffect(() => {
    if (!abierto) return
    const onKey = (e) => e.key === 'Escape' && onCerrar?.()
    document.body.style.overflow = 'hidden'
    addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      removeEventListener('keydown', onKey)
    }
  }, [abierto, onCerrar])

  if (!abierto) return null
  return (
    <div className="modal-fondo" onClick={onCerrar} role="presentation">
      <div
        className="modal"
        style={{ '--ancho': ancho }}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-cabeza">
          <div>
            <h3>{titulo}</h3>
            {descripcion && <p className="modal-descripcion">{descripcion}</p>}
          </div>
          <button type="button" className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar ventana">×</button>
        </header>
        <div className="modal-cuerpo">{children}</div>
        {pie && <footer className="modal-pie">{pie}</footer>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- Avatar, dato */

const TONOS_AVATAR = [
  ['#6872aa', '#e5c4c6'],
  ['#5d4655', '#e2deea'],
  ['#e5c4c6', '#6872aa'],
  ['#6872aa', '#5d4655'],
  ['#9aa98d', '#e2deea'],
  ['#c8a179', '#5d4655'],
]

export function Avatar({ nombre = '', tamano = 40, tono, className = '' }) {
  const iniciales = nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  const indice = tono ?? (nombre.length % TONOS_AVATAR.length)
  const [a, b] = TONOS_AVATAR[indice]
  return (
    <span
      className={`avatar ${className}`.trim()}
      style={{ '--tam': `${tamano}px`, '--avatar-font': `${Math.max(9, Math.min(17, tamano * 0.28))}px`, background: `linear-gradient(140deg, ${a}, ${b})` }}
      aria-hidden="true"
    >
      {iniciales}
    </span>
  )
}

export function Dato({ etiqueta, valor, delta, nota, icono }) {
  return (
    <article className="dato">
      {icono && <span className="dato-icono" aria-hidden="true">{icono}</span>}
      <p className="dato-etiqueta">{etiqueta}</p>
      <p className="dato-valor">{valor}</p>
      <p className="dato-nota">
        {delta != null && (
          <span className={`dato-delta ${delta >= 0 ? 'sube' : 'baja'}`}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
          </span>
        )}
        {nota}
      </p>
    </article>
  )
}

/* -------------------------------------------------------------- Pestañas */

export function Pestanas({ items, activo, onChange, className = '' }) {
  return (
    <div className={`pestanas ${className}`.trim()} role="tablist">
      {items.map((it) => (
        <button
          key={it.valor}
          role="tab"
          aria-selected={activo === it.valor}
          className={`pestana ${activo === it.valor ? 'activa' : ''}`}
          onClick={() => onChange(it.valor)}
        >
          {it.texto}
          {it.cuenta != null && <span className="pestana-cuenta">{it.cuenta}</span>}
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------- Gráficas */

export function Barras({ datos, claves, alto = 220 }) {
  const maximo = Math.max(1, ...datos.flatMap((d) => claves.map((c) => Number(d[c.clave]) || 0))) * 1.12
  return (
    <div className="grafica-barras" style={{ '--alto': `${alto}px` }}>
      <div className="barras" role="img" aria-label="Actividad mensual de la comunidad">
        {datos.map((d) => (
          <div className="barra-grupo" key={d.mes}>
            <div className="barra-pila">
              {claves.map((c) => (
                <span
                  key={c.clave}
                  className="barra"
                  style={{ height: `${(d[c.clave] / maximo) * 100}%`, background: c.color }}
                  title={`${c.etiqueta} · ${d.mes}: ${d[c.clave]}`}
                />
              ))}
            </div>
            <span className="barra-mes">{d.mes}</span>
          </div>
        ))}
      </div>
      <ul className="leyenda">
        {claves.map((c) => (
          <li key={c.clave}>
            <i style={{ background: c.color }} aria-hidden="true" />
            {c.etiqueta}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Dona({ datos, total, etiqueta }) {
  let acumulado = 0
  const radio = 60
  const circunferencia = 2 * Math.PI * radio
  const suma = datos.reduce((s, d) => s + d.valor, 0)
  const colores = ['#6872aa', '#5d4655', '#e5c4c6', '#9aa98d', '#c8a179', '#7f9cc4', '#c9b9dd']
  return (
    <div className="dona">
      <svg viewBox="0 0 160 160" role="img" aria-label="Distribución por categoría">
        <circle cx="80" cy="80" r={radio} fill="none" stroke="var(--línea)" strokeWidth="22" />
        {datos.map((d, i) => {
          const largo = (d.valor / suma) * circunferencia
          const el = (
            <circle
              key={d.nombre}
              cx="80"
              cy="80"
              r={radio}
              fill="none"
              stroke={colores[i % colores.length]}
              strokeWidth="22"
              strokeDasharray={`${largo} ${circunferencia - largo}`}
              strokeDashoffset={-acumulado}
              transform="rotate(-90 80 80)"
              strokeLinecap="butt"
            >
              <title>{`${d.nombre}: ${d.valor}%`}</title>
            </circle>
          )
          acumulado += largo
          return el
        })}
        <text x="80" y="76" textAnchor="middle" className="dona-valor">{total ?? suma}</text>
        <text x="80" y="96" textAnchor="middle" className="dona-texto">{etiqueta ?? 'prendas'}</text>
      </svg>
      <ul className="leyenda vertical">
        {datos.map((d, i) => (
          <li key={d.nombre}>
            <i style={{ background: colores[i % colores.length] }} aria-hidden="true" />
            <span>{d.nombre}</span>
            <b>{d.valor}%</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ----------------------------------------------------------- Estado vacío */

export function EstadoVacio({ pose = 'duerme', titulo, texto, accion, secundario, compacto = false }) {
  return (
    <div className={`vacio ${compacto ? 'compacto' : ''}`.trim()}>
      <Mascot pose={pose} className="vacio-mascota" flota />
      <h3>{titulo}</h3>
      <p>{texto}</p>
      {(accion || secundario) && (
        <div className="vacio-acciones">
          {accion}
          {secundario}
        </div>
      )}
    </div>
  )
}

/* --------------------------------------------------------------- Sección */

/**
 * Envoltorio de sección con tono declarado. El tono define el color de la
 * mascota, así el camaleón se adapta al fondo sobre el que está parado.
 */
let contadorSecciones = 0

export function Seccion({ id, tono = 'claro', className = '', formas, children, ...resto }) {
  const orden = useRef(null)
  if (orden.current === null) orden.current = contadorSecciones++
  const conFormas = formas ?? !className.includes('hero')
  return (
    <section id={id} data-tono={tono} className={`seccion tono-${tono} ${className}`.trim()} {...resto}>
      {conFormas && <Adornos n={orden.current} />}
      {children}
    </section>
  )
}

/** `nivel` permite usar un h1 cuando el título encabeza la página. */
export function TituloSeccion({ ceja, titulo, texto, alineado = 'izquierda', accion, nivel = 2 }) {
  const Encabezado = `h${nivel}`
  return (
    <header className={`titulo-seccion ${alineado}`}>
      <div>
        {ceja && <p className="ceja">{ceja}</p>}
        <Encabezado>{titulo}</Encabezado>
        {texto && <p className="titulo-texto">{texto}</p>}
      </div>
      {accion && <div className="titulo-accion">{accion}</div>}
    </header>
  )
}

/* -------------------------------------------------------------- Progreso */

export function Pasos({ pasos, actual = 0 }) {
  return (
    <ol className="pasos-lista">
      {pasos.map((p, i) => (
        <li key={p} className={i < actual ? 'hecho' : i === actual ? 'activo' : ''}>
          <span className="paso-numero">{i < actual ? '✓' : i + 1}</span>
          <span className="paso-texto">{p}</span>
        </li>
      ))}
    </ol>
  )
}

export function Barra({ valor, maximo = 100, tono = 'lavanda', titulo }) {
  const porcentaje = maximo > 0 ? Math.max(0, Math.min(100, (Number(valor) / maximo) * 100)) : 0
  return (
    <span
      className="barra-progreso"
      role="progressbar"
      aria-valuenow={valor}
      aria-valuemin={0}
      aria-valuemax={maximo}
      title={titulo ?? `${valor} de ${maximo} (${Math.round(porcentaje)}%)`}
    >
      <i className={tono} style={{ width: `${porcentaje}%` }} />
    </span>
  )
}

/* ------------------------------------------------------------ Animaciones */

/** Revela el contenido al entrar en pantalla. */
export function Aparece({ children, retraso = 0, className = '', as: Etiqueta = 'div' }) {
  const [ref, visible] = useVisible()
  return (
    <Etiqueta
      ref={ref}
      className={`aparece ${visible ? 'visible' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${retraso}ms` }}
    >
      {children}
    </Etiqueta>
  )
}

/** Detecta cuándo un nodo entra en pantalla (una sola vez). */
function useVisible() {
  const [nodo, setNodo] = useState(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!nodo) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(nodo)
    return () => io.disconnect()
  }, [nodo])
  return [setNodo, visible]
}
