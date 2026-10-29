import { useRef, useState } from 'react'
import Mascot from '../components/Mascot.jsx'
import { Area, Avatar, Boton, Campo, Entrada, Selector } from '../components/ui.jsx'
import { destinoVolver, navigate, useRoute } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'
import { ADMIN_DEMO, BARRIOS, CIUDAD, ESLOGAN } from '../lib/seed.js'
import { celebrar } from '../lib/movimiento.js'
import {
  fuerzaClave, INTERESES, LIMITE_BIO, normalizarCorreo, normalizarNombre,
  validarAcceso, validarBio, validarClave, validarConfirmar, validarCorreo,
  validarNombre, validarRegistro,
} from '../lib/validar.js'

const ORDEN_CAMPOS = ['nombre', 'email', 'clave', 'confirmar', 'barrio', 'bio', 'terminos']

export default function Auth({ modo = 'entrar' }) {
  const { entrar, registrar } = useStore()
  const { query } = useRoute()
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    clave: '',
    confirmar: '',
    barrio: BARRIOS[0],
    bio: '',
    intereses: [],
    terminos: false,
  })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [verClave, setVerClave] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const refs = useRef({})

  const esRegistro = modo === 'registro'
  const fuerza = fuerzaClave(formulario.clave)

  const actualizar = (cambios) => setFormulario((f) => ({ ...f, ...cambios }))

  const enfocarPrimero = (lista) => {
    const primero = ORDEN_CAMPOS.find((c) => lista[c])
    if (primero) refs.current[primero]?.focus()
  }

  /** Valida un campo al salir de él (no mientras se escribe). */
  const validarAlSalir = (campo) => {
    let mensaje = null
    if (campo === 'nombre') mensaje = validarNombre(formulario.nombre)
    if (campo === 'email') mensaje = validarCorreo(formulario.email)
    if (campo === 'clave') {
      mensaje = esRegistro
        ? validarClave(formulario.clave, { nombre: formulario.nombre, email: formulario.email })
        : null
    }
    if (campo === 'confirmar') mensaje = validarConfirmar(formulario.confirmar, formulario.clave)
    if (campo === 'bio') mensaje = validarBio(formulario.bio)
    setErrores((previos) => ({ ...previos, [campo]: mensaje ?? undefined }))
  }

  // Cambia de formulario conservando el destino al que hay que volver.
  const irA = (destino) => {
    const volver = query.get('volver')
    setError('')
    setErrores({})
    navigate(volver ? `${destino}?volver=${encodeURIComponent(volver)}` : destino)
  }

  const registrarCuenta = async (e) => {
    e.preventDefault()
    const nuevos = validarRegistro(formulario)
    setErrores(nuevos)
    setError('')
    if (Object.keys(nuevos).length) return enfocarPrimero(nuevos)
    setEnviando(true)
    try {
      const usuario = await registrar({
        nombre: normalizarNombre(formulario.nombre),
        email: normalizarCorreo(formulario.email),
        clave: formulario.clave,
        confirmar: formulario.confirmar,
        ciudad: CIUDAD,
        barrio: formulario.barrio,
        bio: formulario.bio,
        intereses: formulario.intereses,
        terminos: formulario.terminos,
      })
      celebrar()
      navigate(usuario.rol === 'admin' ? '/admin' : destinoVolver('/panel'))
    } catch (err) {
      if (err.campos) {
        setErrores(err.campos)
        enfocarPrimero(err.campos)
      }
      setError(err.message || 'No pudimos crear la cuenta.')
    } finally {
      setEnviando(false)
    }
  }

  const iniciarSesion = async (e) => {
    e.preventDefault()
    const nuevos = validarAcceso(formulario)
    setErrores(nuevos)
    setError('')
    if (Object.keys(nuevos).length) return enfocarPrimero(nuevos)
    setEnviando(true)
    try {
      const usuario = await entrar(normalizarCorreo(formulario.email), formulario.clave)
      navigate(usuario.rol === 'admin' ? '/admin' : destinoVolver('/panel'))
    } catch (err) {
      if (err.campos) setErrores(err.campos)
      setError(err.message || 'No fue posible iniciar sesión con esa cuenta.')
    } finally {
      setEnviando(false)
    }
  }

  /** Acceso rápido a la cuenta de administración que trae la demo. */
  const entrarComoAdmin = async () => {
    setError('')
    setErrores({})
    setEnviando(true)
    try {
      const usuario = await entrar(ADMIN_DEMO.email, ADMIN_DEMO.clave)
      navigate(usuario.rol === 'admin' ? '/admin' : '/panel')
    } catch (err) {
      setError(
        err.estado === 401
          ? 'La cuenta de administración de demostración no está disponible en este entorno. Inicia sesión con tus datos.'
          : err.message || 'No pudimos entrar con la cuenta de administración.',
      )
    } finally {
      setEnviando(false)
    }
  }

  const props = (campo) => ({
    id: campo,
    'aria-invalid': errores[campo] ? 'true' : undefined,
    'aria-describedby': errores[campo] ? `${campo}-error` : undefined,
  })

  return (
    <div className="acceso" data-modo={modo}>
      <a className="acceso-volver" href="#/">
        <span aria-hidden="true">←</span> Volver a la web
      </a>

      <div className="acceso-rejilla">
        <aside className="acceso-visual tono-niebla" data-tono="niebla">
          <div className="acceso-visual-contenido">
            <Mascot pose={esRegistro ? 'saluda' : 'sentado'} />
            <p className="ceja">{esRegistro ? 'Únete a la comunidad' : 'Bienvenida/o de vuelta'}</p>
            <h2>{ESLOGAN}</h2>
            <p className="acceso-visual-texto">
              {esRegistro
                ? 'Crea tu cuenta, sube la primera prenda y empieza a recibir propuestas en Medellín.'
                : 'Tu clóset ya está lleno de posibilidades. Entra y sigue el hilo donde lo dejaste.'}
            </p>
            {esRegistro && (
              <article className="auth-perfil-preview">
                <Avatar nombre={formulario.nombre || 'Tu perfil'} tamano={52} />
                <div>
                  <b>{formulario.nombre.trim() || 'Tu perfil'}</b>
                  <small>{formulario.barrio} · {CIUDAD} · Perfil de la comunidad</small>
                  <p>Las iniciales aparecen en un avatar circular para identificarte en tus intercambios.</p>
                </div>
              </article>
            )}
          </div>
        </aside>

        <div className="acceso-panel">
          <form className="auth-form" onSubmit={esRegistro ? registrarCuenta : iniciarSesion} noValidate>
            <div>
              <p className="ceja">{esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</p>
              <h1>{esRegistro ? 'Empieza tu hilo circular' : 'Hola de nuevo'}</h1>
            </div>

            {error && <p className="campo-error auth-alerta" role="alert">{error}</p>}

            {esRegistro && (
              <Campo etiqueta="Nombre completo" id="nombre" error={errores.nombre}>
                <Entrada
                  {...props('nombre')}
                  ref={(el) => { refs.current.nombre = el }}
                  value={formulario.nombre}
                  onChange={(e) => actualizar({ nombre: e.target.value })}
                  onBlur={() => validarAlSalir('nombre')}
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                />
              </Campo>
            )}

            <Campo etiqueta="Correo electrónico" id="email" error={errores.email}>
              <Entrada
                {...props('email')}
                ref={(el) => { refs.current.email = el }}
                type="email"
                value={formulario.email}
                onChange={(e) => actualizar({ email: e.target.value })}
                onBlur={() => validarAlSalir('email')}
                placeholder="tu@correo.com"
                autoComplete="email"
              />
            </Campo>

            <Campo
              etiqueta="Contraseña"
              ayuda={esRegistro ? 'De 8 a 72 caracteres, con al menos una letra y un número.' : undefined}
              error={errores.clave}
              id="clave"
            >
              <span className="campo-clave">
                <Entrada
                  {...props('clave')}
                  ref={(el) => { refs.current.clave = el }}
                  type={verClave ? 'text' : 'password'}
                  value={formulario.clave}
                  onChange={(e) => actualizar({ clave: e.target.value })}
                  onBlur={() => validarAlSalir('clave')}
                  placeholder="••••••••"
                  autoComplete={esRegistro ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="campo-clave-ojo"
                  onClick={() => setVerClave((v) => !v)}
                  aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={verClave}
                >
                  {verClave ? 'Ocultar' : 'Mostrar'}
                </button>
              </span>
            </Campo>

            {esRegistro && (
              <>
                <div className="clave-fuerza" data-nivel={fuerza.nivel} aria-live="polite">
                  <span className="clave-fuerza-barras" aria-hidden="true">
                    <i className={fuerza.porcentaje >= 33 ? 'activa' : ''} />
                    <i className={fuerza.porcentaje >= 66 ? 'activa' : ''} />
                    <i className={fuerza.porcentaje >= 100 ? 'activa' : ''} />
                  </span>
                  <small>{fuerza.nivel ? `Contraseña ${fuerza.nivel}` : 'Aún no escribes una contraseña.'}</small>
                </div>

                <Campo etiqueta="Confirmar contraseña" error={errores.confirmar} id="confirmar">
                  <span className="campo-clave">
                    <Entrada
                      {...props('confirmar')}
                      ref={(el) => { refs.current.confirmar = el }}
                      type={verConfirmar ? 'text' : 'password'}
                      value={formulario.confirmar}
                      onChange={(e) => actualizar({ confirmar: e.target.value })}
                      onBlur={() => validarAlSalir('confirmar')}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="campo-clave-ojo"
                      onClick={() => setVerConfirmar((v) => !v)}
                      aria-label={verConfirmar ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                      aria-pressed={verConfirmar}
                    >
                      {verConfirmar ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </span>
                </Campo>

                <div className="form-columnas">
                  <div className="campo">
                    <span className="campo-etiqueta">Ciudad</span>
                    <div className="campo-ciudad-fija">Medellín · cobertura única</div>
                  </div>
                  <Campo etiqueta="Barrio" ayuda="Con tu barrio coordinamos el domicilio y los puntos de encuentro." error={errores.barrio} id="barrio">
                    <Selector
                      {...props('barrio')}
                      ref={(el) => { refs.current.barrio = el }}
                      value={formulario.barrio}
                      onChange={(e) => actualizar({ barrio: e.target.value })}
                    >
                      {BARRIOS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </Selector>
                  </Campo>
                </div>

                <Campo
                  etiqueta="Cuéntanos de tu estilo"
                  ayuda={`Aparece en tu perfil público. Hasta ${LIMITE_BIO} caracteres (${formulario.bio.length}/${LIMITE_BIO}).`}
                  error={errores.bio}
                  id="bio"
                >
                  <Area
                    {...props('bio')}
                    ref={(el) => { refs.current.bio = el }}
                    maxLength={LIMITE_BIO}
                    value={formulario.bio}
                    onChange={(e) => actualizar({ bio: e.target.value })}
                    onBlur={() => validarAlSalir('bio')}
                    placeholder="Amo las chaquetas de segunda mano y arreglar lo que ya tengo…"
                    rows={3}
                  />
                </Campo>

                <Campo etiqueta="Qué te interesa intercambiar" ayuda="Hasta 8 intereses." error={errores.intereses} id="intereses">
                  <div className="chips" id="intereses">
                    {INTERESES.map((i) => {
                      const activo = formulario.intereses.includes(i)
                      return (
                        <button
                          type="button"
                          key={i}
                          className={`chip ${activo ? 'activo' : ''}`}
                          aria-pressed={activo}
                          onClick={() => actualizar({
                            intereses: activo
                              ? formulario.intereses.filter((x) => x !== i)
                              : [...formulario.intereses, i],
                          })}
                        >
                          {i}
                        </button>
                      )
                    })}
                  </div>
                </Campo>

                <label className={`campo-terminos ${errores.terminos ? 'con-error' : ''}`}>
                  <input
                    ref={(el) => { refs.current.terminos = el }}
                    type="checkbox"
                    checked={formulario.terminos}
                    aria-invalid={errores.terminos ? 'true' : undefined}
                    aria-describedby={errores.terminos ? 'terminos-error' : undefined}
                    onChange={(e) => actualizar({ terminos: e.target.checked })}
                  />
                  <span>
                    Acepto las condiciones de uso y el tratamiento de datos personales de Hilo Circular.
                  </span>
                </label>
                {errores.terminos && <span className="campo-error" id="terminos-error" role="alert">{errores.terminos}</span>}
              </>
            )}

            <Boton tamano="lg" type="submit" className="bloque" disabled={enviando} data-cursor={esRegistro ? 'crear cuenta' : 'entrar'}>
              {enviando ? 'Un momento…' : esRegistro ? 'Crear mi cuenta' : 'Iniciar sesión'}
            </Boton>

            <div className="auth-cambiar">
              {esRegistro ? (
                <>
                  <span>¿Ya tienes cuenta?</span>
                  <button type="button" onClick={() => irA('/entrar')}>Inicia sesión</button>
                </>
              ) : (
                <>
                  <span>¿Aún no tienes cuenta?</span>
                  <button type="button" onClick={() => irA('/registro')}>Regístrate aquí</button>
                </>
              )}
            </div>

            {!esRegistro && (
              <div className="auth-admin">
                <span className="auth-admin-separador" aria-hidden="true"><span>o</span></span>
                <button
                  type="button"
                  className="auth-admin-boton"
                  onClick={entrarComoAdmin}
                  disabled={enviando}
                  data-cursor="admin"
                >
                  <span aria-hidden="true">⚙</span> Entrar con la cuenta de administración
                </button>
                <small>Acceso directo para el equipo de Hilo Circular.</small>
              </div>
            )}

            <p className="auth-privacidad">
              Tus datos de contacto y tu dirección solo se usan para coordinar intercambios. Nunca se muestran en el catálogo.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
