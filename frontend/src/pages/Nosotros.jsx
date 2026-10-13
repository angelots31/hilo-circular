import Mascot from '../components/Mascot.jsx'
import { Aparece, Boton, Etiqueta, Seccion, TituloSeccion } from '../components/ui.jsx'
import { ESLOGAN, FORMAS } from '../lib/seed.js'

const DESTELLO = 'M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z'

const COLORES = [
  { hex: '#6872aa', nombre: 'Lavanda profunda', texto: 'Creatividad, innovación y expresión personal. Es un tono fresco y contemporáneo que presenta el modelo circular desde una perspectiva joven y actual.' },
  { hex: '#5d4655', nombre: 'Ciruela', texto: 'Aporta profundidad y contraste a la identidad. Representa la idea de dar valor y permanencia a las prendas, lejos de la lógica de usar y desechar.' },
  { hex: '#e2deea', nombre: 'Niebla', texto: 'Equilibrio y ligereza visual. Refuerza una identidad sencilla y accesible, relacionada con la idea de encontrar nuevas posibilidades en lo que ya tenemos.' },
  { hex: '#e5c4c6', nombre: 'Rosa empolvado', texto: 'Cercanía, cuidado y expresión personal. Se relaciona con la conexión que desarrollamos con nuestras prendas al repararlas, personalizarlas y darles una nueva vida.' },
]

