import { useEffect, useState } from 'react'
import Garment from './Garment.jsx'

/** Vistas de una prenda: fotos reales si las subió su dueño; si no, tres vistas ilustradas. */
export function vistasDe(prenda) {
  if (!prenda) return []
  if (prenda.fotos?.length) {
    return prenda.fotos
      .filter((f) => typeof f === 'string' && /^(blob:|data:|https?:|\/)/.test(f))
      .map((url, i) => ({ clave: url, tipo: 'foto', url, etiqueta: i === 0 ? 'Portada' : `Foto ${i + 1}` }))
  }
  const paleta = prenda.paleta?.length ? prenda.paleta : ['#6872aa', '#e5c4c6']
  return [
    { clave: 'frente', tipo: 'arte', paleta, etiqueta: 'Frente' },
    { clave: 'reverso', tipo: 'arte', paleta: [...paleta].reverse(), etiqueta: 'Reverso', espejo: true },
    { clave: 'detalle', tipo: 'arte', paleta, etiqueta: 'Detalle', zoom: true },
  ]
}

export function Vista({ vista, prenda, alt = '' }) {
  if (!vista) return null
  if (vista.tipo === 'foto') {
    return <img className="prenda-foto" src={vista.url} alt={alt} loading="lazy" draggable="false" />
  }
  return (
    <div className={`prenda-vista${vista.zoom ? ' zoom' : ''}${vista.espejo ? ' espejo' : ''}`}>
      <Garment tipo={prenda.tipo} paleta={vista.paleta} alt={alt} />
    </div>
  )
}

/** Pasa solo de vista mientras `activo`; al soltar vuelve a la portada. */
function useCarrusel(total, activo, ms = 1000) {
  const [indice, setIndice] = useState(0)
  useEffect(() => {
    if (!activo) {
      setIndice(0)
      return
    }
    if (total < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setIndice((i) => (i + 1) % total), ms)
    return () => clearInterval(t)
  }, [activo, total, ms])
  return [indice, setIndice]
}

export function CarruselPrenda({ prenda, activo }) {
  const vistas = vistasDe(prenda)
  const [i, setI] = useCarrusel(vistas.length, activo)
  const ir = (e, n) => {
    e.preventDefault()
    e.stopPropagation()
    setI((n + vistas.length) % vistas.length)
  }
  return (
    <div className="carrusel">
      {vistas.map((v, k) => (
        <div key={v.clave} className={`carrusel-slide${k === i ? ' actual' : ''}`} aria-hidden={k !== i}>
          <Vista vista={v} prenda={prenda} alt={k === 0 ? prenda.titulo : ''} />
        </div>
      ))}
      {vistas.length > 1 && (
        <>
          <button type="button" className="carrusel-flecha izq" aria-label="Foto anterior" onClick={(e) => ir(e, i - 1)}>‹</button>
          <button type="button" className="carrusel-flecha der" aria-label="Foto siguiente" onClick={(e) => ir(e, i + 1)}>›</button>
          <div className="carrusel-puntos">
            {vistas.map((v, k) => (
              <button key={v.clave} type="button" aria-label={`Ver ${v.etiqueta}`} className={k === i ? 'activo' : ''} onClick={(e) => ir(e, k)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
