// Constantes de la interfaz. Los datos reales (usuarios, prendas, reseñas…)
// ahora viven en el backend; aquí solo queda lo que es configuración de UI.

export const CATEGORIAS = ['Chaquetas', 'Camisetas', 'Pantalones', 'Vestidos', 'Faldas', 'Abrigos', 'Punto', 'Calzado', 'Accesorios']
export const TALLAS = ['XS', 'S', 'M', 'L', 'XL', '36', '37', '38', '39', '40', '41', '42', 'Única']
export const ESTADOS = ['Nuevo con etiqueta', 'Como nuevo', 'Buen estado', 'Con detalles']

// La comunidad vive únicamente en Medellín: no se elige ciudad, se elige barrio.
export const CIUDAD = 'Medellín'
export const CIUDADES = [CIUDAD]
export const BARRIOS = [
  'El Poblado', 'Laureles', 'Belén', 'Robledo', 'Aranjuez', 'Castilla',
  'Guayabal', 'La Candelaria', 'Buenos Aires', 'San Javier', 'Manrique', 'Villa Hermosa',
]
export const METODOS_ENVIO = ['Domicilio', 'Punto de encuentro']

export const ESLOGAN = '¡Lo que ya tienes también es moda!'

export const PASOS = [
  {
    titulo: 'Sube tu prenda',
    texto: 'Fotografías, talla, estado y una descripción honesta. Tu prenda entra al catálogo circular con un valor de referencia para orientar el intercambio.',
  },
  {
    titulo: 'Propón un intercambio',
    texto: 'Elige la prenda de otra persona y ofrece una tuya. Si hay match, ambas partes aceptan y el hilo comienza a girar.',
  },
  {
    titulo: 'Recíbela en tu casa',
    texto: 'Coordinamos el domicilio o un punto de encuentro. Al entregar, las dos personas se califican y la prenda vuelve a la vida.',
  },
]

export const FORMAS = [
  {
    nombre: 'Formas líquidas',
    texto: 'Representan transformación y movimiento. Su apariencia cambiante refleja la posibilidad de modificar aquello que ya existe y convertirlo en algo diferente.',
  },
  {
    nombre: 'Destellos',
    texto: 'Representan creatividad, descubrimiento y nuevas posibilidades: el momento exacto en el que encontramos otra forma de usar una prenda.',
  },
  {
    nombre: 'Trama de puntos',
    texto: 'Aporta continuidad y repetición, refuerza la idea de un ciclo en el que las prendas pueden tener más de una vida.',
  },
]

// Conversación de ejemplo para la vista de mensajes (todavía no hay chat en el backend).
export const mensajes = [
  { id: 'm1', de: 'u1', para: 'u8', texto: 'Hola Daniela, vi tu suéter de punto. ¿Sigue disponible?', hora: '09:12' },
  { id: 'm2', de: 'u8', para: 'u1', texto: '¡Hola! Sí, sigue disponible. ¿Qué prenda ofreces?', hora: '09:20' },
  { id: 'm3', de: 'u1', para: 'u8', texto: 'El jean recto de tiro alto, talla 38.', hora: '09:24' },
  { id: 'm4', de: 'u8', para: 'u1', texto: 'Me sirve perfecto. Te propongo el cambio por la plataforma.', hora: '09:31' },
]

// Series para las gráficas del panel administrativo.
export const actividad = [
  { mes: 'Abr', prendas: 42, intercambios: 28, envios: 24 },
  { mes: 'May', prendas: 55, intercambios: 34, envios: 31 },
  { mes: 'Jun', prendas: 61, intercambios: 40, envios: 36 },
  { mes: 'Jul', prendas: 74, intercambios: 52, envios: 44 },
  { mes: 'Ago', prendas: 88, intercambios: 61, envios: 55 },
  { mes: 'Sep', prendas: 103, intercambios: 78, envios: 69 },
  { mes: 'Oct', prendas: 118, intercambios: 86, envios: 74 },
]

export const porCategoria = [
  { nombre: 'Chaquetas', valor: 24 },
  { nombre: 'Pantalones', valor: 19 },
  { nombre: 'Vestidos', valor: 16 },
  { nombre: 'Abrigos', valor: 13 },
  { nombre: 'Punto', valor: 11 },
  { nombre: 'Calzado', valor: 9 },
  { nombre: 'Accesorios', valor: 8 },
]

export const TESTIMONIOS = [
  { texto: 'Renové media mitad del clóset sin gastar un peso. Mi chaqueta favorita la tiene ahora una estudiante en Medellín.', autor: 'Valentina R.', ciudad: 'Medellín' },
  { texto: 'El domicilio llegó en dos días y con empaque reutilizable. Se siente bien no comprar algo nuevo.', autor: 'Mateo C.', ciudad: 'Medellín' },
  { texto: 'Publiqué el suéter que tejí hace años y hoy alguien lo usa otra vez. Eso es exactamente lo que quería.', autor: 'Daniela Q.', ciudad: 'Medellín' },
]
