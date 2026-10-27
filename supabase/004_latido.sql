-- Latido: una fila que /api/latido reescribe una vez al día.
-- Correr en el SQL Editor de Supabase. Se puede correr de nuevo sin romper nada.
--
-- Supabase pausa el plan gratis cuando la base pasa una semana sin "actividad
-- suficiente". Solo contar filas no alcanzó (la base se pausó igual en octubre
-- de 2026 con el latido andando): escribir es actividad de verdad.

create table if not exists public.latido (
  id integer primary key check (id = 1),
  ultimo timestamptz not null default now()
);

insert into public.latido (id) values (1) on conflict (id) do nothing;

alter table public.latido enable row level security;
revoke all on table public.latido from anon, authenticated;
