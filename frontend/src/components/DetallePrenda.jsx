import { useEffect, useState } from 'react'
import { Vista, vistasDe } from './Carrusel.jsx'
import { Avatar, Boton, Etiqueta, Modal } from './ui.jsx'
import { useStore } from '../lib/store.jsx'

/**
 * Vista de detalle de una prenda dentro de los paneles. Permite ver las
 * fotos en grande, revisar los datos y abrir la publicación o el chat.
 */
export default function DetallePrenda({ prenda, abierto, onCerrar, onChat, acciones }) {
  const { buscarUsuario, fecha } = useStore()
  const [indice, setIndice] = useState(0)
  const vistas = vistasDe(prenda)

  useEffect(() => {
    if (abierto) setIndice(0)
  }, [abierto, prenda?.id])

  if (!prenda) return null
  const dueno = buscarUsuario(prenda.duenoId)
  const vista = vistas[indice] ?? vistas[0]

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={prenda.titulo}
      descripcion={`${prenda.categoria} · Talla ${prenda.talla} · ${prenda.ciudad}`}
      ancho="54rem"
      pie={
        <>
          {acciones}
          <Boton variante="fantasma" onClick={onCerrar}>Cerrar</Boton>
          {onChat && <Boton onClick={onChat}>Abrir conversación</Boton>}
          <Boton to={`/prenda/${prenda.id}`}>Ver publicación</Boton>
        </>
      }
    >
      <div className="detalle-prenda-modal">
        <div className="detalle-prenda-galeria">
          <div className="detalle-prenda-foto">
            <Vista vista={vista} prenda={prenda} alt={prenda.titulo} />
          </div>
          {vistas.length > 1 && (
            <div className="miniaturas">
              {vistas.map((v, i) => (
                <button
                  key={v.clave}
                  type="button"
                  className={`miniatura ${i === indice ? 'activa' : ''}`}
                  aria-label={`Ver ${v.etiqueta}`}
                  onClick={() => setIndice(i)}
                >
                  <Vista vista={v} prenda={prenda} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detalle-prenda-info">
          <div className="chips">
            <Etiqueta tono={prenda.disponible ? 'verde' : 'neutro'}>
              {prenda.disponible ? 'Disponible' : 'Pausada'}
            </Etiqueta>
            <Etiqueta tono="lavanda">{prenda.estado}</Etiqueta>
            {prenda.destacada && <Etiqueta tono="destacada">Destacada</Etiqueta>}
          </div>

          <b className="detalle-prenda-valor">Valor ref. {prenda.valor}</b>
          <p className="detalle-prenda-descripcion">{prenda.descripcion || 'Sin descripción registrada.'}</p>

          <ul className="detalle-lista">
            <li><span>Marca</span><b>{prenda.marca || 'Sin marca'}</b></li>
            <li><span>Color</span><b>{prenda.color || 'Sin especificar'}</b></li>
            <li><span>Barrio</span><b>{prenda.barrio || prenda.ciudad}</b></li>
            <li><span>Publicada</span><b>{fecha(prenda.creada)}</b></li>
            <li><span>Visitas</span><b>{prenda.vistas ?? 0}</b></li>
          </ul>

          {dueno && (
            <div className="detalle-prenda-dueno">
              <Avatar nombre={dueno.nombre} tamano={38} />
              <span>
                <b>{dueno.nombre}</b>
                <small>{dueno.ciudad} · {dueno.intercambios} intercambios</small>
              </span>
              {dueno.verificado && <Etiqueta tono="verde">Verificada</Etiqueta>}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
