import { useRef, useState } from 'react'
import Garment, { TIPOS } from '../components/Garment.jsx'
import GrabadoraAudio from '../components/GrabadoraAudio.jsx'
import Mascot from '../components/Mascot.jsx'
import { Aparece, Area, Boton, Campo, Entrada, Etiqueta, Pasos, Seccion, Selector, TituloSeccion } from '../components/ui.jsx'
import { navigate } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'
import { subirAudio, subirImagen } from '../lib/api.js'
import { BARRIOS, CATEGORIAS, CIUDAD, ESTADOS, MATERIALES, TALLAS } from '../lib/seed.js'
import { celebrar } from '../lib/movimiento.js'

const MAX_MATERIALES = 4

const COLORES = [
  { nombre: 'Negro', hex: '#2f2833' },
  { nombre: 'Crudo', hex: '#e6dcca' },
  { nombre: 'Azul índigo', hex: '#4a5f8a' },
  { nombre: 'Terracota', hex: '#c98a6d' },
  { nombre: 'Verde salvia', hex: '#9aa98d' },
  { nombre: 'Rosa empolvado', hex: '#e5c4c6' },
  { nombre: 'Lila', hex: '#c9b9dd' },
  { nombre: 'Camel', hex: '#c8a179' },
]

const PASOS = ['Datos de la prenda', 'Fotos y estado', 'Intercambio y envío', 'Revisión final']

const LIMITE_AUDIO_MB = 15

