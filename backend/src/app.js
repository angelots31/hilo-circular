import express from 'express'
import cors from 'cors'

import { authOpcional } from './auth.js'
import { probarConexion } from './db.js'
import authRoutes from './routes/auth.js'
import datosRoutes from './routes/datos.js'
import prendasRoutes from './routes/prendas.js'
import usuariosRoutes from './routes/usuarios.js'
import comunidadRoutes from './routes/comunidad.js'
import uploadsRoutes from './routes/uploads.js'

export function crearApp() {
  const app = express()
  app.disable('x-powered-by')

  const origenes = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  app.use(cors({
    origin: (origin, cb) => {
      // Sin origen (curl/Postman), listado en CORS_ORIGIN, *.vercel.app o
      // cualquier localhost/127.0.0.1 (el puerto de Vite puede variar).
      const local = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '')
      if (!origin || local || origenes.includes(origin) || /\.vercel\.app$/.test(safeHost(origin))) return cb(null, true)
      cb(null, origenes.length === 0)
    },
  }))
  app.use(express.json({ limit: '2mb' }))

  app.use('/api', authOpcional)

  app.get('/api/salud', async (_req, res) => {
    try {
      const ahora = await probarConexion()
      res.json({ ok: true, baseDatos: 'conectada', ahora })
    } catch (error) {
      res.status(503).json({ ok: false, baseDatos: 'sin conexión', detalle: error.message })
    }
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/datos', datosRoutes)
  app.use('/api/prendas', prendasRoutes)
  app.use('/api/usuarios', usuariosRoutes)
  app.use('/api', comunidadRoutes)
  app.use('/api/uploads', uploadsRoutes)

  app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }))

  app.use((error, _req, res, _next) => {
    const estado = error.estado || 500
    if (estado >= 500) console.error('[error]', error)
    res.status(estado).json({ error: error.message || 'Error interno del servidor.' })
  })

  return app
}

function safeHost(origin) {
  try { return new URL(origin).hostname } catch { return '' }
}

export default crearApp
