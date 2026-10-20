# Hilo Circular

Marketplace de intercambio de ropa en **Medellín**: publica prendas, propone
intercambios, sigue los envíos y modera la comunidad.

- **Frontend:** React + Vite (`frontend`), desplegado en Vercel.
- **Backend:** Node.js + Express + PostgreSQL (`backend`), desplegado en Render.
- **Imágenes:** Cloudinary (el navegador sube directo con firma del backend).

```
hilo/                     # raíz del repositorio
├── .gitignore / .gitattributes
├── README.md             # este archivo
├── render.yaml           # blueprint de Render: API + PostgreSQL (rootDir: backend)
├── backend/              # API Express: src/, sql/, scripts/, test/
│   └── README.md         # endpoints, variables de entorno, despliegue
└── frontend/             # SPA React + Vite: src/, public/, vercel.json
    └── README.md         # ejecución local, conexión, Vercel
```

No hay `package.json` en la raíz: el backend y el frontend se instalan y se
ejecutan por separado, cada uno en su carpeta.

---

## Requisitos

- Node.js 20 o superior y npm
- Para datos persistentes: una base PostgreSQL (local, Render, Neon…)
- Para las imágenes: cuenta gratuita en [Cloudinary](https://cloudinary.com)

---

## Ejecutar en local

Abre dos terminales.

**Terminal 1 · backend**

```bash
cd backend
npm install
npm run demo        # API con datos en memoria en http://localhost:4000
```

**Terminal 2 · frontend**

```bash
cd frontend
npm install
npm run dev         # web en http://localhost:5173
```

Con `npm run demo` no necesitas PostgreSQL: la API corre con `pg-mem` y los
datos de ejemplo se reinician al cerrar.

Si ya tienes PostgreSQL, en `backend`:

```bash
cp .env.example .env    # completa DATABASE_URL, JWT_SECRET, etc.
npm run db:setup        # crea las tablas y deja la base vacía (entorno real)
npm run admin:crear -- --email tu@correo.com --clave "una-clave-segura" --nombre "Tu nombre"
npm run dev             # API real (:4000)
```

> `db:setup` ya **no** carga prendas, reseñas ni cuentas de prueba. Si quieres
esos datos para una demostración local usa `npm run db:setup:demo`.

### Empezar a operar con datos reales

```bash
npm run db:limpiar              # borra actividad y cuentas de cliente, conserva admin
npm run db:limpiar -- --todo    # borra también todas las cuentas
```

### Scripts

| Carpeta | Script | Qué hace |
| ------- | ------ | -------- |
| `backend` | `npm run demo` | API con datos en memoria |
| `backend` | `npm run dev` | API con Postgres real (reinicia al guardar) |
| `backend` | `npm start` | API en producción |
| `backend` | `npm run db:setup` | Crea las tablas y deja la base vacía |
| `backend` | `npm run db:setup:demo` | Crea tablas y carga datos de demostración |
| `backend` | `npm run db:limpiar` | Borra datos de prueba (conserva administración) |
| `backend` | `npm run admin:crear` | Crea o actualiza la cuenta de administración |
| `backend` | `npm test` | Tests (Postgres en memoria) |
| `frontend` | `npm run dev` | Web en modo desarrollo |
| `frontend` | `npm run build` | Compila en `frontend/dist` |
| `frontend` | `npm run preview` | Sirve `dist/` en local |

---

## Conexión frontend ↔ backend

1. **Frontend** → `frontend/.env` (copia de `.env.example`):

   ```bash
   VITE_API_URL=http://localhost:4000
   ```

2. **Backend** → `backend/.env` (copia de `.env.example`):

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

### Cuentas demo (solo con `npm run demo` o `db:setup:demo`)

| Rol     | Correo                      |
| ------- | --------------------------- |
| Cliente | `valentina@hilocircular.co` |
| Admin   | `admin@hilocircular.co`     |

Contraseña: `demo123`. En producción crea tu propia cuenta con
`npm run admin:crear` y registra clientes desde la web.

---

## Despliegue

1. **Render (API + BD):** **New → Blueprint**, elige este repo; el `render.yaml`
   de la raíz crea `hilo-circular-api` y `hilo-circular-db`. Completa las claves
   de Cloudinary, ajusta `CORS_ORIGIN` con la URL de Vercel y ejecuta una vez
   `npm run db:setup` (desde `backend`) con la **External Database URL**.
2. **Vercel (web):** importa el repo, pon **Root Directory** = `frontend` y la
   variable `VITE_API_URL` con la URL de Render.

> La base PostgreSQL gratuita de Render expira a los 30 días. Para algo
> duradero usa Neon y pon su `DATABASE_URL` en Render.

Detalle paso a paso: `backend/README.md` y `frontend/README.md`.

---

## Subir a GitHub

```bash
cd hilo
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git push -u origin main
```

`node_modules/`, `dist/` y los `.env` quedan fuera del repo por el `.gitignore`.
