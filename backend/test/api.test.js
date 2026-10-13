import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { newDb, DataType } from 'pg-mem'

process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto-de-pruebas'
process.env.CLOUDINARY_CLOUD_NAME = ''
process.env.CLOUDINARY_API_KEY = ''
process.env.CLOUDINARY_API_SECRET = ''

const { configurarPool } = await import('../src/db.js')
const { crearApp } = await import('../src/app.js')

const sqlDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'sql')
const limpiar = (sql) => sql.replace(/CREATE EXTENSION[^;]*;/gi, '')

const db = newDb()
db.public.registerFunction({ name: 'gen_random_uuid', returns: DataType.uuid, implementation: () => crypto.randomUUID(), impure: true })
db.public.registerFunction({ name: 'now', returns: DataType.timestamptz, implementation: () => new Date() })
db.public.none(limpiar(fs.readFileSync(path.join(sqlDir, 'schema.sql'), 'utf8')))
db.public.none(limpiar(fs.readFileSync(path.join(sqlDir, 'seed.sql'), 'utf8')))

const adaptador = db.adapters.createPg()
configurarPool(new adaptador.Pool())

const app = crearApp()
let servidor
let base

before(async () => {
  await new Promise((resolver) => {
    servidor = app.listen(0, () => {
      base = `http://127.0.0.1:${servidor.address().port}`
      resolver()
    })
  })
})
after(() => servidor?.close())

async function pedir(ruta, { method = 'GET', token, body } = {}) {
  const cabeceras = {}
  if (token) cabeceras.Authorization = `Bearer ${token}`
  if (body !== undefined) cabeceras['Content-Type'] = 'application/json'
  const res = await fetch(`${base}${ruta}`, { method, headers: cabeceras, body: body !== undefined ? JSON.stringify(body) : undefined })
  const texto = await res.text()
  return { estado: res.status, cuerpo: texto ? JSON.parse(texto) : null }
}

const entrar = async (email, clave = 'demo123') => {
  const { estado, cuerpo } = await pedir('/api/auth/login', { method: 'POST', body: { email, clave } })
  assert.equal(estado, 200, `login de ${email}`)
  return cuerpo.token
}

test('login correcto y rechazo de contraseña incorrecta', async () => {
  const ok = await pedir('/api/auth/login', { method: 'POST', body: { email: 'valentina@hilocircular.co', clave: 'demo123' } })
  assert.equal(ok.estado, 200)
  assert.ok(ok.cuerpo.token)

  const malo = await pedir('/api/auth/login', { method: 'POST', body: { email: 'valentina@hilocircular.co', clave: 'otra' } })
  assert.equal(malo.estado, 401)
})

test('GET /api/datos devuelve el catálogo y la sesión', async () => {
  const token = await entrar('valentina@hilocircular.co')
  const { estado, cuerpo } = await pedir('/api/datos', { token })
  assert.equal(estado, 200)
  assert.equal(cuerpo.prendas.length, 14)
  assert.equal(cuerpo.usuario.email, 'valentina@hilocircular.co')
  assert.ok(Array.isArray(cuerpo.favoritos))
})

test('publicar una prenda y marcarla como favorita', async () => {
  const token = await entrar('valentina@hilocircular.co')
  const crear = await pedir('/api/prendas', {
    method: 'POST',
    token,
    body: { titulo: 'Chaqueta de prueba automatizada', categoria: 'Chaquetas', talla: 'M', estado: 'Como nuevo', valor: 50, descripcion: 'Prenda creada por el test de integración.' },
  })
  assert.equal(crear.estado, 201)
  const id = crear.cuerpo.prenda.id

  const fav = await pedir(`/api/prendas/${id}/favorito`, { method: 'POST', token })
  assert.equal(fav.estado, 200)
  assert.equal(fav.cuerpo.activo, true)

  const datos = await pedir('/api/datos', { token })
  assert.ok(datos.cuerpo.favoritos.includes(id))
})

test('no se puede publicar sin sesión', async () => {
  const { estado } = await pedir('/api/prendas', { method: 'POST', body: { titulo: 'sin sesión', categoria: 'Chaquetas', talla: 'M' } })
  assert.equal(estado, 401)
})

