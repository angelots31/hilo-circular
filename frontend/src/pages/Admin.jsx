import { useMemo, useState } from 'react'
import DetallePrenda from '../components/DetallePrenda.jsx'
import PanelShell from '../components/PanelShell.jsx'
import Mascot from '../components/Mascot.jsx'
import PrendaMini from '../components/PrendaMini.jsx'
import {
  Aparece, Avatar, Barra, Barras, Boton, Campo, Dato, Dona, Entrada, EstadoVacio,
  Estrellas, Etiqueta, Pestanas, Selector,
} from '../components/ui.jsx'
import { navigate } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'
import { descargarCSV, descargarPDF, parsearCSV } from '../lib/descargas.js'
import { copiarTexto } from '../lib/compartir.js'

const SECCIONES = [
  { valor: 'resumen', texto: 'Resumen', icono: 'resumen' },
  { valor: 'prendas', texto: 'Prendas', icono: 'prendas' },
  { valor: 'usuarios', texto: 'Usuarios', icono: 'usuarios' },
  { valor: 'envios', texto: 'Envíos', icono: 'envios' },
  { valor: 'resenas', texto: 'Reseñas', icono: 'resenas' },
  { valor: 'reportes', texto: 'Reportes', icono: 'reportes' },
  { valor: 'configuracion', texto: 'Configuración', icono: 'configuracion' },
]

const CLAVES_GRAFICA = [
  { clave: 'prendas', etiqueta: 'Prendas publicadas', color: '#6872aa' },
  { clave: 'intercambios', etiqueta: 'Intercambios', color: '#5d4655' },
  { clave: 'envios', etiqueta: 'Envíos', color: '#e5c4c6' },
]

