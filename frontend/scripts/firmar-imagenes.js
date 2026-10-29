/**
 * Firma los metadatos de las imágenes de marca con «angelots».
 * Se ejecuta una sola vez (`node scripts/firmar-imagenes.js`) y es repetible:
 * si el archivo ya lleva la firma, lo salta.
 *
 * - PNG: añade chunks tEXt (Author y Copyright) sin tocar los píxeles.
 * - WebP: añade un chunk XMP con Creator y Copyright al final del archivo.
 *
 * Las fotos que suben las personas no se tocan: son de ellas.
 * La marca de bits de bajo orden no se aplica aquí porque los archivos de
 * marca son WebP con pérdida y cualquier recomprimirla la borraría; la prueba
 * fuerte de autoría es el historial de commits y el LICENSE.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const AUTOR = 'angelots'
const DERECHOS = '© 2026 angelots · Hilo Circular'
const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const carpeta = path.join(raiz, 'public')

/** CRC32 que exige el formato PNG. */
const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabla[n] = c >>> 0
  }
  return tabla
})()

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = TABLA_CRC[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunkPng(tipo, datos) {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length, 0)
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'latin1'), datos])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(cuerpo), 0)
  return Buffer.concat([largo, cuerpo, crc])
}

function firmarPng(archivo) {
  const original = fs.readFileSync(archivo)
  if (original.includes(Buffer.from(AUTOR, 'latin1'))) return false

  const firma = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  if (!original.subarray(0, 8).equals(firma)) return false

  const textos = [
    chunkPng('tEXt', Buffer.concat([Buffer.from('Author\0', 'latin1'), Buffer.from(AUTOR, 'latin1')])),
    chunkPng('tEXt', Buffer.concat([Buffer.from('Copyright\0', 'latin1'), Buffer.from(DERECHOS, 'utf8')])),
  ]

  // Se insertan antes del primer IDAT para que sigan al IHDR.
  const posicion = original.indexOf('IDAT', 8)
  if (posicion < 4) return false
  const corte = posicion - 4
  const salida = Buffer.concat([original.subarray(0, corte), ...textos, original.subarray(corte)])
  fs.writeFileSync(archivo, salida)
  return true
}

function firmarWebp(archivo) {
  const original = fs.readFileSync(archivo)
  if (original.includes(Buffer.from(AUTOR, 'utf8'))) return false
  if (original.subarray(0, 4).toString('latin1') !== 'RIFF') return false
  if (original.subarray(8, 12).toString('latin1') !== 'WEBP') return false

  const xmp = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
   <dc:creator><rdf:Seq><rdf:li>${AUTOR}</rdf:li></rdf:Seq></dc:creator>
   <dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${DERECHOS}</rdf:li></rdf:Alt></dc:rights>
   <xmp:CreatorTool>Hilo Circular</xmp:CreatorTool>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`
  const datos = Buffer.from(xmp, 'utf8')

  const cabecera = Buffer.alloc(8)
  cabecera.write('XMP ', 0, 'latin1')
  cabecera.writeUInt32LE(datos.length, 4)
  const relleno = datos.length % 2 ? Buffer.from([0]) : Buffer.alloc(0)
  const bloque = Buffer.concat([cabecera, datos, relleno])

  const salida = Buffer.concat([original, bloque])
  salida.writeUInt32LE(salida.length - 8, 4) // tamaño RIFF
  fs.writeFileSync(archivo, salida)
  return true
}

const archivos = fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
  if (entrada.isDirectory()) {
    return fs.readdirSync(path.join(carpeta, entrada.name))
      .filter((n) => /\.(png|webp|jpg|jpeg)$/i.test(n))
      .map((n) => path.join(carpeta, entrada.name, n))
  }
  return /\.(png|webp|jpg|jpeg)$/i.test(entrada.name) ? [path.join(carpeta, entrada.name)] : []
})

let firmadas = 0
for (const archivo of archivos) {
  const extension = path.extname(archivo).toLowerCase()
  let cambio = false
  if (extension === '.png') cambio = firmarPng(archivo)
  else if (extension === '.webp') cambio = firmarWebp(archivo)
  if (cambio) {
    firmadas += 1
    console.log(`✔ Firmada: ${path.relative(raiz, archivo)}`)
  }
}

console.log(`Listo. ${firmadas} imagen(es) firmadas con «${AUTOR}».`)
