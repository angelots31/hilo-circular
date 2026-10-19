import { useMemo, useState } from 'react'
import { DESTELLO, puntosHalftone, trazo } from '../lib/mercurio.js'

/** Destello de cuatro puntas con acabado cromado. */
export function Estrella() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={DESTELLO} fill="url(#cromo-star)" stroke="#2f2d55" strokeOpacity="0.55" strokeWidth="0.35" />
      <path d="M12 3.2C12.6 8 14 10 17 11.2" fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="0.7" strokeLinecap="round" />
    </svg>
  )
}

/** Trébol hueco de cromo líquido: su contorno se deforma solo. */
export function Trebol({ n = 0 }) {
  const reducir = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const [d0, d1] = useMemo(() => {
    const f = { lob: n % 3 === 2 ? 5 : 4, fase: n * 1.7 }
    return [trazo(0, f), trazo(7, f)]
  }, [n])
  const mover = !reducir && (
    <animate attributeName="d" dur={`${10 + (n % 3) * 3}s`} repeatCount="indefinite" values={`${d0};${d1};${d0}`} calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
  )
  return (
    <svg viewBox="-170 -170 340 340" aria-hidden="true">
      <path d={d0} fill="none" stroke="#1b1a36" strokeOpacity="0.3" strokeWidth="30" strokeLinejoin="round">{mover}</path>
      <path d={d0} fill="none" stroke="url(#cromo-ring)" strokeWidth="24" strokeLinejoin="round">{mover}</path>
      <path d={d0} fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="5" strokeLinecap="round" transform="translate(-4 -6)">{mover}</path>
    </svg>
  )
}

/** Trama de puntos que se desvanece hacia los bordes. */
export function Puntos() {
  const pts = useMemo(() => puntosHalftone(11, 18), [])
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      {pts.map((p, i) => <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#6872aa" />)}
    </svg>
  )
}

const DISENOS = [
  [['trebol', '24rem', { right: '-7rem', top: '-4rem' }], ['estrella', '3.4rem', { left: '7%', bottom: '14%' }], ['puntos', '13rem', { left: '-3rem', top: '22%' }]],
  [['puntos', '15rem', { right: '-2rem', bottom: '-1rem' }], ['estrella', '4.4rem', { right: '12%', top: '10%' }], ['trebol', '15rem', { left: '-5rem', bottom: '6%' }]],
  [['estrella', '5rem', { left: '5%', top: '8%' }], ['trebol', '19rem', { right: '-4rem', bottom: '-5rem' }], ['puntos', '11rem', { right: '14%', top: '30%' }]],
]

/** Formas decorativas de una sección; cada sección usa una composición distinta. */
export function Adornos({ n = 0 }) {
  // En móvil no se montan: son decorativas y suman cientos de nodos SVG.
  const [compacto] = useState(() => typeof matchMedia === 'function' && matchMedia('(max-width: 900px)').matches)
  const diseno = DISENOS[n % DISENOS.length]
  if (compacto) return null
  return (
    <div className="adornos" aria-hidden="true">
      {diseno.map(([tipo, tam, pos], i) => (
        <span key={i} className={`adorno ${tipo}`} style={{ width: tam, height: tam, ...pos, animationDelay: `${-(n * 3 + i * 2)}s` }}>
          {tipo === 'trebol' ? <Trebol n={n + i} /> : tipo === 'estrella' ? <Estrella /> : <Puntos />}
        </span>
      ))}
    </div>
  )
}
