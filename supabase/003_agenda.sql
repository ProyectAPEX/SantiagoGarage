-- Agenda de horas que se toman desde la web (/agendar).
-- Correr en el SQL Editor de Supabase, una sola vez. Se puede correr de nuevo
-- sin romper nada.
--
-- Igual que presupuestos: RLS activado y sin políticas, así que las claves
-- públicas no pueden leer ni escribir nada. La web entra por el servidor con
-- la clave secreta.

create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  creada timestamptz not null default now(),

  tipo text not null check (tipo in ('particular', 'aseguradora', 'presupuesto')),

  -- Día y hora tal como los ve el taller (hora de Chile), para mostrar y contar cupos
  fecha date not null,
  hora text not null check (hora ~ '^\d{2}:\d{2}$'),
  -- Los mismos, como instantes reales: con estos se evita que dos citas se pisen
  inicio timestamptz not null,
  fin timestamptz not null check (fin > inicio),

  estado text not null default 'confirmada' check (estado in ('confirmada', 'cancelada')),
  cancelada timestamptz,

  nombre text not null check (char_length(nombre) between 1 and 80),
  telefono text not null check (char_length(telefono) between 8 and 20),
  email text not null check (char_length(email) between 5 and 120),
  marca text check (char_length(marca) <= 40),
  modelo text check (char_length(modelo) <= 40),
  patente text check (char_length(patente) <= 10),
  aseguradora text check (char_length(aseguradora) <= 40),
  siniestro text check (char_length(siniestro) <= 30),
  comentario text check (char_length(comentario) <= 400),

  -- Dos citas confirmadas no pueden pisarse, aunque lleguen en el mismo
  -- segundo: lo frena la base, no el código
  constraint citas_sin_choque exclude using gist (tstzrange(inicio, fin, '[)') with &&)
    where (estado = 'confirmada')
);

create index if not exists citas_fecha_idx on public.citas (fecha);
create index if not exists citas_inicio_idx on public.citas (inicio);

-- Días que el taller cierra desde el panel (vacaciones, un imprevisto)
create table if not exists public.agenda_bloqueos (
  fecha date primary key,
  motivo text check (char_length(motivo) <= 80),
  creado timestamptz not null default now()
);

alter table public.citas enable row level security;
alter table public.agenda_bloqueos enable row level security;
revoke all on table public.citas from anon, authenticated;
revoke all on table public.agenda_bloqueos from anon, authenticated;

-- Comprobación: las dos deben decir true
select relname as tabla, relrowsecurity as rls_activado
from pg_class
where oid in ('public.citas'::regclass, 'public.agenda_bloqueos'::regclass);
