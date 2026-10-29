import { useEffect } from 'react'
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'motion/react'
import { StoreProvider, useStore } from './lib/store.jsx'
import { destinoVolver, navigate, useRoute } from './lib/router.jsx'
import { activarScrollSuave, subirAlInicio } from './lib/scroll.js'
import { Fondo, ProgresoLectura } from './components/Chrome.jsx'
import { Avisos, Encabezado, Pie } from './components/Layout.jsx'
import { BotonQr } from './components/BotonQr.jsx'
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
import Conciencia from './pages/Conciencia.jsx'

/** Puerta de entrada para las zonas que necesitan sesión; al entrar vuelve a donde estabas. */
function Acceso({ titulo, texto, volver = '' }) {
  const destino = volver ? `/entrar?volver=${encodeURIComponent(volver)}` : '/entrar'
  return (
    <Seccion tono="claro">
      <div className="contenedor">
        <EstadoVacio
          pose="saluda"
          titulo={titulo}
          texto={texto}
          accion={<Boton to={destino} tamano="lg">Iniciar sesión</Boton>}
          secundario={<Boton to="/registro" variante="fantasma">Crear una cuenta</Boton>}
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

/** La ruta llega por props para que la página que sale conserve la anterior. */
function Rutas({ segments, query }) {
  const { usuario, esAdmin } = useStore()
  const [primero, segundo] = segments

  // Cada cambio de ruta vuelve al inicio de la página (también con Lenis).
  useEffect(() => {
    subirAlInicio()
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
    case 'conciencia':
      // Micropágina pública del QR: no pide sesión y funciona en el celular.
      return <Conciencia key={clave} />
    case 'entrar':
    case 'registro':
      // Quien ya tiene sesión no vuelve a ver el formulario.
      if (usuario) return <Redirigir a={esAdmin ? '/admin' : destinoVolver('/panel')} />
      // Sin key: al alternar entre entrar y registro el panel se desliza en vez de recargarse.
      return <Auth modo={primero === 'registro' ? 'registro' : 'entrar'} />
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
      if (!usuario) return <Acceso key={clave} volver="/admin" titulo="Zona de administración" texto="Este espacio es solo para el equipo de Hilo Circular: moderación, envíos y métricas de la comunidad." />
      if (!esAdmin) return <SinPermiso key={clave} />
      return <Admin key={clave} seccion={segundo ?? 'resumen'} />
    default:
      return <NoEncontrada key={clave} ruta={`/${segments.join('/')}`} />
  }
}

/** Fundido y desplazamiento corto al cambiar de página. */
function Pagina({ clave, children }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={clave}
        className="pagina"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}

/** Los paneles y el acceso van a pantalla completa: sin navbar ni footer. */
function Estructura() {
  const { segments, query } = useRoute()
  const { usuario, esAdmin } = useStore()
  const [primero] = segments
  const enPanel = Boolean((primero === 'panel' && usuario && !esAdmin) || (primero === 'admin' && esAdmin))
  const enAcceso = primero === 'entrar' || primero === 'registro'
  // La página del QR es independiente: sin navbar, sin pie y sin botón flotante.
  const enConciencia = primero === 'conciencia'
  const clave = `${segments.join('/')}?${query.toString()}`

  useEffect(() => {
    document.body.classList.toggle('modo-panel', enPanel)
    document.body.classList.toggle('modo-acceso', enAcceso)
    document.body.classList.toggle('modo-conciencia', enConciencia)
    return () => {
      document.body.classList.remove('modo-panel')
      document.body.classList.remove('modo-acceso')
      document.body.classList.remove('modo-conciencia')
    }
  }, [enPanel, enAcceso, enConciencia])

  if (enPanel || enAcceso || enConciencia) {
    return (
      <>
        <a className="saltar" href="#contenido">Saltar al contenido</a>
        <main id="contenido">
          <Pagina clave={clave}>
            <Rutas segments={segments} query={query} />
          </Pagina>
        </main>
        <Avisos />
      </>
    )
  }

  return (
    <>
      <Fondo />
      <ProgresoLectura />
      <a className="saltar" href="#contenido">Saltar al contenido</a>
      <Encabezado />
      <main id="contenido">
        <Pagina clave={clave}>
          <Rutas segments={segments} query={query} />
        </Pagina>
      </main>
      <Pie />
      <BotonQr />
      <Avisos />
    </>
  )
}

export default function Aplicacion() {
  // Scroll suave con inercia; se apaga solo si el sistema pide reducir movimiento.
  useEffect(() => activarScrollSuave(), [])

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <StoreProvider>
          <Estructura />
        </StoreProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
