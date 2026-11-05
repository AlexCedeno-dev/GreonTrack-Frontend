-- Seguridad de perfiles: que ningun usuario pueda subirse de rol (p. ej. a admin).
--
-- La politica "usuarios ven su perfil" deja que cada usuario edite su propia
-- fila completa, incluida la columna role. El trigger proteger_rol_perfil bloquea ese cambio
-- salvo para administradores. Además se deja explícito el WITH CHECK de la
-- política para que un usuario no pueda escribir filas de otro.
--

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.proteger_rol_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Sin sesión de usuario = SQL Editor, triggers internos o service_role.
  if auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.role <> 'general' and not public.is_admin() then
      new.role := 'general';
    end if;
  elsif new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Solo un administrador puede cambiar roles' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_proteger_rol on public.perfiles;
create trigger trg_proteger_rol
  before insert or update on public.perfiles
  for each row execute function public.proteger_rol_perfil();

drop policy if exists "usuarios ven su perfil" on public.perfiles;
create policy "usuarios ven su perfil" on public.perfiles
  using (auth.uid() = id)
  with check (auth.uid() = id);

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;