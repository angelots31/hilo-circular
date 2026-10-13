# Hilo Circular · Frontend

Interfaz del marketplace de intercambio de ropa (solo Medellín), construida con
**React + Vite**. Habla con el backend propio (`hilo/backend`, Express +
PostgreSQL) mediante la variable `VITE_API_URL`; las imágenes se suben a
**Cloudinary**.

```
.                         # raíz del repositorio
├── render.yaml           # despliegue del backend + BD en Render (rootDir: hilo/backend)
├── package.json          # scripts de la raíz: dev, test, build
└── hilo/
    ├── backend/          # API Express → documentación en hilo/backend/README.md
    └── frontend/         # esta carpeta (React + Vite)
        ├── src/
        ├── public/
        ├── fuente/       # imágenes fuente de la mascota
        ├── vercel.json   # despliegue del frontend en Vercel
        └── .env.example  # VITE_API_URL
```

---

## 1. Requisitos

- Node.js 20 o superior
- El backend corriendo en local (ver `hilo/backend/README.md`)

---

## 2. Ejecutar en local

```bash
# desde la raíz del repositorio
npm install                # instala las dependencias de raíz, backend y frontend
npm run dev                # arranca API (:4000) y web (:5173) a la vez
```

O por separado:

```bash
npm run dev:api            # solo la API
npm run dev:web            # solo la web → http://localhost:5173
```

Variables de entorno (`hilo/frontend/.env`, copia de `.env.example`):

| Variable | Descripción |
| -------- | ----------- |
| `VITE_API_URL` | URL del backend. En local: `http://localhost:4000` |

> Si `VITE_API_URL` no está definida, el cliente usa `http://localhost:4000`
> por defecto. En Vercel debe apuntar a la URL de Render.

---

## 3. Conexión con el backend

- El cliente de la API está en `src/lib/api.js` y envía `Authorization: Bearer <token>`.
- El backend acepta en CORS los orígenes listados en `CORS_ORIGIN`
  (en local: `http://localhost:5173,http://localhost:4173`).
- Si la API no responde, la pantalla avisa «No pudimos conectar con el servidor»
  y queda en estado vacío; revisa que la API esté levantada.

Cuentas demo (contraseña `demo123`):

| Rol     | Correo                      |
| ------- | --------------------------- |
| Cliente | `valentina@hilocircular.co` |
| Admin   | `admin@hilocircular.co`     |

---

## 4. Cloudinary (imágenes)

1. Crea una cuenta gratuita y copia **Cloud name**, **API Key** y **API Secret**.
2. Pégalos en `hilo/backend/.env`.
3. Listo: el navegador pide una firma a `GET /api/uploads/firma` y sube la imagen
   directo a Cloudinary (no pasa por el servidor). La URL resultante se guarda en
   la columna `fotos` de la prenda.

---

## 5. Compilar y probar

```bash
npm run build     # genera dist/
npm run preview   # sirve dist/ en local
npm test          # tests del backend (raíz: npm test)
```

---

## 6. Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. En **Settings → General → Root Directory** pon `hilo/frontend`
   (el repo tiene la web dentro de una subcarpeta).
3. En **Settings → Environment Variables** agrega `VITE_API_URL` con la URL de Render.
4. Deploy. `vercel.json` ya incluye el rewrite a `index.html` y el build de Vite.

Backend y base de datos: ver «Despliegue» en `hilo/backend/README.md`.
