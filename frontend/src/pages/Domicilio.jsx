import { useEffect, useMemo, useState } from 'react'
import DetallePrenda from '../components/DetallePrenda.jsx'
import Mascot from '../components/Mascot.jsx'
import SeguimientoEnvio from '../components/SeguimientoEnvio.jsx'
import { Aparece, Boton, Campo, Etiqueta, EstadoVacio, Seccion, Selector, TituloSeccion, Modal } from '../components/ui.jsx'
import { href, navigate, useRoute } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'
import { CIUDADES, TALLERES } from '../lib/seed.js'

const PASOS_ENVIO = [
  { titulo: 'Acuerdan el intercambio', texto: 'Ambas partes aceptan la propuesta y se habilita la coordinación del envío.' },
  { titulo: 'Recolectamos la prenda', texto: 'Eliges el día en la comodidad de tu casa u oficina. Recolectamos con empaque reutilizable.' },
  { titulo: 'Viaja con guía', texto: 'Te compartimos la guía y puedes seguir el recorrido desde tu panel de usuario.' },
  { titulo: 'Entrega y reseña', texto: 'Al recibir, confirmas la entrega y las dos personas se califican.' },
]

const TARIFAS = { Medellín: 10900 }
const TARIFAS_EXTRA = { Medellín: 0 }

// Referencias de zonas para coordinar un encuentro cerca de los campus y barrios del proyecto.
const PUNTOS = [
  { nombre: 'Robledo · Campus universitario', direccion: 'Parque o plaza pública acordada en la comunidad', ciudad: 'Medellín', horario: 'Taller relámpago · horario por confirmar' },
  { nombre: 'Castilla · Parque barrial', direccion: 'Punto de encuentro público acordado por WhatsApp', ciudad: 'Medellín', horario: 'Taller relámpago · horario por confirmar' },
  { nombre: 'Centro · Plaza pública', direccion: 'Punto de encuentro público acordado por WhatsApp', ciudad: 'Medellín', horario: 'Taller relámpago · horario por confirmar' },
]

