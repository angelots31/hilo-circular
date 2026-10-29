import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

/**
 * © 2026 angelots · Hilo Circular
 * Aplica la migración 002 y la semilla de telas.
 * Es repetible: no borra datos y se puede ejecutar varias veces.
 * Nunca corre schema.sql, que empieza con DROP TABLE ... CASCADE.
 */
const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const sqlDir = path.join(raiz, 'sql')

if (!process.env.DATABASE_URL) {
  console.error('✖ Falta DATABASE_URL en backend/.env.')
  process.exit(1)
}

const cliente = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
})

try {
  await cliente.connect()

  const migraciones = fs
    .readdirSync(path.join(sqlDir, 'migraciones'))
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const archivo of migraciones) {
    const sql = fs.readFileSync(path.join(sqlDir, 'migraciones', archivo), 'utf8')
    await cliente.query(sql)
    console.log(`✔ Migración aplicada: ${archivo}`)
  }

  const semilla = fs.readFileSync(path.join(sqlDir, 'seed-telas.sql'), 'utf8')
  await cliente.query(semilla)
  console.log('✔ Semilla de telas aplicada (13 fichas).')
} catch (error) {
  console.error('✖ No pudimos migrar la base de datos:', error.message)
  process.exitCode = 1
} finally {
  await cliente.end()
}
