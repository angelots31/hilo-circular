/**
 * Iconos de línea de la interfaz. Usan currentColor para heredar el color del
 * contexto (barra lateral, enlaces del pie o etiquetas).
 */

const TRAZOS = {
  resumen: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
    </>
  ),
  prendas: (
    <>
      <path d="M12 3.2a1.9 1.9 0 0 1 1.9 1.9c0 1.3-.9 1.8-1.9 2.6" />
      <path d="M12 7.7 4.4 13a1.5 1.5 0 0 0 .9 2.7h13.4a1.5 1.5 0 0 0 .9-2.7L12 7.7Z" />
    </>
  ),
  intercambios: (
    <>
      <path d="M4 8h13.5" />
      <path d="m14.5 5 3 3-3 3" />
      <path d="M20 16H6.5" />
      <path d="m9.5 13-3 3 3 3" />
    </>
  ),
  envios: (
    <>
      <path d="M3.5 7.5h9v9h-9z" />
      <path d="M12.5 10.5h4l3 3v3h-7z" />
      <circle cx="7" cy="18.5" r="1.7" />
      <circle cx="16.5" cy="18.5" r="1.7" />
    </>
  ),
  resenas: (
    <path d="m12 3.6 2.55 5.17 5.7.83-4.13 4.02.98 5.68L12 16.62 6.9 19.3l.98-5.68L3.75 9.6l5.7-.83L12 3.6Z" />
  ),
  favoritos: (
    <path d="M12 20.2s-7.3-4.6-7.3-9.7A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 7.3 3.2c0 5.1-7.3 9.7-7.3 9.7Z" />
  ),
  ajustes: (
    <>
      <path d="M4 7.5h5M13 7.5h7M4 16.5h7M15 16.5h5" />
      <circle cx="11" cy="7.5" r="2" />
      <circle cx="13" cy="16.5" r="2" />
    </>
  ),
  usuarios: (
    <>
      <circle cx="9" cy="8" r="3.1" />
      <path d="M3.6 19.2a5.6 5.6 0 0 1 10.8 0" />
      <path d="M16 5.2a3 3 0 0 1 0 5.8" />
      <path d="M17.4 14.2a5.4 5.4 0 0 1 3 5" />
    </>
  ),
  reportes: (
    <>
      <path d="M6 21V4" />
      <path d="M6 4.5h11.2l-2.3 4.2 2.3 4.2H6" />
    </>
  ),
  configuracion: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M4.2 16.5l1.9-1.1M17.9 8.6l1.9-1.1" />
    </>
  ),
  volver: (
    <>
      <path d="M20 12H4.5" />
      <path d="m10.5 5.5-6.5 6.5 6.5 6.5" />
    </>
  ),
  salir: (
    <>
      <path d="M9.5 20.5H5.8a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h3.7" />
      <path d="M15.5 16.5 20 12l-4.5-4.5" />
      <path d="M20 12H9.5" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
}

/** Icono de marca relleno (TikTok). */
const RELLENOS = {
  tiktok:
    'M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z',
}

export default function Icono({ nombre, className = '' }) {
  const relleno = RELLENOS[nombre]
  return (
    <svg
      className={`icono-linea ${className}`.trim()}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {relleno ? (
        <path d={relleno} fill="currentColor" />
      ) : (
        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          {TRAZOS[nombre] ?? TRAZOS.resumen}
        </g>
      )}
    </svg>
  )
}
