import { useEffect, useMemo, useState } from 'react'
import Mascot from '../components/Mascot.jsx'
import { Aparece, Boton, Cifra, Dato, Etiqueta, Seccion, TituloSeccion } from '../components/ui.jsx'
import { api } from '../lib/api.js'
import { href, useRoute } from '../lib/router.jsx'
import { irAElemento } from '../lib/scroll.js'
import { useStore } from '../lib/store.jsx'
import { CIFRAS, MATERIALES, TALLERES, nombreMaterial } from '../lib/seed.js'

const FAMILIAS = ['Natural', 'Sintética', 'Artificial', 'Mezcla']

const PASOS_ETIQUETA = [
  {
    titulo: 'Busca la composición',
    texto: 'Está en la etiqueta interior, junto a los símbolos de lavado. Ahí se indica de qué fibras está hecha la prenda.',
  },
  {
    titulo: 'Lee el orden y los porcentajes',
    texto: 'La fibra que aparece primero es la que más pesa. No se cuida igual un 100 % algodón que una mezcla con poliéster.',
  },
  {
    titulo: 'Consulta su ficha',
    texto: 'Cada ficha de esta wiki reúne el impacto de producir la fibra, cómo ayuda reutilizarla y qué hacer al final de su vida.',
  },
]

const normalizar = (texto) => String(texto ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()

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
 * Página pública que abre el QR. Mantiene la estructura del inicio, traduce
 * los intercambios de la persona en impacto propio y reúne las telas en una
 * wiki navegable con buscador, familias e índice.
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

  const closetSlugs = useMemo(() => closet.map((m) => m.slug), [closet])
  const desdeQr = materialesQr.length > 0

  // Todo lo que tiene que ver con la persona: QR, clóset y trueques.
  const foco = useMemo(() => [...new Set([
    ...materialesQr,
    ...closetSlugs,
    ...materialesCompletados,
  ])], [materialesQr, closetSlugs, materialesCompletados])
  const conFoco = foco.length > 0

  const prioridad = (slug) => {
    if (materialesQr.includes(slug)) return 0
    if (closetSlugs.includes(slug)) return 1
    if (materialesCompletados.includes(slug)) return 2
    return 3
  }

  const [fichas, setFichas] = useState([])
  const [familia, setFamilia] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  // Se resuelve después del render para que los filtros ya estén aplicados.
  const [destinoTela, setDestinoTela] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = () => {
    setCargando(true)
    setError('')
    // La wiki completa: el filtrado por foco, familia y búsqueda es local.
    api.telas()
      .then(({ telas }) => setFichas(telas || []))
      .catch(() => setError('No pudimos cargar la wiki. Revisa tu conexión e inténtalo de nuevo.'))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargar()
    // Cada visita que llega desde el QR suma uno al contador del día.
    if (query.get('o') === 'qr') api.visitaQr().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ordenadas = useMemo(() => [...fichas].sort((a, b) => (
    prioridad(a.slug) - prioridad(b.slug) || String(a.nombre).localeCompare(String(b.nombre), 'es')
  )), [fichas, materialesQr, closetSlugs, materialesCompletados])

  const visibles = useMemo(() => {
    const texto = normalizar(busqueda)
    return ordenadas.filter((f) => {
      if (familia === 'mias' && !foco.includes(f.slug)) return false
      if (familia !== 'Todas' && familia !== 'mias' && f.familia !== familia) return false
      if (!texto) return true
      return normalizar(`${f.nombre} ${f.familia} ${f.resumen} ${f.impacto} ${f.ayuda}`).includes(texto)
    })
  }, [ordenadas, familia, busqueda, foco])

  const indice = useMemo(
    () => [...fichas].sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es')),
    [fichas],
  )
  const numeroDe = useMemo(
    () => new Map(ordenadas.map((f, i) => [f.slug, i + 1])),
    [ordenadas],
  )
  const porSlug = useMemo(
    () => new Map(closet.map((m) => [m.slug, m.prendas])),
    [closet],
  )
  const recomendaciones = useMemo(
    () => fichas.filter((f) => materialesCompletados.includes(f.slug)),
    [fichas, materialesCompletados],
  )

  const filtros = useMemo(() => {
    const opciones = [{ valor: 'Todas', texto: 'Todas', total: fichas.length }]
    if (conFoco) opciones.push({ valor: 'mias', texto: 'Mi ropa', total: fichas.filter((f) => foco.includes(f.slug)).length })
    FAMILIAS.forEach((f) => opciones.push({
      valor: f,
      texto: f,
      total: fichas.filter((x) => x.familia === f).length,
    }))
    return opciones
  }, [fichas, foco, conFoco])

  useEffect(() => {
    if (!destinoTela) return undefined
    const frame = requestAnimationFrame(() => {
      irAElemento(`tela-${destinoTela}`)
      setDestinoTela('')
    })
    return () => cancelAnimationFrame(frame)
  }, [destinoTela])

  const irATela = (slug) => {
    setFamilia('Todas')
    setBusqueda('')
    setDestinoTela(slug)
  }

  const etiquetasDeFicha = (slug) => [
    materialesQr.includes(slug) && 'En esta prenda',
    closetSlugs.includes(slug) && 'En tu clóset',
    materialesCompletados.includes(slug) && 'En tus trueques',
  ].filter(Boolean)

  const nombre = usuario?.nombre.split(' ')[0]
  const ceja = desdeQr ? 'Escaneaste una etiqueta' : 'Concientización'
  const titulo = desdeQr
    ? 'Dos prendas siguen en uso gracias a este intercambio'
    : usuario
      ? `Hola, ${nombre}: tu ropa ya hace parte del cambio`
      : 'Antes de comprar, mira lo que ya tienes'
  const intro = desdeQr
    ? 'Los materiales de las prendas que se están intercambiando ya están abiertos en la wiki. Conócelos y descubre qué evitas al darles una segunda vida.'
    : usuario
      ? 'Aquí reunimos el impacto de los trueques que ya completaste y una wiki para entender qué pide cada tela de tu clóset.'
      : 'Cada prenda guardada sigue existiendo. Entender sus materiales es el primer paso para reutilizarla, repararla o intercambiarla en lugar de comprar algo nuevo.'

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
                      <article className="tarjeta tarjeta-fluida" style={{ height: '100%' }}>
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
                        <button type="button" className="wiki-enlace-ficha" onClick={() => irATela(f.slug)}>
                          Ver ficha completa →
                        </button>
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
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <TituloSeccion
                ceja="El problema"
                titulo="El clóset más lleno no es el que más se usa"
                texto="En la encuesta de campo con estudiantes universitarios de Medellín, 8 de cada 10 prendas permanecían inactivas. La ropa olvidada sigue existiendo: producirla ya consumió agua, energía y materiales. Darle una segunda vida es la forma más directa de evitar una compra nueva."
              />
              <p className="wiki-fuente">
                Fuente: encuesta de campo de Hilo Circular (estudiantes universitarios, Medellín, 2026).
              </p>
            </div>
            <div className="hero-datos datos-conciencia">
              {CIFRAS.map((c) => (
                <div className="hero-dato" key={c.texto}>
                  <b><Cifra valor={c.valor} /></b>
                  <span>{c.texto}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion tono="rosa">
        <div className="contenedor">
          <TituloSeccion
            ceja="El segundo uso"
            titulo="Tres formas de alargar la vida de una prenda"
            texto="No hace falta comprar algo nuevo para cambiar de estilo. Reparar, transformar e intercambiar mantienen la ropa en circulación y evitan que termina en la basura antes de tiempo."
          />
          <div className="rejilla tres">
            {TALLERES.map((t, i) => (
              <Aparece key={t.nombre} retraso={i * 80}>
                <article className="tarjeta" style={{ height: '100%' }}>
                  <span className="paso-num">{`0${i + 1}`}</span>
                  <h3 style={{ marginTop: '0.8rem' }}>{t.nombre}</h3>
                  <p style={{ opacity: 0.8 }}>{t.texto}</p>
                </article>
              </Aparece>
            ))}
          </div>
          <div style={{ marginTop: '2.2rem' }}>
            <Boton to="/como-funciona" variante="fantasma">Ver el ciclo completo</Boton>
          </div>
        </div>
      </Seccion>

      <Seccion tono="niebla">
        <div className="contenedor">
          <TituloSeccion
            ceja="Antes de comprar"
            titulo="Aprende a leer la etiqueta"
            texto="La etiqueta interior es la ficha técnica de tu prenda. Con esos datos puedes decidir cómo lavarla, repararla y qué hacer cuando ya no la uses."
          />
          <div className="rejilla tres">
            {PASOS_ETIQUETA.map((paso, i) => (
              <Aparece key={paso.titulo} retraso={i * 80}>
                <article className="tarjeta" style={{ height: '100%' }}>
                  <span className="paso-num">{`0${i + 1}`}</span>
                  <h3 style={{ marginTop: '0.8rem' }}>{paso.titulo}</h3>
                  <p style={{ opacity: 0.8 }}>{paso.texto}</p>
                </article>
              </Aparece>
            ))}
          </div>
          <div style={{ marginTop: '1.8rem' }}>
            <Boton onClick={() => irATela('algodon')} variante="fantasma">Abrir una ficha de ejemplo</Boton>
          </div>
        </div>
      </Seccion>

      <Seccion tono="claro" className="wiki-seccion" id="wiki">
        <div className="contenedor">
          <TituloSeccion
            ceja="Wiki de telas"
            titulo="Fichas de materiales, de la etiqueta al cuidado"
            texto="Trece fibras explicadas con la misma estructura: qué son, qué implica producirlas, cómo ayuda reutilizarlas, cómo cuidarlas y qué hacer al final de su vida. Usa el buscador o filtra por familia."
          />

          <div className="wiki">
            <aside className="wiki-lateral">
              <div className="wiki-caja">
                <label className="campo-etiqueta" htmlFor="wiki-buscar">Buscar en la wiki</label>
                <input
                  id="wiki-buscar"
                  type="search"
                  className="entrada wiki-buscador"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Algodón, lino, mezclilla…"
                />
              </div>

              <div className="wiki-caja">
                <p className="wiki-caja-titulo">Familias</p>
                <div className="wiki-familias">
                  {filtros.map((f) => (
                    <button
                      key={f.valor}
                      type="button"
                      className={`wiki-chip ${familia === f.valor ? 'activo' : ''}`}
                      aria-pressed={familia === f.valor}
                      onClick={() => setFamilia(f.valor)}
                    >
                      {f.texto}
                      <em>{f.total}</em>
                    </button>
                  ))}
                </div>
              </div>

              <div className="wiki-caja wiki-indice">
                <p className="wiki-caja-titulo">Índice de telas</p>
                <ul>
                  {indice.map((f) => (
                    <li key={f.slug}>
                      <button type="button" onClick={() => irATela(f.slug)}>
                        <span>{f.nombre}</span>
                        <em data-familia={normalizar(f.familia)}>{f.familia}</em>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="wiki-nota">
                Cada ficha cita sus fuentes y muestra la fecha de su última revisión.
              </p>
            </aside>

            <div className="wiki-articulos">
              <p className="wiki-resultados" role="status">
                {cargando
                  ? 'Cargando fichas…'
                  : `${visibles.length} ${visibles.length === 1 ? 'ficha' : 'fichas'} de ${fichas.length}`}
              </p>

              {cargando && (
                <div className="conciencia-estado" role="status">
                  <Mascot pose="duerme" className="conciencia-estado-mascota" flota />
                  <p>Un momento… estamos preparando la wiki.</p>
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
                  <p>No encontramos fichas con esa búsqueda.</p>
                  <Boton onClick={() => { setBusqueda(''); setFamilia('Todas') }} variante="fantasma">Limpiar filtros</Boton>
                </div>
              )}

              {!cargando && !error && visibles.map((f) => (
                <article
                  key={f.slug}
                  className="wiki-ficha"
                  id={`tela-${f.slug}`}
                  data-familia={normalizar(f.familia)}
                >
                    <header className="wiki-ficha-cabeza">
                      <div>
                        <p className="wiki-ficha-ceja">Ficha {String(numeroDe.get(f.slug) ?? 1).padStart(2, '0')}</p>
                        <h3>{f.nombre}</h3>
                        <p className="wiki-ficha-meta">
                          <Etiqueta tono="lavanda">{f.familia}</Etiqueta>
                          {etiquetasDeFicha(f.slug).map((etiqueta) => (
                            <Etiqueta key={etiqueta} tono="rosa">{etiqueta}</Etiqueta>
                          ))}
                        </p>
                      </div>
                      <span className="wiki-ficha-num" aria-hidden="true">
                        {String(numeroDe.get(f.slug) ?? 1).padStart(2, '0')}
                      </span>
                    </header>

                    <p className="wiki-ficha-lead">{f.resumen}</p>

                    <div className="wiki-ficha-rejilla">
                      <div className="wiki-bloque">
                        <h4>Impacto de producirlo</h4>
                        <p>{f.impacto}</p>
                      </div>
                      <div className="wiki-bloque wiki-bloque-destacado">
                        <h4>Cómo ayuda reutilizarlo</h4>
                        <p>{f.ayuda}</p>
                      </div>
                    </div>

                    {porSlug.has(f.slug) && (
                      <div className="wiki-prendas">
                        <h4>Tus prendas con {f.nombre.toLowerCase()}</h4>
                        <ul>
                          {porSlug.get(f.slug).map((p) => (
                            <li key={p.id}>
                              <a href={href(`/prenda/${p.id}`)}>{p.titulo}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="wiki-detalles">
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
                    </div>

                    {Array.isArray(f.fuentes) && f.fuentes.length > 0 && (
                      <footer className="wiki-fuentes">
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
              ))}
            </div>
          </div>
        </div>
      </Seccion>
    </>
  )
}
