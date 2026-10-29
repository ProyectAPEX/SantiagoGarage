-- Recordatorio por WhatsApp el día antes, con botones Confirmo / Cancelar.
-- Correr en el SQL Editor de Supabase. Se puede correr de nuevo sin romper nada.

alter table public.citas
  add column if not exists recordatorio timestamptz,              -- cuándo salió el WhatsApp (null = todavía no)
  add column if not exists recordatorio_id text,                   -- id que le dio Meta, para rastrearlo
  add column if not exists asistencia_confirmada timestamptz;      -- cuándo tocó "Confirmo"

alter table public.citas drop constraint if exists citas_recordatorio_id_largo;
alter table public.citas add constraint citas_recordatorio_id_largo check (char_length(recordatorio_id) <= 200);

-- Comprobación: deben aparecer las tres columnas
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'citas'
  and column_name in ('recordatorio', 'recordatorio_id', 'asistencia_confirmada');
