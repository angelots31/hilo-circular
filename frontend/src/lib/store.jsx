import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, ApiError, fijarToken } from './api.js'

const StoreContext = createContext(null)

const ESTADO_VACIO = {
  usuarios: [],
  prendas: [],
  resenas: [],
  pedidos: [],
  intercambios: [],
  reportes: [],
  favoritos: [],
  notificaciones: [],
  mensajes: [],
  usuario: null,
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(ESTADO_VACIO)
  const [avisos, setAvisos] = useState([])
  const [cargando, setCargando] = useState(true)

  /** Muestra una notificación flotante breve. */
  const avisar = useCallback((texto, tono = 'info') => {
    const id = `a${Date.now()}${Math.random().toString(16).slice(2, 6)}`
    setAvisos((lista) => [...lista, { id, texto, tono }])
    setTimeout(() => setAvisos((lista) => lista.filter((a) => a.id !== id)), 5200)
  }, [])

  const cerrarAviso = useCallback((id) => {
    setAvisos((lista) => lista.filter((a) => a.id !== id))
  }, [])

  /** Trae del backend todo lo que la pantalla necesita. */
  const cargar = useCallback(async (silencioso = false) => {
    try {
      const datos = await api.datos()
      setState({
        ...ESTADO_VACIO,
        ...datos,
        favoritos: datos.favoritos ?? [],
        mensajes: datos.mensajes ?? [],
      })
    } catch (error) {
      if (error instanceof ApiError && error.estado === 401) {
        fijarToken(null)
        setState(ESTADO_VACIO)
      } else {
        if (!silencioso) avisar(error.message, 'aviso')
        // Si ya había una sesión cargada, un fallo de red no debe borrar la pantalla.
        setState((previo) => (previo.usuario ? previo : ESTADO_VACIO))
      }
    } finally {
      setCargando(false)
    }
  }, [avisar])

  useEffect(() => { cargar() }, [cargar])

  // Mantiene al día notificaciones y chats mientras haya una sesión abierta.
  useEffect(() => {
    if (!state.usuario) return undefined
    const temporizador = setInterval(() => cargar(true), 25000)
    return () => clearInterval(temporizador)
  }, [state.usuario?.id, cargar])

  /** Ejecuta una acción contra la API, recarga los datos y avisa el resultado. */
  const ejecutar = useCallback(async (accion, mensajeOk, tonoOk = 'ok') => {
    try {
      await accion()
      await cargar()
      if (mensajeOk) avisar(mensajeOk, tonoOk)
      return true
    } catch (error) {
      avisar(error.message || 'No pudimos completar la acción.', 'aviso')
      return false
    }
  }, [cargar, avisar])

  const entrar = useCallback(async (email, clave) => {
    const { usuario, token } = await api.login(email, clave)
    fijarToken(token)
    await cargar()
    avisar(`Bienvenida/o de nuevo, ${usuario.nombre.split(' ')[0]}.`, 'ok')
    return usuario
  }, [cargar, avisar])

  const registrar = useCallback(async (datos) => {
    const { usuario, token } = await api.registro(datos)
    fijarToken(token)
    await cargar()
    avisar('Cuenta creada. Tu perfil ya está listo para el primer intercambio.', 'ok')
    return usuario
  }, [cargar, avisar])

  const valor = useMemo(() => {
    const buscarUsuario = (id) => state.usuarios.find((u) => u.id === id)
    const buscarPrenda = (id) => state.prendas.find((x) => x.id === id)
    const esAdmin = state.usuario?.rol === 'admin'

    return {
      ...state,
      cargando,
      avisos,
      avisar,
      cerrarAviso,
      esAdmin,
      buscarUsuario,
      buscarPrenda,
      precio: (n) => `$${Number(n ?? 0).toLocaleString('es-CO')}`,
      fecha: (iso) => {
        if (!iso) return '—'
        // Acepta tanto 'YYYY-MM-DD' como una fecha ISO completa.
        const valor = String(iso).includes('T') ? new Date(iso) : new Date(`${iso}T12:00:00`)
        return Number.isNaN(valor.getTime())
          ? '—'
          : valor.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
      },
      fechaHora: (iso) => {
        if (!iso) return '—'
        const valor = new Date(iso)
        return Number.isNaN(valor.getTime())
          ? '—'
          : valor.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      },

      entrar,
      registrar,
      salir: () => {
        fijarToken(null)
        setState(ESTADO_VACIO)
        cargar()
        avisar('Cerraste sesión. ¡Vuelve pronto!', 'info')
      },

      marcarNotificacionesLeidas: async () => {
        try {
          await api.marcarNotificacionesLeidas()
          await cargar()
        } catch (error) {
          avisar(error.message || 'No pudimos actualizar las notificaciones.', 'aviso')
        }
      },

      actualizarPerfil: (datos) => ejecutar(() => api.actualizarPerfil(datos), 'Perfil actualizado correctamente.'),
      solicitarVerificacion: () => ejecutar(() => api.solicitarVerificacion(), 'Solicitud de verificación enviada al equipo.'),
      suscribir: (email) => ejecutar(() => api.suscribir(email), '¡Listo! Guardamos tu correo para enviarte la agenda de talleres.'),

      publicarPrenda: (datos) => ejecutar(() => api.publicarPrenda(datos), '¡Tu prenda quedó publicada y ya hace parte del catálogo!'),
      importarPrendas: (prendas) => ejecutar(() => api.importarPrendas(prendas)),
      eliminarPrenda: (id) => ejecutar(() => api.eliminarPrenda(id), 'Prenda retirada del catálogo.', 'aviso'),
      alternarDisponible: (id) => ejecutar(() => api.alternarDisponible(id)),
      destacar: (id, valor) => ejecutar(async () => {
        const respuesta = await api.destacar(id, valor)
        if (respuesta?.solicitud) avisar('Postulación enviada al equipo de curaduría.', 'ok')
        return respuesta
      }),
      alternarFavorito: (id) => {
        if (!state.usuario) { avisar('Inicia sesión para guardar prendas en tus favoritos.', 'aviso'); return }
        const activo = !state.favoritos.includes(id)
        ejecutar(() => api.alternarFavorito(id), activo ? 'Añadido a tus favoritos.' : 'Quitado de tus favoritos.', 'info')
      },
      registrarVista: (id) => { api.registrarVista(id).catch(() => {}) },

      solicitar: (datos) => ejecutar(() => api.solicitar(datos), 'Solicitud enviada. Te avisaremos cuando respondan.'),
      enviarMensaje: (id, texto) => ejecutar(() => api.enviarMensaje(id, texto)),
      responderSolicitud: (id, estado) => {
        const mensajes = {
          Aceptado: ['Intercambio aceptado. Ya puedes coordinar el envío.', 'ok'],
          Rechazado: ['Solicitud rechazada.', 'aviso'],
          Cancelado: ['Cancelaste la solicitud pendiente.', 'info'],
          Completado: ['Intercambio marcado como completado.', 'ok'],
        }
        const [mensaje, tono] = mensajes[estado] ?? ['Estado del intercambio actualizado.', 'info']
        return ejecutar(() => api.responderSolicitud(id, estado), mensaje, tono)
      },

      publicarResena: (datos) => ejecutar(() => api.publicarResena(datos), 'Gracias por compartir tu experiencia.'),
      responderResena: (id, respuesta) => ejecutar(() => api.responderResena(id, respuesta), 'Respuesta publicada.'),
      marcarResena: (id, valor) => ejecutar(() => api.marcarResena(id, valor), valor ? 'Reseña enviada a moderación.' : 'Reseña restaurada.', valor ? 'aviso' : 'ok'),
      utilResena: (id) => ejecutar(() => api.utilResena(id)),

      crearPedido: (datos) => ejecutar(() => api.crearPedido(datos), 'Envío programado. Te compartimos la guía en seguida.'),
      moverPedido: (id, estado) => ejecutar(() => api.moverPedido(id, estado), `Envío actualizado a «${estado}».`),
      resolverReporte: (id, estado, mensaje) => ejecutar(() => api.resolverReporte(id, estado), mensaje),

      suspenderUsuario: (id) => ejecutar(() => api.suspenderUsuario(id), 'Estado de la cuenta actualizado.', 'aviso'),
      verificarUsuario: (id) => ejecutar(() => api.verificarUsuario(id), 'Verificación actualizada.'),
    }
  }, [state, cargando, avisos, avisar, cerrarAviso, cargar, ejecutar, entrar, registrar])

  return <StoreContext.Provider value={valor}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}
