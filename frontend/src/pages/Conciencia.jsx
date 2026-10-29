import { useEffect, useMemo, useState } from 'react'
import Mascot from '../components/Mascot.jsx'
import PreguntaIA from '../components/PreguntaIA.jsx'
import { Aparece, Boton, Etiqueta, Seccion } from '../components/ui.jsx'
import { api } from '../lib/api.js'
import { useRoute } from '../lib/router.jsx'
import { MATERIALES, nombreMaterial } from '../lib/seed.js'

const FAMILIAS = ['Natural', 'Sintética', 'Artificial', 'Mezcla']

const formatoFecha = (iso) => {
  if (!iso) return 'sin fecha'
  const valor = new Date(`${String(iso).slice(0, 10)}T12:00:00`)
  return Number.isNaN(valor.getTime())
    ? 'sin fecha'
    : valor.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

/**
 * Micropágina pública que abre el QR: explica, material por material, cómo
 * ayuda reutilizar la ropa. No pide sesión y funciona en un celular.
 */
export default function Conciencia() {
  const { query } = useRoute()
  const materiales = useMemo(
    () => String(query.get('m') || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => MATERIALES.some((m) => m.slug === s)),
    [query],
  )
  const llave = materiales.join(',')
  const [fichas, setFichas] = useState([])
  const [familia, setFamilia] = useState('Todas')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = () => {
    setCargando(true)
    setError('')
    api.telas(materiales)
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
  const conMateriales = materiales.length > 0

  return (
    <Seccion tono="claro" className="conciencia">
      <div className="contenedor conciencia-contenedor">
        <header className="conciencia-cabeza">
          <Mascot pose="saluda" className="conciencia-mascota" />
          <p className="ceja">{conMateriales ? 'Esto es lo que estás reutilizando' : 'Guía de materiales'}</p>
          <h1>
            {conMateriales
              ? 'Dos prendas siguen en uso gracias a este intercambio'
              : 'Cada material pide un cuidado distinto'}
          </h1>
          <p className="conciencia-intro">
            {conMateriales
              ? 'Estos son los materiales de las prendas que se están intercambiando y lo que evitas al darles una segunda vida.'
              : 'Busca el material en la etiqueta interior de tu prenda y toca su ficha. Sin cifras inventadas: solo lo que cada fuente sostiene.'}
          </p>
          {conMateriales && (
            <ul className="chips conciencia-chips">
              {materiales.map((m) => <li key={m} className="etiqueta lavanda">{nombreMaterial(m)}</li>)}
            </ul>
          )}
        </header>

        {!conMateriales && (
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

        <section className="conciencia-cierre">
          <Mascot pose="saluda" className="conciencia-cierre-mascota" />
          <h2>
            {conMateriales
              ? 'En este intercambio, dos prendas siguen en uso'
              : 'Cada prenda que sigue en uso es una que no hay que fabricar'}
          </h2>
          <p>Reparar, transformar e intercambiar son las formas más directas de cuidar lo que ya existe.</p>
          <div className="conciencia-cierre-acciones">
            <Boton to="/subir" tamano="lg">Subir una prenda</Boton>
            <Boton to="/domicilio" variante="fantasma" tamano="lg">Ver los talleres</Boton>
          </div>
        </section>

        <PreguntaIA materiales={materiales} nombreMateriales={materiales.map(nombreMaterial)} />

        <p className="conciencia-privacidad">
          No guardamos tus preguntas ni tu dirección IP: solo contamos cuántas preguntas se hacen al día.
        </p>
      </div>
    </Seccion>
  )
}
