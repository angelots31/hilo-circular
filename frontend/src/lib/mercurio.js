// Geometría del «mercurio»: tréboles huecos, destellos y puntos halftone.
export const DESTELLO = 'M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z'

// p = velocidad de parallax con el scroll (cada forma a su profundidad).
export const FORMAS = [
  { x: 260, y: 230, s: 1.9, dx: 90, dy: 60, v: 0.07, lob: 4, fase: 0, p: 0.1 },
  { x: 1330, y: 700, s: 1.5, dx: -70, dy: -50, v: 0.06, lob: 4, fase: 2, p: 0.16 },
  { x: 790, y: 470, s: 0.85, dx: 120, dy: 80, v: 0.09, lob: 4, fase: 4, p: 0.24 },
  { x: 1260, y: 160, s: 0.7, dx: -60, dy: 70, v: 0.08, lob: 5, fase: 1, p: 0.3 },
  { x: 150, y: 770, s: 0.9, dx: 80, dy: -60, v: 0.075, lob: 4, fase: 3, p: 0.2 },
  { x: 1000, y: 60, s: 1.2, dx: -90, dy: 60, v: 0.05, lob: 5, fase: 5, p: 0.13 },
  { x: 520, y: 900, s: 1.1, dx: 70, dy: -70, v: 0.065, lob: 4, fase: 6, p: 0.27 },
]

export const DESTELLOS = [
  { x: 1180, y: 130, s: 3, v: 0.5, fase: 0, p: 0.18 },
  { x: 430, y: 640, s: 2.2, v: 0.4, fase: 1.5, p: 0.28 },
  { x: 900, y: 790, s: 3.4, v: 0.35, fase: 3, p: 0.12 },
  { x: 150, y: 400, s: 2.6, v: 0.55, fase: 4.4, p: 0.22 },
  { x: 1450, y: 470, s: 2, v: 0.45, fase: 2.2, p: 0.34 },
  { x: 650, y: 150, s: 2.8, v: 0.38, fase: 5.1, p: 0.15 },
  { x: 1050, y: 450, s: 1.6, v: 0.6, fase: 0.7, p: 0.3 },
]

export const GRUPOS_PUNTOS = [
  { x: 1250, y: 330, s: 1.7, fase: 1, p: 0.2 },
  { x: 230, y: 600, s: 1.4, fase: 3, p: 0.26 },
]

/** Reaparece por el otro lado cuando una forma sale de pantalla al hacer scroll. */
export const envolver = (base, p, scroll) => ((((base - scroll * p) % 1500) + 1500) % 1500) - 300

/** Retícula de puntos que se achican hacia los bordes (efecto halftone), centrada en (100,100). */
export function puntosHalftone(n = 11, esp = 18) {
  const c = 100
  const rmax = (n * esp) / 2
  const out = []
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cx = c + (i - (n - 1) / 2) * esp
      const cy = c + (j - (n - 1) / 2) * esp
      const r = 7 * (1 - Math.hypot(cx - c, cy - c) / rmax)
      if (r > 0.8) out.push({ cx: +cx.toFixed(1), cy: +cy.toFixed(1), r: +r.toFixed(2) })
    }
  }
  return out
}

const N = 56
const f1 = (n) => n.toFixed(1)

/** Curva cerrada y suave (Catmull-Rom → Bézier) con lóbulos que fluyen con t. */
export function trazo(t, f, R = 100) {
  const p = []
  for (let k = 0; k < N; k++) {
    const th = (k / N) * Math.PI * 2
    const r = R * (1 + 0.3 * Math.sin(f.lob * th + t * 0.5 + f.fase) + 0.1 * Math.sin(2 * th - t * 0.35 + f.fase * 2))
    p.push([Math.cos(th) * r, Math.sin(th) * r])
  }
  let d = `M${f1(p[0][0])} ${f1(p[0][1])}`
  for (let i = 0; i < N; i++) {
    const a = p[(i - 1 + N) % N], b = p[i], c = p[(i + 1) % N], e = p[(i + 2) % N]
    d += `C${f1(b[0] + (c[0] - a[0]) / 6)} ${f1(b[1] + (c[1] - a[1]) / 6)} ${f1(c[0] - (e[0] - b[0]) / 6)} ${f1(c[1] - (e[1] - b[1]) / 6)} ${f1(c[0])} ${f1(c[1])}`
  }
  return d + 'Z'
}