export default function Domicilio() {
  const { pedidos, usuario, buscarPrenda, buscarUsuario, precio, crearPedido, moverPedido, avisar, intercambios } = useStore()
  const origen = 'Medellín'
  const destino = 'Medellín'
  const [metodo, setMetodo] = useState('Domicilio')
  const [prendasEnvio, setPrendasEnvio] = useState(1)
  const [abierto, setAbierto] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [nuevoEnvio, setNuevoEnvio] = useState({ intercambioId: '', metodo: 'Domicilio', transportadora: 'Servientrega' })

  // El seguimiento es privado: nunca mostramos envíos de otras personas.
  const misEnvios = useMemo(() => {
    if (!usuario) return []
    return pedidos.filter((p) => p.usuarioId === usuario.id || p.receptorId === usuario.id)
  }, [pedidos, usuario])

  const { query } = useRoute()
  const intercambiosEnvio = useMemo(() => {
    if (!usuario) return []
    return intercambios.filter(
      (x) =>
        x.estado === 'Aceptado' &&
        (x.solicitanteId === usuario.id || x.receptorId === usuario.id) &&
        // Cada parte envía su propia prenda; el envío de la otra persona no
        // debe ocultar el intercambio de mi lista.
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

  const costoDe = (metodoEntrega) => {
    if (metodoEntrega === 'Punto de encuentro') return 0
    const base = TARIFAS[destino] ?? 12000
    const descuento = Math.min(prendasEnvio - 1, 3) * 1500
    const largaDistancia = origen === destino ? 0 : 900
    return Math.max(base + largaDistancia - descuento, 0)
  }
  const costo = useMemo(
    () => costoDe(metodo),
    [origen, destino, metodo, prendasEnvio],
  )

  const programar = async () => {
    const x = intercambiosEnvio.find((i) => i.id === nuevoEnvio.intercambioId)
    if (!x) return avisar('Elige el intercambio acordado que quieres enviar.', 'aviso')
    const yoSolicito = x.solicitanteId === usuario.id
    const prenda = buscarPrenda(yoSolicito ? x.ofreceId : x.prendaId)
    if (!prenda) return avisar('No encontramos la prenda de este intercambio. Actualiza la página e inténtalo de nuevo.', 'aviso')
    if (pedidos.some((p) => p.intercambioId === x.id && p.usuarioId === usuario.id)) {
      return avisar('Ya programaste un envío para este intercambio.', 'aviso')
    }
    const ok = await crearPedido({
      ...nuevoEnvio,
      prendaId: prenda?.id,
      intercambioId: x.id,
      receptorId: yoSolicito ? x.receptorId : x.solicitanteId,
      ciudad: prenda?.ciudad ?? destino,
      costo: costoDe(nuevoEnvio.metodo),
      usuarioId: usuario?.id,
    })
    if (ok) setAbierto(false)
  }

  return (
    <>
      <Seccion tono="claro">
        <div className="contenedor">
          <div className="rejilla dos" style={{ alignItems: 'center' }}>
            <div>
              <p className="ceja">Talleres y entregas</p>
              <h1 style={{ fontSize: 'clamp(2.3rem, 5.6vw, 4.2rem)' }}>
                Repara, transforma o intercambia en menos de una hora
              </h1>
              <p style={{ marginTop: '1.2rem', fontSize: '1.06rem', maxWidth: '36rem', opacity: 0.82 }}>
                Los talleres relámpago ocurren cerca de tu universidad o de tu casa, en formatos de 15 a 60 minutos y
                con un facilitador modista. Si no puedes asistir, coordinamos la entrega de la prenda o un punto de
                encuentro sin costo.
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

          <div className="rejilla tres" style={{ marginTop: '3.4rem' }}>
            {TALLERES.map((t, i) => (
              <Aparece key={t.nombre} retraso={i * 80}>
                <article className="tarjeta taller-tarjeta" style={{ height: '100%' }}>
                  <span className="taller-indice" aria-hidden="true">{`0${i + 1}`}</span>
                  <h3 style={{ marginTop: '0.7rem' }}>{t.nombre}</h3>
                  <p style={{ opacity: 0.78 }}>{t.texto}</p>
                </article>
              </Aparece>
            ))}
          </div>
          <div className="chips" style={{ marginTop: '1.8rem' }}>
            <Etiqueta tono="lavanda">15 a 60 minutos</Etiqueta>
            <Etiqueta tono="neutro">Facilitador modista</Etiqueta>
            <Etiqueta tono="rosa">Kits y materiales del aliado</Etiqueta>
            <Etiqueta tono="verde">Etiqueta con QR de impacto</Etiqueta>
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

              <Campo etiqueta="Prendas en el envío" ayuda="A partir de la segunda prenda aplicamos descuento." id="cantidad">
                <div className="rango-envoltorio">
                  <p className="rango-valor">
                    <b>{prendasEnvio}</b>
                    <span>{prendasEnvio === 1 ? 'prenda' : 'prendas'}</span>
                  </p>
                  <input
                    id="cantidad"
                    className="control-rango"
                    type="range"
                    min="1"
                    max="5"
                    value={prendasEnvio}
                    onChange={(e) => setPrendasEnvio(Number(e.target.value))}
                    aria-valuetext={`${prendasEnvio} ${prendasEnvio === 1 ? 'prenda' : 'prendas'}`}
                    style={{ '--avance': `${((prendasEnvio - 1) / 4) * 100}%` }}
                  />
                  <div className="rango-marcas" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={n <= prendasEnvio ? 'activo' : ''}>{n}</span>
                    ))}
                  </div>
                </div>
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
              {CIUDADES.map((c) => (
                <dl className="cobertura-tarifas" key={c}>
                  <div>
                    <dt>Ciudad</dt>
                    <dd><b>{c}</b></dd>
                  </div>
                  <div>
                    <dt>Domicilio</dt>
                    <dd>{precio(TARIFAS[c])}</dd>
                  </div>
                  <div>
                    <dt>Punto de encuentro</dt>
                    <dd>{precio(TARIFAS_EXTRA[c])}</dd>
                  </div>
                  <div>
                    <dt>Tiempo estimado</dt>
                    <dd>{TARIFAS[c] >= 14000 ? '3 a 5 días' : '2 a 4 días'}</dd>
                  </div>
                </dl>
              ))}
              <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.9rem' }}>
                Los tiempos se cuentan desde que ambas personas confirman el intercambio. La recolección depende de la zona y de la disponibilidad del día.
              </p>
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion tono="claro" id="seguimiento">
        <div className="contenedor">
          <TituloSeccion
            ceja="Seguimiento privado"
            titulo={usuario ? 'Tus envíos en curso' : 'Tu seguimiento, solo para ti'}
            texto="El estado de cada envío, la guía y el nombre de la persona que recibe solo son visibles para las dos partes del intercambio."
            accion={usuario ? <Boton variante="fantasma" onClick={abrirEnvio}>Programar otro envío</Boton> : null}
          />

          {!usuario ? (
            <div className="seguimiento-privado">
              <div className="seguimiento-candado" aria-hidden="true">
                <svg viewBox="0 0 24 24"><rect x="4.5" y="10" width="15" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
              </div>
              <div>
                <b>Inicia sesión para ver tus envíos</b>
                <p>Por privacidad no mostramos guías ni envíos de otras personas. Tus datos aparecen únicamente en tu cuenta.</p>
              </div>
              <Boton to="/entrar?volver=/domicilio">Iniciar sesión</Boton>
            </div>
          ) : misEnvios.length === 0 ? (
            <EstadoVacio
              compacto
              pose="camina"
              titulo="Todavía no tienes envíos programados"
              texto="Cuando aceptes un intercambio podrás coordinar aquí la recolección o el punto de encuentro."
              accion={<Boton to="/intercambios">Ver mis intercambios</Boton>}
              secundario={<Boton variante="fantasma" onClick={abrirEnvio}>Programar un envío</Boton>}
            />
          ) : (
            <div className="rejilla dos">
              {misEnvios.map((envio, i) => (
                <Aparece key={envio.id} retraso={i * 70}>
                  <SeguimientoEnvio
                    pedido={envio}
                    onVerPrenda={() => setDetalle(buscarPrenda(envio.prendaId))}
                    onAvanzar={(pedido, estado) => moverPedido(pedido.id, estado)}
                  />
                </Aparece>
              ))}
            </div>
          )}
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
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.6vw, 2.6rem)' }}>La entrega también hace parte del ciclo</h2>
              <p style={{ marginTop: '1rem', maxWidth: '34rem', opacity: 0.92 }}>
                Si no puedes llegar al taller, acordamos un punto de encuentro o la recolección en tu casa. Cada prenda
                viaja con su etiqueta QR para que el impacto del intercambio quede documentado y se pueda compartir.
              </p>
              <div className="chips" style={{ marginTop: '1.4rem' }}>
                <Etiqueta tono="claro">Etiquetas con QR</Etiqueta>
                <Etiqueta tono="claro">Kits del aliado</Etiqueta>
                <Etiqueta tono="claro">Cupos por WhatsApp</Etiqueta>
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
            <b>{precio(costoDe(nuevoEnvio.metodo))}</b>
          </div>
          <Etiqueta tono="claro">Incluye seguimiento</Etiqueta>
        </div>
      </Modal>

      <DetallePrenda
        prenda={detalle}
        abierto={Boolean(detalle)}
        onCerrar={() => setDetalle(null)}
      />
    </>
  )
}
