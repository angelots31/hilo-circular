import { useMemo, useState } from 'react'
import PrendaCard from '../components/PrendaCard.jsx'
import { Aparece, Boton, Campo, Entrada, EstadoVacio, Seccion, Selector, TituloSeccion } from '../components/ui.jsx'
import { useRoute, navigate } from '../lib/router.jsx'
import { useStore } from '../lib/store.jsx'
import { BARRIOS, CATEGORIAS, ESTADOS, TALLAS } from '../lib/seed.js'

const ORDENES = [
  { valor: 'recientes', texto: 'Más recientes' },
  { valor: 'valor', texto: 'Mayor valor de referencia' },
  { valor: 'vistas', texto: 'Más vistas' },
  { valor: 'cercanas', texto: 'Cerca de mi barrio' },
]

export default function Catalogo() {
  const { prendas, usuario } = useStore()
  const { query } = useRoute()
  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState(query.get('cat') ?? 'todas')
  const [talla, setTalla] = useState('todas')
  const [estado, setEstado] = useState('todos')
  const [barrio, setBarrio] = useState('todos')
  const [orden, setOrden] = useState('recientes')
  const [soloDisponibles, setSoloDisponibles] = useState(true)
  const [limite, setLimite] = useState(8)

  const resultados = useMemo(() => {
    const t = texto.trim().toLowerCase()
    let lista = prendas.filter((p) => {
      if (soloDisponibles && !p.disponible) return false
      if (categoria !== 'todas' && p.categoria !== categoria) return false
      if (talla !== 'todas' && p.talla !== talla) return false
      if (estado !== 'todos' && p.estado !== estado) return false
      if (barrio !== 'todos' && p.barrio !== barrio) return false
      if (!t) return true
      return [p.titulo, p.descripcion, p.marca, p.color, p.categoria, p.barrio].join(' ').toLowerCase().includes(t)
    })
    lista = lista.sort((a, b) => {
      if (orden === 'valor') return b.valor - a.valor
      if (orden === 'vistas') return (b.vistas ?? 0) - (a.vistas ?? 0)
      if (orden === 'cercanas') {
        const mio = usuario?.barrio
        if (!mio) return 0
        return (b.barrio === mio) - (a.barrio === mio)
      }
      return a.creada < b.creada ? 1 : -1
    })
    return lista
  }, [prendas, texto, categoria, talla, estado, barrio, orden, soloDisponibles, usuario])

  const limpiar = () => {
    setTexto('')
    setCategoria('todas')
    setTalla('todas')
    setEstado('todos')
    setBarrio('todos')
    setOrden('recientes')
    setSoloDisponibles(true)
    navigate('/catalogo')
  }

  const visibles = resultados.slice(0, limite)
  const hayFiltros =
    texto || categoria !== 'todas' || talla !== 'todas' || estado !== 'todos' || barrio !== 'todos' || !soloDisponibles

  return (
    <Seccion tono="claro">
      <div className="contenedor">
        <TituloSeccion
          nivel={1}
          ceja="Catálogo circular"
          titulo="Prendas publicadas por la comunidad"
          texto="Filtra por talla, estado y barrio. Cada prenda incluye sus características para que acuerdes el intercambio directamente con la otra persona."
          accion={
            <div className="chips">
              <Boton to={usuario ? '/subir' : '/registro'}>Subir mi prenda</Boton>
            </div>
          }
        />

        <form className="filtros" onSubmit={(e) => e.preventDefault()}>
          <div className="filtros-fila">
            <Campo etiqueta="Buscar" id="buscar">
              <Entrada
                id="buscar"
                type="search"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Chaqueta de cuero, vestido de lino, Levi's…"
              />
            </Campo>
            <Campo etiqueta="Categoría" id="categoria">
              <Selector id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="todas">Todas</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Selector>
            </Campo>
            <Campo etiqueta="Talla" id="talla">
              <Selector id="talla" value={talla} onChange={(e) => setTalla(e.target.value)}>
                <option value="todas">Todas</option>
                {TALLAS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Selector>
            </Campo>
            <Campo etiqueta="Estado" id="estado">
              <Selector id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="todos">Cualquiera</option>
                {ESTADOS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Selector>
            </Campo>
            <Campo etiqueta="Barrio" id="barrio">
              <Selector id="barrio" value={barrio} onChange={(e) => setBarrio(e.target.value)}>
                <option value="todos">Todos</option>
                {BARRIOS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Selector>
            </Campo>
          </div>

          <div className="chips">
            <button type="button" className={`chip ${soloDisponibles ? 'activo' : ''}`} onClick={() => setSoloDisponibles((v) => !v)}>
              Solo disponibles
            </button>
            {CATEGORIAS.slice(0, 6).map((c) => (
              <button
                type="button"
                key={c}
                className={`chip ${categoria === c ? 'activo' : ''}`}
                onClick={() => {
                  setCategoria(categoria === c ? 'todas' : c)
                  setLimite(8)
                }}
              >
                {c}
              </button>
            ))}
            <span style={{ flex: 1 }} />
            <Campo etiqueta="Ordenar por" id="orden" className="orden-campo">
              <Selector id="orden" value={orden} onChange={(e) => setOrden(e.target.value)}>
                {ORDENES.map((o) => (
                  <option key={o.valor} value={o.valor}>{o.texto}</option>
                ))}
              </Selector>
            </Campo>
          </div>
        </form>

        <div className="barra-resultados">
          <p>
            <b>{resultados.length}</b> {resultados.length === 1 ? 'prenda encontrada' : 'prendas encontradas'}
            {barrio !== 'todos' && ` en ${barrio}`}
            {hayFiltros && (
              <button className="boton texto sm" onClick={limpiar}>Limpiar filtros</button>
            )}
          </p>
          <p style={{ opacity: 0.7 }}>Mostrando {visibles.length} de {resultados.length}</p>
        </div>

        {resultados.length === 0 ? (
          <EstadoVacio
            pose="duerme"
            titulo="Todavía no hay prendas con estos filtros"
            texto="Nuestro camaleón se quedó dormido esperando. Prueba con otros filtros o sé la primera persona en publicar una prenda así."
            accion={<Boton to={usuario ? '/subir' : '/registro'} tamano="lg">Subir una prenda</Boton>}
            secundario={<Boton variante="fantasma" onClick={limpiar}>Quitar los filtros</Boton>}
          />
        ) : (
          <>
            <div className="catalogo-rejilla">
              {visibles.map((p, i) => (
                <Aparece key={p.id} retraso={(i % 4) * 70}>
                  <PrendaCard prenda={p} />
                </Aparece>
              ))}
            </div>
            {limite < resultados.length && (
              <div style={{ display: 'grid', placeItems: 'center', marginTop: '2.6rem' }}>
                <Boton variante="fantasma" tamano="lg" onClick={() => setLimite((v) => v + 8)}>
                  Ver más prendas ({resultados.length - limite} restantes)
                </Boton>
              </div>
            )}
          </>
        )}
      </div>
    </Seccion>
  )
}
