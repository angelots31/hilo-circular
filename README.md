# Hilo Circular

Marketplace de intercambio de ropa en **Medellín**: publica prendas, propone
intercambios, sigue los envíos y modera la comunidad.

- **Frontend:** React + Vite (`hilo/frontend`), desplegado en Vercel.
- **Backend:** Node.js + Express + PostgreSQL (`hilo/backend`), desplegado en Render.
- **Imágenes:** Cloudinary (el navegador sube directo con firma del backend).

```
.
├── .gitignore / .gitattributes
├── package.json          # scripts de la raíz (dev, test, build…)
├── README.md             # este archivo
├── render.yaml           # blueprint de Render: API + PostgreSQL (rootDir: hilo/backend)
└── hilo/
    ├── backend/          # API Express: src/, sql/, scripts/, test/
    │   └── README.md     # endpoints, variables de entorno, despliegue
    └── frontend/         # SPA React + Vite: src/, public/, vercel.json
        └── README.md     # ejecución local, conexión, Vercel
```

---

## Requisitos

- Node.js 20 o superior y npm
- Para datos persistentes: una base PostgreSQL (local, Render, Tiger Cloud, Neon…)
- Para las imágenes: cuenta gratuita en [Cloudinary](https://cloudinary.com)

---

## Ejecutar en local

```bash
npm install        # instala raíz + backend + frontend
npm run demo       # API con datos en memoria (:4000) + web (:5173)
```

Abre <http://localhost:5173>. Con `npm run demo` no necesitas PostgreSQL: la API
corre con `pg-mem` y los datos de ejemplo se reinician al cerrar.

Si ya tienes PostgreSQL:

```bash
npm run db:setup   # crea las tablas y carga el seed (usa hilo/backend/.env)
npm run dev        # API real (:4000) + web (:5173)
```

### Scripts de la raíz

| Script | Qué hace |
| ------ | -------- |
| `npm run dev` | Backend (Postgres real) + frontend a la vez |
| `npm run demo` | Backend (demo en memoria) + frontend a la vez |
| `npm run dev:api` / `demo:api` | Solo la API |
| `npm run dev:web` | Solo la web |
| `npm run db:setup` | Crea tablas y carga datos de ejemplo |
| `npm test` | Tests del backend (Postgres en memoria) |
| `npm run build` | Compila el frontend en `hilo/frontend/dist` |

---

## Conexión frontend ↔ backend

1. **Frontend** → `hilo/frontend/.env` (copia de `.env.example`):

   ```bash
   VITE_API_URL=http://localhost:4000
   ```

   El cliente de la API vive en `hilo/frontend/src/lib/api.js`.

2. **Backend** → `hilo/backend/.env` (copia de `.env.example`):

   ```bash
   PORT=4000
   CORS_ORIGIN=http://localhost:5173,http://localhost:4173
   JWT_SECRET=<secreto largo>
   DATABASE_URL=            # vacío = usa npm run demo
   PGSSL=false
   ```

3. Comprueba que todo conecte: `GET http://localhost:4000/api/salud` debe
   responder `{"ok":true,...}`.

> Los `.env` **no se suben a git**; solo se versionan los `.env.example`.

### Cuentas demo (contraseña `demo123`)

| Rol     | Correo                      |
| ------- | --------------------------- |
| Cliente | `valentina@hilocircular.co` |
| Admin   | `admin@hilocircular.co`     |

---

## Pruebas

```bash
npm test      # esquema + API contra PostgreSQL en memoria
```

---

## Despliegue

1. **Render (API + BD):** en Render, **New → Blueprint**, elige este repo; el
   `render.yaml` de la raíz crea `hilo-circular-api` y `hilo-circular-db`.
   Después completa las claves de Cloudinary y ajusta `CORS_ORIGIN` con la URL
   de Vercel, y ejecuta una vez `npm run db:setup` con el `DATABASE_URL` de Render.
2. **Vercel (web):** importa el repo, pon **Root Directory** = `hilo/frontend` y
   la variable `VITE_API_URL` con la URL de Render.

Detalle paso a paso: `hilo/backend/README.md` y `hilo/frontend/README.md`.

---

## Subir a GitHub

El repositorio ya está inicializado con el commit inicial. Solo falta enlazarlo
con tu remoto:

```bash
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git push -u origin main
```

Los directorios `node_modules/`, `dist/` y los archivos `.env` quedan fuera del
repo por el `.gitignore`.
