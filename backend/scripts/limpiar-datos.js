import 'dotenv/config'
import pg from 'pg'

/**
 * Limpia la actividad de la plataforma para empezar a operar con datos reales.
 *   npm run db:limpiar           → conserva las cuentas de administración
 *   npm run db:limpiar -- --todo → elimina también todas las cuentas
 */
const todo = process.argv.includes('--todo')

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
  await cliente.query('BEGIN')

  await cliente.query(
    'TRUNCATE TABLE mensajes, reportes, pedidos, intercambios, resenas, favoritos, prendas, notificaciones, suscriptores RESTART IDENTITY CASCADE',
  )

  if (todo) {
    await cliente.query('TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE')
  } else {
    await cliente.query("DELETE FROM usuarios WHERE rol <> 'admin'")
  }

  await cliente.query('COMMIT')

  const { rows } = await cliente.query('SELECT count(*)::int AS n FROM usuarios')
  console.log('✔ Datos de prueba eliminados.')
  console.log(`  Cuentas restantes: ${rows[0].n}${todo ? ' (todas las cuentas fueron borradas)' : ' (solo administración)'}`)
  console.log('  El catálogo, las reseñas, los intercambios y los envíos quedaron vacíos.')
} catch (error) {
  await cliente.query('ROLLBACK').catch(() => {})
  console.error('✖ No pudimos limpiar la base:', error.message)
  process.exitCode = 1
} finally {
  await cliente.end()
}
