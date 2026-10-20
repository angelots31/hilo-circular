// Ilustraciones vectoriales de prendas: reemplazan las fotos mientras no exista backend.
// Cada prenda recibe su propia paleta, así el catálogo se ve variado y coherente.
const FORMAS = {
  camiseta: (a, b) => (
    <>
      <path d="M62 40 34 62l-14 34 26 12 6-18v86h84v-86l6 18 26-12-14-34-28-22z" fill={a} />
      <path d="M78 40q22 20 44 0-10 26-22 26t-22-26Z" fill={b} opacity=".85" />
    </>
  ),
  chaqueta: (a, b) => (
    <>
      <path d="M60 42 30 64 16 100l28 12 6-16v84h100v-84l6 16 28-12-14-36-30-22z" fill={a} />
      <path d="M60 42l40 60-40 78h-20l40-78-40-52z" fill={b} opacity=".9" />
      <path d="M100 102 60 42l-8 6 40 132h8z" fill="#fff" opacity=".22" />
      <circle cx="100" cy="120" r="5" fill="#fff" opacity=".8" />
      <circle cx="100" cy="146" r="5" fill="#fff" opacity=".8" />
      <circle cx="100" cy="172" r="5" fill="#fff" opacity=".8" />
    </>
  ),
  blazer: (a, b) => (
    <>
      <path d="M58 44 30 66 16 104l28 12 8-18v82h96v-82l8 18 28-12-14-38-28-22z" fill={a} />
      <path d="M58 44l42 66-24 32-26-24z" fill={b} />
      <path d="M142 44l-42 66 24 32 26-24z" fill={b} opacity=".8" />
      <path d="M100 110v88" stroke="#fff" strokeOpacity=".35" strokeWidth="3" />
    </>
  ),
  abrigo: (a, b) => (
    <>
      <path d="M58 44 28 68 14 106l28 12 8-16v104h100V102l8 16 28-12-14-38-30-24z" fill={a} />
      <path d="M58 44h84l-8 18H66z" fill={b} />
      <path d="M100 62v144" stroke="#fff" strokeOpacity=".3" strokeWidth="3" />
      <rect x="52" y="150" width="96" height="14" rx="7" fill={b} opacity=".9" />
      <circle cx="100" cy="157" r="6" fill="#fff" opacity=".7" />
    </>
  ),
  sueter: (a, b) => (
    <>
      <path d="M62 42 32 64 18 102l28 12 6-16v92h96v-92l6 16 28-12-14-38-30-22z" fill={a} />
      <path d="M78 42q22 22 44 0l-6 16q-16 14-32 0z" fill={b} />
      <g stroke={b} strokeWidth="3" opacity=".7" fill="none">
        <path d="M62 130q38 18 76 0M62 156q38 18 76 0M62 182q38 18 76 0" />
      </g>
      <rect x="46" y="182" width="108" height="16" rx="8" fill={b} opacity=".9" />
    </>
  ),
  pantalon: (a, b) => (
    <>
      <path d="M52 30h96l10 176h-42l-8-96-8 96H58z" fill={a} />
      <rect x="52" y="30" width="96" height="20" fill={b} />
      <path d="M74 50l6 0 4 130-10 0z" fill="#fff" opacity=".16" />
      <circle cx="100" cy="40" r="4" fill="#fff" opacity=".6" />
    </>
  ),
  vestido: (a, b) => (
    <>
      <path d="M74 32h52l10 54 34 108q-56 22-140 0L64 86z" fill={a} />
      <path d="M78 32q22 18 44 0l4 22q-26 16-52 0z" fill={b} />
      <path d="M74 86q26 12 52 0l6 20q-32 14-64 0z" fill={b} opacity=".85" />
      <path d="M88 34v194M112 34v194" stroke="#fff" strokeOpacity=".22" strokeWidth="2" />
    </>
  ),
  falda: (a, b) => (
    <>
      <path d="M58 46h84l24 148q-66 20-132 0z" fill={a} />
      <rect x="56" y="40" width="88" height="18" rx="9" fill={b} />
      <g stroke={b} strokeWidth="2.4" opacity=".65" fill="none">
        <path d="M78 58l-12 130M100 58v136M122 58l12 130" />
      </g>
    </>
  ),
  zapatillas: (a, b) => (
    <>
      <path d="M22 158q8-46 34-62l26-16 10 22 50 20q28 12 30 36z" fill={a} />
      <path d="M22 158h150q6 18-12 22H34q-16-4-12-22z" fill={b} />
      <path d="M62 118l40 16M70 106l40 16M78 96l38 14" stroke={b} strokeWidth="4" opacity=".8" />
      <path d="M110 124l22 26" stroke="#fff" strokeOpacity=".4" strokeWidth="4" />
    </>
  ),
  bolso: (a, b) => (
    <>
      <path d="M44 96h112l14 92q-70 18-140 0z" fill={a} />
      <path d="M74 96V76q0-26 26-26t26 26v20" fill="none" stroke={b} strokeWidth="9" strokeLinecap="round" />
      <path d="M44 128q56 16 112 0" fill="none" stroke={b} strokeWidth="6" opacity=".7" />
      <circle cx="100" cy="146" r="8" fill={b} />
    </>
  ),
}

export const TIPOS = Object.keys(FORMAS)
export const TIPO_POR_CATEGORIA = {
  Chaquetas: 'chaqueta',
  Camisetas: 'camiseta',
  Pantalones: 'pantalon',
  Vestidos: 'vestido',
  Faldas: 'falda',
  Abrigos: 'abrigo',
  Punto: 'sueter',
  Calzado: 'zapatillas',
  Accesorios: 'bolso',
}

/**
 * @param {string} tipo  clave de FORMAS (o se deduce de la categoría)
 * @param {string[]} paleta dos colores [base, detalle]
 */
export default function Garment({ tipo, categoría, categoria, paleta, className = '', alt = '' }) {
  const clave = tipo ?? TIPO_POR_CATEGORIA[categoria ?? categoría] ?? 'camiseta'
  const colores = Array.isArray(paleta) && paleta.length >= 2 ? paleta : ['#6872aa', '#e5c4c6']
  const [a, b] = colores
  const dibujo = (FORMAS[clave] ?? FORMAS.camiseta)(a, b)
  return (
    <svg className={`prenda-arte ${className}`} viewBox="0 0 200 240" role="img" aria-label={alt}>
      <defs>
        <linearGradient id={`g-${clave}-${a.replace('#', '')}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="112" r="96" fill={`url(#g-${clave}-${a.replace('#', '')})`} />
      {dibujo}
    </svg>
  )
}
