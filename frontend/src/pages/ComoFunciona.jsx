import { useState } from 'react'
import Mascot from '../components/Mascot.jsx'
import { Aparece, Boton, Etiqueta, Seccion, TituloSeccion } from '../components/ui.jsx'
import { CANALES, NIVELES, PASOS, PRINCIPIOS, RUTAS } from '../lib/seed.js'

const PREGUNTAS = [
  {
    p: '¿Necesito dinero para participar?',
    r: 'Reparar e intercambiar son gratuitos. Si quieres materiales del aliado, la ruta social (trueque con espacio y percha) cuesta $5.000 y la ruta creativa (upcycling con kit) $8.000. Las rutas minimalista y observador son $0.',
  },
  {
    p: '¿Cuánto tiempo me toma?',
    r: 'Los talleres duran entre 15 y 60 minutos. En la encuesta, el 54,2 % de las personas dispone de 30 a 60 minutos y el 77,9 % de hasta una hora: por eso el formato es relámpago y sin trámites previos.',
  },
  {
    p: '¿Dónde son los talleres?',
    r: 'Cerca de las universidades y de los barrios, en espacios públicos accesibles como parques, plazas o campus. El 64,4 % asistiría si el taller le queda de paso, así que la cercanía es una condición del proyecto, no un detalle.',
  },
  {
    p: '¿Tengo que saber coser?',
    r: 'No. Cada taller tiene un facilitador modista y materiales aportados por el aliado. Además, los cuadernitos impresos y los videos tutoriales explican paso a paso reparación, transformación y trueque.',
  },
  {
    p: '¿Cómo sé que el impacto es real?',
    r: 'Cada prenda recibe una etiqueta con QR que enlaza al micrositio: allí ves el proceso, el impacto de tu prenda y el panel público de resultados. No publicamos una etiqueta de sostenibilidad sin evidencia detrás.',
  },
  {
    p: '¿Qué pasa si no puedo ir a un taller?',
    r: 'La ruta minimalista incluye un PDF y un reel tutorial para reparar en casa en 10 a 15 minutos. El trueque también puede coordinarse por la comunidad de WhatsApp y cerrarse en un punto de encuentro.',
  },
]