export default function Subir() {
  const { usuario, publicarPrenda, avisar, precio } = useStore()
  const [paso, setPaso] = useState(0)
  const [fotos, setFotos] = useState([])
  const [audio, setAudio] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [encima, setEncima] = useState(false)
  const entradaArchivos = useRef(null)

  const [datos, setDatos] = useState({
    titulo: '',
    tipo: 'camiseta',
    categoria: 'Camisetas',
    talla: 'M',
    estado: 'Como nuevo',
    color: 'Negro',
    marca: '',
    valor: 45,
    descripcion: '',
    barrio: usuario?.barrio ?? BARRIOS[0],
    metodo: 'Domicilio',
    destacada: false,
    composicion: [],
    sinMateriales: false,
  })

  const paleta = COLORES.find((c) => c.nombre === datos.color)
  const paletaArte = [paleta?.hex ?? '#6872aa', '#6872aa']

  const actualizar = (cambios) => setDatos((d) => ({ ...d, ...cambios }))

  const alternarMaterial = (slug) => {
    setDatos((d) => {
      const activo = d.composicion.includes(slug)
      if (!activo && d.composicion.length >= MAX_MATERIALES) return d
      return {
        ...d,
        sinMateriales: false,
        composicion: activo ? d.composicion.filter((x) => x !== slug) : [...d.composicion, slug],
      }
    })
  }

  const agregarFotos = (lista) => {
    const nuevas = Array.from(lista).slice(0, 6 - fotos.length).map((archivo) => ({
      nombre: archivo.name,
      archivo,
      url: URL.createObjectURL(archivo),
    }))
    if (nuevas.length) setFotos((f) => [...f, ...nuevas])
  }

  const elegirAudio = (archivo) => {
    if (!archivo) return
    if (!archivo.type.startsWith('audio/')) return avisar('El archivo debe ser un audio (MP3, M4A, WAV…).', 'aviso')
    if (archivo.size > LIMITE_AUDIO_MB * 1024 * 1024) return avisar(`El audio supera los ${LIMITE_AUDIO_MB} MB. Graba uno más corto.`, 'aviso')
    if (audio?.url) URL.revokeObjectURL(audio.url)
    setAudio({ nombre: archivo.name, archivo, url: URL.createObjectURL(archivo) })
  }

  const quitarAudio = () => {
    if (audio?.url) URL.revokeObjectURL(audio.url)
    setAudio(null)
  }

  const publicar = async () => {
    if (datos.titulo.trim().length < 6) {
      setPaso(0)
      return avisar('El título debe describir mejor la prenda (mínimo 6 caracteres).', 'aviso')
    }
    if (datos.descripcion.trim().length < 20) {
      setPaso(0)
      return avisar('Cuéntanos más sobre la prenda: estado, uso y detalles.', 'aviso')
    }
    setSubiendo(true)
    try {
      // Las fotos y el audio se suben a Cloudinary y guardamos sus URL en la base de datos.
      const urls = []
      for (const f of fotos) urls.push(await subirImagen(f.archivo))
      // El audio es opcional: solo se sube si la persona eligió uno.
      const urlAudio = audio ? await subirAudio(audio.archivo) : null
      const ok = await publicarPrenda({
        ...datos,
        valor: Number(datos.valor),
        descripcion: datos.descripcion.trim(),
        ciudad: CIUDAD,
        paleta: paletaArte,
        fotos: urls,
        audio: urlAudio,
        composicion: datos.composicion,
        disponible: true,
      })
      if (ok) {
        celebrar()
        navigate('/panel?seccion=prendas')
      }
    } catch (error) {
      avisar(error.message || 'No pudimos subir las fotos.', 'aviso')
    } finally {
      setSubiendo(false)
    }
  }

  const progreso = Math.round(((paso + 1) / PASOS.length) * 100)

  return (
    <Seccion tono="claro">
      <div className="contenedor">
        <TituloSeccion
          nivel={1}
          ceja="Publicar prenda"
          titulo="Cuéntanos qué prenda entra al ciclo"
          texto="Mientras más honesta y detallada sea la publicación, más rápido llega una propuesta de intercambio."
          accion={<Boton variante="fantasma" to="/como-funciona">Ver reglas del intercambio</Boton>}
        />

        <div className="subir-rejilla">
          <div className="tarjeta-form">
            <Pasos pasos={PASOS} actual={paso} />
            <span className="barra-progreso"><i style={{ width: `${progreso}%` }} /></span>

            {paso === 0 && (
              <div className="form-rejilla">
                <Campo etiqueta="Título de la publicación" ayuda="Ej.: Chaqueta biker en cuero sintético." id="titulo">
                  <Entrada id="titulo" value={datos.titulo} onChange={(e) => actualizar({ titulo: e.target.value })} placeholder="¿Cómo describirías la prenda en una línea?" />
                </Campo>

                <div className="form-columnas">
                  <Campo etiqueta="Tipo de prenda" id="tipo">
                    <Selector
                      id="tipo"
                      value={datos.tipo}
                      onChange={(e) => actualizar({ tipo: e.target.value })}
                    >
                      {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Selector>
                  </Campo>
                  <Campo etiqueta="Categoría" id="categoria-subir">
                    <Selector id="categoria-subir" value={datos.categoria} onChange={(e) => actualizar({ categoria: e.target.value })}>
                      {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Selector>
                  </Campo>
                  <Campo etiqueta="Talla" id="talla-subir">
                    <Selector id="talla-subir" value={datos.talla} onChange={(e) => actualizar({ talla: e.target.value })}>
                      {TALLAS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Selector>
                  </Campo>
                  <Campo etiqueta="Marca" id="marca">
                    <Entrada id="marca" value={datos.marca} onChange={(e) => actualizar({ marca: e.target.value })} placeholder="Marca o «artesanal»" />
                  </Campo>
                </div>

                <Campo etiqueta="Color principal" id="color">
                  <div className="colores-elegir" id="color">
                    {COLORES.map((c) => (
                      <button
                        key={c.nombre}
                        type="button"
                        title={c.nombre}
                        aria-label={c.nombre}
                        className={`color-opcion ${datos.color === c.nombre ? 'activo' : ''}`}
                        style={{ background: c.hex }}
                        onClick={() => actualizar({ color: c.nombre })}
                      />
                    ))}
                  </div>
                </Campo>

                <Campo
                  etiqueta="Descripción"
                  ayuda="Menciona el estado real, si tiene arreglos y cómo la has usado."
                  id="descripcion"
                >
                  <Area id="descripcion" value={datos.descripcion} onChange={(e) => actualizar({ descripcion: e.target.value })} placeholder="La compré hace dos años, la usé pocas veces. Tiene un remiendo pequeño en el forro…" />
                </Campo>

                <Campo
                  etiqueta="¿De qué está hecha?"
                  ayuda={`Hasta ${MAX_MATERIALES} materiales. Es opcional: si no estás seguro, mira la etiqueta interior.`}
                  id="composicion"
                >
                  <div className="chips" id="composicion">
                    {MATERIALES.map((m) => {
                      const activo = datos.composicion.includes(m.slug)
                      const lleno = !activo && datos.composicion.length >= MAX_MATERIALES
                      return (
                        <button
                          key={m.slug}
                          type="button"
                          className={`chip ${activo ? 'activo' : ''}`}
                          aria-pressed={activo}
                          disabled={lleno}
                          onClick={() => alternarMaterial(m.slug)}
                        >
                          {m.nombre}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      className={`chip ${datos.sinMateriales ? 'activo' : ''}`}
                      aria-pressed={datos.sinMateriales}
                      onClick={() => actualizar({ sinMateriales: !datos.sinMateriales, composicion: [] })}
                    >
                      No sé
                    </button>
                  </div>
                  {datos.sinMateriales && (
                    <span className="campo-ayuda">Tranquila/o: mira la etiqueta interior y complétalo cuando puedas.</span>
                  )}
                </Campo>
              </div>
            )}

            {paso === 1 && (
              <div className="form-rejilla">
                <Campo etiqueta="Fotos de la prenda" ayuda="Hasta 6 imágenes. La primera será la portada del catálogo y todas serán visibles para la persona con la que intercambies." id="fotos">
                  <div
                    className={`soltar ${encima ? 'encima' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setEncima(true)
                    }}
                    onDragLeave={() => setEncima(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setEncima(false)
                      agregarFotos(e.dataTransfer.files)
                    }}
                    onClick={() => entradaArchivos.current?.click()}
                    role="button"
                    tabIndex={0}
                   
                  >
                    <b>Arrastra tus fotos aquí</b>
                    <small>o haz clic para elegirlas desde tu equipo · JPG o PNG</small>
                    <input
                      ref={entradaArchivos}
                      id="fotos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => agregarFotos(e.target.files)}
                    />
                  </div>
                </Campo>

                {fotos.length > 0 && (
                  <div className="vista-previa">
                    {fotos.map((f, i) => (
                      <figure key={f.url}>
                        <img src={f.url} alt={`Vista previa ${i + 1}`} />
                        <figcaption>{i === 0 ? 'Portada' : `Foto ${i + 1}`}</figcaption>
                        <button
                          type="button"
                          aria-label={`Quitar ${f.nombre}`}
                          onClick={() => setFotos((lista) => lista.filter((x) => x.url !== f.url))}
                        >
                          ×
                        </button>
                        {i > 0 && (
                          <button type="button" className="foto-portada" onClick={() => setFotos((l) => [f, ...l.filter((x) => x.url !== f.url)])}>
                            ★ Portada
                          </button>
                        )}
                      </figure>
                    ))}
                  </div>
                )}

                {fotos.length === 0 && (
                  <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                    Sin fotos también puedes publicar: usaremos la ilustración de la prenda como portada.
                  </p>
                )}

                <Campo etiqueta="Audio explicativo (opcional)" ayuda={`Graba un audio contando detalles de la prenda: cómo la usaste, arreglos o lo que destaque. Máximo ${LIMITE_AUDIO_MB} MB.`} id="audio-subir">
                  {audio ? (
                    <div className="audio-carga">
                      <audio controls src={audio.url} />
                      <div className="audio-carga-pie">
                        <small>{audio.nombre}</small>
                        <button type="button" className="chip" onClick={quitarAudio}>Quitar audio</button>
                      </div>
                    </div>
                  ) : (
                    <GrabadoraAudio id="audio-subir" onGrabar={elegirAudio} avisar={avisar} />
                  )}
                </Campo>

                <div className="form-columnas">
                  <Campo etiqueta="Estado real" id="estado-subir">
                    <Selector id="estado-subir" value={datos.estado} onChange={(e) => actualizar({ estado: e.target.value })}>
                      {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </Selector>
                  </Campo>
                  <Campo etiqueta={`Valor de referencia: ${datos.valor}`} ayuda="Es una referencia, no un precio de venta." id="valor">
                    <input
                      id="valor"
                      className="control-rango"
                      type="range"
                      min="10"
                      max="150"
                      step="5"
                      value={datos.valor}
                      onChange={(e) => actualizar({ valor: Number(e.target.value) })}
                    />
                  </Campo>
                </div>
              </div>
            )}

            {paso === 2 && (
              <div className="form-rejilla">

                <div className="form-columnas">
                  <Campo etiqueta="Método preferido" id="metodo-subir">
                    <Selector id="metodo-subir" value={datos.metodo} onChange={(e) => actualizar({ metodo: e.target.value })}>
                      <option value="Domicilio">Domicilio con recolección</option>
                      <option value="Punto de encuentro">Punto de encuentro aliado</option>
                      <option value="Ambos">Me acomodo a los dos</option>
                    </Selector>
                  </Campo>
                  <Campo etiqueta="Barrio donde está la prenda" id="barrio-subir">
                    <Selector id="barrio-subir" value={datos.barrio} onChange={(e) => actualizar({ barrio: e.target.value })}>
                      {BARRIOS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </Selector>
                  </Campo>
                </div>

                <div className="auth-demo">
                  <b>Opciones de intercambio</b>

                  <label className="campo-terminos">
                    <input type="checkbox" checked={datos.destacada} onChange={(e) => actualizar({ destacada: e.target.checked })} />
                    <span>Quiero que el equipo revise mi prenda para el catálogo destacado.</span>
                  </label>
                </div>
              </div>
            )}

            {paso === 3 && (
              <div className="form-rejilla">
                <div className="vista-previa" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="tarjeta" style={{ display: 'grid', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <b style={{ fontFamily: 'var(--fuente-titulo)', fontSize: '1.2rem' }}>{datos.titulo || 'Sin título'}</b>
                      <Etiqueta tono="lavanda">Valor ref. {datos.valor}</Etiqueta>
                    </div>
                    <p style={{ fontSize: '0.88rem', opacity: 0.8 }}>{datos.descripcion || 'Sin descripción todavía.'}</p>
                    <div className="chips">
                      <Etiqueta tono="neutro">{datos.categoria}</Etiqueta>
                      <Etiqueta tono="neutro">Talla {datos.talla}</Etiqueta>
                    <Etiqueta tono="neutro">{datos.estado}</Etiqueta>
                    <Etiqueta tono="neutro">{datos.barrio}</Etiqueta>
                    </div>
                    <p style={{ fontSize: '0.85rem', opacity: 0.72 }}>
                      {fotos.length} {fotos.length === 1 ? 'foto cargada' : 'fotos cargadas'} · método {datos.metodo}{audio ? ' · con audio explicativo' : ''}
                    </p>
                  </div>
                </div>

                <div className="auth-demo">
                  <b>Antes de publicar</b>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', opacity: 0.85 }}>
                    <li>Revisa que la talla y el estado coincidan con la realidad.</li>
                    <li>Los datos de contacto no se muestran públicamente.</li>
                    <li>Podrás editar o retirar la publicación cuando quieras.</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="subir-acciones">
              <Boton variante="fantasma" onClick={() => (paso === 0 ? navigate('/panel') : setPaso((p) => p - 1))}>
                {paso === 0 ? 'Cancelar' : 'Atrás'}
              </Boton>
              {paso < PASOS.length - 1 ? (
                <Boton onClick={() => setPaso((p) => p + 1)}>Continuar</Boton>
              ) : (
                <Boton onClick={publicar} disabled={subiendo}>{subiendo ? (audio ? 'Subiendo fotos y audio…' : 'Subiendo fotos…') : 'Publicar prenda'}</Boton>
              )}
            </div>
          </div>

          <aside className="subir-vista">
            <Aparece>
              <div className="prenda" style={{ pointerEvents: 'none' }}>
                <div className="prenda-arte-marco">
                  {fotos[0] ? <img className="prenda-foto" src={fotos[0].url} alt="Portada de tu prenda" /> : <Garment tipo={datos.tipo} paleta={paletaArte} alt="" />}
                  <div className="prenda-etiquetas">
                    <Etiqueta tono="claro">Vista previa</Etiqueta>
                    {datos.destacada && <Etiqueta tono="destacada">Candidata</Etiqueta>}
                    {audio && <Etiqueta tono="lavanda">🎙 Con audio</Etiqueta>}
                  </div>
                </div>
                <div className="prenda-cuerpo">
                  <h3 className="prenda-titulo">{datos.titulo || 'Título de tu prenda'}</h3>
                  <p className="prenda-meta">
                    <span>Talla {datos.talla}</span>·<span>{datos.categoria}</span>·<span>{datos.barrio}</span>
                  </p>
                  <div className="prenda-pie">
                    <span className="prenda-valor">Valor ref. {datos.valor}</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{usuario?.nombre}</span>
                  </div>
                </div>
              </div>
            </Aparece>

            <div className="tarjeta">
              <h3 style={{ fontSize: '1.05rem' }}>Consejos de curaduría</h3>
              <ul style={{ margin: '0.6rem 0 0', paddingLeft: '1.1rem', fontSize: '0.88rem', opacity: 0.82, display: 'grid', gap: '0.35rem' }}>
                <li>Fotografía con luz natural y fondo neutro.</li>
                <li>Muestra el interior, las costuras y las etiquetas.</li>
                <li>Si tiene arreglos, cuéntalos: son parte del valor.</li>
                <li>Un valor de referencia coherente ayuda a describir la prenda.</li>
              </ul>
            </div>

            <div className="tarjeta" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}>
              <Mascot pose="saluda" style={{ width: 'min(180px, 50vw)' }} />
              <p style={{ fontSize: '0.88rem', opacity: 0.78 }}>
                Nuestro camaleón revisa cada publicación antes de destacarla. ¡Suerte con el primer trueque!
              </p>
              <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Valor sugerido de envío desde {precio(9900)}</p>
            </div>
          </aside>
        </div>
      </div>
    </Seccion>
  )
}