export default function Nosotros() {
  return (
    <>
      <Seccion tono="claro">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <p className="ceja">Sobre la marca</p>
              <h1 style={{ fontSize: 'clamp(2.3rem, 5.6vw, 4.2rem)' }}>Hilo Circular</h1>
              <p className="hero-eslogan" style={{ marginTop: '1.2rem' }}>
                <i aria-hidden="true" />
                {ESLOGAN}
              </p>
              <p style={{ marginTop: '1.2rem', fontSize: '1.06rem', maxWidth: '38rem', opacity: 0.82 }}>
                Existimos para cuestionar la idea de que para vestir bien siempre hay que comprar algo nuevo. Invitamos a
                descubrir el valor de lo que ya tenemos mediante la creatividad, la combinación, la reparación y la
                transformación. Así, cambiar de estilo no tiene que significar gastar constantemente.
              </p>
              <div className="chips" style={{ marginTop: '1.6rem' }}>
                <Etiqueta tono="lavanda">Moda circular</Etiqueta>
                <Etiqueta tono="neutro">Hecho en Medellín</Etiqueta>
                <Etiqueta tono="rosa">Comunidad abierta</Etiqueta>
              </div>
            </div>
            <div style={{ display: 'grid', placeItems: 'center' }}>
              <Mascot pose="saluda" />
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion tono="niebla">
        <div className="contenedor">
          <TituloSeccion
            ceja="La mascota"
            titulo="Un camaleón que se adapta a donde esté"
            texto="El camaleón representa la adaptación y la transformación, los conceptos centrales de Hilo Circular."
          />
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '1.04rem', maxWidth: '38rem' }}>
                Su capacidad de cambiar refleja cómo una prenda puede adquirir nuevos usos, formas y estilos en lugar de
                ser desechada. Su apariencia expresiva y caricaturesca aporta cercanía y conecta con un público joven,
                creativo y diverso.
              </p>
              <ul className="detalle-lista" style={{ marginTop: '1.6rem' }}>
                <li><span>Adaptación</span><b>Cambia de color con el fondo</b></li>
                <li><span>Transformación</span><b>Cuerpo y cola en espiral</b></li>
                <li><span>Carácter</span><b>Ojos grandes y gesto expresivo</b></li>
                <li><span>Presencia</span><b>Acompaña cada estado vacío</b></li>
              </ul>
            </div>
            <div>
              <div className="muestrario-tonos">
                {[
                  { tono: 'claro', etiqueta: 'Fondo claro' },
                  { tono: 'niebla', etiqueta: 'Fondo niebla' },
                  { tono: 'rosa', etiqueta: 'Fondo rosa' },
                  { tono: 'oscuro', etiqueta: 'Fondo ciruela' },
                ].map((t) => (
                  <div key={t.tono} className={`muestra-tono tono-${t.tono}`} data-tono={t.tono}>
                    <Mascot pose="sentado" title={`Camaleón sobre ${t.etiqueta}`} />
                    <span>{t.etiqueta}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.9rem' }}>
                La ilustración se presenta sobre cuatro tonos de la paleta para mostrar su contraste en distintos fondos.
              </p>
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion tono="claro">
        <div className="contenedor">
          <TituloSeccion ceja="Formas usadas" titulo="Tres formas que cuentan la historia" />
          <div className="rejilla tres">
            {FORMAS.map((f, i) => (
              <Aparece key={f.nombre} retraso={i * 80}>
                <article className="tarjeta" style={{ height: '100%' }}>
                  <span className={`forma-visual ${i === 1 ? 'estrella' : i === 2 ? 'puntos' : ''}`} aria-hidden="true" style={{ marginBottom: '1rem' }}>
                    {i === 1 ? <svg viewBox="0 0 24 24"><path d={DESTELLO} /></svg> : i === 0 ? <i /> : null}
                  </span>
                  <h3>{f.nombre}</h3>
                  <p style={{ opacity: 0.78 }}>{f.texto}</p>
                </article>
              </Aparece>
            ))}
          </div>
        </div>
      </Seccion>

      <Seccion tono="oscuro">
        <div className="contenedor">
          <TituloSeccion ceja="Paleta de colores" titulo="Cuatro tonos con intención" />
          <div className="paleta-muestra">
            {COLORES.map((c, i) => (
              <Aparece key={c.hex} retraso={i * 70}>
                <article className="paleta-color" style={{ height: '100%', background: 'rgba(226,222,234,.08)', borderColor: 'rgba(226,222,234,.2)' }}>
                  <i style={{ background: c.hex }} aria-hidden="true" />
                  <b>{c.hex}</b>
                  <p style={{ opacity: 0.7, fontFamily: 'var(--fuente-titulo)', marginBottom: '0.4rem' }}>{c.nombre}</p>
                  <p>{c.texto}</p>
                </article>
              </Aparece>
            ))}
          </div>
        </div>
      </Seccion>

      <Seccion tono="claro" className="nosotros-pendiente">
        <div className="contenedor rejilla dos">
          <div>
            <TituloSeccion ceja="Nuestra historia" titulo="Nuestra historia" />
            <p className="nosotros-pendiente-texto">Esta sección queda pendiente hasta definir la historia oficial de Hilo Circular.</p>
          </div>
          <div>
            <TituloSeccion ceja="El equipo" titulo="Las personas detrás de Hilo Circular" />
            <p className="nosotros-pendiente-texto">Los integrantes y sus roles se añadirán cuando el equipo comparta la información confirmada.</p>
          </div>
        </div>
      </Seccion>

      <Seccion tono="rosa">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Nuestro compromiso</h2>
              <ul className="detalle-lista" style={{ marginTop: '1.2rem' }}>
                <li><span>Cada prenda intercambiada</span><b>evita ropa nueva en circulación</b></li>
                <li><span>Empaques reutilizados</span><b>62 % de los envíos</b></li>
                <li><span>Arreglos antes de descartar</span><b>programa de costura aliada</b></li>
                <li><span>Datos personales</span><b>tratados con reserva</b></li>
              </ul>
              <div className="hero-acciones" style={{ marginTop: '1.8rem' }}>
                <Boton to="/catalogo" tamano="lg">Explorar el catálogo</Boton>
                <Boton to="/como-funciona" variante="fantasma" tamano="lg">Leer las reglas</Boton>
              </div>
            </div>
            <div style={{ display: 'grid', placeItems: 'center' }}>
              <Mascot pose="sentado" />
            </div>
          </div>
        </div>
      </Seccion>
    </>
  )
}
