import { useEffect, useMemo, useState } from 'react'
import Mascot from '../components/Mascot.jsx'
import PreguntaIA from '../components/PreguntaIA.jsx'
import { Aparece, Boton, Cifra, Dato, Etiqueta, Seccion, TituloSeccion } from '../components/ui.jsx'
import { api } from '../lib/api.js'
import { href, useRoute } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'
import { CIFRAS, MATERIALES, TALLERES, nombreMaterial } from '../lib/seed.js'

const FAMILIAS = ['Natural', 'Sintética', 'Artificial', 'Mezcla']

const formatoFecha = (iso) => {
  if (!iso) return 'sin fecha'
  const valor = new Date(`${String(iso).slice(0, 10)}T12:00:00`)
  return Number.isNaN(valor.getTime())
    ? 'sin fecha'
    : valor.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

const esMaterial = (slug) => MATERIALES.some((m) => m.slug === slug)

/** Materiales distintos registrados en un grupo de prendas. */
const materialesDePrendas = (lista) => [...new Set(
  lista.flatMap((p) => (Array.isArray(p.composicion) ? p.composicion : [])).filter(esMaterial),
)]

/** Prendas que participan en los acuerdos indicados (una por cada lado del trueque). */
const prendasDeAcuerdos = (acuerdos, prendas) => {
  const ids = new Set()
  acuerdos.forEach((x) => {
    if (x.prendaId) ids.add(x.prendaId)
    if (x.ofreceId) ids.add(x.ofreceId)
  })
  return [...ids].map((id) => prendas.find((p) => p.id === id)).filter(Boolean)
}

/**
 * Página pública que abre el QR. Usa la misma estructura del inicio (portada,
 * datos, secciones y pie) y, si hay sesión, traduce los intercambios de la
 * persona en recomendaciones sobre lo que ya hizo bien.
 */
export default function Conciencia() {
  const { query } = useRoute()
  const { usuario, prendas, intercambios, cargando: cargandoSesion } = useStore()

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

  const misIntercambios = useMemo(
    () => (usuario
      ? intercambios.filter((x) => x.solicitanteId === usuario.id || x.receptorId === usuario.id)
      : []),
    [intercambios, usuario],
  )

  const completados = useMemo(
    () => misIntercambios.filter((x) => x.estado === 'Completado'),
    [misIntercambios],
  )

  const enCurso = useMemo(
    () => misIntercambios.filter((x) => x.estado === 'Aceptado' || x.estado === 'Pendiente'),
    [misIntercambios],
  )

  const prendasCompletadas = useMemo(
    () => prendasDeAcuerdos(completados, prendas),
    [completados, prendas],
  )

  const materialesCompletados = useMemo(
    () => materialesDePrendas(prendasCompletadas),
    [prendasCompletadas],
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
  // El QR manda; después se suman los materiales del clóset y de los trueques.
  const foco = useMemo(() => [...new Set([
    ...materialesQr,
    ...closet.map((m) => m.slug),
    ...materialesCompletados,
  ])], [materialesQr, closet, materialesCompletados])
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
  const recomendaciones = fichas.filter((f) => materialesCompletados.includes(f.slug))

  const nombre = usuario?.nombre.split(' ')[0]
  const ceja = desdeQr ? 'Escaneaste una etiqueta' : 'Concientización'
  const titulo = desdeQr
    ? 'Dos prendas siguen en uso gracias a este intercambio'
    : usuario
      ? `Hola, ${nombre}: tu ropa ya hace parte del cambio`
      : 'Lo que ya tienes también es moda'
  const intro = desdeQr
    ? 'Estos son los materiales de las prendas que se están intercambiando. Al darles una segunda vida evitas una compra nueva y alargas su tiempo de uso.'
    : usuario
      ? 'Aquí reunimos el impacto de los intercambios que ya completaste y lo que cada material de tu clóset evita cuando lo sigues usando.'
      : 'Cada prenda guardada sigue existiendo. Reutilizarla evita una compra nueva: conoce qué pide cada material y cómo darle otra historia.'

  return (
    <>
      <Seccion tono="claro" className="hero conciencia-hero">
        <div className="trama" aria-hidden="true" />
        <div className="contenedor">
          <div className="hero-rejilla">
            <div>
              <p className="hero-eslogan">
                <i aria-hidden="true" />
                {ceja}
              </p>
              <h1>{titulo}</h1>
              <p className="hero-lead">{intro}</p>
              {desdeQr && (
                <ul className="chips conciencia-chips">
                  {materialesQr.map((m) => <li key={m} className="etiqueta lavanda">{nombreMaterial(m)}</li>)}
                </ul>
              )}
              <div className="hero-acciones">
                <Boton to="/catalogo" variante="lavanda" tamano="lg">Ver prendas disponibles</Boton>
                {usuario ? (
                  <Boton to="/panel" variante="fantasma" tamano="lg">Ir a mi panel</Boton>
                ) : (
                  <Boton to="/entrar?volver=%2Fconciencia" variante="fantasma" tamano="lg">Entrar y ver mi impacto</Boton>
                )}
              </div>
            </div>
            <div className="hero-mascota">
              <Mascot pose="saluda" title="Camaleón de Hilo Circular" />
            </div>
          </div>
        </div>
      </Seccion>

      {!cargandoSesion && usuario && (
        <Seccion tono="niebla">
          <div className="contenedor">
            <TituloSeccion
              ceja="Tu impacto"
              titulo={completados.length
                ? `Esto es lo que ya lograste, ${nombre}`
                : 'Tu impacto empieza con el primer intercambio'}
              texto={completados.length
                ? 'Cada intercambio completado mantiene dos prendas en uso. Estos son los materiales que ya volvieron a circular contigo.'
                : 'Cuando completes un intercambio aparecerá aquí el impacto de las prendas que volviste a poner en uso.'}
            />

            <div className="datos-rejilla">
              <Dato etiqueta="Prendas registradas" valor={misPrendas.length} nota="En tu clóset" />
              <Dato
                etiqueta="Intercambios completados"
                valor={completados.length}
                nota={enCurso.length ? `${enCurso.length} en curso` : 'Sin pendientes'}
              />
              <Dato etiqueta="Prendas con nueva vida" valor={prendasCompletadas.length} nota="Gracias a tus trueques" />
              <Dato etiqueta="Materiales reutilizados" valor={materialesCompletados.length} nota="Distintos en circulación" />
            </div>

            {cargando ? (
              <div className="conciencia-estado" role="status">
                <Mascot pose="duerme" className="conciencia-estado-mascota" flota />
                <p>Un momento… preparamos tus recomendaciones.</p>
              </div>
            ) : recomendaciones.length > 0 ? (
              <>
                <h3 className="conciencia-subtitulo">Lo que hiciste bien</h3>
                <div className="rejilla tres">
                  {recomendaciones.map((f, i) => (
                    <Aparece key={f.slug} retraso={i * 70}>
                      <article className="tarjeta" style={{ height: '100%' }}>
                        <Etiqueta tono="lavanda">{f.familia}</Etiqueta>
                        <h3 style={{ marginTop: '0.6rem' }}>{f.nombre}</h3>
                        <p>{f.ayuda}</p>
                        {porSlug.has(f.slug) && (
                          <p className="conciencia-reco-prendas">
                            También está en tus prendas:{' '}
                            {porSlug.get(f.slug).map((p, k) => (
                              <span key={p.id}>
                                {k > 0 && ', '}
                                <a href={href(`/prenda/${p.id}`)}>{p.titulo}</a>
                              </span>
                            ))}
                          </p>
                        )}
                      </article>
                    </Aparece>
                  ))}
                </div>
              </>
            ) : (
              <div className="conciencia-nota">
                <p>
                  {completados.length
                    ? 'Las prendas que intercambiaste todavía no tienen la composición registrada, así que aún no podemos calcular su impacto por material.'
                    : 'Todavía no has completado un intercambio. Sube una prenda con su composición y aquí verás lo que aporta al darle una segunda vida.'}
                </p>
                <Boton to="/subir" tamano="sm">Subir una prenda</Boton>
              </div>
            )}
          </div>
        </Seccion>
      )}

      <Seccion tono="claro">
        <div className="contenedor">
          <TituloSeccion
            ceja="El segundo uso"
            titulo="Una prenda guardada no deja de existir"
            texto="El 80 % del clóset de los universitarios permanece inactivo. Cada intercambio evita una compra nueva y mantiene dos prendas en uso; reparar o transformar hace lo mismo con una sola."
          />
          <div className="hero-datos">
            {CIFRAS.map((c) => (
              <div className="hero-dato" key={c.texto}>
                <b><Cifra valor={c.valor} /></b>
                <span>{c.texto}</span>
              </div>
            ))}
          </div>
          <div className="rejilla tres" style={{ marginTop: '2.6rem' }}>
            {TALLERES.map((t, i) => (
              <Aparece key={t.nombre} retraso={i * 80}>
                <article className="tarjeta" style={{ height: '100%' }}>
                  <h3>{t.nombre}</h3>
                  <p>{t.texto}</p>
                </article>
              </Aparece>
            ))}
          </div>
          <div style={{ marginTop: '2.2rem' }}>
            <Boton to="/como-funciona" variante="fantasma">Ver el ciclo completo</Boton>
          </div>
        </div>
      </Seccion>

      <Seccion tono="niebla" id="materiales">
        <div className="contenedor">
          <TituloSeccion
            ceja="Guía de telas"
            titulo={conFoco ? 'Los materiales de estas prendas' : 'Busca el material en tu etiqueta'}
            texto={conFoco
              ? 'Estas son las fichas de las telas que aparecen en las prendas de esta página. Toca cada una para ver su impacto y sus cuidados.'
              : 'Cada material pide un cuidado distinto. Sin cifras inventadas: solo lo que cada fuente sostiene.'}
          />

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
        </div>
      </Seccion>

      <Seccion tono="rosa">
        <div className="contenedor">
          <PreguntaIA materiales={foco} nombreMateriales={foco.map(nombreMaterial)} />
          <p className="conciencia-privacidad">
            No guardamos tus preguntas ni tu dirección IP: solo contamos cuántas preguntas se hacen al día.
          </p>
        </div>
      </Seccion>
    </>
  )
}
