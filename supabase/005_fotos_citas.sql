-- Fotos del daño que el cliente adjunta al agendar.
-- Correr en el SQL Editor de Supabase. Se puede correr de nuevo sin romper nada.
--
-- Las fotos viven en un espacio privado de Storage ("citas"): sin políticas,
-- nadie las ve desde el navegador. El panel las muestra con enlaces firmados
-- que vencen en una hora. Llegan ya achicadas a JPEG desde el navegador.

alter table public.citas
  add column if not exists fotos text[] not null default '{}';

alter table public.citas drop constraint if exists citas_fotos_max;
alter table public.citas add constraint citas_fotos_max check (cardinality(fotos) <= 5);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('citas', 'citas', false, 2097152, array['image/jpeg'])
on conflict (id) do update
  set public = false, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg'];

-- Comprobación: debe decir citas · false
select id, public from storage.buckets where id = 'citas';
