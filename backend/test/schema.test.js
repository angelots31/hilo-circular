import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { newDb, DataType } from 'pg-mem'

const sqlDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'sql')
const quitarExtensiones = (sql) => sql.replace(/CREATE EXTENSION[^;]*;/gi, '')

function crearBase() {
  const db = newDb()
  db.public.registerFunction({ name: 'gen_random_uuid', returns: DataType.uuid, implementation: () => crypto.randomUUID(), impure: true })
  db.public.registerFunction({ name: 'now', returns: DataType.timestamptz, implementation: () => new Date() })
  db.public.none(quitarExtensiones(fs.readFileSync(path.join(sqlDir, 'schema.sql'), 'utf8')))
  db.public.none(quitarExtensiones(fs.readFileSync(path.join(sqlDir, 'seed.sql'), 'utf8')))
  return db
}

test('el esquema y los datos de ejemplo cargan sin errores', () => {
  const db = crearBase()
  assert.equal(db.public.many('SELECT count(*)::int AS n FROM usuarios')[0].n, 9)
  assert.equal(db.public.many('SELECT count(*)::int AS n FROM prendas')[0].n, 14)
  assert.equal(db.public.many('SELECT count(*)::int AS n FROM intercambios')[0].n, 7)
  assert.equal(db.public.many('SELECT count(*)::int AS n FROM pedidos')[0].n, 6)
})

test('las relaciones entre tablas se resuelven', () => {
  const db = crearBase()
  const filas = db.public.many(
    "SELECT p.titulo, u.nombre, p.barrio FROM prendas p JOIN usuarios u ON u.id = p.dueno_id WHERE p.id = 'p1'",
  )
  assert.equal(filas.length, 1)
  assert.equal(filas[0].nombre, 'Valentina Ríos')
  assert.equal(filas[0].barrio, 'El Poblado')
})

test('los correos son únicos', () => {
  const db = crearBase()
  assert.throws(() =>
    db.public.none(
      "INSERT INTO usuarios (nombre, email, clave_hash) VALUES ('Otro', 'valentina@hilocircular.co', 'x')",
    ),
  )
})

test('las calificaciones fuera de 1..5 se rechazan', () => {
  const db = crearBase()
  assert.throws(() =>
    db.public.none(
      "INSERT INTO resenas (autor_id, para_id, estrellas, texto) VALUES ('u1', 'u2', 9, 'texto de prueba largo')",
    ),
  )
})
