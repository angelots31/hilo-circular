import { useEffect, useMemo, useState } from 'react'
import Mascot from '../components/Mascot.jsx'
import PreguntaIA from '../components/PreguntaIA.jsx'
import { Aparece, Boton, Etiqueta, Seccion } from '../components/ui.jsx'
import { api } from '../lib/api.js'
import { href, useRoute } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'
import { MATERIALES, nombreMaterial } from '../lib/seed.js'

const FAMILIAS = ['Natural', 'Sintética', 'Artificial', 'Mezcla']

const formatoFecha = (iso) => {
  if (!iso) return 'sin fecha'
  const valor = new Date(`${String(iso).slice(0, 10)}T12:00:00`)
  return Number.isNaN(valor.getTime())
    ? 'sin fecha'
    : valor.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

const esMaterial = (slug) => MATERIALES.some((m) => m.slug === slug)

/**
 * Página independiente que abre el QR: sin navbar ni pie, solo información.
 * Muestra cómo ayuda cada material y, si hay sesión, lo aplica a las prendas
 * que la persona ya tiene registradas.
 */
export default function Conciencia() {
  const { query } = useRoute()
  const { usuario, prendas, cargando: cargandoSesion } = useStore()

  // Materiales que llegan en la URL (QR de una prenda o de un intercambio).
  const materialesQr = useMemo(
    () => [...new Set(String(query.get('m') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(esMaterial))],
    [query],
  )

  const misPrendas = useMemo(
    () => (usuario ? prendas.filter((p) => p.duenoId === usuario.id) : []),
    [prendas, usuario],
  )

  // Una entrada por material presente en el clóset, con sus prendas.
  const closet = useMemo(() => {
    const mapa = new Map()
    misPrendas.forEach((prenda) => {
      const materiales = Array.isArray(prenda.composicion) ? prenda.composicion : []
      materiales.filter(esMaterial).forEach((slug) => {
        if (!mapa.has(slug)) mapa.set(slug, [])
        mapa.get(slug).push(prenda)
      })
    })
    return MATERIALES
      .filter((m) => mapa.has(m.slug))
      .map((m) => ({ ...m, prendas: mapa.get(m.slug) }))
  }, [misPrendas])

  const desdeQr = materialesQr.length > 0
  const foco = desdeQr ? materialesQr : closet.map((m) => m.slug)
  const llave = foco.join(',')
  const conFoco = foco.length > 0

  const [fichas, setFichas] = useState([])
  const [familia, setFamilia] = useState('Todas')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = () => {
    setCargando(true)
    setError('')
    api.telas(foco)
      .then(({ telas }) => setFichas(telas || []))
      .catch(() => setError('No pudimos cargar las fichas. Revisa tu conexión e inténtalo de nuevo.'))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargar()
    // Cada visita que llega desde el QR suma uno al contador del día.
    if (query.get('o') === 'qr') api.visitaQr().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [llave])

  const visibles = familia === 'Todas' ? fichas : fichas.filter((f) => f.familia === familia)
  const porSlug = new Map(closet.map((m) => [m.slug, m.prendas]))

  const ceja = desdeQr
    ? 'Esto es lo que estás reutilizando'
    : usuario
      ? `Hola, ${usuario.nombre.split(' ')[0]}`
      : 'Guía de materiales'

  const titulo = desdeQr
    ? 'Dos prendas siguen en uso gracias a este intercambio'
    : usuario && closet.length
      ? 'Lo que ya está en tu clóset también cuida el medio ambiente'
      : 'Cada material pide un cuidado distinto'

  const intro = desdeQr
    ? 'Estos son los materiales de las prendas que se están intercambiando y lo que evitas al darles una segunda vida.'
    : usuario && closet.length
      ? `Registramos ${closet.length === 1 ? 'un material' : `${closet.length} materiales`} en las prendas que ya tienes. Esto es lo que cada uno evita cuando lo sigues usando.`
      : 'Busca el material en la etiqueta interior de tu prenda y toca su ficha. Sin cifras inventadas: solo lo que cada fuente sostiene.'

  return (
    <Seccion tono="claro" className="conciencia conciencia-pagina">
      <nav className="conciencia-barra" aria-label="Navegación de la página informativa">
        <a className="conciencia-marca" href={href('/')}>
          <img src="/icono-redondo.png" alt="" width="34" height="34" decoding="async" />
          <span>
            <b>Hilo Circular</b>
            <small>Información de materiales</small>
          </span>
        </a>
        <div className="conciencia-barra-acciones">
          {usuario ? (
            <span className="conciencia-hola">Hola, {usuario.nombre.split(' ')[0]}</span>
          ) : (
            <a className="conciencia-enlace" href={href('/entrar?volver=%2Fconciencia')}>Entrar</a>
          )}
          <a className="conciencia-enlace" href={href('/')}>Ir a la tienda</a>
        </div>
      </nav>

      <div className="contenedor conciencia-contenedor">
        <header className="conciencia-cabeza">
          <Mascot pose="saluda" className="conciencia-mascota" />
          <p className="ceja">{ceja}</p>
          <h1>{titulo}</h1>
          <p className="conciencia-intro">{intro}</p>
          {desdeQr && (
            <ul className="chips conciencia-chips">
              {materialesQr.map((m) => <li key={m} className="etiqueta lavanda">{nombreMaterial(m)}</li>)}
            </ul>
          )}
        </header>

        {!cargandoSesion && usuario && closet.length > 0 && (
          <section className="conciencia-closet" aria-label="Materiales de tus prendas">
            <h2>Los materiales de tus prendas</h2>
            <ul className="conciencia-closet-lista">
              {closet.map((m) => (
                <li key={m.slug}>
                  <b>{m.nombre}</b>
                  <small>{m.prendas.length === 1 ? '1 prenda tuya' : `${m.prendas.length} prendas tuyas`}</small>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!cargandoSesion && usuario && closet.length === 0 && (
          <div className="conciencia-nota">
            <p>Todavía no registramos los materiales de tus prendas. Súbelas con su composición y aquí verás cómo ayuda cada tela.</p>
            <Boton to="/subir" tamano="sm">Subir una prenda</Boton>
          </div>
        )}

        {!cargandoSesion && !usuario && (
          <div className="conciencia-nota">
            <p>Inicia sesión y te diremos, con las prendas de tu propio clóset, cómo ayuda cada material al medio ambiente.</p>
            <Boton to="/entrar?volver=%2Fconciencia" tamano="sm">Iniciar sesión</Boton>
          </div>
        )}

        {!conFoco && (
          <div className="chips conciencia-filtro" role="group" aria-label="Filtrar por familia de material">
            {['Todas', ...FAMILIAS].map((f) => (
              <button
                key={f}
                type="button"
                className={`chip ${familia === f ? 'activo' : ''}`}
                aria-pressed={familia === f}
                onClick={() => setFamilia(f)}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {cargando && (
          <div className="conciencia-estado" role="status">
            <Mascot pose="duerme" className="conciencia-estado-mascota" flota />
            <p>Un momento… estamos preparando las fichas.</p>
          </div>
        )}

        {!cargando && error && (
          <div className="conciencia-estado" role="alert">
            <p>{error}</p>
            <Boton onClick={cargar}>Reintentar</Boton>
          </div>
        )}

        {!cargando && !error && visibles.length === 0 && (
          <div className="conciencia-estado">
            <p>Todavía no hay fichas para esta selección. Prueba con otro material.</p>
          </div>
        )}

        {!cargando && !error && visibles.length > 0 && (
          <div className="conciencia-fichas">
            {visibles.map((f, i) => (
              <Aparece key={f.slug} retraso={i * 60}>
                <article className="ficha-tela">
                  <header className="ficha-tela-cabeza">
                    <h2>{f.nombre}</h2>
                    <Etiqueta tono="lavanda">{f.familia}</Etiqueta>
                  </header>

                  <p className="ficha-que">{f.resumen}</p>

                  <div className="ficha-bloque">
                    <h3>Qué impacto tiene producirlo</h3>
                    <p>{f.impacto}</p>
                  </div>

                  <div className="ficha-ayuda">
                    <h3>Cómo ayuda reutilizarlo</h3>
                    <p>{f.ayuda}</p>
                  </div>

                  {porSlug.has(f.slug) && (
                    <div className="ficha-closet">
                      <h3>Tus prendas con {f.nombre.toLowerCase()}</h3>
                      <ul>
                        {porSlug.get(f.slug).map((p) => (
                          <li key={p.id}>
                            <a href={href(`/prenda/${p.id}`)}>{p.titulo}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <details>
                    <summary>Cómo cuidarlo</summary>
                    <ul>{(f.cuidado || []).map((c) => <li key={c}>{c}</li>)}</ul>
                  </details>
                  <details>
                    <summary>Reparar o reusar</summary>
                    <ul>{(f.repararReusar || []).map((c) => <li key={c}>{c}</li>)}</ul>
                  </details>
                  <details>
                    <summary>Al final de su vida</summary>
                    <p>{f.finDeVida}</p>
                  </details>

                  {Array.isArray(f.fuentes) && f.fuentes.length > 0 && (
                    <footer className="ficha-fuentes">
                      <b>Fuentes</b>
                      <ul>
                        {f.fuentes.map((fuente) => (
                          <li key={fuente.url}>
                            <a href={fuente.url} target="_blank" rel="noopener noreferrer">{fuente.titulo}</a>
                          </li>
                        ))}
                      </ul>
                      <small>Última revisión: {formatoFecha(f.actualizado)}</small>
                    </footer>
                  )}
                </article>
              </Aparece>
            ))}
          </div>
        )}

        <PreguntaIA materiales={foco} nombreMateriales={foco.map(nombreMaterial)} />

        <p className="conciencia-privacidad">
          No guardamos tus preguntas ni tu dirección IP: solo contamos cuántas preguntas se hacen al día.
        </p>

        <a className="conciencia-pie" href={href('/')}>Volver a Hilo Circular →</a>
      </div>
    </Seccion>
  )
}
