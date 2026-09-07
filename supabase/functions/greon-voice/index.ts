// Edge Function: greon-voice
//
// Recibe un texto corto (un tip de Greon) y regresa el audio en MP3
// generado por la API de texto-a-voz de ElevenLabs, para que el
// MascotWidget lo reproduzca en vez de usar la voz del navegador.
//
// La API key de ElevenLabs vive SOLO aquí, como secreto de Supabase
// (Deno.env) — nunca se manda al navegador. Igual que greon-chat, exige
// el JWT de sesión del usuario por default, así que no cualquiera puede
// invocarla y gastar la cuota.

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
// Voz elegida por el usuario (Jessica, premade — las voces "premade" de
// la cuenta se pueden usar por API en el plan gratis; las de la Voice
// Library que solo se "agregan" a Mis Voces no). Cámbiala guardando un
// secreto ELEVENLABS_VOICE_ID con otro Voice ID, sin tocar este código.
const VOICE_ID = Deno.env.get('ELEVENLABS_VOICE_ID') || 'cgSgspJ2msm6clMCkdW9';
const MODEL_ID = 'eleven_multilingual_v2';
const MAX_CARACTERES = 300;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Body {
  texto?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (!ELEVENLABS_API_KEY) {
    return new Response(JSON.stringify({ error: 'Falta configurar ELEVENLABS_API_KEY en Supabase.' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: Body = await req.json();
    const texto = (body.texto ?? '').trim().slice(0, MAX_CARACTERES);

    if (!texto) {
      return new Response(JSON.stringify({ error: 'Falta el texto a convertir.' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const respuestaElevenLabs = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({ text: texto, model_id: MODEL_ID }),
    });

    if (!respuestaElevenLabs.ok) {
      const detalle = await respuestaElevenLabs.text();
      console.error('Error de ElevenLabs:', respuestaElevenLabs.status, detalle);
      return new Response(JSON.stringify({ error: 'No pude generar la voz. Intenta de nuevo.' }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const audio = await respuestaElevenLabs.arrayBuffer();
    return new Response(audio, {
      headers: { ...CORS_HEADERS, 'Content-Type': 'audio/mpeg' },
    });
  } catch (e) {
    console.error('Error en greon-voice:', e);
    return new Response(JSON.stringify({ error: 'Solicitud inválida.' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
