-- Historial de presupuestos emitidos desde el panel.
-- Correr en el SQL Editor de Supabase, una sola vez.
--
-- Nadie entra a esta tabla desde el navegador: RLS activado y sin políticas,
-- así que las claves públicas no pueden leer ni escribir nada. El panel entra
-- por el servidor con la clave secreta, que se salta RLS.

create table if not exists public.presupuestos (
  id uuid primary key default gen_random_uuid(),
  creado timestamptz not null default now(),

  numero text not null check (char_length(numero) <= 20),
  fecha text check (char_length(fecha) <= 12),

  cliente_nombre text not null check (char_length(cliente_nombre) between 1 and 80),
  cliente_rut text check (char_length(cliente_rut) <= 12),
  cliente_telefono text check (char_length(cliente_telefono) <= 17),
  cliente_email text check (char_length(cliente_email) <= 120),
  cliente_domicilio text check (char_length(cliente_domicilio) <= 60),
  cliente_comuna text check (char_length(cliente_comuna) <= 30),

  vehiculo_marca text check (char_length(vehiculo_marca) <= 40),
  vehiculo_modelo text check (char_length(vehiculo_modelo) <= 40),
  vehiculo_patente text check (char_length(vehiculo_patente) <= 10),
  vehiculo_anio text check (char_length(vehiculo_anio) <= 4),
  vehiculo_color text check (char_length(vehiculo_color) <= 25),

  -- [{descripcion, precio}] tal como salió en el PDF
  items jsonb not null default '[]'::jsonb,

  descuento integer not null default 0 check (descuento >= 0),
  subtotal integer not null default 0 check (subtotal >= 0),
  iva integer not null default 0 check (iva >= 0),
  total integer not null default 0 check (total >= 0),

  plazo_dias text check (char_length(plazo_dias) <= 3),
  validez_dias text check (char_length(validez_dias) <= 3),
  observaciones text check (char_length(observaciones) <= 400),

  -- cómo se entregó: 'whatsapp' cuando se abrió el chat, 'pdf' si solo se descargó
  enviado_por text check (enviado_por in ('whatsapp', 'pdf'))
);

create index if not exists presupuestos_creado_idx on public.presupuestos (creado desc);
create index if not exists presupuestos_patente_idx on public.presupuestos (vehiculo_patente);

alter table public.presupuestos enable row level security;
revoke all on table public.presupuestos from anon, authenticated;

-- Comprobación: debe decir true
select relrowsecurity as rls_activado
from pg_class
where oid = 'public.presupuestos'::regclass;
