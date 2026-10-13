# Hilo Circular · Backend

API REST de Hilo Circular: autenticación, catálogo, intercambios, envíos y
moderación. **Node.js + Express + PostgreSQL**, imágenes en Cloudinary y
tokens JWT.

```
backend/
├── src/
│   ├── index.js          # arranque del servidor
│   ├── app.js            # Express: CORS, middlewares y rutas
│   ├── auth.js           # bcrypt + JWT
│   ├── db.js             # pool de PostgreSQL (pg)
│   ├── util.js           # ayudantes (async, camelizado, errores HTTP)
│   └── routes/           # auth, datos, prendas, usuarios, comunidad, uploads
├── sql/
│   ├── schema.sql        # tablas, índices y checks
│   └── seed.sql          # datos de ejemplo
├── scripts/
│   ├── setup-db.js       # crea las tablas y carga el seed
│   └── demo-mem.js       # API con Postgres en memoria (sin instalar nada)
├── test/                 # node:test contra pg-mem
├── .env.example
└── package.json
```

---

## 1. Requisitos

- Node.js 20 o superior
- Para la base real: PostgreSQL (local, Render, Tiger Cloud, Neon…)
- Para las imágenes: cuenta gratuita de [Cloudinary](https://cloudinary.com)

---

## 2. Ejecutar en local

### Opción A · sin base de datos (demo)

```bash
npm install
npm run demo          # API en http://localhost:4000 con datos de ejemplo
npm run demo:watch    # igual, pero reinicia al guardar cambios
```

Usa PostgreSQL en memoria (`pg-mem`): ideal para probar el frontend de punta a
punta. Los datos se descartan al cerrar.

### Opción B · con PostgreSQL real

```bash
npm install
cp .env.example .env      # y completa las variables
npm run db:setup          # crea las tablas y carga los datos de ejemplo
npm run dev               # API en http://localhost:4000
```

`npm run db:setup` ejecuta, en orden:

1. `sql/schema.sql` → crea todas las tablas.
2. `sql/seed.sql` → inserta los datos de ejemplo.

Cuentas demo (contraseña `demo123`):

| Rol     | Correo                      |
| ------- | --------------------------- |
| Cliente | `valentina@hilocircular.co` |
| Admin   | `admin@hilocircular.co`     |

---

## 3. Variables de entorno (`backend/.env`)

| Variable | Descripción |
| -------- | ----------- |
| `PORT` | Puerto de la API (por defecto 4000) |
| `DATABASE_URL` | Cadena de conexión de PostgreSQL |
| `PGSSL` | `true` en la nube, `false` en local |
| `JWT_SECRET` | Secreto para firmar los tokens |
| `JWT_EXPIRA` | Vigencia del token (por defecto `30d`) |
| `CORS_ORIGIN` | Orígenes permitidos, separados por coma |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Credenciales de Cloudinary |
| `CLOUDINARY_FOLDER` | Carpeta de Cloudinary (por defecto `hilo-circular`) |

Genera un secreto con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 4. Endpoints principales

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/api/salud` | Estado de la API y de la base de datos |
| POST | `/api/auth/registro` | Crear cuenta |
| POST | `/api/auth/login` | Iniciar sesión (devuelve token) |
| GET | `/api/datos` | Carga inicial de la SPA (público + datos de la sesión) |
| PUT | `/api/usuarios/me` | Actualizar perfil |
| PATCH | `/api/usuarios/:id/estado`, `/verificado` | Moderación (admin) |
| POST/PATCH/DELETE | `/api/prendas`, `/api/prendas/:id/...` | Catálogo, disponibilidad, favoritos |
| POST | `/api/prendas/importar` | Importar CSV (admin) |
| POST/PATCH | `/api/intercambios`, `/api/intercambios/:id/estado` | Propuestas y respuesta |
| POST/PATCH | `/api/pedidos`, `/api/pedidos/:id/estado` | Envíos y seguimiento |
| POST/PUT/PATCH | `/api/resenas`, `/api/resenas/:id/...` | Reseñas y respuestas |
| PATCH | `/api/reportes/:id/estado` | Moderación (admin) |
| GET | `/api/uploads/firma` | Firma para subir la imagen a Cloudinary |
| POST | `/api/prendas/:id/vista` | Suma una visita |

---

## 5. Pruebas

```bash
npm test        # valida esquema y datos contra un Postgres en memoria
```

---

## 6. Despliegue

### Base de datos + API en Render

1. Sube el repositorio a GitHub.
2. En Render, **New → Blueprint** y selecciona el repo. El `render.yaml` está en
   la raíz del repositorio con `rootDir: backend`; crea el servicio
   `hilo-circular-api` y la base `hilo-circular-db`.
3. En las variables de entorno del servicio, completa las claves de Cloudinary y
   ajusta `CORS_ORIGIN` con la URL de Vercel.
4. Cuando termine el primer deploy, ejecuta el script de base de datos una vez.
   En tu máquina, apuntando al `DATABASE_URL` de Render (usa la *External Database URL*; la Internal solo funciona dentro de Render):

   ```bash
   cd backend
   DATABASE_URL="<cadena de Render>" PGSSL=true npm run db:setup
   ```

El frontend se despliega en Vercel (ver `frontend/README.md`).

> **Nota:** el plan gratuito de Render suspende el servicio tras ~15 min de
> inactividad; la primera petición puede tardar unos segundos en despertarlo.
