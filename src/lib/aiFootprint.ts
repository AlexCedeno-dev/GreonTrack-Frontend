// Estimado de referencia del gasto energético de tus consultas a Greon —
// NO es una medición exacta de OpenAI/ElevenLabs (no la publican por
// consulta), es un número redondo tomado de cifras públicas aproximadas
// para una consulta típica a un modelo de lenguaje de este tamaño. Se
// muestra siempre como estimado, nunca como dato certificado.
const WH_POR_CONSULTA = 0.3;

// Referencia para la equivalencia ("como tener encendido X minutos"): un
// foco LED doméstico típico.
const WATTS_FOCO_LED_REFERENCIA = 9;

export interface HuellaConsultasIA {
  consultas: number;
  whTotal: number;
  kwhTotal: number;
  co2TotalKg: number | null;
  minutosFocoLed: number;
}

export function estimarHuellaConsultasIA(
  consultas: number,
  factorCo2KgPorKwh: number | null
): HuellaConsultasIA {
  const whTotal = consultas * WH_POR_CONSULTA;
  const kwhTotal = whTotal / 1000;
  const co2TotalKg = factorCo2KgPorKwh !== null ? kwhTotal * factorCo2KgPorKwh : null;
  const minutosFocoLed = (whTotal / WATTS_FOCO_LED_REFERENCIA) * 60;
  return { consultas, whTotal, kwhTotal, co2TotalKg, minutosFocoLed };
}
