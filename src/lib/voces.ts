// Voces ElevenLabs disponibles para Greon: las mismas 3 que se le mostraron
// al usuario al elegir la voz del monito (todas "premade" de la cuenta, así
// que sí funcionan por API en el plan gratis — a diferencia de las voces de
// la Voice Library que solo se "agregan" a Mis Voces).
export interface VozDisponible {
  id: string;
  nombre: string;
  descripcion: string;
}

export const VOCES_DISPONIBLES: VozDisponible[] = [
  { id: 'cgSgspJ2msm6clMCkdW9', nombre: 'Jessica', descripcion: 'Juguetona y cálida' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', nombre: 'Laura', descripcion: 'Entusiasta y chispeante' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', nombre: 'Alice', descripcion: 'Clara y agradable' },
];

export const VOZ_POR_DEFECTO = VOCES_DISPONIBLES[0].id;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Pide el audio a la Edge Function greon-voice (la API key de ElevenLabs
// nunca sale del servidor) y regresa un <audio> listo para reproducirse.
// Lanza si algo falla, para que quien la llame decida el respaldo (voz del
// navegador).
export async function generarAudioElevenLabs(texto: string, voiceId: string): Promise<HTMLAudioElement> {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/greon-voice`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ texto, voiceId }),
  });
  if (!resp.ok) throw new Error('greon-voice respondió con error');

  const bytes = await resp.blob();
  if (bytes.size === 0) throw new Error('Sin audio');

  const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(audioBlob);
  const audio = new Audio(url);
  audio.addEventListener('ended', () => URL.revokeObjectURL(url), { once: true });
  return audio;
}
