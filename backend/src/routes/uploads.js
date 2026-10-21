import { Router } from 'express'
import crypto from 'node:crypto'
import { authRequerida } from '../auth.js'
import { asincrono, errorHttp } from '../util.js'

const router = Router()

/**
 * GET /api/uploads/firma
 * Devuelve los parámetros firmados para que el navegador suba la imagen
 * directamente a Cloudinary (sin pasar el archivo por el backend).
 * Con ?recurso=audio firma la subida de audio (Cloudinary lo recibe como video).
 */
router.get('/firma', authRequerida, asincrono(async (req, res) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const folder = process.env.CLOUDINARY_FOLDER || 'hilo-circular'
  if (!cloudName || !apiKey || !apiSecret) throw errorHttp(500, 'Cloudinary no está configurado en el servidor.')

  const timestamp = Math.floor(Date.now() / 1000)
  // Firma: sha1 de los parámetros ordenados (excepto file/api_key) + api_secret
  const aFirmar = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = crypto.createHash('sha1').update(aFirmar).digest('hex')

  // En Cloudinary el audio viaja como resource type «video».
  const recurso = req.query.recurso === 'audio' ? 'video' : 'image'

  res.json({
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${recurso}/upload`,
  })
}))

export default router
