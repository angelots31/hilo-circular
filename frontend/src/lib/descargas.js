/** Descargas locales para el prototipo (no requieren servicio backend). */
function descargarBlob(nombre, blob, extension) {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre.toLowerCase().endsWith(`.${extension}`) ? nombre : `${nombre}.${extension}`
  enlace.hidden = true
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1200)
}

export function descargarCSV(nombre, columnas, filas) {
  const escapar = (valor) => {
    const texto = String(valor ?? '').replace(/\r?\n/g, ' ')
    return /[",;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
  }
  const contenido = [columnas, ...filas].map((fila) => fila.map(escapar).join(';')).join('\r\n')
  descargarBlob(nombre, new Blob([`\uFEFF${contenido}`], { type: 'text/csv;charset=utf-8;' }), 'csv')
}

/** Convierte CSV separado por coma o punto y coma en objetos a partir de la primera fila. */
export function parsearCSV(contenido) {
  const texto = String(contenido ?? '').replace(/^\uFEFF/, '')
  const primeraLinea = texto.split(/\r?\n/, 1)[0] || ''
  const contar = (delimitador) => {
    let comillas = false, total = 0
    for (let i = 0; i < primeraLinea.length; i += 1) {
      const ch = primeraLinea[i]
      if (ch === '"' && primeraLinea[i + 1] === '"' && comillas) { i += 1; continue }
      if (ch === '"') comillas = !comillas
      else if (ch === delimitador && !comillas) total += 1
    }
    return total
  }
  const delimitador = contar(';') >= contar(',') ? ';' : ','
  const matriz = []
  let fila = [], campo = '', comillas = false
  for (let i = 0; i < texto.length; i += 1) {
    const ch = texto[i]
    if (ch === '"') {
      if (comillas && texto[i + 1] === '"') { campo += '"'; i += 1 }
      else comillas = !comillas
    } else if (ch === delimitador && !comillas) {
      fila.push(campo); campo = ''
    } else if ((ch === '\n' || ch === '\r') && !comillas) {
      if (ch === '\r' && texto[i + 1] === '\n') i += 1
      fila.push(campo)
      if (fila.some((valor) => valor.trim() !== '')) matriz.push(fila)
      fila = []; campo = ''
    } else campo += ch
  }
  if (campo.length || fila.length) { fila.push(campo); if (fila.some((valor) => valor.trim() !== '')) matriz.push(fila) }
  if (matriz.length < 2) return []
  const cabeceras = matriz.shift().map((valor) => valor.trim())
  return matriz.map((valores) => Object.fromEntries(cabeceras.map((cabecera, i) => [cabecera, String(valores[i] ?? '').trim()])))
}

function pdfBytes(texto) {
  // Los caracteres españoles (á, é, í, ó, ú, ñ) caben en WinAnsi; los no representables se suavizan.
  const normalizado = String(texto ?? '').normalize('NFC')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/→/g, '->')
    .replace(/•/g, '-')
    // Conserva CR/LF: los flujos PDF necesitan sus separadores de operadores.
    .replace(/[^\x09\x0A\x0D\x20-\xFF]/g, '?')
  return Uint8Array.from(normalizado, (caracter) => caracter.charCodeAt(0) & 255)
}

function pdfLiteral(texto) {
  return String(texto ?? '').normalize('NFC')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/→/g, '->')
    .replace(/•/g, '-')
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[^\x20-\xFF]/g, '?')
    .replace(/[\\()]/g, '\\$&')
}

function wrapLine(texto, maximo = 91) {
  const palabras = String(texto).split(/\s+/)
  const lineas = []
  let actual = ''
  for (const palabra of palabras) {
    const partes = palabra.length > maximo ? palabra.match(new RegExp(`.{1,${maximo}}`, 'g')) : [palabra]
    for (const parte of partes) {
      const siguiente = actual ? `${actual} ${parte}` : parte
      if (siguiente.length > maximo && actual) { lineas.push(actual); actual = parte }
      else actual = siguiente
    }
  }
  if (actual) lineas.push(actual)
  return lineas.length ? lineas : ['']
}

