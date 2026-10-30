-- ============================================================
--  Migración 003 · audio explicativo de la prenda
--  Repetible: se puede ejecutar varias veces sin dañar los datos.
--  No borra nada. Se aplica con `npm run db:migrar`.
--
--  `audio` se agregó directamente a schema.sql y no tenía migración:
--  una base creada antes de ese cambio rechazaba cada publicación con
--  «column "audio" does not exist».
-- ============================================================

ALTER TABLE prendas ADD COLUMN IF NOT EXISTS audio text;
