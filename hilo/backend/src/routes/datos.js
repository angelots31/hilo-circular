import { Router } from 'express'
import { q } from '../db.js'
import { asincrono, camelizarFilas, usuarioSeguro } from '../util.js'

const router = Router()

// GET /api/datos  → carga inicial del frontend (público + datos de la sesión)
router.get('/', asincrono(async (req, res) => {
  const yo = req.usuario
  const esAdmin = yo?.rol === 'admin'

  const [prendas, usuarios, resenas] = await Promise.all([
    q('SELECT * FROM prendas ORDER BY creada DESC, id DESC'),
    esAdmin
      ? q('SELECT * FROM usuarios ORDER BY desde ASC')
      : q('SELECT * FROM usuarios ORDER BY desde ASC'),
    q('SELECT * FROM resenas ORDER BY fecha DESC, id DESC'),
  ])

  let pedidos = []
  let intercambios = []
  let reportes = []
  let favoritos = []
  let notificaciones = []

  if (esAdmin) {
    const [p, i, r, n] = await Promise.all([
      q('SELECT * FROM pedidos ORDER BY fecha DESC, id DESC'),
      q('SELECT * FROM intercambios ORDER BY fecha DESC, id DESC'),
      q('SELECT * FROM reportes ORDER BY fecha DESC, id DESC'),
      q('SELECT * FROM notificaciones WHERE usuario_id = $1 ORDER BY creada DESC', [yo.id]),
    ])
    pedidos = p.rows; intercambios = i.rows; reportes = r.rows; notificaciones = n.rows
  } else if (yo) {
    const [p, i, f, n] = await Promise.all([
      q('SELECT * FROM pedidos WHERE usuario_id = $1 OR receptor_id = $1 ORDER BY fecha DESC, id DESC', [yo.id]),
      q('SELECT * FROM intercambios WHERE solicitante_id = $1 OR receptor_id = $1 ORDER BY fecha DESC, id DESC', [yo.id]),
      q('SELECT prenda_id FROM favoritos WHERE usuario_id = $1', [yo.id]),
      q('SELECT * FROM notificaciones WHERE usuario_id = $1 ORDER BY creada DESC', [yo.id]),
    ])
    pedidos = p.rows; intercambios = i.rows; favoritos = f.rows.map((x) => x.prenda_id); notificaciones = n.rows
  } else {
    // Visitante: mostramos un par de envíos recientes como muestra del seguimiento.
    const p = await q('SELECT * FROM pedidos ORDER BY fecha DESC, id DESC LIMIT 3')
    pedidos = p.rows
  }

  res.json({
    usuarios: usuarios.rows.map((u) => usuarioSeguro(u, Boolean(esAdmin || (yo && yo.id === u.id)))),
    prendas: camelizarFilas(prendas.rows),
    resenas: camelizarFilas(resenas.rows),
    pedidos: camelizarFilas(pedidos),
    intercambios: camelizarFilas(intercambios),
    reportes: camelizarFilas(reportes),
    favoritos,
    notificaciones: camelizarFilas(notificaciones),
    usuario: yo ? usuarioSeguro(yo) : null,
  })
}))

/** Devuelve true si la prenda está protegida (tiene pedido o intercambio). */
export async function prendaProtegida(id) {
  const { rows } = await q(
    `SELECT EXISTS(SELECT 1 FROM pedidos WHERE prenda_id = $1) OR
            EXISTS(SELECT 1 FROM intercambios WHERE prenda_id = $1 OR ofrece_id = $1) AS protegida`,
    [id],
  )
  return rows[0]?.protegida === true
}

export default router
