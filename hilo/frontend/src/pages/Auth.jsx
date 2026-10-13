import { useState } from 'react'
import Mascot from '../components/Mascot.jsx'
import { Area, Avatar, Boton, Campo, Entrada, Seccion, Selector } from '../components/ui.jsx'
import { destinoVolver, navigate } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'
import { BARRIOS, CIUDAD, ESLOGAN } from '../lib/seed.js'

const INTERESES = ['Chaquetas', 'Vestidos', 'Calzado', 'Punto', 'Accesorios', 'Reparación', 'Vintage', 'Deportivo']

export default function Auth({ modo = 'entrar' }) {
  const { entrar, registrar } = useStore()
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    clave: '',
    barrio: BARRIOS[0],
    bio: '',
    intereses: [],
    terminos: false,
  })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const registrarCuenta = async (e) => {
    e.preventDefault()
    if (formulario.nombre.trim().length < 3) return setError('Escribe tu nombre completo.')
    const correo = formulario.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return setError('Escribe un correo electrónico válido.')
    if (formulario.clave.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    if (!formulario.terminos) return setError('Debes aceptar las condiciones y el tratamiento de datos.')
    setError('')
    setEnviando(true)
    try {
      const usuario = await registrar({
        nombre: formulario.nombre.trim(),
        email: correo,
        clave: formulario.clave,
        ciudad: CIUDAD,
        barrio: formulario.barrio,
        bio: formulario.bio,
        intereses: formulario.intereses,
      })
      navigate(usuario.rol === 'admin' ? '/admin' : destinoVolver('/panel'))
    } catch (err) {
      setError(err.message || 'No pudimos crear la cuenta.')
    } finally {
      setEnviando(false)
    }
  }

  const iniciarSesion = async (e) => {
    e.preventDefault()
    const correo = formulario.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return setError('Escribe un correo válido.')
    if (!formulario.clave) return setError('Escribe tu contraseña.')
    setError('')
    setEnviando(true)
    try {
      const usuario = await entrar(correo, formulario.clave)
      navigate(usuario.rol === 'admin' ? '/admin' : destinoVolver('/panel'))
    } catch (err) {
      setError(err.message || 'No fue posible iniciar sesión con esa cuenta.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className={`auth ${modo === 'registro' ? 'auth-registro' : 'auth-entrar'}`}>
      <div className="auth-lado tono-niebla" data-tono="niebla">
        <div className="auth-lado-contenido">
          <Mascot pose={modo === 'entrar' ? 'sentado' : 'saluda'} />
          <h2>{ESLOGAN}</h2>
          <p style={{ opacity: 0.8 }}>
            {modo === 'entrar'
              ? 'Tu clóset ya está lleno de posibilidades. Entra y sigue el hilo donde lo dejaste.'
              : 'Crea tu cuenta, sube la primera prenda y empieza a recibir propuestas en Medellín.'}
          </p>
          {modo === 'registro' && (
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
      </div>

      <Seccion tono="claro" style={{ padding: 0 }}>
        <form className="auth-form" onSubmit={modo === 'entrar' ? iniciarSesion : registrarCuenta}>
          <div>
            <p className="ceja">{modo === 'entrar' ? 'Iniciar sesión' : 'Crear cuenta'}</p>
            <h1>{modo === 'entrar' ? 'Hola de nuevo' : 'Empieza tu hilo circular'}</h1>
          </div>

          {error && <p className="campo-error" role="alert">{error}</p>}

          {modo === 'registro' && (
            <Campo etiqueta="Nombre completo" id="nombre">
              <Entrada id="nombre" value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} placeholder="Valentina Ríos" autoComplete="name" />
            </Campo>
          )}

          <Campo etiqueta="Correo electrónico" id="email">
            <Entrada id="email" type="email" value={formulario.email} onChange={(e) => setFormulario({ ...formulario, email: e.target.value })} placeholder="tu@correo.com" autoComplete="email" />
          </Campo>

          <Campo etiqueta="Contraseña" ayuda={modo === 'registro' ? 'Mínimo 6 caracteres.' : undefined} id="clave">
            <Entrada id="clave" type="password" value={formulario.clave} onChange={(e) => setFormulario({ ...formulario, clave: e.target.value })} placeholder="••••••••" autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} />
          </Campo>

          {modo === 'registro' && (
            <>
              <div className="form-columnas">
                <div className="campo">
                  <span className="campo-etiqueta">Ciudad</span>
                  <div className="campo-ciudad-fija">Medellín · cobertura única</div>
                </div>
                <Campo etiqueta="Barrio" ayuda="Con tu barrio coordinamos el domicilio y los puntos de encuentro." id="barrio">
                  <Selector id="barrio" value={formulario.barrio} onChange={(e) => setFormulario({ ...formulario, barrio: e.target.value })}>
                    {BARRIOS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </Selector>
                </Campo>
              </div>

              <Campo etiqueta="Cuéntanos de tu estilo" ayuda="Aparece en tu perfil público." id="bio">
                <Area id="bio" value={formulario.bio} onChange={(e) => setFormulario({ ...formulario, bio: e.target.value })} placeholder="Amo las chaquetas de segunda mano y arreglar lo que ya tengo…" rows={3} />
              </Campo>

              <Campo etiqueta="Qué te interesa intercambiar" id="intereses">
                <div className="chips" id="intereses">
                  {INTERESES.map((i) => (
                    <button
                      type="button"
                      key={i}
                      className={`chip ${formulario.intereses.includes(i) ? 'activo' : ''}`}
                      onClick={() =>
                        setFormulario({
                          ...formulario,
                          intereses: formulario.intereses.includes(i)
                            ? formulario.intereses.filter((x) => x !== i)
                            : [...formulario.intereses, i],
                        })
                      }
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </Campo>

              <label className="campo-terminos">
                <input
                  type="checkbox"
                  checked={formulario.terminos}
                  onChange={(e) => setFormulario({ ...formulario, terminos: e.target.checked })}
                />
                <span>
                  Acepto las condiciones de uso y el tratamiento de datos personales de Hilo Circular.
                </span>
              </label>
            </>
          )}

          <Boton tamano="lg" type="submit" className="bloque" disabled={enviando} data-cursor={modo === 'entrar' ? 'entrar' : 'crear cuenta'}>
            {enviando ? 'Un momento…' : modo === 'entrar' ? 'Iniciar sesión' : 'Crear mi cuenta'}
          </Boton>

          <div className="auth-cambiar">
            {modo === 'entrar' ? (
              <>
                <span>¿Aún no tienes cuenta?</span>
                <button type="button" onClick={() => navigate('/registro')}>Regístrate aquí</button>
              </>
            ) : (
              <>
                <span>¿Ya tienes cuenta?</span>
                <button type="button" onClick={() => navigate('/entrar')}>Inicia sesión</button>
              </>
            )}
          </div>

          <div className="auth-demo">
            <b>Cuentas de demostración</b>
            <p>Este prototipo no tiene backend: usa estas cuentas para recorrer los paneles.</p>
            <div className="chips">
              <Boton
                type="button"
                variante="fantasma"
                tamano="sm"
                onClick={() => { setFormulario({ ...formulario, email: 'valentina@hilocircular.co', clave: 'demo123' }); setError('') }}
              >
                valentina@hilocircular.co
              </Boton>
              <Boton
                type="button"
                variante="fantasma"
                tamano="sm"
                onClick={() => { setFormulario({ ...formulario, email: 'admin@hilocircular.co', clave: 'demo123' }); setError('') }}
              >
                admin@hilocircular.co
              </Boton>
            </div>
          </div>
        </form>
      </Seccion>
    </div>
  )
}
