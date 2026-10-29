import 'dotenv/config'
import bcrypt from 'bcryptjs'
import pg from 'pg'

/**
 * © 2026 angelots · Hilo Circular
 * Cambia la contraseña de una cuenta existente.
 * Sirve mientras no existe la recuperación por correo.
 *
 *   npm run clave:restablecer -- --email persona@correo.com --clave "NuevaClave123"
 */
function argumento(nombre) {
  const i = process.argv.indexOf(`--${nombre}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const email = String(argumento('email') || '').trim().toLowerCase()
const clave = String(argumento('clave') || '')

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('✖ Indica el correo con --email persona@correo.com.')
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
  const hash = await bcrypt.hash(clave, 10)
  // `clave_cambiada` invalida los tokens emitidos antes de este momento.
  const { rowCount } = await cliente.query(
    'UPDATE usuarios SET clave_hash = $2, clave_cambiada = now(), intentos_fallidos = 0, bloqueado_hasta = NULL WHERE email = $1',
    [email, hash],
  )
  if (!rowCount) {
    console.error(`✖ No encontramos una cuenta con el correo ${email}.`)
    process.exitCode = 1
  } else {
    console.log(`✔ Contraseña actualizada para ${email}.`)
  }
} catch (error) {
  console.error('✖ No pudimos cambiar la contraseña:', error.message)
  process.exitCode = 1
} finally {
  await cliente.end()
}
