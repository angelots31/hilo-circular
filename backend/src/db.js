import pg from 'pg'

// El frontend espera fechas como texto ('YYYY-MM-DD') y números (no strings).
pg.types.setTypeParser(1082, (v) => v) // date
pg.types.setTypeParser(1700, (v) => Number(v)) // numeric
pg.types.setTypeParser(20, (v) => Number(v)) // bigint

const usaSSL = process.env.PGSSL !== 'false'

let pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: usaSSL ? { rejectUnauthorized: false } : false,
  max: 10,
})

/** Permite inyectar otro pool (pruebas con un Postgres en memoria). */
export function configurarPool(nuevo) { pool = nuevo }

/** Atajo de consulta. */
export const q = (text, params) => pool.query(text, params)

/** Ejecuta varias consultas dentro de una transacción. */
export async function tx(fn) {
  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    const resultado = await fn(cliente)
    await cliente.query('COMMIT')
    return resultado
  } catch (error) {
    await cliente.query('ROLLBACK')
    throw error
  } finally {
    cliente.release()
  }
}

export async function probarConexion() {
  const { rows } = await pool.query('SELECT now() AS ahora')
  return rows[0].ahora
}
