import { useEffect, useState } from 'react'

/** Convierte "#/catalogo?cat=abrigos" en { path:'/catalogo', segments:['catalogo'], query:URLSearchParams } */
function parse(hash) {
  const raw = hash.replace(/^#/, '') || '/'
  const [pathname, search = ''] = raw.split('?')
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`
  return {
    path: clean,
    segments: clean.split('/').filter(Boolean),
    query: new URLSearchParams(search),
  }
}

export function navigate(to, { replace = false } = {}) {
  const target = to.startsWith('#') ? to : `#${to}`
  if (replace) history.replaceState(null, '', target)
  else location.hash = target
  if (replace) dispatchEvent(new HashChangeEvent('hashchange'))
}

export function useRoute() {
  const [route, setRoute] = useState(() => parse(location.hash))
  useEffect(() => {
    const onHash = () => setRoute(parse(location.hash))
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])
  return route
}

/** Ancla interna que respeta el router del hash. */
export function href(to) {
  return `#${to}`
}

/** Lee ?volver=/ruta de la dirección actual (solo rutas internas). */
export function destinoVolver(porDefecto = '/') {
  const volver = new URLSearchParams(location.hash.split('?')[1] ?? '').get('volver')
  return volver && volver.startsWith('/') && !volver.startsWith('//') ? volver : porDefecto
}
