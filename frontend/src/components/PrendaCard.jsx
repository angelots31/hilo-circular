import { useState } from 'react'
import { CarruselPrenda } from './Carrusel.jsx'
import { Avatar, Etiqueta } from './ui.jsx'
import { href } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'

const ETIQUETA_ESTADO = {
  'Nuevo con etiqueta': 'verde',
  'Como nuevo': 'lavanda',
  'Buen estado': 'neutro',
  'Con detalles': 'ambar',
}

/** Corazón de favoritos: se detiene la navegación para no salir de la tarjeta. */
function Corazon({ activo, onClick }) {
  return (
    <button
      className="prenda-corazon clicable"
      aria-label={activo ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      aria-pressed={activo}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7 3.1C19 15.6 12 20 12 20Z"
          fill={activo ? '#b3475b' : 'none'}
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </svg>
    </button>
  )
}

export default function PrendaCard({ prenda, retraso = 0, onEliminar, acciones }) {
  const { buscarUsuario, favoritos, alternarFavorito } = useStore()
  const dueno = buscarUsuario(prenda.duenoId)
  const favorito = favoritos.includes(prenda.id)
  const [activo, setActivo] = useState(false)

  return (
    <article
      className="prenda clicable"
      style={{ transitionDelay: `${retraso}ms` }}
      onMouseEnter={() => setActivo(true)}
      onMouseLeave={() => setActivo(false)}
      onFocus={() => setActivo(true)}
      onBlur={() => setActivo(false)}
    >
      <a href={href(`/prenda/${prenda.id}`)} aria-label={`Ver ${prenda.titulo}`}>
        <div className="prenda-arte-marco">
          <CarruselPrenda prenda={prenda} activo={activo} />
          <div className="prenda-etiquetas">
            <span>
              <Etiqueta tono={ETIQUETA_ESTADO[prenda.estado] ?? 'neutro'}>{prenda.estado}</Etiqueta>
              {prenda.destacada && <Etiqueta tono="destacada" style={{ marginLeft: '0.35rem' }}>Destacada</Etiqueta>}
            </span>
            <Corazon activo={favorito} onClick={() => alternarFavorito(prenda.id)} />
          </div>
          {!prenda.disponible && <span className="prenda-velo">Ya tiene nuevo dueño</span>}
        </div>
      </a>

      <div className="prenda-cuerpo">
        <a href={href(`/prenda/${prenda.id}`)}>
          <h3 className="prenda-titulo">{prenda.titulo}</h3>
        </a>
        <p className="prenda-meta">
          <span>Talla {prenda.talla}</span>
          <span>·</span>
          <span>{prenda.categoria}</span>
          <span>·</span>
          <span>{prenda.ciudad}</span>
        </p>
        <p className="prenda-meta">
          <EstrellasMini valor={dueno?.reputacion ?? 0} />
          <span>{dueno?.nombre}</span>
        </p>
        <div className="prenda-pie">
          <span className="prenda-valor">Valor ref. {prenda.valor}</span>
          {onEliminar ? (
            <button className="boton fantasma sm" onClick={() => onEliminar(prenda.id)}>
              Retirar
            </button>
          ) : (
            <Avatar nombre={dueno?.nombre ?? ''} tamano={28} />
          )}
        </div>
        {acciones}
      </div>
    </article>
  )
}

function EstrellasMini({ valor }) {
  return (
    <span className="prenda-puntaje" aria-label={`${valor} de 5`}>
      ★ {Number(valor).toFixed(1).replace('.', ',')}
    </span>
  )
}
