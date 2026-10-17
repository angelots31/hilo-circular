import Mascot from '../components/Mascot.jsx'
import { Estrella, Puntos, Trebol } from '../components/Adornos.jsx'
import PrendaCard from '../components/PrendaCard.jsx'
import { Aparece, Boton, Estrellas, Seccion, TituloSeccion } from '../components/ui.jsx'
import { useStore } from '../lib/store.jsx'
import { ESLOGAN, FORMAS, PASOS, TESTIMONIOS } from '../lib/seed.js'

const DESTELLO = 'M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z'

function Destello({ className }) {
  return (
    <svg className={`destello ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d={DESTELLO} />
    </svg>
  )
}

export default function Home() {
  const { prendas, resenas, buscarUsuario, usuario } = useStore()
  const destacadas = prendas.filter((p) => p.destacada && p.disponible).slice(0, 3)
  const ultimas = [...prendas].sort((a, b) => (a.creada < b.creada ? 1 : -1)).slice(0, 6)
  const mejores = [...resenas].sort((a, b) => b.estrellas - a.estrellas).slice(0, 2)

  return (
    <>
      <Seccion tono="claro" className="hero">
        <div className="trama" aria-hidden="true" />
        <div className="hero-formas" aria-hidden="true">
          <Destello className="d1" />
          <Destello className="d2" />
          <Destello className="d3" />
          <span className="adorno trebol h-t1"><Trebol n={1} /></span>
          <span className="adorno trebol h-t2"><Trebol n={2} /></span>
          <span className="adorno puntos h-p"><Puntos /></span>
          <span className="adorno estrella h-e1"><Estrella /></span>
          <span className="adorno estrella h-e2"><Estrella /></span>
        </div>
        <div className="contenedor">
          <div className="hero-rejilla">
            <div>
              <p className="hero-eslogan">
                <i aria-hidden="true" />
                {ESLOGAN}
              </p>
              <h1>
                Dale otra vuelta a tu clóset, <em>sin comprar nada nuevo</em>
              </h1>
              <p className="hero-lead">
                Hilo Circular es la comunidad donde subes las prendas que ya no usas, encuentras las que sí quieres y
                coordinas el domicilio hasta tu casa. Cada intercambio le da una vida más a la ropa.
              </p>
              <div className="hero-acciones">
                <Boton to={usuario ? '/panel' : '/entrar'} variante="lavanda" tamano="lg">
                  {usuario ? 'Ir a mi panel' : 'Entrar'}
                </Boton>
              </div>
              <div className="hero-datos">
                <div className="hero-dato"><b>2.480</b><span>prendas en circulación</span></div>
                <div className="hero-dato"><b>1.130</b><span>intercambios completados</span></div>
                <div className="hero-dato"><b>1</b><span>ciudad: Medellín</span></div>
                <div className="hero-dato"><b>4,8 / 5</b><span>valoración de la comunidad</span></div>
              </div>
            </div>

            <div className="hero-mascota">
              <Mascot pose="sentado" title="Camaleón de Hilo Circular" />
            </div>
          </div>
        </div>
      </Seccion>

      <div className="marquesina" aria-hidden="true">
        <div className="marquesina-fila">
          {[0, 1].map((vuelta) => (
            <span key={vuelta}>
              <b>Intercambia</b> · <b>Transforma</b> · <b>Repara</b> · <b>Reutiliza</b> · <b>Comparte</b> · <b>Descubre</b>
            </span>
          ))}
        </div>
      </div>

      <Seccion tono="niebla" id="como">
        <div className="contenedor">
          <TituloSeccion
            ceja="Cómo funciona"
            titulo="Tres pasos y la prenda empieza a girar"
            texto="Un ciclo sencillo y transparente: publicas, encuentras a alguien que quiere lo que tienes y coordinamos la entrega."
            accion={<Boton to="/como-funciona" variante="fantasma">Ver reglas del intercambio</Boton>}
          />
          <div className="rejilla tres">
            {PASOS.map((paso, i) => (
              <Aparece key={paso.titulo} retraso={i * 90}>
                <article className="tarjeta tarjeta-fluida" style={{ height: '100%' }}>
                  <span className="paso-num">{`0${i + 1}`}</span>
                  <h3 style={{ marginTop: '0.8rem' }}>{paso.titulo}</h3>
                  <p style={{ opacity: 0.78 }}>{paso.texto}</p>
                </article>
              </Aparece>
            ))}
          </div>
        </div>
      </Seccion>

      <Seccion tono="claro" id="destacadas">
        <div className="contenedor">
          <TituloSeccion
            ceja="Catálogo destacado"
            titulo="Prendas que están buscando un nuevo hogar"
            texto="Seleccionamos cada semana las prendas mejor descritas y con mejores fotos de la comunidad."
            accion={<Boton to="/catalogo">Ver todo el catálogo</Boton>}
          />
          <div className="catalogo-rejilla">
            {destacadas.map((p, i) => (
              <Aparece key={p.id} retraso={i * 80}>
                <PrendaCard prenda={p} />
              </Aparece>
            ))}
          </div>

          <div style={{ marginTop: '4.5rem' }}>
            <TituloSeccion ceja="Recién llegadas" titulo="Lo último que subió la comunidad" />
            <div className="catalogo-rejilla">
              {ultimas.map((p, i) => (
                <Aparece key={p.id} retraso={i * 60}>
                  <PrendaCard prenda={p} />
                </Aparece>
              ))}
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion tono="oscuro">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <p className="ceja">Identidad visual</p>
              <h2 style={{ fontSize: 'clamp(2rem, 4.4vw, 3.4rem)' }}>
                Un camaleón que se adapta, igual que tus prendas
              </h2>
              <p style={{ marginTop: '1.2rem', maxWidth: '36rem', opacity: 0.85 }}>
                Las formas líquidas hablan de transformación, los destellos de nuevas posibilidades y la trama de puntos
                del ciclo que se repite. La mascota cambia de color según el fondo: así representamos la capacidad de la
                ropa de adquirir nuevos usos sin dejar de ser la misma.
              </p>
              <div className="rejilla tres" style={{ marginTop: '2.4rem' }}>
                {FORMAS.map((f, i) => (
                  <Aparece key={f.nombre} retraso={i * 90}>
                    <div className="forma-tarjeta">
                      <span className={`forma-visual ${i === 1 ? 'estrella' : i === 2 ? 'puntos' : ''}`} aria-hidden="true">
                        {i === 1 ? (
                          <svg viewBox="0 0 24 24"><path d={DESTELLO} /></svg>
                        ) : (
                          i === 0 && <i />
                        )}
                      </span>
                      <div>
                        <b style={{ fontFamily: 'var(--fuente-titulo)' }}>{f.nombre}</b>
                        <p style={{ fontSize: '0.88rem', opacity: 0.78, marginTop: '0.3rem' }}>{f.texto}</p>
                      </div>
                    </div>
                  </Aparece>
                ))}
              </div>
              <div style={{ marginTop: '2.4rem' }}>
                <Boton to="/nosotros" variante="claro">Conocer la marca y la paleta</Boton>
              </div>
            </div>
            <div className="mascota-panel" style={{ display: 'grid', placeItems: 'center' }}>
              <Mascot pose="colgado" className="mascota-grande" />
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion tono="rosa">
        <div className="contenedor">
          <TituloSeccion
            ceja="Lo que dicen"
            titulo="Personas reales con prendas que volvieron a usarse"
            accion={<Boton to="/resenas" variante="claro">Leer todas las reseñas</Boton>}
          />
          <div className="rejilla tres">
            {TESTIMONIOS.map((t, i) => (
              <Aparece key={t.autor} retraso={i * 90}>
                <article className="tarjeta" style={{ height: '100%' }}>
                  <Estrellas valor={5} />
                  <p style={{ margin: '0.9rem 0 1.1rem' }}>«{t.texto}»</p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.72 }}>{t.autor} · {t.ciudad}</p>
                </article>
              </Aparece>
            ))}
          </div>

          <div className="rejilla dos" style={{ marginTop: '3rem' }}>
            {mejores.map((r) => {
              const autor = buscarUsuario(r.autorId)
              const prenda = prendas.find((p) => p.id === r.prendaId)
              return (
                <Aparece key={r.id}>
                  <article className="tarjeta" style={{ height: '100%' }}>
                    <Estrellas valor={r.estrellas} />
                    <p style={{ margin: '0.8rem 0' }}>«{r.texto}»</p>
                    <p style={{ fontSize: '0.85rem', opacity: 0.75 }}>
                      {autor?.nombre} intercambió <b>{prenda?.titulo}</b>
                    </p>
                  </article>
                </Aparece>
              )
            })}
          </div>
        </div>
      </Seccion>

      <Seccion tono="claro">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <p className="ceja">Únete</p>
              <h2 style={{ fontSize: 'clamp(2rem, 4.4vw, 3.2rem)' }}>
                Tu próxima prenda favorita ya está en el clóset de alguien más
              </h2>
              <p style={{ marginTop: '1.1rem', maxWidth: '34rem', opacity: 0.8 }}>
                Crear la cuenta toma un minuto: registras tu perfil en Medellín, subes la primera prenda y empiezas a recibir
                solicitudes. El domicilio lo coordinamos nosotros.
              </p>
              <div className="hero-acciones" style={{ marginTop: '1.8rem' }}>
                <Boton to="/registro" tamano="lg">Crear mi cuenta</Boton>
                <Boton to="/domicilio" variante="fantasma" tamano="lg">Ver cobertura de domicilio</Boton>
              </div>
            </div>
            <div className="mascota-panel" style={{ display: 'grid', placeItems: 'center' }}>
              <Mascot pose="saluda" />
            </div>
          </div>
        </div>
      </Seccion>
    </>
  )
}
