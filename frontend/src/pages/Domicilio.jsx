import { useEffect, useMemo, useState } from 'react'
import Mascot from '../components/Mascot.jsx'
import { Aparece, Boton, Campo, Etiqueta, Seccion, Selector, TituloSeccion, Modal } from '../components/ui.jsx'
import { href, navigate, useRoute } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'
import { CIUDADES } from '../lib/seed.js'

const PASOS_ENVIO = [
  { titulo: 'Acuerdan el intercambio', texto: 'Ambas partes aceptan la propuesta y se habilita la coordinación del envío.' },
  { titulo: 'Recolectamos la prenda', texto: 'Eliges el día en la comodidad de tu casa u oficina. Recolectamos con empaque reutilizable.' },
  { titulo: 'Viaja con guía', texto: 'Te compartimos la guía y puedes seguir el recorrido desde tu panel de usuario.' },
  { titulo: 'Entrega y reseña', texto: 'Al recibir, confirmas la entrega y las dos personas se califican.' },
]

const ESTADOS_SEGUIMIENTO = ['Preparando', 'En camino', 'Entregado']

const TARIFAS = { Medellín: 10900 }
const TARIFAS_EXTRA = { Medellín: 0 }

// Referencias de zonas para coordinar un encuentro; no representan comercios aliados confirmados.
const PUNTOS = [
  { nombre: 'Zona El Poblado', direccion: 'Lugar público acordado por el chat', ciudad: 'Medellín', horario: 'Horario a coordinar' },
  { nombre: 'Zona Laureles-Estadio', direccion: 'Lugar público acordado por el chat', ciudad: 'Medellín', horario: 'Horario a coordinar' },
  { nombre: 'Zona Centro', direccion: 'Lugar público acordado por el chat', ciudad: 'Medellín', horario: 'Horario a coordinar' },
]

