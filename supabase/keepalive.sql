-- Latido diario para que el proyecto de Supabase (plan gratis) no se pause
-- por inactividad. Lo llama .github/workflows/keepalive.yml una vez al día.
--
-- La tabla no tiene políticas de RLS a propósito: nadie puede leerla ni
-- escribirla directo desde la API, solo a través de la función de abajo, que
-- únicamente actualiza una fecha — no expone ni modifica datos de usuarios.

create table if not exists public.keepalive (
  id int primary key default 1 check (id = 1),
  ultimo_ping timestamptz not null default now()
);

alter table public.keepalive enable row level security;

insert into public.keepalive (id) values (1) on conflict (id) do nothing;

create or replace function public.keepalive()
returns timestamptz
language sql
security definer
set search_path = ''
as $$
  update public.keepalive set ultimo_ping = now() where id = 1 returning ultimo_ping;
$$;

revoke all on function public.keepalive() from public;
grant execute on function public.keepalive() to anon, authenticated;
