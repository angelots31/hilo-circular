import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// Firma de autoría del proyecto. Se usa de verdad al arrancar para que la
// minificación no la elimine del paquete compilado.
const FIRMA = 'angelots'
document.documentElement.dataset.autor = FIRMA
document.documentElement.dataset.firma = `${FIRMA} · Hilo Circular`

createRoot(document.getElementById('root')).render(<App />)
