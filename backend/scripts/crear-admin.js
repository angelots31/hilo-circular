import 'dotenv/config'
import bcrypt from 'bcryptjs'
import pg from 'pg'

/** Lee `--clave valor` de la línea de comandos. */
function argumento(nombre) {
  const i = process.argv.indexOf(`--${nombre}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const nombre = String(argumento('nombre') || process.env.ADMIN_NOMBRE || '').trim()
const email = String(argumento('email') || process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const clave = String(argumento('clave') || process.env.ADMIN_CLAVE || '')

if (nombre.length < 3) {
  console.error('✖ Indica el nombre con --nombre "Nombre completo".')
  process.exit(1)
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('✖ Indica un correo válido con --email tu@correo.com.')
  process.exit(1)
}
if (clave.length < 8) {
  console.error('✖ La contraseña debe tener al menos 8 caracteres (--clave "...").')
  process.exit(1)
}
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
  const existente = await cliente.query('SELECT id FROM usuarios WHERE email = $1', [email])
  const hash = await bcrypt.hash(clave, 10)

  if (existente.rowCount) {
    await cliente.query(
      "UPDATE usuarios SET nombre = $2, clave_hash = $3, rol = 'admin', estado = 'activo', verificado = true WHERE email = $1",
      [email, nombre, hash],
    )
    console.log(`✔ La cuenta ${email} ya existía y quedó actualizada como administración.`)
  } else {
    await cliente.query(
      "INSERT INTO usuarios (nombre, email, clave_hash, rol, estado, verificado) VALUES ($1,$2,$3,'admin','activo',true)",
      [nombre, email, hash],
    )
    console.log(`✔ Cuenta de administración creada: ${email}`)
  }
} catch (error) {
  console.error('✖ No pudimos crear la cuenta:', error.message)
  process.exitCode = 1
} finally {
  await cliente.end()
}
