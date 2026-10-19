// Constantes de la interfaz y contenido oficial del proyecto Hilo Circular.
// Los datos operativos (usuarios, prendas, reseñas…) viven en el backend;
// aquí queda la configuración de UI y la información de la marca y la investigación.

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

// Dirección pública que codifica el QR del pie de página.
export const SITIO_URL = 'https://hilo-circular.vercel.app'

export const REDES = [
  {
    nombre: 'Instagram',
    usuario: '@hilo_circularoficial',
    url: 'https://www.instagram.com/hilo_circularoficial?utm_source=ig_web_button_share_sheet&obrf=ZDNlZDc0MzIxNw==',
  },
  {
    nombre: 'TikTok',
    usuario: 'Cuenta oficial',
    url: 'https://vm.tiktok.com/ZS9UxschCMAvV-qTMHW/',
  },
]

// Público y problema: jóvenes universitarios de estrato medio-bajo en Medellín (17–25 años).
export const PUBLICO = 'Jóvenes universitarios de estratos medio-bajo en Medellín, entre 17 y 25 años, que combinan estudio y trabajo.'

export const QUIENES_SOMOS =
  'Somos un equipo de investigación y diseño enfocado en jóvenes con presupuestos limitados que consumen moda rápida no por falta de conciencia ambiental, sino porque el precio, las tendencias, las redes sociales, la falta de tiempo y la desconfianza frente al greenwashing limitan sus alternativas. Entendimos que el problema no está en comprar ropa económica, sino en la falta de opciones para mantener el estilo sin comprometer el presupuesto.'

export const ODS = {
  numero: 'ODS 12',
  titulo: 'Producción y Consumo Responsables',
  texto:
    'Hilo Circular se relaciona directamente con el ODS 12: promueve hábitos de consumo más conscientes, reduce la compra impulsiva y facilita información que permite identificar prácticas de sostenibilidad reales frente al greenwashing.',
}

export const PRINCIPIOS = [
  {
    nombre: 'Accesibilidad',
    texto: 'La participación debe ser económica, cercana y posible para estudiantes universitarios.',
  },
  {
    nombre: 'Transparencia',
    texto: 'La información sobre el impacto es clara y comprensible para combatir la desconfianza frente al greenwashing.',
  },
  {
    nombre: 'Practicidad',
    texto: 'Las acciones se realizan en poco tiempo y sin procesos complicados: talleres de 15 a 60 minutos.',
  },
  {
    nombre: 'Identidad',
    texto: 'La sostenibilidad no está separada de la moda: cada persona sigue expresando su estilo mientras repara, transforma o intercambia.',
  },
]

// Ciclo oficial de la experiencia: reto digital → taller → co-creación → resultado.
export const PASOS = [
  {
    titulo: 'El reto digital',
    texto: 'Subes a TikTok o Instagram la prenda que menos usas y cuentas por qué quedó olvidada. Un QR revela su costo ambiental real y la agenda de talleres cercanos.',
  },
  {
    titulo: 'La cita en el taller',
    texto: 'Cerca de tu universidad o de tu casa, en formato relámpago y sin inscripción complicada. Coordinamos cupos y trueques por la comunidad de WhatsApp.',
  },
  {
    titulo: 'La co-creación',
    texto: 'Con un facilitador modista reparas, transformas o intercambias la prenda en 15 a 60 minutos. Los kits y materiales los aporta el aliado del proyecto.',
  },
  {
    titulo: 'El impacto que vuelve',
    texto: 'Recibes una etiqueta con QR con el impacto de tu prenda. Ese contenido vuelve a las redes como nueva carnada y cierra el ciclo comunitario.',
  },
]

// Los cinco niveles de participación y la emoción que valida cada uno.
export const NIVELES = [
  { nombre: 'Espectador', validacion: 'Ver que otros sienten lo mismo que yo', detalle: 'Ve el contenido del reto en TikTok o Instagram, sin participar todavía.' },
  { nombre: 'Retador', validacion: 'Descubrir que hay un lugar para gente como yo', detalle: 'Sube su propia prenda al reto digital y cuenta su historia.' },
  { nombre: 'Asistente', validacion: 'Actuar en menos de una hora sin gastar mucho', detalle: 'Llega por primera vez a un taller relámpago cerca de su universidad.' },
  { nombre: 'Co-creador', validacion: 'Mi acción inspira a otros a hacer lo mismo', detalle: 'Repara, transforma o intercambia su prenda dentro del taller.' },
  { nombre: 'Embajador', validacion: 'He creado un movimiento en mi círculo', detalle: 'Repite el ciclo, invita a sus amigos y genera contenido de forma recurrente.' },
]

// Resultados de la encuesta de campo (estudiantes universitarios, Medellín).
export const CIFRAS = [
  { valor: '80 %', texto: 'del clóset permanece inactivo' },
  { valor: '88,2 %', texto: 'participaría en el reto digital' },
  { valor: '54,2 %', texto: 'dispone de 30 a 60 minutos' },
  { valor: '72,9 %', texto: 'se motiva con un aliado real' },
]

