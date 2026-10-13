import 'dotenv/config'
import { crearApp } from './app.js'
import { probarConexion } from './db.js'

const app = crearApp()
const puerto = Number(process.env.PORT) || 4000

app.listen(puerto, () => {
  console.log(`Hilo Circular API escuchando en http://localhost:${puerto}`)
  probarConexion()
    .then(() => console.log('Conexión a PostgreSQL OK'))
    .catch((e) => console.warn('Aviso: no se pudo conectar a PostgreSQL ->', e.message))
})
