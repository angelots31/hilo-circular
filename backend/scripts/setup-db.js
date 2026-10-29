import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const dir = path.dirname(fileURLToPath(import.meta.url))
const sqlDir = path.join(dir, '..', 'sql')
const conDemo = process.argv.includes('--demo')

const url = process.env.DATABASE_URL
if (!url) {
  console.error('✖ Falta DATABASE_URL. Copia backend/.env.example a backend/.env y complétalo.')
  process.exit(1)
}

const cliente = new pg.Client({
  connectionString: url,
  ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
})

try {
  await cliente.connect()
  console.log('→ Conectado a PostgreSQL')

  // El esquema se recrea desde cero; después la base queda limpia.
  await cliente.query(await fs.readFile(path.join(sqlDir, 'schema.sql'), 'utf8'))
  console.log('✔ Esquema creado')

  // La wiki de telas es contenido del producto, no dato de demostración.
  await cliente.query(await fs.readFile(path.join(sqlDir, 'seed-telas.sql'), 'utf8'))
  console.log('✔ Wiki de telas cargada (13 fichas)')

  if (conDemo) {
    await cliente.query(await fs.readFile(path.join(sqlDir, 'seed-demo.sql'), 'utf8'))
    console.log('✔ Datos de demostración cargados (solo para pruebas locales)')
    console.log('  Cuentas demo → valentina@hilocircular.co / admin@hilocircular.co  (contraseña: demo123)')
  } else {
    const { rows } = await cliente.query('SELECT count(*)::int AS n FROM usuarios')
    console.log(`✔ Base lista y vacía. Cuentas registradas: ${rows[0].n}`)
    console.log('  Crea la primera cuenta de administración con:')
    console.log('  npm run admin:crear -- --email tu@correo.com --clave "una-clave-segura" --nombre "Tu nombre"')
  }
} catch (error) {
  console.error('✖ Error al preparar la base de datos:', error.message)
  process.exitCode = 1
} finally {
  await cliente.end()
}
