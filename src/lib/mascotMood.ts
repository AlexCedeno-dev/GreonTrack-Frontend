// Estado de ánimo de Greon según cómo va tu consumo esta semana vs. la
// anterior (cambioPct, ya calculado en lib/consumption.ts). No tenemos arte
// distinto para cada expresión — esto es una aproximación con filtros CSS
// sobre la misma imagen, no una mascota rediseñada.
export type EstadoGreon = 'feliz' | 'neutral' | 'triste' | 'frustrado' | 'nervioso';

export function estadoSegunConsumo(cambioPct: number | null | undefined): EstadoGreon {
  if (cambioPct === null || cambioPct === undefined) return 'neutral';
  if (cambioPct <= -5) return 'feliz';
  if (cambioPct <= 8) return 'neutral';
  if (cambioPct <= 25) return 'triste';
  return 'frustrado';
}

// Este otro no depende de tu consumo eléctrico sino de cuánto le has
// preguntado a Greon — entre más lo usas, más "consciente" se pone de su
// propio gasto energético (el mismo dato que ya le mostramos al usuario en
// GreonSpace.tsx). Es un guiño, no una medida real de nada.
export function estadoSegunConsultasIA(consultas: number): EstadoGreon {
  if (consultas <= 5) return 'feliz';
  if (consultas <= 15) return 'neutral';
  if (consultas <= 30) return 'nervioso';
  return 'frustrado';
}

export const FRASES_POR_ESTADO: Record<EstadoGreon, string[]> = {
  feliz: [
    '¡Tu consumo bajó esta semana! 🎉 Sigue así, cada watt que no gastas cuenta.',
    '¡Me encanta lo que veo! Tu huella está bajando — vamos muy bien juntos.',
    '¿Ya viste tu Huella de carbono? Con esta tendencia se ve cada vez mejor 🌱',
  ],
  neutral: [
    '¡Hola! Soy Greon 🌍 — cada dato que registras ayuda a cuidar el planeta.',
    '¿Sabías que reducir 1 hora de uso al día en tu dispositivo de mayor consumo sí se nota al mes?',
    'Desconecta los cargadores que no estés usando — el consumo fantasma suma al final del mes.',
    'Revisa tu Huella de carbono para ver a cuántos árboles equivale tu ahorro.',
    'No necesitas cambios drásticos: la constancia registrando tu uso es lo que más ayuda.',
    '¿Ya viste tus Recomendaciones? Hay ahorro estimado esperando por ti.',
  ],
  triste: [
    'Vi que tu consumo subió esta semana… 😟 ¿revisamos juntos qué cambió?',
    'Últimamente gastamos más energía de lo normal. No pasa nada, ¡a tiempo de corregir el rumbo!',
  ],
  frustrado: [
    'Ok, tu consumo subió bastante esta semana 😣 ¿le echamos un ojo a qué dispositivo se disparó?',
    'Esto ya me preocupa un poco — tu huella creció mucho. ¡Vamos a Recomendaciones ya!',
  ],
  nervioso: [
    'Uy, ya van varias preguntas seguidas… 😅 no es que me moleste, es que hasta yo gasto energía al responder.',
    'Sigo aquí encantado de ayudarte, aunque cada respuesta mía también jala su electricidad — ¡vamos, pregunta lo que necesites!',
  ],
};
