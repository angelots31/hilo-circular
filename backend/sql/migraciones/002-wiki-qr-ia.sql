-- ============================================================
--  Migración 002 · wiki de telas, QR de concientización e IA
--  Repetible: se puede ejecutar varias veces sin dañar los datos.
--  No borra nada. Se aplica con `npm run db:migrar`.
-- ============================================================

-- ------------------------------------------------ usuarios (intentos y clave)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS clave_cambiada timestamptz;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS intentos_fallidos integer NOT NULL DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bloqueado_hasta timestamptz;

-- ------------------------------------------------ prendas (composición)
ALTER TABLE prendas ADD COLUMN IF NOT EXISTS composicion text[] NOT NULL DEFAULT '{}';

-- ------------------------------------------------ telas (wiki de materiales)
CREATE TABLE IF NOT EXISTS telas (
  slug            text PRIMARY KEY,
  nombre          text NOT NULL,
  familia         text NOT NULL CHECK (familia IN ('Natural', 'Sintética', 'Artificial', 'Mezcla')),
  resumen         text NOT NULL,
  impacto         text NOT NULL,
  ayuda           text NOT NULL,
  cuidado         text[] NOT NULL DEFAULT '{}',
  reparar_reusar  text[] NOT NULL DEFAULT '{}',
  fin_de_vida     text NOT NULL,
  fuentes         jsonb NOT NULL DEFAULT '[]',
  actualizado     date NOT NULL DEFAULT CURRENT_DATE
);
CREATE INDEX IF NOT EXISTS idx_telas_familia ON telas(familia);

-- ------------------------------------------------ escaneos del QR
CREATE TABLE IF NOT EXISTS qr_visitas (
  dia     date PRIMARY KEY DEFAULT CURRENT_DATE,
  conteo  integer NOT NULL DEFAULT 0
);

-- ------------------------------------------------ uso del asistente
CREATE TABLE IF NOT EXISTS ia_uso (
  dia        date PRIMARY KEY DEFAULT CURRENT_DATE,
  preguntas  integer NOT NULL DEFAULT 0
);