export default function ComoFunciona() {
  const [abierta, setAbierta] = useState(0)

  return (
    <>
      <Seccion tono="claro">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <p className="ceja">Cómo funciona</p>
              <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.4rem)' }}>
                La prenda cambia físicamente y la experiencia continúa digitalmente
              </h1>
              <p style={{ marginTop: '1.2rem', fontSize: '1.08rem', maxWidth: '38rem', opacity: 0.82 }}>
                Hilo Circular combina tres espacios digitales y uno presencial. En TikTok e Instagram te encuentras con
                el reto; el micrositio muestra la evidencia; WhatsApp coordina cupos y trueques; y el taller relámpago
                es el único lugar donde la prenda pasa realmente de un estado a otro.
              </p>
              <div className="hero-acciones" style={{ marginTop: '1.8rem' }}>
                <Boton to="/registro" tamano="lg">Empezar mi primer ciclo</Boton>
                <Boton to="/domicilio" variante="fantasma" tamano="lg">Ver talleres y entregas</Boton>
              </div>
            </div>
            <div className="mascota-panel" style={{ display: 'grid', placeItems: 'center' }}>
              <Mascot pose="camina" />
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion tono="oscuro">
        <div className="contenedor">
          <TituloSeccion
            ceja="El ciclo"
            titulo="Cuatro pasos para convertir una prenda olvidada en comunidad"
            texto="El modelo se mueve en un ciclo de cuatro pasos que transforma a la persona de consumidora pasiva en co-creadora."
          />
          <div className="pasos">
            {PASOS.map((p, i) => (
              <Aparece key={p.titulo}>
                <article className="paso">
                  <span className="paso-num">{`0${i + 1}`}</span>
                  <div>
                    <h3>{p.titulo}</h3>
                    <p>{p.texto}</p>
                  </div>
                </article>
              </Aparece>
            ))}
          </div>
        </div>
      </Seccion>

      <Seccion tono="niebla">
        <div className="contenedor">
          <TituloSeccion
            ceja="Niveles de participación"
            titulo="Cada nivel es un alivio, no un compromiso de una sola vez"
            texto="No todas las personas se comprometen desde el primer contacto. La participación se diseña como una escalera progresiva: cada paso exige un poco más, sin que nadie sienta que debe dar un gran salto."
          />
          <div className="niveles-rejilla">
            {NIVELES.map((n, i) => (
              <Aparece key={n.nombre} retraso={i * 70}>
                <article className="nivel-tarjeta">
                  <span className="nivel-num">{i + 1}</span>
                  <h3>{n.nombre}</h3>
                  <p className="nivel-validacion">“{n.validacion}”</p>
                  <p className="nivel-detalle">{n.detalle}</p>
                </article>
              </Aparece>
            ))}
          </div>
        </div>
      </Seccion>

      <Seccion tono="claro">
        <div className="contenedor">
          <TituloSeccion
            ceja="Los principios"
            titulo="Cuatro reglas que sostienen la experiencia"
            texto="No son condiciones legales: son los principios con los que Hilo Circular se acerca a su público sin imponer un cambio de mentalidad desde el primer día."
          />
          <div className="rejilla dos">
            {PRINCIPIOS.map((pr, i) => (
              <Aparece key={pr.nombre} retraso={i * 70}>
                <article className="tarjeta" style={{ height: '100%' }}>
                  <Etiqueta tono="lavanda">{`Principio ${i + 1}`}</Etiqueta>
                  <h3 style={{ marginTop: '0.8rem' }}>{pr.nombre}</h3>
                  <p style={{ opacity: 0.78 }}>{pr.texto}</p>
                </article>
              </Aparece>
            ))}
          </div>
        </div>
      </Seccion>

      <Seccion tono="niebla">
        <div className="contenedor">
          <TituloSeccion
            ceja="Un ecosistema de cuatro espacios"
            titulo="Cada plataforma cumple una función distinta"
            texto="Para que el proyecto tenga presencia digital y análoga, los canales trabajan de manera coordinada en lugar de repetir el mismo mensaje."
          />
          <div className="rejilla dos">
            {CANALES.map((c, i) => (
              <Aparece key={c.nombre} retraso={i * 70}>
                <article className="canal-tarjeta">
                  <span className="canal-indice" aria-hidden="true">{`0${i + 1}`}</span>
                  <div>
                    <h3>{c.nombre}</h3>
                    <p>{c.texto}</p>
                  </div>
                </article>
              </Aparece>
            ))}
          </div>

          <div style={{ marginTop: '3.4rem' }}>
            <TituloSeccion
              ceja="Rutas de entrada"
              titulo="¿Cuánto cuesta y cuánto tiempo requiere?"
              texto="El proyecto reconoce cuatro perfiles con necesidades distintas. La ruta más cara no es la única forma de participar."
            />
            <div className="tabla-envoltorio">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Perfil</th>
                    <th>Acción</th>
                    <th>Costo</th>
                    <th>Tiempo</th>
                  </tr>
                </thead>
                <tbody>
                  {RUTAS.map((r) => (
                    <tr key={r.perfil}>
                      <td><b>{r.perfil}</b></td>
                      <td>{r.accion}</td>
                      <td>{r.costo}</td>
                      <td>{r.tiempo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion tono="claro">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'start' }}>
            <div>
              <TituloSeccion
                ceja="Preguntas frecuentes"
                titulo="Lo que necesitas saber antes del primer taller"
                texto="Sin letra menuda: costos, tiempos y evidencia del impacto, tal como lo respondieron las personas que participaron en la investigación."
              />
              <div className="tarjeta-info">
                <b>Dato de la encuesta</b>
                <p>El 88,2 % participaría en el reto digital y el 72,9 % se motivaría más si detrás hay un aliado real y visible.</p>
              </div>
            </div>
            <div className="tarjeta-form">
              <div className="acordeon">
                {PREGUNTAS.map((q, i) => (
                  <div key={q.p} className={`acordeon-item ${abierta === i ? 'abierta' : ''}`}>
                    <button onClick={() => setAbierta(abierta === i ? -1 : i)} aria-expanded={abierta === i}>
                      <span>{q.p}</span>
                      <i aria-hidden="true">{abierta === i ? '−' : '+'}</i>
                    </button>
                    {abierta === i && <p>{q.r}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion tono="lavanda">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(2rem, 4.4vw, 3.2rem)' }}>No te pedimos comprar menos</h2>
              <p style={{ marginTop: '1rem', maxWidth: '34rem', opacity: 0.92 }}>
                Te damos un sistema para que esa ropa olvidada sea tu entrada a una comunidad. Empieza con el reto
                digital y en menos de una hora ya estarás reparando, transformando o intercambiando.
              </p>
              <div className="hero-acciones" style={{ marginTop: '1.8rem' }}>
                <Boton variante="claro" tamano="lg" to="/subir">Subir mi primera prenda</Boton>
                <Boton variante="fantasma" tamano="lg" to="/nosotros">Conocer al equipo</Boton>
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