export default function Domicilio() {
  const { pedidos, prendas, usuario, buscarPrenda, buscarUsuario, fecha, precio, crearPedido, moverPedido, avisar, usuarios, intercambios } = useStore()
  const origen = 'Medellín'
  const destino = 'Medellín'
  const [metodo, setMetodo] = useState('Domicilio')
  const [prendasEnvio, setPrendasEnvio] = useState(1)
  const [abierto, setAbierto] = useState(false)
  const [nuevoEnvio, setNuevoEnvio] = useState({ intercambioId: '', metodo: 'Domicilio', transportadora: 'Servientrega' })

  const misEnvios = useMemo(() => {
    if (!usuario) return pedidos.slice(0, 3)
    const propios = pedidos.filter((p) => p.usuarioId === usuario.id || p.receptorId === usuario.id)
    return propios.length ? propios : pedidos.slice(0, 3)
  }, [pedidos, usuario])

  const { query } = useRoute()
  const intercambiosEnvio = useMemo(() => {
    if (!usuario) return []
    return intercambios.filter(
      (x) =>
        x.estado === 'Aceptado' &&
        (x.solicitanteId === usuario.id || x.receptorId === usuario.id) &&
        !pedidos.some((p) => p.intercambioId === x.id && p.usuarioId === usuario.id),
    )
  }, [intercambios, pedidos, usuario])
  const abrirEnvio = () => (usuario ? setAbierto(true) : navigate('/entrar?volver=/domicilio'))

  useEffect(() => {
    const previo = query.get('intercambio')
    if (previo && usuario) {
      setNuevoEnvio((n) => ({ ...n, intercambioId: previo }))
      setAbierto(true)
    }
  }, [])

  const costo = useMemo(() => {
    if (metodo === 'Punto de encuentro') return 0
    const base = TARIFAS[destino] ?? 12000
    const descuento = Math.min(prendasEnvio - 1, 3) * 1500
    const largaDistancia = origen === destino ? 0 : 900
    return Math.max(base + largaDistancia - descuento, 0)
  }, [origen, destino, metodo, prendasEnvio])

  const programar = () => {
    const x = intercambiosEnvio.find((i) => i.id === nuevoEnvio.intercambioId)
    if (!x) return avisar('Elige el intercambio acordado que quieres enviar.', 'aviso')
    const yoSolicito = x.solicitanteId === usuario.id
    const prenda = buscarPrenda(yoSolicito ? x.ofreceId : x.prendaId)
    crearPedido({
      ...nuevoEnvio,
      prendaId: prenda?.id,
      receptorId: yoSolicito ? x.receptorId : x.solicitanteId,
      ciudad: prenda?.ciudad ?? destino,
      costo: nuevoEnvio.metodo === 'Domicilio' ? costo : 0,
      usuarioId: usuario?.id,
    })
    setAbierto(false)
  }

  return (
    <>
      <Seccion tono="claro">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <p className="ceja">Domicilio y entregas</p>
              <h1 style={{ fontSize: 'clamp(2.3rem, 5.6vw, 4.2rem)' }}>
                La prenda va hasta tu puerta, con guía y seguimiento
              </h1>
              <p style={{ marginTop: '1.2rem', fontSize: '1.06rem', maxWidth: '36rem', opacity: 0.82 }}>
                Coordinamos la recolección en casa u oficina, empacamos con material reutilizado y te compartimos la guía
                para seguir el recorrido. Si prefieres, también puedes acordar un punto de encuentro sin costo.
              </p>
              <div className="hero-acciones" style={{ marginTop: '1.8rem' }}>
                <Boton tamano="lg" onClick={abrirEnvio}>Programar un envío</Boton>
                <Boton variante="fantasma" tamano="lg" onClick={() => document.getElementById('cotizador')?.scrollIntoView({ behavior: 'smooth' })}>
                  Calcular el costo
                </Boton>
              </div>
            </div>
            <div className="mascota-panel" style={{ display: 'grid', placeItems: 'center' }}>
              <Mascot pose="camina" />
            </div>
          </div>

          <div className="envio-pasos" style={{ marginTop: '4rem' }}>
            {PASOS_ENVIO.map((p, i) => (
              <Aparece key={p.titulo} retraso={i * 80}>
                <article className="envio-paso">
                  <span className="num">{i + 1}</span>
                  <b>{p.titulo}</b>
                  <p style={{ fontSize: '0.92rem', opacity: 0.78 }}>{p.texto}</p>
                </article>
              </Aparece>
            ))}
          </div>
        </div>
      </Seccion>

      <Seccion tono="niebla" id="cotizador">
        <div className="contenedor">
          <TituloSeccion
            ceja="Cotizador"
            titulo="¿Cuánto cuesta enviar tu prenda?"
            texto="El servicio funciona únicamente dentro de Medellín. El costo depende del número de prendas y del método de entrega."
          />
          <div className="rejilla dos" style={{ alignItems: 'start' }}>
            <div className="tarjeta-form">
              <div className="form-columnas">
                <div className="campo"><span className="campo-etiqueta">Ciudad de origen</span><div className="campo-ciudad-fija">Medellín</div></div>
                <div className="campo"><span className="campo-etiqueta">Ciudad de destino</span><div className="campo-ciudad-fija">Medellín</div></div>
              </div>

              <Campo etiqueta="Método de entrega" id="metodo">
                <Selector id="metodo" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                  <option value="Domicilio">Domicilio con recolección</option>
                  <option value="Punto de encuentro">Punto de encuentro acordado (sin costo)</option>
                </Selector>
              </Campo>

              <Campo etiqueta={`Prendas en el envío: ${prendasEnvio}`} ayuda="A partir de la segunda prenda aplicamos descuento." id="cantidad">
                <input
                  id="cantidad"
                  className="control-rango"
                  type="range"
                  min="1"
                  max="5"
                  value={prendasEnvio}
                  onChange={(e) => setPrendasEnvio(Number(e.target.value))}
                />
              </Campo>

              <div className="cotizador-resultado">
                <div>
                  <p style={{ fontSize: '0.82rem', opacity: 0.8 }}>{metodo === 'Domicilio' ? `${origen} → ${destino}` : 'Punto de encuentro aliado'}</p>
                  <b>{precio(costo)}</b>
                </div>
                <Etiqueta tono="claro">{metodo === 'Domicilio' ? '2 a 4 días hábiles' : 'Acuerdan el lugar'}</Etiqueta>
              </div>

              <Boton onClick={abrirEnvio}>Programar con este costo</Boton>
            </div>

            <div className="tarjeta-form">
              <h2 style={{ fontSize: '1.5rem' }}>Cobertura en Medellín</h2>
              <div className="tabla-envoltorio">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Ciudad</th>
                      <th>Domicilio</th>
                      <th>Punto de encuentro</th>
                      <th>Tiempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CIUDADES.map((c) => (
                      <tr key={c}>
                        <td><b>{c}</b></td>
                        <td>{precio(TARIFAS[c])}</td>
                        <td>{precio(TARIFAS_EXTRA[c])}</td>
                        <td>{TARIFAS[c] >= 14000 ? '3 a 5 días' : '2 a 4 días'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                Los tiempos se cuentan desde que ambas personas confirman el intercambio. La recolección depende de la zona y de la disponibilidad del día.
              </p>
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion tono="claro">
        <div className="contenedor">
          <TituloSeccion
            ceja="Seguimiento"
            titulo={usuario ? 'Tus envíos en curso' : 'Así se ve el seguimiento'}
            texto="Cada envío tiene una guía y tres estados: preparando, en camino y entregado."
            accion={usuario ? <Boton variante="fantasma" onClick={abrirEnvio}>Programar otro envío</Boton> : <Boton to="/entrar?volver=/domicilio">Iniciar sesión</Boton>}
          />

          <div className="rejilla dos">
            {misEnvios.map((envio, i) => {
              const prenda = buscarPrenda(envio.prendaId)
              const receptor = buscarUsuario(envio.receptorId)
              const actual = ESTADOS_SEGUIMIENTO.indexOf(envio.estado)
              return (
                <Aparece key={envio.id} retraso={i * 70}>
                  <article className="panel-tarjeta">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <b style={{ fontFamily: 'var(--fuente-titulo)', fontSize: '1.1rem' }}>{prenda?.titulo ?? 'Prenda'}</b>
                        <p style={{ fontSize: '0.85rem', opacity: 0.72 }}>
                          Guía {envio.guia} · {envio.transportadora} · para {receptor?.nombre}
                        </p>
                      </div>
                      <Etiqueta tono={envio.estado === 'Entregado' ? 'verde' : envio.estado === 'Incidencia' ? 'rojo' : 'ambar'}>
                        {envio.estado}
                      </Etiqueta>
                    </div>

                    <div className="seguimiento">
                      {[...ESTADOS_SEGUIMIENTO, 'Reseña'].map((paso, j) => (
                        <div key={paso} className={`seguimiento-paso ${j <= actual ? 'hecho' : ''}`}>
                          <b>{paso}</b>
                          <span style={{ opacity: 0.7, fontSize: '0.78rem' }}>
                            {j === 0 && fecha(envio.fecha)}
                            {j === 2 && 'Confirmado por quien recibe'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.2rem' }}>
                      <Etiqueta tono="neutro">{envio.metodo}</Etiqueta>
                      <Etiqueta tono="neutro">{precio(envio.costo)}</Etiqueta>
                      {envio.estado !== 'Entregado' && (
                        <Boton
                          tamano="sm"
                          variante="fantasma"
                          onClick={() =>
                            moverPedido(
                              envio.id,
                              ESTADOS_SEGUIMIENTO[Math.min(actual + 1, ESTADOS_SEGUIMIENTO.length - 1)],
                            )
                          }
                        >
                          Avanzar estado
                        </Boton>
                      )}
                      <Boton tamano="sm" variante="texto" onClick={() => avisar('Abrimos el chat del envío con la transportadora.', 'info')}>
                        Contactar transportadora
                      </Boton>
                    </div>
                  </article>
                </Aparece>
              )
            })}
          </div>
        </div>
      </Seccion>

      <Seccion tono="lavanda">
        <div className="contenedor">
          <TituloSeccion ceja="Puntos de encuentro" titulo="Coordinemos un encuentro en Medellín" texto="Estas son zonas de referencia; el lugar público exacto se acuerda entre ambas personas antes del intercambio." />
          <div className="rejilla tres">
            {PUNTOS.map((p) => (
              <article className="tarjeta" key={p.nombre}>
                <h3>{p.nombre}</h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.85 }}>{p.direccion}</p>
                <p style={{ fontSize: '0.85rem', opacity: 0.75 }}>{p.ciudad} · {p.horario}</p>
                <Etiqueta tono="claro" style={{ marginTop: '0.9rem' }}>Zona de referencia</Etiqueta>
              </article>
            ))}
          </div>
          <div className="rejilla dos" style={{ marginTop: '3rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.6vw, 2.6rem)' }}>Empaques que también circulan</h2>
              <p style={{ marginTop: '1rem', maxWidth: '34rem', opacity: 0.92 }}>
                Reutilizamos bolsas, cajas y papel de la comunidad. Si tienes empaques guardados, entrégalos al
                recolector y entran de nuevo al ciclo. Cada envío reutilizado nos ahorra plástico nuevo.
              </p>
              <div className="chips" style={{ marginTop: '1.4rem' }}>
                <Etiqueta tono="claro">62 % de empaques reutilizados</Etiqueta>
                <Etiqueta tono="claro">Cero plástico de un solo uso</Etiqueta>
              </div>
            </div>
            <div className="empaques-mascota mascota-panel" style={{ display: 'grid', placeItems: 'center' }}>
              <Mascot pose="colgado" />
            </div>
          </div>
        </div>
      </Seccion>

      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo="Programar un envío"
        descripcion="Elige la prenda y la persona que la recibirá. Después coordinamos la recolección contigo."
        pie={
          <>
            <Boton variante="fantasma" onClick={() => setAbierto(false)}>Cancelar</Boton>
            <Boton onClick={programar}>Programar envío</Boton>
          </>
        }
      >
        <Campo etiqueta="Intercambio acordado" id="intercambio-envio" ayuda="Solo se envían prendas de intercambios que ambas partes ya aceptaron.">
          {intercambiosEnvio.length === 0 ? (
            <p>Todavía no tienes intercambios aceptados pendientes de envío. <a href={href('/intercambios')}>Revisa tus solicitudes</a>.</p>
          ) : (
            <Selector id="intercambio-envio" value={nuevoEnvio.intercambioId} onChange={(e) => setNuevoEnvio({ ...nuevoEnvio, intercambioId: e.target.value })}>
              <option value="">Elige el intercambio</option>
              {intercambiosEnvio.map((x) => {
                const yoSolicito = x.solicitanteId === usuario.id
                return (
                  <option key={x.id} value={x.id}>
                    {buscarPrenda(yoSolicito ? x.ofreceId : x.prendaId)?.titulo} → {buscarUsuario(yoSolicito ? x.receptorId : x.solicitanteId)?.nombre}
                  </option>
                )
              })}
            </Selector>
          )}
        </Campo>

        <div className="form-columnas">
          
          <Campo etiqueta="Método" id="metodo-envio">
            <Selector id="metodo-envio" value={nuevoEnvio.metodo} onChange={(e) => setNuevoEnvio({ ...nuevoEnvio, metodo: e.target.value })}>
              <option value="Domicilio">Domicilio con recolección</option>
              <option value="Punto de encuentro">Punto de encuentro aliado</option>
            </Selector>
          </Campo>
        </div>

        <Campo etiqueta="Transportadora" id="transportadora">
          <Selector id="transportadora" value={nuevoEnvio.transportadora} onChange={(e) => setNuevoEnvio({ ...nuevoEnvio, transportadora: e.target.value })}>
            <option>Servientrega</option>
            <option>Envía</option>
            <option>Coordinadora</option>
            <option>Punto aliado</option>
          </Selector>
        </Campo>

        <div className="cotizador-resultado">
          <div>
            <p style={{ fontSize: '0.82rem', opacity: 0.8 }}>Costo estimado del envío</p>
            <b>{precio(nuevoEnvio.metodo === 'Domicilio' ? costo : 0)}</b>
          </div>
          <Etiqueta tono="claro">Incluye seguimiento</Etiqueta>
        </div>
      </Modal>
    </>
  )
}
