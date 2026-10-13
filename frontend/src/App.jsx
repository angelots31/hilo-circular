import { useEffect } from 'react'
import { StoreProvider, useStore } from './lib/store.jsx'
import { destinoVolver, navigate, useRoute } from './lib/router.jsx'
import { Fondo, ProgresoLectura, CursorHueco } from './components/Chrome.jsx'
import { Avisos, Encabezado, Pie } from './components/Layout.jsx'
import { Boton, EstadoVacio, Seccion } from './components/ui.jsx'

import Home from './pages/Home.jsx'
import ComoFunciona from './pages/ComoFunciona.jsx'
import Catalogo from './pages/Catalogo.jsx'
import PrendaDetalle from './pages/PrendaDetalle.jsx'
import Resenas from './pages/Resenas.jsx'
import Domicilio from './pages/Domicilio.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Auth from './pages/Auth.jsx'
import Subir from './pages/Subir.jsx'
import Intercambios from './pages/Intercambios.jsx'
import Panel from './pages/Panel.jsx'
import Admin from './pages/Admin.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'

/** Puerta de entrada para las zonas que necesitan sesión; al entrar vuelve a donde estabas. */
function Acceso({ titulo, texto, volver = '', modoAdmin = false }) {
  const { entrar, avisar } = useStore()
  const destino = volver ? `/entrar?volver=${encodeURIComponent(volver)}` : '/entrar'
  const entrarDemo = async () => {
    try {
      const cuenta = await entrar(modoAdmin ? 'admin@hilocircular.co' : 'valentina@hilocircular.co', 'demo123')
      navigate(cuenta.rol === 'admin' ? '/admin' : destinoVolver('/panel'))
    } catch (error) {
      avisar(error.message || 'No pudimos iniciar la sesión de prueba.', 'aviso')
    }
  }
  return (
    <Seccion tono="claro">
      <div className="contenedor">
        <EstadoVacio
          pose="saluda"
          titulo={titulo}
          texto={texto}
          accion={<Boton to={destino} tamano="lg">Iniciar sesión</Boton>}
          secundario={
            <Boton variante="fantasma" onClick={entrarDemo}>
              {modoAdmin ? 'Entrar como administrador (demo)' : 'Entrar con una cuenta de prueba'}
            </Boton>
          }
        />
      </div>
    </Seccion>
  )
}

function SinPermiso() {
  return (
    <Seccion tono="claro">
      <div className="contenedor">
        <EstadoVacio
          pose="alerta"
          titulo="Esta zona es solo para el equipo"
          texto="Tu cuenta no tiene permisos de administración. Puedes seguir gestionando tus prendas e intercambios desde tu panel."
          accion={<Boton to="/panel" tamano="lg">Ir a mi panel</Boton>}
        />
      </div>
    </Seccion>
  )
}

function Redirigir({ a }) {
  useEffect(() => {
    navigate(a, { replace: true })
  }, [a])
  return null
}

function Rutas() {
  const { segments, query } = useRoute()
  const { usuario, esAdmin } = useStore()
  const [primero, segundo] = segments

  // Cada cambio de ruta vuelve al inicio de la página.
  useEffect(() => {
    scrollTo({ top: 0, behavior: 'auto' })
  }, [segments.join('/')])

  // La clave fuerza el remontaje cuando cambian los parámetros de la dirección.
  const clave = `${segments.join('/')}?${query.toString()}`

  switch (primero) {
    case undefined:
      return <Home key={clave} />
    case 'catalogo':
      return <Catalogo key={clave} />
    case 'prenda':
      return segundo ? <PrendaDetalle key={clave} id={segundo} /> : <Catalogo key={clave} />
    case 'como-funciona':
      return <ComoFunciona key={clave} />
    case 'resenas':
      return <Resenas key={clave} />
    case 'domicilio':
      return <Domicilio key={clave} />
    case 'nosotros':
      return <Nosotros key={clave} />
    case 'entrar':
    case 'registro':
      // Quien ya tiene sesión no vuelve a ver el formulario.
      if (usuario) return <Redirigir a={esAdmin ? '/admin' : destinoVolver('/panel')} />
      return <Auth key={clave} modo={primero === 'registro' ? 'registro' : 'entrar'} />
    case 'subir':
      return usuario ? (
        <Subir key={clave} />
      ) : (
        <Acceso key={clave} volver="/subir" titulo="Inicia sesión para subir tu prenda" texto="Creamos un perfil para cada persona: así sabemos a quién pertenece cada prenda y a dónde va el domicilio." />
      )
    case 'intercambios':
      return usuario ? (
        <Intercambios key={clave} />
      ) : (
        <Acceso key={clave} volver="/intercambios" titulo="Tus intercambios te esperan" texto="Entra a tu cuenta para ver las solicitudes que recibiste y las que enviaste." />
      )
    case 'panel':
      if (!usuario) return <Acceso key={clave} volver="/panel" titulo="Tu panel de intercambios" texto="Desde tu panel gestionas tus prendas, envíos, reseñas y datos personales." />
      if (esAdmin) return <Redirigir a="/admin" />
      return <Panel key={clave} seccion={query.get('seccion') ?? 'resumen'} />
    case 'admin':
      if (!usuario) return <Acceso key={clave} modoAdmin volver="/admin" titulo="Zona de administración" texto="Este espacio es solo para el equipo de Hilo Circular: moderación, envíos y métricas de la comunidad." />
      if (!esAdmin) return <SinPermiso key={clave} />
      return <Admin key={clave} seccion={segundo ?? 'resumen'} />
    default:
      return <NoEncontrada key={clave} ruta={`/${segments.join('/')}`} />
  }
}

/** Los paneles (cliente y administración) van a pantalla completa: sin navbar, sin footer. */
function Estructura() {
  const { segments } = useRoute()
  const { usuario, esAdmin } = useStore()
  const [primero] = segments
  const enPanel = Boolean((primero === 'panel' && usuario && !esAdmin) || (primero === 'admin' && esAdmin))

  useEffect(() => {
    document.body.classList.toggle('modo-panel', enPanel)
    return () => document.body.classList.remove('modo-panel')
  }, [enPanel])

  if (enPanel) {
    return (
      <>
        <CursorHueco />
        <a className="saltar" href="#contenido">Saltar al contenido</a>
        <main id="contenido">
          <Rutas />
        </main>
        <Avisos />
      </>
    )
  }

  return (
    <>
      <CursorHueco />
      <Fondo />
      <ProgresoLectura />
      <a className="saltar" href="#contenido">Saltar al contenido</a>
      <Encabezado />
      <main id="contenido">
        <Rutas />
      </main>
      <Pie />
      <Avisos />
    </>
  )
}

export default function Aplicacion() {
  return (
    <StoreProvider>
      <Estructura />
    </StoreProvider>
  )
}
