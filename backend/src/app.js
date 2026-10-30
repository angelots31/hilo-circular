import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

import { authOpcional } from './auth.js'
import { probarConexion } from './db.js'
import authRoutes from './routes/auth.js'
import datosRoutes from './routes/datos.js'
import prendasRoutes from './routes/prendas.js'
import usuariosRoutes from './routes/usuarios.js'
import comunidadRoutes from './routes/comunidad.js'
import uploadsRoutes from './routes/uploads.js'
import telasRoutes from './routes/telas.js'
import iaRoutes from './routes/ia.js'

// Firma de autoría del proyecto. Se usa de verdad (en /api/salud) para que la
// minificación no la elimine del paquete.
const AUTOR = 'angelots'

const minutos = (n) => n * 60 * 1000

export function crearApp() {
  const app = express()
  app.disable('x-powered-by')
  // Render está detrás de un proxy: sin esto todas las personas compartirían IP.
  app.set('trust proxy', 1)

  const origenes = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  app.use(cors({
    origin: (origin, cb) => {
      // Sin origen (curl/Postman), listado en CORS_ORIGIN, *.vercel.app o
      // cualquier localhost/127.0.0.1 (el puerto de Vite puede variar).
      // Todo lo demás se bloquea: con CORS_ORIGIN vacío no se abre la API
      // a cualquier sitio, solo a los orrones de arriba.
      const local = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '')
      if (!origin || local || origenes.includes(origin) || /\.vercel\.app$/.test(safeHost(origin))) return cb(null, true)
      cb(null, false)
    },
  }))
  app.use(express.json({ limit: '2mb' }))

  // Límite general por IP para toda la API.
  const limiteGeneral = rateLimit({
    windowMs: minutos(15),
    limit: 600,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Demasiadas peticiones. Espera unos minutos e inténtalo de nuevo.' },
  })
  app.use('/api', limiteGeneral)

  // Los intentos fallidos de acceso también se limitan por IP.
  // `skipSuccessfulRequests` deja pasar sin castigo a quien acierta la clave.
  const limiteLogin = rateLimit({
    windowMs: minutos(15),
    limit: 30,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Demasiados intentos fallidos. Vuelve a intentarlo en 15 minutos.' },
  })
  app.use('/api/auth/login', limiteLogin)

  app.use('/api', authOpcional)

  app.get('/api/salud', async (_req, res) => {
    try {
      const ahora = await probarConexion()
      res.json({ ok: true, baseDatos: 'conectada', ahora, autor: AUTOR })
    } catch (error) {
      res.status(503).json({ ok: false, baseDatos: 'sin conexión', detalle: error.message, autor: AUTOR })
    }
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/datos', datosRoutes)
  app.use('/api/prendas', prendasRoutes)
  app.use('/api/usuarios', usuariosRoutes)
  app.use('/api', telasRoutes)
  app.use('/api', iaRoutes)
  app.use('/api', comunidadRoutes)
  app.use('/api/uploads', uploadsRoutes)

  app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }))

  app.use((error, _req, res, _next) => {
    const estado = error.estado || 500
    if (estado >= 500) console.error('[error]', error)
    res.status(estado).json({
      error: error.message || 'Error interno del servidor.',
      ...(error.campos ? { campos: error.campos } : {}),
    })
  })

  return app
}

function safeHost(origin) {
  try { return new URL(origin).hostname } catch { return '' }
}

export default crearApp
