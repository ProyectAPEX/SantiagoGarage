-- Solicitudes de cotizacion que llegan desde el formulario del sitio.
--
-- Como correrlo: Supabase -> SQL Editor -> pegar todo -> Run.
-- Se puede correr mas de una vez sin romper nada.

create table if not exists public.solicitudes (
  id        uuid primary key default gen_random_uuid(),
  creada    timestamptz not null default now(),
  nombre    text not null check (char_length(nombre) between 1 and 80),
  telefono  text not null check (char_length(telefono) between 8 and 20),
  email     text check (email is null or char_length(email) <= 120),
  vehiculo  text check (vehiculo is null or char_length(vehiculo) <= 60),
  mensaje   text not null check (char_length(mensaje) between 1 and 600),
  estado    text not null default 'nueva'
            check (estado in ('nueva', 'cotizada', 'descartada')),
  atendida  timestamptz
);

-- La bandeja del admin filtra por estado y ordena por fecha
create index if not exists solicitudes_estado_creada
  on public.solicitudes (estado, creada desc);

-- Row Level Security activada y SIN politicas: con la clave publica (anon)
-- nadie puede leer ni escribir. Solo el servidor del sitio, con la clave
-- secreta, que no pasa por RLS.
alter table public.solicitudes enable row level security;

-- Doble cerrojo: los roles publicos ni siquiera tienen permiso sobre la tabla
revoke all on table public.solicitudes from anon, authenticated;

-- Verificacion: debe mostrar una fila con rls = true
select relname as tabla, relrowsecurity as rls
from pg_class
where relname = 'solicitudes';
