import Mascot from '../components/Mascot.jsx'
import { Boton, Seccion } from '../components/ui.jsx'
import { href } from '../lib/router.jsx'

const SUGERENCIAS = [
  { to: '/catalogo', texto: 'Catálogo completo' },
  { to: '/como-funciona', texto: 'Cómo funciona el intercambio' },
  { to: '/resenas', texto: 'Reseñas de la comunidad' },
  { to: '/domicilio', texto: 'Domicilio y entregas' },
]

export default function NoEncontrada({ ruta }) {
  return (
    <Seccion tono="claro">
      <div className="contenedor">
        <div className="no-encontrada">
          <Mascot pose="colgado" />
          <div>
            <p className="ceja">Error 404</p>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5.4vw, 3.8rem)' }}>Esta página se deshilachó</h1>
            <p style={{ marginTop: '1rem', maxWidth: '36rem', opacity: 0.8 }}>
              No encontramos <code className="codigo-ruta">{ruta}</code>. Puede que el enlace esté mal escrito o que la
              página haya cambiado de lugar. Nuestro camaleón te ayuda a volver al hilo.
            </p>
            <div className="hero-acciones" style={{ marginTop: '1.8rem' }}>
              <Boton to="/" tamano="lg">Volver al inicio</Boton>
              <Boton to="/catalogo" variante="fantasma" tamano="lg">Ver el catálogo</Boton>
            </div>
            <ul className="sugerencias-404">
              {SUGERENCIAS.map((s) => (
                <li key={s.to}>
                  <a href={href(s.to)}>{s.texto}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Seccion>
  )
}
