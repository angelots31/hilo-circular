import Mascot from '../components/Mascot.jsx'
import { Aparece, Avatar, Boton, Cifra, Etiqueta, Seccion, TituloSeccion } from '../components/ui.jsx'
import { EQUIPO, ESLOGAN, FORMAS, ODS, PUBLICO, QUIENES_SOMOS, REFERENTES } from '../lib/seed.js'

const DESTELLO = 'M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z'

const COLORES = [
  { hex: '#6872aa', nombre: 'Lavanda profunda', texto: 'Creatividad, innovación y expresión personal. Es un tono fresco y contemporáneo que presenta la moda circular desde una perspectiva joven y actual.' },
  { hex: '#5d4655', nombre: 'Ciruela', texto: 'Aporta profundidad y contraste a la identidad. Representa la idea de dar valor y permanencia a las prendas, lejos de la lógica de usar y desechar.' },
  { hex: '#e2deea', nombre: 'Niebla', texto: 'Equilibrio y ligereza visual. Refuerza una identidad sencilla y accesible, relacionada con la idea de encontrar nuevas posibilidades en lo que ya tenemos.' },
  { hex: '#e5c4c6', nombre: 'Rosa empolvado', texto: 'Cercanía, cuidado y expresión personal. Se relaciona con la conexión que desarrollamos con nuestras prendas al repararlas, personalizarlas y darles una nueva vida.' },
]

const HALLAZGOS = [
  { valor: '80 %', texto: 'del clóset de los jóvenes universitarios permanece inactivo.' },
  { valor: '44 %', texto: 'destina menos de $50.000 COP al mes a ropa, calzado o accesorios.' },
  { valor: '40 %', texto: 'nunca compra de segunda mano ni intercambia prendas.' },
  { valor: '4,5 h', texto: 'al día en TikTok, más 2 o 3 en Instagram: la ropa funciona ahí como moneda de estatus.' },
]

