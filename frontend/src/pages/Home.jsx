import { useState } from 'react'
import Mascot from '../components/Mascot.jsx'
import { Estrella, Puntos, Trebol } from '../components/Adornos.jsx'
import PrendaCard from '../components/PrendaCard.jsx'
import { Aparece, Boton, Cifra, EstadoVacio, Seccion, TituloSeccion } from '../components/ui.jsx'
import { useStore } from '../lib/store.jsx'
import { CIFRAS, ESLOGAN, FORMAS, PASOS, VOCES } from '../lib/seed.js'

const DESTELLO = 'M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z'

function Destello({ className }) {
  return (
    <svg className={`destello ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d={DESTELLO} />
    </svg>
  )
}

export default function Home() {
  const { prendas, usuario } = useStore()
  const [ligero] = useState(() => typeof matchMedia === 'function' && matchMedia('(max-width: 900px)').matches)
  const destacadas = prendas.filter((p) => p.destacada && p.disponible).slice(0, 3)
  const ultimas = [...prendas].sort((a, b) => (a.creada < b.creada ? 1 : -1)).slice(0, 6)

  return (
    <>
      <Seccion tono="claro" className="hero">
        <div className="trama" aria-hidden="true" />
        {!ligero && (
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
        )}
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
                Hilo Circular es una experiencia <b>phygital</b> para jóvenes universitarios de Medellín: un reto en
                TikTok o Instagram, talleres relámpago de 15 a 60 minutos y una comunidad que repara, transforma e
                intercambia. Sin sermones y sin gastar de más.
              </p>
              <div className="hero-acciones">
                <Boton to={usuario ? '/panel' : '/entrar'} variante="lavanda" tamano="lg">
                  {usuario ? 'Ir a mi panel' : 'Entrar'}
                </Boton>
                <Boton to="/como-funciona" variante="fantasma" tamano="lg">Cómo funciona</Boton>
              </div>
              <div className="hero-datos">
                {CIFRAS.map((c) => (
                  <div className="hero-dato" key={c.texto}>
                    <b><Cifra valor={c.valor} /></b>
                    <span>{c.texto}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-mascota">
              <Mascot pose="sentado" title="Camaleón de Hilo Circular" prioridad />
            </div>
          </div>
        </div>
      </Seccion>

      <div className="marquesina" aria-hidden="true">
        <div className="marquesina-fila">
          {[0, 1].map((vuelta) => (
            <span key={vuelta}>
              <b>Repara</b> · <b>Transforma</b> · <b>Intercambia</b> · <b>Comparte</b> · <b>Descubre</b> · <b>Reutiliza</b>
            </span>
          ))}
        </div>
      </div>

      <Seccion tono="niebla" id="como">
        <div className="contenedor">
          <TituloSeccion
            ceja="Cómo funciona"
            titulo="El ciclo empieza con una prenda olvidada"
            texto="No te pedimos comprar menos: te damos un sistema para que esa ropa olvidada sea tu entrada a una comunidad. Un reto en redes, un taller corto y una etiqueta con QR que cuenta el impacto."
            accion={<Boton to="/como-funciona" variante="fantasma">Ver el ciclo completo</Boton>}
          />
          <div className="rejilla tres">
            {PASOS.slice(0, 3).map((paso, i) => (
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
            ceja="Catálogo de la comunidad"
            titulo="Prendas que buscan otra historia"
            texto="Cada pieza pertenece a alguien de la comunidad universitaria de Medellín. Puedes intercambiarla, repararla o transformarla en un taller relámpago."
            accion={<Boton to="/catalogo">Ver todo el catálogo</Boton>}
          />
          {prendas.length === 0 ? (
            <EstadoVacio
              pose="saluda"
              titulo="El catálogo está esperando su primera prenda"
              texto="La comunidad acaba de abrir sus puertas. Publica esa prenda que ya no usas y empieza el primer intercambio."
              accion={<Boton to={usuario ? '/subir' : '/registro'} tamano="lg">Publicar la primera prenda</Boton>}
              secundario={<Boton to="/como-funciona" variante="fantasma">Conocer cómo funciona</Boton>}
            />
          ) : (
            <>
              <div className="catalogo-rejilla">
                {(destacadas.length ? destacadas : ultimas.slice(0, 3)).map((p, i) => (
                  <Aparece key={p.id} retraso={i * 80}>
                    <PrendaCard prenda={p} />
                  </Aparece>
                ))}
              </div>

              {ultimas.length > 0 && (
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
              )}
            </>
          )}
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
                El camaleón representa la adaptación y la transformación, los conceptos centrales del proyecto. Su
                capacidad de cambiar refleja cómo una prenda puede adquirir nuevos usos, formas y estilos en lugar de
                ser desechada, y conecta con un público joven, creativo y diverso.
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
                <Boton to="/nosotros" variante="claro">Conocer la marca</Boton>
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
            ceja="Voces del proyecto"
            titulo="La moda circular ya tiene quien la respalde"
            texto="Investigación académica, comercio de segunda mano y oficios locales: tres miradas que sostienen la propuesta de Hilo Circular."
          />
          <div className="rejilla tres">
            {VOCES.map((v, i) => (
              <Aparece key={v.autor} retraso={i * 90}>
                <article className="tarjeta tarjeta-voz" style={{ height: '100%' }}>
                  <span className="voz-comilla" aria-hidden="true">“</span>
                  <p style={{ margin: '0.2rem 0 1.1rem' }}>{v.texto}</p>
                  <p style={{ fontSize: '0.88rem' }}><b>{v.autor}</b></p>
                  <p style={{ fontSize: '0.82rem', opacity: 0.72 }}>{v.ciudad}</p>
                </article>
              </Aparece>
            ))}
          </div>
        </div>
      </Seccion>

      <Seccion tono="claro">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <p className="ceja">Únete</p>
              <h2 style={{ fontSize: 'clamp(2rem, 4.4vw, 3.2rem)' }}>
                Esa prenda que no usas puede ser la entrada a tu próxima comunidad
              </h2>
              <p style={{ marginTop: '1.1rem', maxWidth: '34rem', opacity: 0.8 }}>
                Hilo Circular responde al ODS 12 con acciones concretas: crear la cuenta toma un minuto, subir la
                primera prenda es gratis y el taller más cercano queda a pocos minutos de tu universidad.
              </p>
              <div className="hero-acciones" style={{ marginTop: '1.8rem' }}>
                <Boton to="/registro" tamano="lg">Crear mi cuenta</Boton>
                <Boton to="/domicilio" variante="fantasma" tamano="lg">Ver talleres y entregas</Boton>
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