/** Genera un PDF de texto simple, paginado y descargable sin librerías externas. */
export function descargarPDF(nombre, titulo, columnas, filas) {
  const fecha = new Date().toLocaleString('es-CO')
  const lineas = [`Generado: ${fecha} | Registros: ${filas.length}`, '']
  filas.forEach((fila, indice) => {
    lineas.push(`REGISTRO ${indice + 1}`)
    columnas.forEach((columna, posicion) => {
      lineas.push(...wrapLine(`${columna}: ${fila[posicion] ?? ''}`, 88))
    })
    lineas.push('')
  })
  if (!filas.length) lineas.push('No hay registros para mostrar.')
  const porPagina = 47
  const paginas = []
  for (let i = 0; i < lineas.length; i += porPagina) paginas.push(lineas.slice(i, i + porPagina))
  const pageIds = paginas.map((_, i) => 4 + i * 2)
  const objetos = new Map()
  objetos.set(1, pdfBytes('<< /Type /Catalog /Pages 2 0 R >>'))
  objetos.set(2, pdfBytes(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${paginas.length} >>`))
  objetos.set(3, pdfBytes('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'))

  paginas.forEach((pagina, indice) => {
    const idPagina = pageIds[indice]
    const idStream = idPagina + 1
    let contenido = 'q\n0.40 0.42 0.62 rg\n38 786 519 30 re f\nQ\n'
    contenido += `BT /F1 15 Tf 48 796 Td (${pdfLiteral(titulo)}) Tj ET\n`
    contenido += `BT /F1 8 Tf 500 25 Td (${indice + 1}/${paginas.length}) Tj ET\n`
    let y = 765
    pagina.forEach((linea, lineaIndice) => {
      if (lineaIndice === 0) {
        contenido += `BT /F1 9 Tf 42 ${y} Td (${pdfLiteral(linea)}) Tj ET\n`
        y -= 20
      } else if (linea.startsWith('REGISTRO ')) {
        contenido += `BT /F1 9 Tf 42 ${y} Td (${pdfLiteral(linea)}) Tj ET\n`
        y -= 14
      } else {
        contenido += `BT /F1 8 Tf 48 ${y} Td (${pdfLiteral(linea)}) Tj ET\n`
        y -= 12
      }
    })
    const stream = pdfBytes(contenido)
    const encabezadoPagina = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${idStream} 0 R >>`
    objetos.set(idPagina, pdfBytes(encabezadoPagina))
    objetos.set(idStream, joinBytes([pdfBytes(`<< /Length ${stream.length} >>\nstream\n`), stream, pdfBytes('\nendstream')]))
  })

  const chunks = [pdfBytes('%PDF-1.4\n')]
  const offsets = [0]
  let longitud = chunks[0].length
  const totalObjetos = Math.max(...objetos.keys())
  for (let id = 1; id <= totalObjetos; id += 1) {
    const cuerpo = objetos.get(id)
    if (!cuerpo) throw new Error(`Falta el objeto PDF ${id}`)
    const pieza = joinBytes([pdfBytes(`${id} 0 obj\n`), cuerpo, pdfBytes('\nendobj\n')])
    offsets[id] = longitud
    chunks.push(pieza)
    longitud += pieza.length
  }
  const inicioXref = longitud
  let xref = `xref\n0 ${totalObjetos + 1}\n0000000000 65535 f \n`
  for (let id = 1; id <= totalObjetos; id += 1) xref += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
  xref += `trailer\n<< /Size ${totalObjetos + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`
  chunks.push(pdfBytes(xref))
  descargarBlob(nombre, new Blob(chunks, { type: 'application/pdf' }), 'pdf')
}

function joinBytes(arrays) {
  const total = arrays.reduce((sum, actual) => sum + actual.length, 0)
  const salida = new Uint8Array(total)
  let offset = 0
  arrays.forEach((actual) => { salida.set(actual, offset); offset += actual.length })
  return salida
}

export function descargarJSON(nombre, datos) {
  descargarBlob(nombre, new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json;charset=utf-8' }), 'json')
}
