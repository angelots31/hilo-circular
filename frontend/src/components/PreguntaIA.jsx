import { useState } from 'react'
import Mascot from './Mascot.jsx'
import { api } from '../lib/api.js'

const MAX_PREGUNTA = 300

const sugerenciasPara = (nombres) => {
  const material = nombres[0]
  if (!material) {
    return [
      '¿Cómo cuido un suéter de lana para que dure más?',
      '¿Qué hago con una camiseta rota?',
      '¿Cómo lavo ropa sintética sin soltar microplásticos?',
    ]
  }
  return [
    `¿Cómo cuido ${material} para que dure más?`,
    `¿Cómo reparo una prenda de ${material}?`,
    `¿Qué hago con ${material} cuando ya no se puede usar?`,
  ]
}

/**
 * Asistente de la micropágina. Es un extra: si falla o no está configurado,
 * las fichas de arriba siguen contando todo.
 */
export default function PreguntaIA({ materiales = [], nombreMateriales = [] }) {
  const [pregunta, setPregunta] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [fuentes, setFuentes] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const sugerencias = sugerenciasPara(nombreMateriales)

  const preguntar = async (texto) => {
    const limpia = String(texto ?? '').replace(/\s+/g, ' ').trim()
    if (limpia.length < 3) return setError('Escribe una pregunta un poco más larga.')
    setError('')
    setRespuesta('')
    setFuentes([])
    setCargando(true)
    try {
      const datos = await api.preguntarIA(limpia, materiales)
      setRespuesta(datos?.respuesta || '')
      setFuentes(Array.isArray(datos?.fuentes) ? datos.fuentes : [])
    } catch (err) {
      setError(err.message || 'El asistente no pudo responder ahora. Inténtalo de nuevo en un momento.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="pregunta-ia" aria-labelledby="pregunta-ia-titulo">
      <header className="pregunta-ia-cabeza">
        <Mascot pose="sentado" className="pregunta-ia-mascota" />
        <div>
          <h2 id="pregunta-ia-titulo">Pregúntale a Hilo</h2>
          <p>Dudas sobre cómo cuidar, reparar o reutilizar estas prendas. Responde con base en las fichas de arriba.</p>
        </div>
      </header>

      <div className="chips pregunta-ia-sugerencias">
        {sugerencias.map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            onClick={() => { setPregunta(s); preguntar(s) }}
            disabled={cargando}
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="pregunta-ia-form"
        onSubmit={(e) => {
          e.preventDefault()
          preguntar(pregunta)
        }}
      >
        <label className="campo" htmlFor="pregunta-ia">
          <span className="campo-etiqueta">Tu pregunta</span>
          <textarea
            id="pregunta-ia"
            className="entrada area"
            rows={3}
            maxLength={MAX_PREGUNTA}
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            placeholder="Ej.: ¿cómo lavo esta chaqueta para que suelte menos microplásticos?"
            aria-describedby="pregunta-ia-ayuda"
          />
          <span className="campo-ayuda" id="pregunta-ia-ayuda">
            Hasta {MAX_PREGUNTA} caracteres ({pregunta.length}/{MAX_PREGUNTA}). No escribas datos personales.
          </span>
        </label>
        <button type="submit" className="boton solido md" disabled={cargando}>
          <span>{cargando ? 'Pensando…' : 'Preguntar'}</span>
        </button>
      </form>

      {cargando && (
        <div className="pregunta-ia-pensando" role="status">
          <Mascot pose="duerme" className="pregunta-ia-pensando-mascota" flota />
          <p>Un momento… Hilo está leyendo las fichas.</p>
        </div>
      )}

      {error && <p className="campo-error" role="alert">{error}</p>}

      {respuesta && !cargando && (
        <article className="pregunta-ia-respuesta">
          <p>{respuesta}</p>
          <small className="pregunta-ia-aviso">
            Respuesta generada por IA, puede equivocarse. Revisa las fuentes de la ficha.
          </small>
          {fuentes.length > 0 && (
            <p className="pregunta-ia-fuentes">
              Basada en:{' '}
              {fuentes.map((f, i) => (
                <span key={f.slug}>
                  <a href={`#/conciencia?m=${encodeURIComponent(f.slug)}`}>{f.nombre}</a>
                  {i < fuentes.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          )}
        </article>
      )}
    </section>
  )
}
