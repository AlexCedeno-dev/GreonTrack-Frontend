-- Control del Sniffer desde la web: prender/pausar, pedir un escaneo y ver
-- lo que va haciendo. Las políticas de la tabla (cada usuario ve y actualiza
-- solo su fila) ya cubren estas columnas.
alter table public.sniffer_estado
  add column if not exists encendido boolean not null default true,
  add column if not exists escaneando boolean not null default false,
  add column if not exists escanear_ahora timestamptz,
  add column if not exists bitacora jsonb not null default '[]'::jsonb;