export default function Nosotros() {
  return (
    <>
      <Seccion tono="claro">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <p className="ceja">Quiénes somos</p>
              <h1 style={{ fontSize: 'clamp(2.3rem, 5.6vw, 4.2rem)' }}>Hilo Circular</h1>
              <p className="hero-eslogan" style={{ marginTop: '1.2rem' }}>
                <i aria-hidden="true" />
                {ESLOGAN}
              </p>
              <p style={{ marginTop: '1.2rem', fontSize: '1.04rem', maxWidth: '40rem', opacity: 0.84 }}>
                {QUIENES_SOMOS}
              </p>
              <div className="chips" style={{ marginTop: '1.6rem' }}>
                <Etiqueta tono="lavanda">{ODS.numero} · Consumo responsable</Etiqueta>
                <Etiqueta tono="neutro">Medellín</Etiqueta>
                <Etiqueta tono="rosa">17 a 25 años</Etiqueta>
              </div>
            </div>
            <div className="mascota-panel" style={{ display: 'grid', placeItems: 'center' }}>
              <Mascot pose="saluda" />
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion tono="niebla">
        <div className="contenedor">
          <TituloSeccion
            ceja="El problema que investigamos"
            titulo="No es falta de conciencia: es falta de alternativas"
            texto={PUBLICO + ' Compran moda rápida porque comprar barato y a la moda les resuelve necesidades emocionales inmediatas: estrés, presión social y falta de tiempo.'}
          />
          <div className="rejilla dos" style={{ alignItems: 'start' }}>
            <div className="hallazgos">
              {HALLAZGOS.map((h, i) => (
                <Aparece key={h.valor} retraso={i * 70}>
                  <article className="hallazgo">
                    <b><Cifra valor={h.valor} /></b>
                    <p>{h.texto}</p>
                  </article>
                </Aparece>
              ))}
            </div>
            <div>
              <p style={{ fontSize: '1.02rem', opacity: 0.85 }}>
                Detrás de cada prenda barata hay un alto costo ambiental —agua, químicos, microplásticos— y una presión
                creciente sobre sistemas locales como el Relleno La Pradera. Lo paradójico es que este público ya
                practica hábitos sostenibles en casa (ahorrar, reutilizar, reparar), pero no los traslada a la ropa.
              </p>
              <p style={{ marginTop: '1rem', fontSize: '1.02rem', opacity: 0.85 }}>
                La ropa guardada sin usar se explica por daños pequeños sin arreglar, compras para una ocasión puntual o
                piezas que pasaron de moda. Y cuando no se intercambia, las barreras son la distancia, la falta de tiempo
                y la desconfianza en el estado de las prendas usadas. El reto no es enseñar a ser sostenible desde cero,
                sino conectar una lógica que ya existe con un terreno donde hoy no se aplica.
              </p>
              <div className="tarjeta-ods">
                <b>{ODS.numero} · {ODS.titulo}</b>
                <p>{ODS.texto}</p>
              </div>
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion tono="claro">
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
              <p className="muestrario-nota" style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.9rem' }}>
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

      <Seccion tono="niebla">
        <div className="contenedor">
          <TituloSeccion
            ceja="El equipo"
            titulo="Las personas detrás de Hilo Circular"
            texto="Un equipo de investigación y diseño que combina estrategia, experiencia de usuario, contexto y comunicación visual."
          />
          <div className="equipo-rejilla">
            {EQUIPO.map((p, i) => (
              <Aparece key={p.nombre} retraso={i * 60}>
                <article className="equipo-tarjeta">
                  <Avatar nombre={p.nombre} tamano={56} />
                  <div>
                    <b>{p.nombre}</b>
                    <small>{p.rol}</small>
                  </div>
                </article>
              </Aparece>
            ))}
          </div>
        </div>
      </Seccion>

      <Seccion tono="claro">
        <div className="contenedor">
          <TituloSeccion
            ceja="Referentes"
            titulo="De quién aprendimos"
            texto="Hilo Circular no inventa la reparación ni el trueque: ajusta esas ideas al perfil real de su público y las conecta en un solo ecosistema."
          />
          <div className="rejilla dos">
            {REFERENTES.map((r, i) => (
              <Aparece key={r.nombre} retraso={i * 60}>
                <article className="tarjeta" style={{ height: '100%' }}>
                  <Etiqueta tono={i % 2 ? 'rosa' : 'lavanda'}>{r.tipo}</Etiqueta>
                  <h3 style={{ marginTop: '0.8rem' }}>{r.nombre}</h3>
                  <p style={{ opacity: 0.78 }}>{r.texto}</p>
                </article>
              </Aparece>
            ))}
          </div>
        </div>
      </Seccion>

      <Seccion tono="rosa">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>Nuestro compromiso</h2>
              <p style={{ marginTop: '1rem', maxWidth: '34rem' }}>
                Ser tan rápidos, gratificantes y sociales como comprar algo nuevo, pero dejando un impacto que se puede
                medir, mostrar y sentir como propio.
              </p>
              <ul className="detalle-lista" style={{ marginTop: '1.2rem' }}>
                <li><span>Cada taller</span><b>produce evidencia verificable, no etiquetas</b></li>
                <li><span>Cada prenda</span><b>recibe una etiqueta con QR de impacto</b></li>
                <li><span>Cada aliado</span><b>es real, visible y parte del proceso</b></li>
                <li><span>Cada decisión</span><b>se apoya en la encuesta de campo 2026</b></li>
              </ul>
              <div className="hero-acciones" style={{ marginTop: '1.8rem' }}>
                <Boton to="/catalogo" tamano="lg">Explorar el catálogo</Boton>
                <Boton to="/como-funciona" variante="fantasma" tamano="lg">Leer cómo funciona</Boton>
              </div>
            </div>
            <div className="mascota-panel" style={{ display: 'grid', placeItems: 'center' }}>
              <Mascot pose="sentado" />
            </div>
          </div>
        </div>
      </Seccion>
    </>
  )
}
