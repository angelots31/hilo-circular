import { useState } from 'react'
import Mascot from '../components/Mascot.jsx'
import { Aparece, Avatar, Boton, Etiqueta, Seccion, TituloSeccion } from '../components/ui.jsx'
import { PASOS } from '../lib/seed.js'

const REGLAS = [
  { titulo: 'Describe con honestidad', texto: 'Sube fotos del estado real, menciona manchas, desgastes o arreglos. Una descripción sincera acelera el intercambio.' },
  { titulo: 'Un intercambio, dos acuerdos', texto: 'Ninguna prenda se envía hasta que ambas personas aceptan la propuesta dentro de la plataforma.' },
  { titulo: 'Cuida el empaque', texto: 'Reutiliza bolsas, cajas y papel que ya tengas en casa. El empaque circular también cuenta en la experiencia.' },
  { titulo: 'Califica al final', texto: 'Después de recibir, deja tu reseña. La reputación de cada perfil la construye la comunidad.' },
  { titulo: 'Nada de dinero por fuera', texto: 'Los pagos de domicilio se hacen por la plataforma. Así protegemos a las dos partes del intercambio.' },
  { titulo: 'Apoya y denuncia', texto: 'Si algo no coincide con lo publicado, escríbenos desde el detalle del envío. El equipo revisa cada caso.' },
]

const PREGUNTAS = [
  { p: '¿Necesito dinero para intercambiar?', r: 'No. El intercambio es directo entre prendas. Lo único que se paga es el envío a domicilio si decides usarlo, y siempre puedes acordar un punto de encuentro sin costo.' },
  { p: '¿Qué pasa si la prenda no coincide con la descripción?', r: 'Tienes tres días desde la entrega para reportarlo. El equipo revisa las fotos originales y, si hay diferencia, la prenda regresa y se ajusta la reputación de quien publicó.' },
  { p: '¿Cómo viajan las prendas?', r: 'Recolectamos en la dirección que registres, empacamos con material reutilizado y viajamos con transportadoras aliadas. Recibes la guía y el seguimiento en tu panel.' },
  { p: '¿Puedo publicar prendas arregladas o intervenidas?', r: 'Claro, es parte de la idea. Solo descríbelo: si tiene un remiendo, un bordado o un ajuste, cuéntalo en la descripción para que la otra persona sepa que es una prenda única.' },
  { p: '¿Existe un límite de publicaciones?', r: 'Puedes publicar hasta veinte prendas activas al mismo tiempo. Así el catálogo se mantiene fresco y la gente renueva su clóset con frecuencia.' },
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
                El ciclo completo, del clóset de alguien al tuyo
              </h1>
              <p style={{ marginTop: '1.2rem', fontSize: '1.08rem', maxWidth: '38rem', opacity: 0.82 }}>
                Hilo Circular funciona como un trueque cuidado: publicas, propones, coordinas y calificas. Sin comprar
                prendas nuevas y con la posibilidad de que todo llegue hasta tu casa.
              </p>
              <div className="hero-acciones" style={{ marginTop: '1.8rem' }}>
                <Boton to="/registro" tamano="lg">Empezar mi primer intercambio</Boton>
                <Boton to="/catalogo" variante="fantasma" tamano="lg">Ver qué hay disponible</Boton>
              </div>
            </div>
            <div style={{ display: 'grid', placeItems: 'center' }}>
              <Mascot pose="camina" />
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion tono="oscuro">
        <div className="contenedor">
          <TituloSeccion ceja="Paso a paso" titulo="Tres momentos y la prenda vuelve a circular" />
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
            ceja="Reglas del juego"
            titulo="Seis acuerdos que sostienen la comunidad"
            texto="No son condiciones legales: son las normas que hacen que el intercambio se sienta seguro y justo."
          />
          <div className="rejilla tres">
            {REGLAS.map((r, i) => (
              <Aparece key={r.titulo} retraso={i * 70}>
                <article className="tarjeta" style={{ height: '100%' }}>
                  <Etiqueta tono="lavanda">{`Regla ${i + 1}`}</Etiqueta>
                  <h3 style={{ marginTop: '0.8rem' }}>{r.titulo}</h3>
                  <p style={{ opacity: 0.78 }}>{r.texto}</p>
                </article>
              </Aparece>
            ))}
          </div>
        </div>
      </Seccion>

      <Seccion tono="claro">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'start' }}>
            <div className="perfil-comunidad tarjeta-form">
              <TituloSeccion
                ceja="Tu perfil"
                titulo="Una identidad sencilla para cada persona"
                texto="Al registrarte, Hilo Circular genera un avatar circular con las iniciales de tu nombre. Así tu perfil se reconoce fácilmente en solicitudes, mensajes y reseñas."
              />
              <div className="perfil-ejemplos">
                <div><Avatar nombre="Valentina Ríos" tamano={64} /><b>Valentina Ríos</b><small>VR · Medellín</small></div>
                <div><Avatar nombre="Mateo Cárdenas" tamano={64} /><b>Mateo Cárdenas</b><small>MC · Medellín</small></div>
                <div><Avatar nombre="Sara Betancur" tamano={64} /><b>Sara Betancur</b><small>SB · Medellín</small></div>
              </div>
              <p className="perfil-comunidad-nota">No necesitas subir una foto para tener un perfil identificable. Las iniciales usan una paleta de la marca y mantienen la forma circular en todos los tamaños.</p>
            </div>

            <div className="tarjeta-form">
              <h2 style={{ fontSize: '1.8rem' }}>Preguntas frecuentes</h2>
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
              <h2 style={{ fontSize: 'clamp(2rem, 4.4vw, 3.2rem)' }}>¿Listo para el primer trueque?</h2>
              <p style={{ marginTop: '1rem', maxWidth: '34rem', opacity: 0.92 }}>
                Sube una prenda hoy y en menos de una semana tendrás propuestas de personas de tu ciudad.
              </p>
              <div className="hero-acciones" style={{ marginTop: '1.8rem' }}>
                <Boton variante="claro" tamano="lg" to="/subir">Subir mi primera prenda</Boton>
                <Boton variante="fantasma" tamano="lg" to="/resenas">Leer experiencias reales</Boton>
              </div>
            </div>
            <div style={{ display: 'grid', placeItems: 'center' }}>
              <Mascot pose="saluda" />
            </div>
          </div>
        </div>
      </Seccion>
    </>
  )
}