export const DATOS_CLAVE = [
  { valor: '88,2 %', titulo: 'Reto digital', texto: 'participaría en el reto de mostrar la prenda que menos usa (49,2 % sí y 39 % si sus amigos también lo hacen).' },
  { valor: '64,4 %', titulo: 'Cercanía', texto: 'iría a un taller si le queda de paso, cerca de la universidad o de la casa.' },
  { valor: '77,9 %', titulo: 'Tiempo', texto: 'dispone de hasta una hora; el 54,2 % tiene entre 30 y 60 minutos.' },
  { valor: '47,5 %', titulo: 'Confianza', texto: 'confía más al ver el proceso en vivo, antes y después, que en cifras aisladas.' },
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

// Voces oficiales que respaldan la propuesta (no son reseñas de la plataforma).
export const VOCES = [
  {
    texto: 'Mantener los materiales y prendas en el ciclo de vida es la clave para generar valor desde la economía circular y la sostenibilidad en el vestuario.',
    autor: 'Dra. Margarita María Baena Restrepo',
    ciudad: 'Docente e investigadora de Diseño de Vestuario, UPB',
  },
  {
    texto: 'Aunque las tendencias venden más fácil, la moda es cíclica: lo que estuvo de moda antes, vuelve. Muchos buscan piezas de colección que nunca pasan de moda.',
    autor: 'Ropa Andada',
    ciudad: 'Tienda de segunda mano y e-commerce',
  },
  {
    texto: 'Cuando las personas cambian de talla, mandan a arreglar la ropa de buena calidad o aquella que les trae recuerdos, para alargar su vida útil.',
    autor: 'Martika.oficial',
    ciudad: 'Arreglos y confección local',
  },
]

export const TALLERES = [
  {
    nombre: 'Reparación',
    texto: 'Hilos, agujas, dedales, enhebradores y agujas zurcidoras. Se repara acompañado: se habla mientras se cose.',
  },
  {
    nombre: 'Transformación',
    texto: 'Tijeras, cinta de refuerzo, botones y accesorios. La prenda no está muerta: está desactualizada y se puede resetear.',
  },
  {
    nombre: 'Trueque',
    texto: 'Un espacio con percha para exhibir prendas, guía de trueque y etiquetas QR para contar la historia de cada pieza.',
  },
]

// Cada perfil llega al proyecto por una ruta distinta (costo para la persona).
export const RUTAS = [
  { perfil: 'Minimalista', accion: 'Repara en casa con el PDF o reel tutorial', costo: '$0', tiempo: '10-15 min' },
  { perfil: 'Social', accion: 'Trueque en un espacio físico con percha', costo: '$5.000', tiempo: '20-30 min' },
  { perfil: 'Creativa', accion: 'Upcycling con el kit de materiales', costo: '$8.000', tiempo: '40-60 min' },
  { perfil: 'Observador', accion: 'Explora el contenido y la comunidad', costo: '$0', tiempo: '0 min' },
]

export const EQUIPO = [
  { nombre: 'Jimena Andrea Graciano Vásquez', rol: 'Diseñadora gráfica' },
  { nombre: 'Camilo Marín Bolaños', rol: 'Líder de proyecto y editor' },
  { nombre: 'Isaac Hurtado Ramírez', rol: 'Estratega de solución' },
  { nombre: 'Valery Uparela Arroyo', rol: 'Investigadora de contexto' },
  { nombre: 'Sofía Balbón Patiño', rol: 'Investigadora de UX' },
]

export const REFERENTES = [
  {
    nombre: 'Dra. Margarita María Baena Restrepo',
    tipo: 'Referente académico · UPB',
    texto: 'Aporta la validez teórica del proyecto: mantener las prendas en el ciclo de vida es la clave para generar valor desde la economía circular.',
  },
  {
    nombre: 'Ropa Andada',
    tipo: 'Referente comercial',
    texto: 'Demuestra que existe un mercado activo para la moda circular y enseña cómo se comunica el valor de lo reutilizable.',
  },
  {
    nombre: 'Martika.oficial',
    tipo: 'Arreglo y confección local',
    texto: 'Resuelve las fallas de talla del fast fashion y rescata el valor emocional de las prendas que se ajustan para durar más.',
  },
  {
    nombre: 'Fashion Revolution · Repair Café',
    tipo: 'Movimientos de referencia',
    texto: 'Inspiran la transparencia radical y la reparación comunitaria; Hilo Circular las traduce a acciones rápidas dentro del campus.',
  },
]

export const CANALES = [
  { nombre: 'TikTok e Instagram', texto: 'Canales de descubrimiento público: el reto de la prenda olvidada vive en el mismo lenguaje que ya consumen los usuarios.' },
  { nombre: 'Micrositio', texto: 'Espacio de evidencia y transparencia: datos de impacto, ideas de creación, calendario de talleres y panel público de resultados.' },
  { nombre: 'Comunidad de WhatsApp', texto: 'Coordinación en tiempo real de cupos y trueques, sin perder tiempo ni sumar trámites.' },
  { nombre: 'Talleres relámpago', texto: 'El único punto del ecosistema donde la prenda pasa realmente de un estado a otro: reparación, transformación o trueque.' },
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
