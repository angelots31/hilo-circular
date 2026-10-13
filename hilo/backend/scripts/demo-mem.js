/**
 * Arranca la API con un PostgreSQL en memoria (pg-mem), sin instalar nada.
 * Útil para probar el frontend de punta a punta:
 *   node --watch src/index.js   → versión real con Postgres
 *   node scripts/demo-mem.js    → versión demo (datos de ejemplo, se reinician al cerrar)
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { newDb, DataType } from 'pg-mem'

const dir = path.dirname(fileURLToPath(import.meta.url))
const sqlDir = path.join(dir, '..', 'sql')

process.env.JWT_SECRET ||= 'demo-secreto-local'
process.env.PGSSL ||= 'false'

const db = newDb()
db.public.registerFunction({ name: 'gen_random_uuid', returns: DataType.uuid, implementation: () => crypto.randomUUID(), impure: true })
db.public.registerFunction({ name: 'now', returns: DataType.timestamptz, implementation: () => new Date() })

const quitarExtensiones = (sql) => sql.replace(/CREATE EXTENSION[^;]*;/gi, '')
db.public.none(quitarExtensiones(fs.readFileSync(path.join(sqlDir, 'schema.sql'), 'utf8')))
db.public.none(quitarExtensiones(fs.readFileSync(path.join(sqlDir, 'seed.sql'), 'utf8')))

const { configurarPool } = await import('../src/db.js')
configurarPool(new (db.adapters.createPg().Pool)())

const { crearApp } = await import('../src/app.js')
const puerto = Number(process.env.PORT) || 4000
crearApp().listen(puerto, () => {
  console.log(`Hilo Circular API (demo en memoria) en http://localhost:${puerto}`)
  console.log('Cuentas: valentina@hilocircular.co / admin@hilocircular.co · contraseña demo123')
})
