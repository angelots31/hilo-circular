import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const dir = path.dirname(fileURLToPath(import.meta.url))
const sqlDir = path.join(dir, '..', 'sql')

const url = process.env.DATABASE_URL
if (!url) {
  console.error('✖ Falta DATABASE_URL. Copia hilo/backend/.env.example a hilo/backend/.env y complétalo.')
  process.exit(1)
}

const cliente = new pg.Client({
  connectionString: url,
  ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
})

try {
  await cliente.connect()
  console.log('→ Conectado a PostgreSQL')

  for (const archivo of ['schema.sql', 'seed.sql']) {
    const sql = await fs.readFile(path.join(sqlDir, archivo), 'utf8')
    await cliente.query(sql)
    console.log(`✔ Ejecutado ${archivo}`)
  }

  const { rows } = await cliente.query('SELECT count(*)::int AS n FROM prendas')
  console.log(`✔ Base lista. Prendas de ejemplo: ${rows[0].n}`)
  console.log('  Cuentas demo → valentina@hilocircular.co / admin@hilocircular.co  (contraseña: demo123)')
} catch (error) {
  console.error('✖ Error al preparar la base de datos:', error.message)
  process.exitCode = 1
} finally {
  await cliente.end()
}
