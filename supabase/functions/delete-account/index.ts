// Edge Function: delete-account
//
// Borra la cuenta del usuario que llama, para siempre: primero limpia sus
// datos en las tablas propias (por si alguna no tiene ON DELETE CASCADE
// configurado hacia auth.users) y al final borra su cuenta de Auth. Exige
// volver a confirmar la contraseña actual antes de tocar nada — evita que
// una sesión abierta por accidente (o robada por unos segundos) borre la
// cuenta sin que la persona lo sepa.
//
// Usa la Service Role key SOLO aquí, en el servidor — nunca se manda al
// navegador. Es la única forma de borrar una cuenta de Supabase Auth: el
// cliente con la anon key no tiene permiso para eso.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonError(mensaje: string, status: number) {
  return new Response(JSON.stringify({ error: mensaje }), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

interface Body {
  password?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonError('Falta la sesión.', 401);

    // Cliente "de usuario": solo para confirmar quién llama y re-validar su
    // contraseña — no tiene privilegios de administrador.
    const supabaseUsuario = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabaseUsuario.auth.getUser();
    if (userError || !userData.user?.email) return jsonError('Sesión inválida.', 401);
    const usuario = userData.user;

    const body: Body = await req.json();
    const password = body.password ?? '';
    if (!password) return jsonError('Falta confirmar tu contraseña.', 400);

    const { error: passwordError } = await supabaseUsuario.auth.signInWithPassword({
      email: usuario.email,
      password,
    });
    if (passwordError) return jsonError('Tu contraseña no es correcta.', 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: dispositivos } = await admin
      .from('dispositivos')
      .select('id')
      .eq('usuario_id', usuario.id);
    const idsDispositivos = (dispositivos ?? []).map((d: { id: string }) => d.id);

    if (idsDispositivos.length > 0) {
      await admin.from('registros_uso').delete().in('dispositivo_id', idsDispositivos);
    }
    await admin.from('calculos').delete().eq('usuario_id', usuario.id);
    await admin.from('recomendaciones').delete().eq('usuario_id', usuario.id);
    await admin.from('dispositivos_sugeridos').delete().eq('usuario_id', usuario.id);
    await admin.from('sniffer_estado').delete().eq('usuario_id', usuario.id);
    await admin.from('dispositivos').delete().eq('usuario_id', usuario.id);
    await admin.from('perfiles').delete().eq('id', usuario.id);

    const { error: deleteError } = await admin.auth.admin.deleteUser(usuario.id);
    if (deleteError) {
      console.error('Error borrando cuenta de Auth:', deleteError);
      return jsonError('No pude eliminar tu cuenta. Intenta de nuevo.', 500);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Error en delete-account:', e);
    return jsonError('Solicitud inválida.', 400);
  }
});
