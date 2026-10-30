import { useEffect, useRef, useState } from 'react'

/** Codecs que el navegador puede grabar y que la nube acepta como audio. */
const FORMATOS = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
const SEGUNDOS_MAXIMOS = 60

const reloj = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/**
 * Grabadora de voz con el micrófono del equipo. Al detener la grabación
 * entrega un archivo de audio (File) listo para subirse a la nube, en lugar
 * de pedir que se elija un archivo existente.
 */
export default function GrabadoraAudio({ id, onGrabar, avisar, className = 'soltar soltar-audio' }) {
  const [grabando, setGrabando] = useState(false)
  const [segundos, setSegundos] = useState(0)
  const flujoRef = useRef(null)
  const grabadorRef = useRef(null)
  const trozosRef = useRef([])
  const relojRef = useRef(null)
  const cuentaRef = useRef(0)

  const soltarMic = () => {
    flujoRef.current?.getTracks().forEach((t) => t.stop())
    flujoRef.current = null
  }

  const limpiar = () => {
    clearInterval(relojRef.current)
    // Al desmontar no se entrega nada: solo se apaga el micrófono.
    if (grabadorRef.current) grabadorRef.current.onstop = null
    if (grabadorRef.current?.state !== 'inactive') grabadorRef.current?.stop()
    grabadorRef.current = null
    soltarMic()
  }

  useEffect(() => limpiar, [])

  const detener = () => {
    clearInterval(relojRef.current)
    if (grabadorRef.current?.state !== 'inactive') grabadorRef.current?.stop()
  }

  const empezar = async () => {
    if (grabando) return detener()
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      return avisar('Tu navegador no permite grabar audio. Puedes publicar la prenda sin audio.', 'aviso')
    }

    let flujo
    try {
      flujo = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      return avisar('No pudimos usar el micrófono: revisa el permiso del navegador.', 'aviso')
    }

    let grabador
    try {
      const tipo = FORMATOS.find((f) => MediaRecorder.isTypeSupported?.(f))
      grabador = new MediaRecorder(flujo, tipo ? { mimeType: tipo } : undefined)
    } catch {
      flujo.getTracks().forEach((t) => t.stop())
      return avisar('No pudimos iniciar la grabadora de audio.', 'aviso')
    }

    flujoRef.current = flujo
    grabadorRef.current = grabador
    trozosRef.current = []

    grabador.ondataavailable = (e) => { if (e.data?.size) trozosRef.current.push(e.data) }
    grabador.onstop = () => {
      clearInterval(relojRef.current)
      soltarMic()
      grabadorRef.current = null
      setGrabando(false)
      const blob = new Blob(trozosRef.current, { type: grabador.mimeType || 'audio/webm' })
      if (!blob.size) return avisar('La grabación salió vacía, inténtala de nuevo.', 'aviso')
      const extension = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm'
      onGrabar(new File([blob], `grabacion-de-voz.${extension}`, { type: blob.type }))
    }

    cuentaRef.current = 0
    setSegundos(0)
    grabador.start()
    setGrabando(true)
    relojRef.current = setInterval(() => {
      cuentaRef.current += 1
      setSegundos(cuentaRef.current)
      if (cuentaRef.current >= SEGUNDOS_MAXIMOS) detener()
    }, 1000)
  }

  if (grabando) {
    return (
      <button
        type="button"
        id={id}
        className={`${className} grabando`}
        onClick={detener}
      >
        <b><i className="grab-punto" aria-hidden="true" /> Grabando… {reloj(segundos)}</b>
        <small>haz clic para detener y escuchar tu grabación</small>
      </button>
    )
  }

  return (
    <button type="button" id={id} className={className} onClick={empezar}>
      <b>🎙️ Graba un audio con los detalles</b>
      <small>haz clic para grabar con tu micrófono · hasta {SEGUNDOS_MAXIMOS} segundos · completamente opcional</small>
    </button>
  )
}
