-- ============================================================
--  Hilo Circular · esquema de base de datos (PostgreSQL 13+)
--  Ejecuta este archivo sobre una base vacía.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS reportes, pedidos, intercambios, resenas, favoritos, prendas, usuarios CASCADE;

-- ---------------------------------------------------------- usuarios
CREATE TABLE usuarios (
  id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nombre        text NOT NULL,
  email         text NOT NULL UNIQUE,
  clave_hash    text NOT NULL,
  ciudad        text NOT NULL DEFAULT 'Medellín',
  barrio        text,
  direccion     text,
  bio           text NOT NULL DEFAULT '',
  intereses     text[] NOT NULL DEFAULT '{}',
  rol           text NOT NULL DEFAULT 'usuario' CHECK (rol IN ('usuario', 'admin')),
  verificado    boolean NOT NULL DEFAULT false,
  reputacion    numeric(2,1) NOT NULL DEFAULT 5.0,
  intercambios  integer NOT NULL DEFAULT 0,
  desde         date NOT NULL DEFAULT CURRENT_DATE,
  estado        text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido')),
  creado        timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------- prendas
CREATE TABLE prendas (
  id           text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  titulo       text NOT NULL,
  tipo         text NOT NULL DEFAULT 'camiseta',
  categoria    text NOT NULL,
  talla        text NOT NULL,
  estado       text NOT NULL DEFAULT 'Buen estado',
  color        text,
  marca        text,
  valor        numeric(10,2) NOT NULL DEFAULT 0,
  descripcion  text NOT NULL DEFAULT '',
  dueno_id     text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  ciudad       text NOT NULL DEFAULT 'Medellín',
  barrio       text,
  disponible   boolean NOT NULL DEFAULT true,
  destacada    boolean NOT NULL DEFAULT false,
  vistas       integer NOT NULL DEFAULT 0,
  likes        integer NOT NULL DEFAULT 0,
  creada       date NOT NULL DEFAULT CURRENT_DATE,
  fotos        text[] NOT NULL DEFAULT '{}',
  paleta       text[] NOT NULL DEFAULT '{}'
);
CREATE INDEX idx_prendas_dueno ON prendas(dueno_id);
CREATE INDEX idx_prendas_categoria ON prendas(categoria);
CREATE INDEX idx_prendas_disponible ON prendas(disponible);

-- ---------------------------------------------------------- favoritos
CREATE TABLE favoritos (
  usuario_id text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  prenda_id  text NOT NULL REFERENCES prendas(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, prenda_id)
);

-- ---------------------------------------------------------- reseñas
CREATE TABLE resenas (
  id         text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  autor_id   text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  para_id    text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  prenda_id  text REFERENCES prendas(id) ON DELETE SET NULL,
  estrellas  integer NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
  texto      text NOT NULL,
  fecha      date NOT NULL DEFAULT CURRENT_DATE,
  util       integer NOT NULL DEFAULT 0,
  reportada  boolean NOT NULL DEFAULT false,
  respuesta  text NOT NULL DEFAULT ''
);
CREATE INDEX idx_resenas_para ON resenas(para_id);

-- ---------------------------------------------------------- intercambios
CREATE TABLE intercambios (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  prenda_id       text NOT NULL REFERENCES prendas(id) ON DELETE CASCADE,
  ofrece_id       text NOT NULL REFERENCES prendas(id) ON DELETE CASCADE,
  solicitante_id  text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  receptor_id     text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  estado          text NOT NULL DEFAULT 'Pendiente'
                  CHECK (estado IN ('Pendiente', 'Aceptado', 'Rechazado', 'Completado', 'Cancelado')),
  fecha           date NOT NULL DEFAULT CURRENT_DATE,
  mensaje         text NOT NULL DEFAULT ''
);
CREATE INDEX idx_intercambios_partes ON intercambios(solicitante_id, receptor_id);

-- ---------------------------------------------------------- pedidos (envíos)
CREATE TABLE pedidos (
  id               text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  prenda_id        text REFERENCES prendas(id) ON DELETE SET NULL,
  usuario_id       text REFERENCES usuarios(id) ON DELETE SET NULL,
  receptor_id      text REFERENCES usuarios(id) ON DELETE SET NULL,
  intercambio_id   text REFERENCES intercambios(id) ON DELETE SET NULL,
  metodo           text NOT NULL DEFAULT 'Domicilio',
  ciudad           text NOT NULL DEFAULT 'Medellín',
  estado           text NOT NULL DEFAULT 'Preparando'
                   CHECK (estado IN ('Preparando', 'En camino', 'Entregado', 'Incidencia')),
  guia             text,
  fecha            date NOT NULL DEFAULT CURRENT_DATE,
  costo            numeric(10,2) NOT NULL DEFAULT 0,
  transportadora   text
);
CREATE INDEX idx_pedidos_partes ON pedidos(usuario_id, receptor_id);

-- ---------------------------------------------------------- reportes
CREATE TABLE reportes (
  id         text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tipo       text NOT NULL,
  motivo     text NOT NULL,
  prenda_id  text REFERENCES prendas(id) ON DELETE SET NULL,
  usuario_id text REFERENCES usuarios(id) ON DELETE SET NULL,
  resena_id  text REFERENCES resenas(id) ON DELETE SET NULL,
  pedido_id  text REFERENCES pedidos(id) ON DELETE SET NULL,
  estado     text NOT NULL DEFAULT 'En revisión'
             CHECK (estado IN ('En revisión', 'Escalado', 'Resuelto')),
  fecha      date NOT NULL DEFAULT CURRENT_DATE
);

-- ---------------------------------------------------------- notificaciones (por usuario)
CREATE TABLE notificaciones (
  id         text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  usuario_id text NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo       text NOT NULL DEFAULT 'sistema',
  texto      text NOT NULL,
  fecha      text NOT NULL DEFAULT 'Reciente',
  leida      boolean NOT NULL DEFAULT false,
  destino    text,
  creada     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