test('flujo completo de intercambio: proponer, aceptar y crear envío', async () => {
  const valentina = await entrar('valentina@hilocircular.co')
  const mateo = await entrar('mateo@hilocircular.co')

  // Valentina ofrece p8 (suya) por p2 (de Mateo).
  const propuesta = await pedir('/api/intercambios', {
    method: 'POST', token: valentina,
    body: { prendaId: 'p2', ofreceId: 'p8', mensaje: 'Te ofrezco la falda plisada.' },
  })
  assert.equal(propuesta.estado, 201)
  const id = propuesta.cuerpo.intercambio.id
  assert.equal(propuesta.cuerpo.intercambio.estado, 'Pendiente')

  const aceptar = await pedir(`/api/intercambios/${id}/estado`, { method: 'PATCH', token: mateo, body: { estado: 'Aceptado' } })
  assert.equal(aceptar.estado, 200)
  assert.equal(aceptar.cuerpo.intercambio.estado, 'Aceptado')

  const envio = await pedir('/api/pedidos', {
    method: 'POST', token: valentina,
    body: { prendaId: 'p8', receptorId: 'u2', intercambioId: id, metodo: 'Domicilio', costo: 11900, transportadora: 'Servientrega' },
  })
  assert.equal(envio.estado, 201)
  assert.match(envio.cuerpo.pedido.guia, /^HC-/)
})

test('el receptor no puede cancelar (solo aceptar o rechazar)', async () => {
  // x1 la recibe Daniela (u8); quien recibe no puede cancelar.
  const daniela = await entrar('daniela@hilocircular.co')
  const { estado } = await pedir('/api/intercambios/x1/estado', { method: 'PATCH', token: daniela, body: { estado: 'Cancelado' } })
  assert.equal(estado, 403)
})

test('marcar reseña como útil', async () => {
  const { estado, cuerpo } = await pedir('/api/resenas/r2/util', { method: 'POST' })
  assert.equal(estado, 200)
  assert.equal(cuerpo.resena.util, 10)
})

test('registro de una cuenta nueva', async () => {
  const { estado, cuerpo } = await pedir('/api/auth/registro', {
    method: 'POST',
    body: { nombre: 'Persona Nueva', email: 'nueva@hilocircular.co', clave: 'clave123', barrio: 'Belén' },
  })
  assert.equal(estado, 201)
  assert.ok(cuerpo.token)
  assert.equal(cuerpo.usuario.barrio, 'Belén')

  const repetido = await pedir('/api/auth/registro', {
    method: 'POST',
    body: { nombre: 'Persona Nueva', email: 'nueva@hilocircular.co', clave: 'clave123' },
  })
  assert.equal(repetido.estado, 409)
})

test('admin: verificar usuario y resolver reportes', async () => {
  const admin = await entrar('admin@hilocircular.co')

  const verificar = await pedir('/api/usuarios/u3/verificado', { method: 'PATCH', token: admin })
  assert.equal(verificar.estado, 200)
  assert.equal(verificar.cuerpo.usuario.verificado, true)

  const datos = await pedir('/api/datos', { token: admin })
  assert.equal(datos.cuerpo.reportes.length, 4)
  assert.ok(datos.cuerpo.pedidos.length >= 6)

  const resolver = await pedir('/api/reportes/g1/estado', { method: 'PATCH', token: admin, body: { estado: 'Resuelto' } })
  assert.equal(resolver.estado, 200)
  assert.equal(resolver.cuerpo.reporte.estado, 'Resuelto')
})

test('un cliente no puede moderar', async () => {
  const valentina = await entrar('valentina@hilocircular.co')
  const { estado } = await pedir('/api/usuarios/u3/verificado', { method: 'PATCH', token: valentina })
  assert.equal(estado, 403)
})

test('la firma de Cloudinary avisa si no está configurado', async () => {
  const token = await entrar('valentina@hilocircular.co')
  const { estado, cuerpo } = await pedir('/api/uploads/firma', { token })
  assert.equal(estado, 500)
  assert.match(cuerpo.error, /Cloudinary/)
})