export default function Admin({ seccion = 'resumen' }) {
  const {
    usuario, prendas, usuarios, pedidos, resenas, intercambios, reportes, buscarUsuario, buscarPrenda,
    fecha, precio, destacar, eliminarPrenda, alternarDisponible, moverPedido, resolverReporte,
    marcarResena, suspenderUsuario, verificarUsuario, avisar, importarPrendas, notificaciones, escaneosQr,
  } = useStore()

  const [vista, setVista] = useState(SECCIONES.some((s) => s.valor === seccion) ? seccion : 'resumen')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroEnvios, setFiltroEnvios] = useState('todos')
  const [filtroResenas, setFiltroResenas] = useState('todas')
  const [filtroReportes, setFiltroReportes] = useState('abiertos')
  const [detallePrenda, setDetallePrenda] = useState(null)
  const [config, setConfig] = useState(() => {
    const base = { verificacionObligatoria: false, envioGratisPunto: true, moderacionAuto: true, limitePublicaciones: '20' }
    try { return { ...base, ...JSON.parse(localStorage.getItem('hilo-admin-config') || '{}') } } catch { return base }
  })

  const cambiar = (valor) => {
    setVista(valor)
    navigate(`/admin/${valor}`)
  }

  const ingresos = pedidos.reduce((s, p) => s + p.costo, 0)
  const pendientes = intercambios.filter((x) => x.estado === 'Pendiente').length
  const activos = usuarios.filter((u) => u.estado === 'activo').length
  const promedio = resenas.length ? resenas.reduce((s, r) => s + r.estrellas, 0) / resenas.length : 0
  const notificacionesAdmin = notificaciones

  // Series reales para el panel: se calculan con los registros de la API.
  const actividadReal = useMemo(() => {
    const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const hoy = new Date()
    const meses = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - (6 - i), 1)
      return { mes: MESES[d.getMonth()], clave: `${d.getFullYear()}-${d.getMonth()}`, prendas: 0, intercambios: 0, envios: 0 }
    })
    const indice = new Map(meses.map((m, i) => [m.clave, i]))
    const sumar = (fechaValor, campo) => {
      if (!fechaValor) return
      const d = new Date(String(fechaValor).includes('T') ? fechaValor : `${fechaValor}T12:00:00`)
      if (Number.isNaN(d.getTime())) return
      const i = indice.get(`${d.getFullYear()}-${d.getMonth()}`)
      if (i != null) meses[i][campo] += 1
    }
    prendas.forEach((p) => sumar(p.creada, 'prendas'))
    intercambios.forEach((x) => sumar(x.fecha, 'intercambios'))
    pedidos.forEach((p) => sumar(p.fecha, 'envios'))
    return meses
  }, [prendas, intercambios, pedidos])

  const categoriaReal = useMemo(() => {
    const total = prendas.length || 1
    const conteo = new Map()
    prendas.forEach((p) => conteo.set(p.categoria, (conteo.get(p.categoria) ?? 0) + 1))
    return [...conteo.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([nombre, cantidad]) => ({ nombre, valor: Math.round((cantidad / total) * 100) }))
  }, [prendas])

  const saludComunidad = useMemo(() => {
    const totalIntercambios = intercambios.length || 1
    const totalEnvios = pedidos.length || 1
    const totalResenas = resenas.length || 1
    const porcentaje = (cantidad, total) => Math.round((cantidad / total) * 100)
    return [
      { texto: 'Intercambios completados', valor: porcentaje(intercambios.filter((x) => x.estado === 'Completado').length, totalIntercambios) },
      { texto: 'Solicitudes ya respondidas', valor: porcentaje(intercambios.filter((x) => x.estado !== 'Pendiente').length, totalIntercambios) },
      { texto: 'Envíos entregados', valor: porcentaje(pedidos.filter((p) => p.estado === 'Entregado').length, totalEnvios) },
      { texto: 'Reseñas de 4 o 5 estrellas', valor: porcentaje(resenas.filter((r) => r.estrellas >= 4).length, totalResenas) },
    ]
  }, [intercambios, pedidos, resenas])

  const cargarCSVPrendas = async (evento) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return
    if (!archivo.name.toLowerCase().endsWith('.csv')) return avisar('Selecciona un archivo .csv.', 'aviso')
    try {
      const registros = parsearCSV(await archivo.text())
      const normalizar = (valor) => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
      const valorDe = (fila, ...claves) => {
        const entrada = Object.entries(fila).find(([k]) => claves.includes(normalizar(k)))
        return entrada?.[1] ?? ''
      }
      const candidatas = registros.map((fila) => {
        const titulo = valorDe(fila, 'prenda', 'titulo', 'nombre', 'nombre de prenda').trim()
        if (!titulo) return null
        const duenoNombre = valorDe(fila, 'dueno', 'dueño', 'propietario', 'vendedor').trim()
        const dueno = usuarios.find((u) => normalizar(u.nombre) === normalizar(duenoNombre))
        const categoria = valorDe(fila, 'categoria') || 'Accesorios'
        const calidadCsv = valorDe(fila, 'calidad', 'condicion', 'condición')
        const estadoCsv = valorDe(fila, 'estado')
        const disponibleCsv = normalizar(valorDe(fila, 'disponibilidad', 'disponible'))
        const duenoId = dueno?.id || usuarios.find((u) => u.rol !== 'admin' && u.estado === 'activo')?.id || usuario?.id
        if (!duenoId) return null
        const estado = ['nuevo con etiqueta', 'como nuevo', 'buen estado', 'con detalles'].includes(normalizar(calidadCsv || estadoCsv)) ? (calidadCsv || estadoCsv) : 'Buen estado'
        const valor = Number(String(valorDe(fila, 'valor estimado', 'valor', 'precio')).replace(/[^0-9,.-]/g, '').replace(/\.(?=.*\.)/g, '').replace(',', '.'))
        return {
          titulo, categoria, talla: valorDe(fila, 'talla') || 'Única', estado,
          marca: valorDe(fila, 'marca') || '', color: valorDe(fila, 'color') || 'Sin especificar',
          valor: Number.isFinite(valor) && valor >= 0 ? valor : 0,
          descripcion: valorDe(fila, 'descripcion', 'descripción') || 'Prenda importada desde el catálogo CSV.',
          tipo: ({ Calzado: 'zapatillas', Chaquetas: 'chaqueta', Vestidos: 'vestido', Pantalones: 'pantalon', Faldas: 'falda', Abrigos: 'abrigo', Punto: 'sueter', Accesorios: 'bolso' })[categoria] || 'camiseta',
          paleta: ['#6872aa', '#5d4655'], ciudad: 'Medellín',
          duenoId,
          disponible: !['pausada', 'no', 'false', '0', 'inactiva'].includes(normalizar(disponibleCsv || estadoCsv)),
          destacada: ['si', 'sí', 'true', '1', 'destacada'].includes(normalizar(valorDe(fila, 'destacada'))),
        }
      }).filter(Boolean)
      if (!candidatas.length) return avisar('El CSV no tiene filas con una columna Prenda, Título o Nombre.', 'aviso')
      importarPrendas(candidatas)
      avisar(`Se importaron ${candidatas.length} prendas. La ciudad se asignó a Medellín.`, 'ok')
    } catch (error) {
      avisar(`No pudimos leer el CSV: ${error?.message || 'formato inválido'}.`, 'aviso')
    }
  }

  const filasPDFPrendas = (lista) => lista.map((p) => [p.id, p.titulo, buscarUsuario(p.duenoId)?.nombre ?? 'Sin asignar', p.categoria, p.talla, p.valor, p.disponible ? 'Disponible' : 'Pausada', p.destacada ? 'Sí' : 'No', 'Medellín'])

  const detalleActual = detallePrenda ? prendas.find((p) => p.id === detallePrenda.id) ?? detallePrenda : null

  const prendasFiltradas = useMemo(() => {
    const t = busqueda.trim().toLowerCase()
    return prendas.filter((p) => {
      if (filtroEstado !== 'todos') {
        if (filtroEstado === 'disponibles' && !p.disponible) return false
        if (filtroEstado === 'pausadas' && p.disponible) return false
        if (filtroEstado === 'destacadas' && !p.destacada) return false
      }
      if (!t) return true
      return [p.titulo, p.categoria, p.ciudad, p.marca, buscarUsuario(p.duenoId)?.nombre].join(' ').toLowerCase().includes(t)
    })
  }, [prendas, busqueda, filtroEstado, buscarUsuario])

  return (
    <PanelShell
      ceja="Administración"
      titulo={`Hola, ${usuario?.nombre?.split(' ')[0] ?? 'administrador'}`}
      texto="Vista de administración · Moderación de catálogo, usuarios, envíos y comunidad."
      mostrarEncabezado={vista === 'resumen'}
      tituloSeccion={SECCIONES.find((s) => s.valor === vista)?.texto ?? 'Administración'}
      textoSeccion={{ prendas: 'Modera las publicaciones y la disponibilidad del catálogo.', usuarios: 'Revisa los perfiles y el acceso de la comunidad.', envios: 'Supervisa guías, entregas e incidencias.', resenas: 'Modera las opiniones de la comunidad.', reportes: 'Prioriza y resuelve los reportes abiertos.', configuracion: 'Ajusta las reglas de la comunidad.' }[vista] ?? ''}
      notificaciones={notificacionesAdmin}
      usuarioId={usuario?.id}
      secciones={SECCIONES}
      vista={vista}
      onCambiar={cambiar}
      insignias={{ reportes: reportes.filter((r) => r.estado !== 'Resuelto').length }}
      usuarioNombre={usuario?.nombre ?? 'Administrador'}
      rol="Administrador"
    >
          <div>
            {vista === 'resumen' && (
              <>
                <div className="datos-rejilla">
                  <Dato etiqueta="Prendas publicadas" valor={prendas.length} nota="En todo el catálogo" />
                  <Dato etiqueta="Intercambios activos" valor={intercambios.length} nota={`${pendientes} sin responder`} />
                  <Dato etiqueta="Envíos registrados" valor={pedidos.length} nota={`Ingresos ${precio(ingresos)}`} />
                  <Dato etiqueta="Usuarios activos" valor={activos} nota={`${usuarios.length} registrados`} />
                  <Dato
                    etiqueta="Escaneos del QR"
                    valor={escaneosQr?.hoy ?? 0}
                    nota={`${escaneosQr?.total ?? 0} desde el inicio`}
                  />
                </div>

                <div className="datos-rejilla admin-envios-resumen">
                  <Dato etiqueta="En camino" valor={pedidos.filter((p) => p.estado === 'En camino').length} nota="Seguimiento activo" />
                  <Dato etiqueta="Preparando" valor={pedidos.filter((p) => p.estado === 'Preparando').length} nota="Pendientes de salida" />
                  <Dato etiqueta="Entregados" valor={pedidos.filter((p) => p.estado === 'Entregado').length} nota="Entrega confirmada" />
                  <Dato etiqueta="Con incidencia" valor={pedidos.filter((p) => p.estado === 'Incidencia').length} nota="Requieren gestión" />
                </div>

                <div className="rejilla dos">
                  <article className="panel-tarjeta">
                    <h3>Actividad de los últimos siete meses</h3>
                    <p>Publicaciones, intercambios y envíos registrados por mes.</p>
                    <Barras datos={actividadReal} claves={CLAVES_GRAFICA} />
                  </article>

                  <article className="panel-tarjeta">
                    <h3>Catálogo por categoría</h3>
                    <p>Participación de cada categoría dentro del catálogo activo.</p>
                    <Dona datos={categoriaReal} total={prendas.length} etiqueta="prendas" />
                  </article>

                  <article className="panel-tarjeta">
                    <h3>Salud de la comunidad</h3>
                    <p>Indicadores que revisamos cada semana.</p>
                    <div style={{ display: 'grid', gap: '0.9rem' }}>
                      {saludComunidad.map((k, i) => (
                        <div key={k.texto} style={{ display: 'grid', gap: '0.35rem' }}>
                          <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span>{k.texto}</span>
                            <b>{k.valor}%</b>
                          </span>
                          <Barra valor={k.valor} tono={i === 3 ? 'rosa' : 'lavanda'} titulo={`${k.texto}: ${k.valor}%`} />
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="panel-tarjeta">
                    <h3>Pendientes del equipo</h3>
                    <p>Acciones de moderación que conviene resolver hoy.</p>
                    <ul className="lista-tareas">
                      <li className={reportes.some((r) => r.estado === 'En revisión') ? '' : 'hecho'}>
                        <span aria-hidden="true">{reportes.some((r) => r.estado === 'En revisión') ? '○' : '✓'}</span>
                        {reportes.filter((r) => r.estado === 'En revisión').length} reportes en revisión
                      </li>
                      <li className={resenas.some((r) => r.reportada) ? '' : 'hecho'}>
                        <span aria-hidden="true">{resenas.some((r) => r.reportada) ? '○' : '✓'}</span>
                        {resenas.filter((r) => r.reportada).length} reseñas marcadas
                      </li>
                      <li className={usuarios.some((u) => u.estado === 'suspendido') ? '' : 'hecho'}>
                        <span aria-hidden="true">{usuarios.some((u) => u.estado === 'suspendido') ? '○' : '✓'}</span>
                        {usuarios.filter((u) => u.estado === 'suspendido').length} cuentas suspendidas
                      </li>
                      <li className={pedidos.some((p) => p.estado === 'Incidencia') ? '' : 'hecho'}>
                        <span aria-hidden="true">{pedidos.some((p) => p.estado === 'Incidencia') ? '○' : '✓'}</span>
                        {pedidos.filter((p) => p.estado === 'Incidencia').length} envíos con incidencia
                      </li>
                    </ul>
                    <Boton tamano="sm" variante="fantasma" style={{ marginTop: '1rem' }} onClick={() => cambiar('reportes')}>
                      Ir a reportes
                    </Boton>
                  </article>

                  <article className="panel-tarjeta">
                    <h3>Resumen editorial</h3>
                    <p>Mensaje del día para la comunidad.</p>
                    <p style={{ fontSize: '0.95rem' }}>
                      Hoy publicamos <b>{prendas.filter((p) => p.destacada).length} prendas destacadas</b> y la valoración
                      promedio de la plataforma está en <b>{promedio.toFixed(1).replace('.', ',')}</b> sobre 5.
                    </p>
                    <div style={{ display: 'grid', placeItems: 'center', marginTop: '0.8rem' }}>
                      <Mascot pose="saluda" style={{ width: 'min(200px, 48vw)' }} />
                    </div>
                  </article>
                </div>
              </>
            )}

            {vista === 'prendas' && (
              <>
                <div className="panel-cabeza admin-prendas-cabeza">
                  <div>
                    <h2>Prendas del catálogo</h2>
                    <p>{prendasFiltradas.length} prendas en la vista actual · catálogo local de Medellín</p>
                  </div>
                  <div className="admin-datos-acciones">
                    <label className="boton fantasma md admin-importar-label" htmlFor="admin-importar-prendas-csv" tabIndex={0} role="button" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('admin-importar-prendas-csv')?.click() } }}><span aria-hidden="true">↑</span><span>Importar CSV</span></label>
                    <input id="admin-importar-prendas-csv" className="admin-input-archivo" type="file" accept=".csv,text/csv" onChange={cargarCSVPrendas} />
                    <Boton variante="fantasma" onClick={() => descargarCSV('hilo-circular-catalogo', ['ID', 'Prenda', 'Dueño', 'Categoría', 'Valor estimado', 'Ciudad', 'Calidad', 'Disponibilidad', 'Destacada', 'Talla', 'Marca', 'Color', 'Descripción'], prendasFiltradas.map((p) => [p.id, p.titulo, buscarUsuario(p.duenoId)?.nombre, p.categoria, p.valor, 'Medellín', p.estado, p.disponible ? 'Disponible' : 'Pausada', p.destacada ? 'Sí' : 'No', p.talla, p.marca, p.color, p.descripcion]))}>Exportar CSV</Boton>
                    <Boton variante="fantasma" onClick={() => descargarPDF('hilo-circular-catalogo', 'Catálogo de prendas · Medellín', ['ID', 'Prenda', 'Dueño', 'Categoría', 'Talla', 'Valor', 'Disponibilidad', 'Destacada', 'Ciudad'], filasPDFPrendas(prendasFiltradas))}>Descargar PDF</Boton>
                    <Boton onClick={() => { const candidatas = prendas.filter((p) => p.disponible).sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 3); const seleccionadas = new Set(candidatas.map((p) => p.id)); prendas.forEach((p) => { if (Boolean(p.destacada) !== seleccionadas.has(p.id)) destacar(p.id) }); avisar(`Curaduría aplicada: ${candidatas.length} prendas disponibles quedaron destacadas por actividad.`, 'ok') }}>Aplicar curaduría</Boton>
                  </div>
                </div>

                <div className="filtros" style={{ marginBottom: '1.4rem' }}>
                  <div className="filtros-fila">
                    <Campo etiqueta="Buscar prenda" id="buscar-prenda">
                      <Entrada id="buscar-prenda" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Título, marca, ciudad o dueño" />
                    </Campo>
                    <Campo etiqueta="Estado" id="filtro-prenda">
                      <Selector id="filtro-prenda" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                        <option value="todos">Todas</option>
                        <option value="disponibles">Disponibles</option>
                        <option value="pausadas">Pausadas</option>
                        <option value="destacadas">Destacadas</option>
                      </Selector>
                    </Campo>
                  </div>
                </div>

                {prendasFiltradas.length === 0 ? (
                  <EstadoVacio pose="duerme" titulo="Sin resultados" texto="No hay prendas que coincidan con esta búsqueda." accion={<Boton onClick={() => { setBusqueda(''); setFiltroEstado('todos') }}>Limpiar búsqueda</Boton>} />
                ) : (
                  <div className="tabla-envoltorio">
                    <table className="tabla">
                      <thead>
                        <tr>
                          <th>Prenda</th>
                          <th>Dueño</th>
                          <th>Categoría</th>
                          <th>Valor</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prendasFiltradas.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <div className="celda-prenda">
                                <PrendaMini prenda={p} tamano="xs" onClick={() => setDetallePrenda(p)} />
                                <span>
                                  <b>{p.titulo}</b>
                                  <small>{fecha(p.creada)} · {p.ciudad}</small>
                                </span>
                              </div>
                            </td>
                            <td>{buscarUsuario(p.duenoId)?.nombre}</td>
                            <td>{p.categoria}</td>
                            <td>{p.valor}</td>
                            <td>
                              <div className="chips">
                                <Etiqueta tono={p.disponible ? 'verde' : 'neutro'}>{p.disponible ? 'Disponible' : 'Pausada'}</Etiqueta>
                                {p.destacada && <Etiqueta tono="destacada">Destacada</Etiqueta>}
                              </div>
                            </td>
                            <td>
                              <div className="acciones-celda">
                                <Boton className="mini" onClick={() => setDetallePrenda(p)}>Detalle</Boton>
                                <Boton className="mini" variante="fantasma" onClick={() => destacar(p.id)}>
                                  {p.destacada ? 'Quitar' : 'Destacar'}
                                </Boton>
                                <Boton className="mini" variante="fantasma" onClick={() => alternarDisponible(p.id)}>
                                  {p.disponible ? 'Pausar' : 'Activar'}
                                </Boton>
                                <Boton className="mini" variante="texto" onClick={() => eliminarPrenda(p.id)}>Retirar</Boton>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {vista === 'usuarios' && (
              <>
                <div className="panel-cabeza">
                  <div>
                    <h2 style={{ fontSize: '1.7rem' }}>Usuarios de la comunidad</h2>
                    <p>{usuarios.length} cuentas · {activos} activas</p>
                  </div>
                  <div className="admin-datos-acciones">
                    <Boton variante="fantasma" onClick={() => descargarCSV('hilo-circular-usuarios', ['ID', 'Nombre', 'Correo', 'Ciudad', 'Reputación', 'Intercambios', 'Estado', 'Verificado', 'Rol'], usuarios.map((u) => [u.id, u.nombre, u.email, 'Medellín', u.reputacion, u.intercambios, u.estado, u.verificado ? 'Sí' : 'No', u.rol]))}>Exportar CSV</Boton>
                    <Boton variante="fantasma" onClick={() => descargarPDF('hilo-circular-usuarios', 'Usuarios de Hilo Circular · Medellín', ['ID', 'Nombre', 'Correo', 'Ciudad', 'Reputación', 'Intercambios', 'Estado', 'Verificado', 'Rol'], usuarios.map((u) => [u.id, u.nombre, u.email, 'Medellín', u.reputacion, u.intercambios, u.estado, u.verificado ? 'Sí' : 'No', u.rol]))}>Descargar PDF</Boton>
                    <Boton variante="fantasma" onClick={() => descargarCSV('hilo-circular-verificaciones', ['Nombre', 'Correo', 'Barrio', 'Desde'], usuarios.filter((u) => !u.verificado && u.estado === 'activo').map((u) => [u.nombre, u.email, u.barrio, fecha(u.desde)]))}>Exportar pendientes</Boton>
                  </div>
                </div>

                <div className="tabla-envoltorio">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Persona</th>
                        <th>Ciudad</th>
                        <th>Reputación</th>
                        <th>Intercambios</th>
                        <th>Desde</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
                              <Avatar nombre={u.nombre} tamano={36} />
                              <span>
                                <b>{u.nombre}</b>
                                <br />
                                <small style={{ opacity: 0.7 }}>{u.email}</small>
                              </span>
                            </div>
                          </td>
                          <td>{u.ciudad}</td>
                          <td><Estrellas valor={Math.round(Number(u.reputacion))} tamano={13} /> <small>{Number(u.reputacion).toFixed(1).replace('.', ',')}</small></td>
                          <td>{u.intercambios}</td>
                          <td>{fecha(u.desde)}</td>
                          <td>
                            <div className="chips">
                              <Etiqueta tono={u.estado === 'activo' ? 'verde' : 'rojo'}>{u.estado}</Etiqueta>
                              {u.rol === 'admin' && <Etiqueta tono="lavanda">Admin</Etiqueta>}
                            </div>
                          </td>
                          <td>
                            <div className="acciones-celda">
                              <Boton className="mini" variante="fantasma" onClick={() => verificarUsuario(u.id)}>
                                {u.verificado ? 'Quitar verificación' : 'Verificar'}
                              </Boton>
                              {u.rol !== 'admin' && (
                                <Boton className="mini" variante="texto" onClick={() => suspenderUsuario(u.id)}>
                                  {u.estado === 'activo' ? 'Suspender' : 'Reactivar'}
                                </Boton>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {vista === 'envios' && (
              <>
                <div className="panel-cabeza">
                  <div>
                    <h2 style={{ fontSize: '1.7rem' }}>Envíos y domicilios</h2>
                    <p>{pedidos.length} envíos registrados · ingresos acumulados {precio(ingresos)}</p>
                  </div>
                  <div className="chips">
                    <Pestanas
                      items={[
                        { valor: 'todos', texto: 'Todos' },
                        { valor: 'activos', texto: 'En curso' },
                        { valor: 'entregados', texto: 'Entregados' },
                      ]}
                      activo={filtroEnvios}
                      onChange={setFiltroEnvios}
                    />
                  </div>
                </div>

                <div className="admin-datos-acciones admin-exportacion-envios">
                  <Boton variante="fantasma" onClick={() => descargarCSV('hilo-circular-envios', ['Guía', 'Prenda', 'Origen', 'Destino', 'Transportadora', 'Costo', 'Estado', 'Ciudad'], pedidos.map((p) => [p.guia, buscarPrenda(p.prendaId)?.titulo, 'Medellín', 'Medellín', p.transportadora, p.costo, p.estado, 'Medellín']))}>Exportar CSV</Boton>
                  <Boton variante="fantasma" onClick={() => descargarPDF('hilo-circular-envios', 'Envíos y domicilios · Medellín', ['Guía', 'Prenda', 'Origen', 'Destino', 'Transportadora', 'Costo', 'Estado'], pedidos.map((p) => [p.guia, buscarPrenda(p.prendaId)?.titulo, 'Medellín', 'Medellín', p.transportadora, p.costo, p.estado]))}>Descargar PDF</Boton>
                </div>

                <div className="datos-rejilla">
                  <Dato etiqueta="En camino" valor={pedidos.filter((p) => p.estado === 'En camino').length} />
                  <Dato etiqueta="Preparando" valor={pedidos.filter((p) => p.estado === 'Preparando').length} />
                  <Dato etiqueta="Entregados" valor={pedidos.filter((p) => p.estado === 'Entregado').length} />
                  <Dato etiqueta="Con incidencia" valor={pedidos.filter((p) => p.estado === 'Incidencia').length} nota="Requieren gestión" />
                </div>

                <div className="tabla-envoltorio">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Guía</th>
                        <th>Prenda</th>
                        <th>Origen → destino</th>
                        <th>Transportadora</th>
                        <th>Costo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos
                        .filter((p) => {
                          if (filtroEnvios === 'activos') return p.estado !== 'Entregado'
                          if (filtroEnvios === 'entregados') return p.estado === 'Entregado'
                          return true
                        })
                        .map((p) => {
                          const prenda = buscarPrenda(p.prendaId)
                          return (
                            <tr key={p.id}>
                              <td><b>{p.guia}</b><br /><small style={{ opacity: 0.7 }}>{fecha(p.fecha)}</small></td>
                              <td>
                                <div className="celda-prenda">
                                  <PrendaMini prenda={prenda} tamano="xs" onClick={() => prenda && setDetallePrenda(prenda)} />
                                  <span>
                                    <b>{prenda?.titulo ?? 'Prenda'}</b>
                                    <small>{prenda?.categoria ?? 'Sin categoría'}</small>
                                  </span>
                                </div>
                              </td>
                              <td>{prenda?.ciudad} → {buscarUsuario(p.receptorId)?.ciudad}</td>
                              <td>{p.transportadora}</td>
                              <td>{precio(p.costo)}</td>
                              <td>
                                <Etiqueta tono={p.estado === 'Entregado' ? 'verde' : p.estado === 'Incidencia' ? 'rojo' : 'ambar'}>
                                  {p.estado}
                                </Etiqueta>
                              </td>
                              <td>
                                <div className="acciones-celda">
                                  <Boton className="mini" variante="fantasma" onClick={() => prenda && setDetallePrenda(prenda)}>
                                    Ver prenda
                                  </Boton>
                                  {['Preparando', 'En camino', 'Entregado'].map((estado) => (
                                    <Boton
                                      key={estado}
                                      className="mini"
                                      variante={p.estado === estado ? 'lavanda' : 'fantasma'}
                                      onClick={() => moverPedido(p.id, estado)}
                                    >
                                      {estado}
                                    </Boton>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {vista === 'resenas' && (
              <>
                <div className="panel-cabeza">
                  <div>
                    <h2 style={{ fontSize: '1.7rem' }}>Moderación de reseñas</h2>
                    <p>{resenas.length} reseñas · promedio {promedio.toFixed(1).replace('.', ',')} · {resenas.filter((r) => r.reportada).length} marcadas</p>
                  </div>
                  <Pestanas
                    items={[
                      { valor: 'todas', texto: 'Todas' },
                      { valor: 'reportadas', texto: 'Reportadas' },
                      { valor: 'respondidas', texto: 'Respondidas' },
                      { valor: 'sin-respuesta', texto: 'Sin respuesta' },
                    ]}
                    activo={filtroResenas}
                    onChange={setFiltroResenas}
                  />
                </div>

                <div className="rejilla dos">
                  {resenas
                    .filter((r) => { if (filtroResenas === 'reportadas') return r.reportada; if (filtroResenas === 'respondidas') return Boolean(r.respuesta); if (filtroResenas === 'sin-respuesta') return !r.respuesta; return true })
                    .map((r) => {
                      const autor = buscarUsuario(r.autorId)
                      const para = buscarUsuario(r.paraId)
                      return (
                        <article className="resena" key={r.id}>
                          <Avatar nombre={autor?.nombre ?? ''} tamano={44} />
                          <div>
                            <div className="resena-cabeza">
                              <span className="resena-autor">
                                <b>{autor?.nombre}</b>
                                <small>para {para?.nombre} · {fecha(r.fecha)}</small>
                              </span>
                              <Estrellas valor={r.estrellas} tamano={15} />
                            </div>
                            <p className="resena-texto">{r.texto}</p>
                            <div className="chips">
                              {r.reportada && <Etiqueta tono="ambar">Reportada</Etiqueta>}
                              {r.respuesta && <Etiqueta tono="verde">Con respuesta</Etiqueta>}
                              <Etiqueta tono="neutro">{r.util} votos útiles</Etiqueta>
                            </div>
                            <div className="acciones-celda" style={{ marginTop: '0.8rem' }}>
                              <Boton className="mini" variante="fantasma" onClick={() => marcarResena(r.id, !r.reportada)}>
                                {r.reportada ? 'Restaurar' : 'Marcar'}
                              </Boton>
                              <Boton
                                className="mini"
                                variante="texto"
                                onClick={async () => {
                                  const resumen = `Caso ${r.id}: ${r.texto || r.motivo}\nAutor: ${autor?.nombre ?? '—'}\nPersona reseñada: ${para?.nombre ?? '—'}\nEstado: ${r.reportada ? 'Reportada / en revisión' : 'Publicada'}`
                                  const ok = await copiarTexto(resumen)
                                  avisar(ok ? 'Resumen del caso copiado para notificar a las partes.' : 'No pudimos copiar el resumen.', ok ? 'ok' : 'aviso')
                                }}
                              >
                                Copiar resumen
                              </Boton>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                </div>
              </>
            )}

            {vista === 'reportes' && (
              <>
                <div className="panel-cabeza">
                  <div>
                    <h2 style={{ fontSize: '1.7rem' }}>Reportes y moderación</h2>
                    <p>{reportes.filter((r) => r.estado !== 'Resuelto').length} casos abiertos · {reportes.filter((r) => r.estado === 'Escalado').length} escalados</p>
                  </div>
                  <div className="admin-datos-acciones">
                    <Boton variante="fantasma" onClick={() => descargarCSV('hilo-circular-reportes', ['ID', 'Tipo', 'Motivo', 'Usuario', 'Fecha', 'Estado'], reportes.map((r) => [r.id, r.tipo, r.motivo, buscarUsuario(r.usuarioId)?.nombre ?? '', fecha(r.fecha), r.estado]))}>Exportar CSV</Boton>
                    <Boton variante="fantasma" onClick={() => descargarPDF('hilo-circular-reportes', 'Reportes de moderación · Medellín', ['ID', 'Tipo', 'Motivo', 'Usuario', 'Fecha', 'Estado'], reportes.map((r) => [r.id, r.tipo, r.motivo, buscarUsuario(r.usuarioId)?.nombre ?? '', fecha(r.fecha), r.estado]))}>Descargar PDF</Boton>
                  </div>
                </div>

                <div className="admin-reportes-filtros">
                  <Pestanas
                    items={[
                      { valor: 'abiertos', texto: 'Abiertos', cuenta: reportes.filter((r) => r.estado !== 'Resuelto').length },
                      { valor: 'revision', texto: 'En revisión' },
                      { valor: 'escalados', texto: 'Escalados', cuenta: reportes.filter((r) => r.estado === 'Escalado').length },
                      { valor: 'resueltos', texto: 'Resueltos' },
                      { valor: 'todos', texto: 'Todos' },
                    ]}
                    activo={filtroReportes}
                    onChange={setFiltroReportes}
                  />
                </div>
                <div className="tabla-envoltorio">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Caso</th>
                        <th>Tipo</th>
                        <th>Motivo</th>
                        <th>Relacionado con</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportes.filter((r) => {
                        if (filtroReportes === 'abiertos') return r.estado !== 'Resuelto'
                        if (filtroReportes === 'revision') return r.estado === 'En revisión'
                        if (filtroReportes === 'escalados') return r.estado === 'Escalado'
                        if (filtroReportes === 'resueltos') return r.estado === 'Resuelto'
                        return true
                      }).map((r) => (
                        <tr key={r.id}>
                          <td><b>{r.id.toUpperCase()}</b></td>
                          <td>{r.tipo}</td>
                          <td>{r.motivo}</td>
                          <td>
                            {r.prendaId && buscarPrenda(r.prendaId)?.titulo}
                            {r.usuarioId && buscarUsuario(r.usuarioId)?.nombre}
                            {r.resenaId && `Reseña ${r.resenaId.toUpperCase()}`}
                            {r.pedidoId && `Envío ${r.pedidoId.toUpperCase()}`}
                          </td>
                          <td>{fecha(r.fecha)}</td>
                          <td><Etiqueta tono={r.estado === 'Resuelto' ? 'verde' : r.estado === 'Escalado' ? 'lavanda' : 'ambar'}>{r.estado}</Etiqueta></td>
                          <td>
                            <div className="acciones-celda">
                              <Boton className="mini" disabled={r.estado === 'Resuelto'} onClick={() => resolverReporte(r.id, 'Resuelto', 'Caso resuelto y partes notificadas.')}>
                                Resolver
                              </Boton>
                              <Boton className="mini" variante="fantasma" disabled={r.estado === 'Escalado' || r.estado === 'Resuelto'} onClick={() => resolverReporte(r.id, 'Escalado', 'Caso escalado al comité de moderación.')}> 
                                {r.estado === 'Escalado' ? 'Escalado' : 'Escalar'}
                              </Boton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rejilla dos" style={{ marginTop: '2rem' }}>
                  <article className="panel-tarjeta">
                    <h3>Protocolo de actuación</h3>
                    <p>Pasos que sigue el equipo ante un reporte.</p>
                    <ul className="lista-tareas">
                      {['Confirmar el caso con ambas partes', 'Revisar fotos y mensajes del intercambio', 'Aplicar medida: aviso, pausa o suspensión', 'Registrar la decisión y notificar'].map((t) => (
                        <li key={t}><span aria-hidden="true">○</span>{t}</li>
                      ))}
                    </ul>
                  </article>
                  <article className="panel-tarjeta">
                    <h3>Mascota en moderación</h3>
                    <p>Recordatorio del equipo: la transparencia es lo que sostiene el hilo.</p>
                    <div style={{ display: 'grid', placeItems: 'center' }}>
                      <Mascot pose="sentado" style={{ width: 'min(200px, 48vw)' }} />
                    </div>
                  </article>
                </div>
              </>
            )}

            {vista === 'configuracion' && (
              <>
                <div className="panel-cabeza">
                  <div>
                    <h2 style={{ fontSize: '1.7rem' }}>Configuración de la plataforma</h2>
                    <p>Parámetros generales del intercambio y la moderación.</p>
                  </div>
                  <Boton onClick={() => { localStorage.setItem('hilo-admin-config', JSON.stringify(config)); avisar('Configuración guardada en este dispositivo.', 'ok') }}>Guardar cambios</Boton>
                </div>

                <div className="rejilla dos" style={{ alignItems: 'start' }}>
                  <div className="tarjeta-form">
                    <h3 style={{ fontSize: '1.2rem' }}>Reglas del intercambio</h3>
                    {[
                      ['verificacionObligatoria', 'Exigir verificación de identidad para publicar'],
                      ['envioGratisPunto', 'Envío sin costo a puntos aliados'],
                      ['moderacionAuto', 'Revisión automática de reseñas antes de publicar'],
                    ].map(([clave, texto]) => (
                      <label className="campo-terminos" key={clave}>
                        <input
                          type="checkbox"
                          checked={config[clave]}
                          onChange={(e) => setConfig({ ...config, [clave]: e.target.checked })}
                        />
                        <span>{texto}</span>
                      </label>
                    ))}
                    <Campo etiqueta="Límite de publicaciones activas por persona" id="limite">
                      <Selector id="limite" value={config.limitePublicaciones} onChange={(e) => setConfig({ ...config, limitePublicaciones: e.target.value })}>
                        {['10', '20', '30', 'Sin límite'].map((v) => <option key={v} value={v}>{v}</option>)}
                      </Selector>
                    </Campo>
                  </div>

                  <div style={{ display: 'grid', gap: '1.2rem' }}>
                    <div className="panel-tarjeta">
                      <h3>Ciudades y cobertura</h3>
                      <p>Activa o desactiva la operación logística por ciudad.</p>
                      <div className="chips">
                        <Etiqueta tono="lavanda">Medellín</Etiqueta>
                      </div>
                    </div>

                    <div className="panel-tarjeta">
                      <h3>Identidad y marca</h3>
                      <p>Elementos que se aplican en toda la interfaz.</p>
                      <div className="paleta-muestra" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(7rem, 1fr))' }}>
                        {['#6872aa', '#5d4655', '#e2deea', '#e5c4c6'].map((c) => (
                          <div key={c} style={{ display: 'grid', gap: '0.4rem' }}>
                            <i style={{ display: 'block', height: '56px', borderRadius: '14px', background: c }} />
                            <small style={{ fontSize: '0.74rem', opacity: 0.7 }}>{c}</small>
                          </div>
                        ))}
                      </div>
                      <p style={{ marginTop: '1rem', fontSize: '0.88rem', opacity: 0.75 }}>
                        Eslogan activo: «¡Lo que ya tienes también es moda!»
                      </p>
                    </div>

                    <div className="panel-tarjeta">
                      <h3>Estado del sistema</h3>
                      <p>Servicios que sostienen la operación de la comunidad.</p>
                      <div style={{ display: 'grid', gap: '0.6rem' }}>
                        <span style={{ display: 'flex', justifyContent: 'space-between' }}><span>API de intercambios</span><Etiqueta tono="verde">Conectada</Etiqueta></span>
                        <span style={{ display: 'flex', justifyContent: 'space-between' }}><span>Seguimiento de envíos</span><Etiqueta tono="ambar">Manual</Etiqueta></span>
                        <span style={{ display: 'flex', justifyContent: 'space-between' }}><span>Fotos de prendas</span><Etiqueta tono="lavanda">Cloudinary</Etiqueta></span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

      <DetallePrenda
        prenda={detalleActual}
        abierto={Boolean(detallePrenda)}
        onCerrar={() => setDetallePrenda(null)}
        acciones={detalleActual && (
          <>
            <Boton variante="fantasma" onClick={() => destacar(detalleActual.id)}>
              {detalleActual.destacada ? 'Quitar destacado' : 'Destacar'}
            </Boton>
            <Boton variante="fantasma" onClick={() => alternarDisponible(detalleActual.id)}>
              {detalleActual.disponible ? 'Pausar' : 'Activar'}
            </Boton>
          </>
        )}
      />
    </PanelShell>
  )
}
