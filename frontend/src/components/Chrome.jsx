import { useEffect, useMemo, useRef, useState } from 'react'
import { DESTELLO, DESTELLOS, FORMAS, GRUPOS_PUNTOS, envolver, puntosHalftone, trazo } from '../lib/mercurio.js'

/** Fondo «mercurio»: tréboles de cromo, destellos y puntos que se mueven solos y con el scroll. */
export function Fondo() {
  const refs = useRef({})
  const ref = (i, k) => (el) => { (refs.current[i] ||= {})[k] = el }
  const puntos = useMemo(() => puntosHalftone(11, 18), [])

  useEffect(() => {
    const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf
    const pintar = (t) => {
      const sc = window.scrollY || 0
      FORMAS.forEach((f, i) => {
        const e = refs.current[i]
        if (!e?.g || !e.base || !e.cromo || !e.brillo || !e.grad) return
        const d = trazo(t, f)
        e.base.setAttribute('d', d); e.cromo.setAttribute('d', d); e.brillo.setAttribute('d', d)
        const x = f.x + f.dx * Math.sin(t * f.v + f.fase)
        const y = envolver(f.y, f.p, sc) + f.dy * Math.cos(t * f.v * 1.3 + f.fase)
        e.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(t * f.v * 40 + f.fase * 50).toFixed(1)}) scale(${f.s})`)
        e.grad.setAttribute('gradientTransform', `rotate(${(t * 18 + i * 70).toFixed(1)})`)
      })
      DESTELLOS.forEach((d, i) => {
        const e = refs.current['d' + i]
        if (!e?.g) return
        const x = d.x + 40 * Math.sin(t * d.v + d.fase)
        const y = envolver(d.y, d.p, sc) + 30 * Math.cos(t * d.v * 1.2 + d.fase)
        const esc = d.s * (1 + 0.22 * Math.sin(t * d.v * 5 + d.fase))
        e.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(t * d.v * 35).toFixed(1)}) scale(${esc.toFixed(2)})`)
      })
      GRUPOS_PUNTOS.forEach((d, i) => {
        const e = refs.current['p' + i]
        if (!e?.g) return
        const x = d.x + 50 * Math.sin(t * 0.05 + d.fase)
        e.g.setAttribute('transform', `translate(${x.toFixed(1)} ${envolver(d.y, d.p, sc).toFixed(1)}) rotate(${(t * 3 + d.fase * 40).toFixed(1)}) scale(${d.s})`)
      })
    }
    if (reducir) { pintar(6); return }
    const bucle = (ms) => { pintar(ms / 1000); raf = requestAnimationFrame(bucle) }
    raf = requestAnimationFrame(bucle)
    return () => cancelAnimationFrame(raf)
  }, [])

  const paradas = (
    <>
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="0.16" stopColor="#9fb0e8" />
      <stop offset="0.34" stopColor="#2f2d55" />
      <stop offset="0.5" stopColor="#e5c4c6" />
      <stop offset="0.66" stopColor="#ffffff" />
      <stop offset="0.82" stopColor="#6872aa" />
      <stop offset="1" stopColor="#2f2d55" />
    </>
  )

  return (
    <div className="fondo" aria-hidden="true">
      <svg className="mercurio" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* Degradados cromados compartidos con los adornos de cada sección */}
          <linearGradient id="cromo-ring" gradientUnits="userSpaceOnUse" x1="-150" y1="-150" x2="150" y2="150">{paradas}</linearGradient>
          <linearGradient id="cromo-star" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.3" stopColor="#9fb0e8" />
            <stop offset="0.55" stopColor="#2f2d55" />
            <stop offset="0.78" stopColor="#e5c4c6" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
          {FORMAS.map((_, i) => (
            <linearGradient key={i} id={`mer-${i}`} ref={ref(i, 'grad')} gradientUnits="userSpaceOnUse" x1="-150" y1="-150" x2="150" y2="150">{paradas}</linearGradient>
          ))}
        </defs>

        {GRUPOS_PUNTOS.map((_, i) => (
          <g key={'p' + i} ref={ref('p' + i, 'g')}>
            <g transform="translate(-100 -100)">
              {puntos.map((p, k) => <circle key={k} cx={p.cx} cy={p.cy} r={p.r} fill="#6872aa" fillOpacity="0.55" />)}
            </g>
          </g>
        ))}

        {FORMAS.map((_, i) => (
          <g key={i} ref={ref(i, 'g')}>
            <path ref={ref(i, 'base')} fill="none" stroke="#1b1a36" strokeOpacity="0.35" strokeWidth="30" strokeLinejoin="round" />
            <path ref={ref(i, 'cromo')} fill="none" stroke={`url(#mer-${i})`} strokeWidth="24" strokeLinejoin="round" />
            <path ref={ref(i, 'brillo')} fill="none" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="5" strokeLinecap="round" transform="translate(-4 -6)" />
          </g>
        ))}

        {DESTELLOS.map((_, i) => (
          <g key={'d' + i} ref={ref('d' + i, 'g')}>
            <path d={DESTELLO} transform="translate(-12 -12)" fill="url(#cromo-star)" stroke="#2f2d55" strokeOpacity="0.5" strokeWidth="0.3" />
          </g>
        ))}
      </svg>
      <span className="grano" />
    </div>
  )
}

/** Barra de progreso de lectura, arriba del todo. */
export function ProgresoLectura() {
  const [avance, setAvance] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const alto = document.documentElement.scrollHeight - innerHeight
      setAvance(alto > 0 ? (scrollY / alto) * 100 : 0)
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
    }
  }, [])
  return (
    <div className="progreso-lectura" role="presentation">
      <span style={{ transform: `scaleX(${avance / 100})` }} />
    </div>
  )
}


/** Cursor circular hueco para equipos con puntero; no altera la navegación táctil. */
export function CursorHueco() {
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return
    const cursor = document.createElement('span')
    cursor.className = 'cursor-hueco'
    cursor.setAttribute('aria-hidden', 'true')
    document.body.appendChild(cursor)
    const mover = (e) => {
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`
    }
    const entrar = (e) => {
      if (e.target.closest('a, button, input, select, textarea, [role="button"], .clicable')) cursor.classList.add('encima')
    }
    const salir = () => cursor.classList.remove('encima')
    window.addEventListener('pointermove', mover, { passive: true })
    document.addEventListener('pointerover', entrar)
    document.addEventListener('pointerout', salir)
    document.documentElement.classList.add('cursor-hueco-activo')
    return () => {
      window.removeEventListener('pointermove', mover)
      document.removeEventListener('pointerover', entrar)
      document.removeEventListener('pointerout', salir)
      document.documentElement.classList.remove('cursor-hueco-activo')
      cursor.remove()
    }
  }, [])
  return null
}
