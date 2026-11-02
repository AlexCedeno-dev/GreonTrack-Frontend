// Cálculo del recibo de luz doméstico de CFE: cobra por escalones — los
// primeros kWh del periodo son baratos y los siguientes cuestan más.
//
// OJO: los precios y los límites de abajo son valores de REFERENCIA (fuera de
// verano, sin alumbrado público). CFE los actualiza cada mes y varían por
// región, así que se cambian aquí en un solo lugar cuando haga falta. Sirven
// para comparar y entender el recibo, no para sustituirlo.

export type TarifaCfe = '1' | '1A' | '1B' | '1C' | '1D' | '1E' | '1F';

export const TARIFAS: TarifaCfe[] = ['1', '1A', '1B', '1C', '1D', '1E', '1F'];

// Precio por kWh, sin IVA.
export const PRECIOS_CFE = {
  basico: 1.125,
  intermedio: 1.369,
  excedente: 4.004,
  referencia: 'jun-2026',
};

export const IVA = 0.16;

// Límites mensuales por tarifa: cuántos kWh caben en cada escalón y a partir
// de cuántos kWh al mes se cae en la tarifa de alto consumo (DAC).
const LIMITES_MENSUALES: Record<TarifaCfe, { basico: number; intermedio: number; dac: number }> = {
  '1': { basico: 75, intermedio: 65, dac: 250 },
  '1A': { basico: 100, intermedio: 50, dac: 300 },
  '1B': { basico: 125, intermedio: 100, dac: 400 },
  '1C': { basico: 150, intermedio: 150, dac: 850 },
  '1D': { basico: 175, intermedio: 225, dac: 1000 },
  '1E': { basico: 300, intermedio: 900, dac: 2000 },
  '1F': { basico: 300, intermedio: 1200, dac: 2500 },
};

// CFE cobra cada dos meses, por eso los escalones se duplican.
export const MESES_POR_RECIBO = 2;
export const DIAS_POR_BIMESTRE = 61;

export interface EscalonRecibo {
  clave: 'basico' | 'intermedio' | 'excedente';
  nombre: string;
  kwh: number;
  precio: number;
  subtotal: number;
  // Cuántos kWh caben en este escalón (null en el último, que no tiene tope).
  tope: number | null;
}

export interface Recibo {
  tarifa: TarifaCfe;
  kwh: number;
  escalones: EscalonRecibo[];
  subtotal: number;
  iva: number;
  total: number;
  // Promedio mensual y límite mensual de la DAC para esta tarifa.
  kwhMensual: number;
  limiteDacMensual: number;
  // 0–1+: qué tan cerca se está del límite de alto consumo.
  avanceDac: number;
  superaDac: boolean;
  // Precio promedio de cada kWh ya con IVA.
  precioPromedio: number;
}

export function limitesBimestre(tarifa: TarifaCfe) {
  const l = LIMITES_MENSUALES[tarifa];
  return {
    basico: l.basico * MESES_POR_RECIBO,
    intermedio: l.intermedio * MESES_POR_RECIBO,
    dac: l.dac * MESES_POR_RECIBO,
  };
}

export function calcularRecibo(kwhBimestre: number, tarifa: TarifaCfe): Recibo {
  const kwh = Math.max(0, kwhBimestre);
  const lim = limitesBimestre(tarifa);

  const kwhBasico = Math.min(kwh, lim.basico);
  const kwhIntermedio = Math.min(Math.max(kwh - lim.basico, 0), lim.intermedio);
  const kwhExcedente = Math.max(kwh - lim.basico - lim.intermedio, 0);

  const escalones: EscalonRecibo[] = [
    { clave: 'basico', nombre: 'Básico', kwh: kwhBasico, precio: PRECIOS_CFE.basico, subtotal: kwhBasico * PRECIOS_CFE.basico, tope: lim.basico },
    { clave: 'intermedio', nombre: 'Intermedio', kwh: kwhIntermedio, precio: PRECIOS_CFE.intermedio, subtotal: kwhIntermedio * PRECIOS_CFE.intermedio, tope: lim.intermedio },
    { clave: 'excedente', nombre: 'Excedente', kwh: kwhExcedente, precio: PRECIOS_CFE.excedente, subtotal: kwhExcedente * PRECIOS_CFE.excedente, tope: null },
  ];

  const subtotal = escalones.reduce((suma, e) => suma + e.subtotal, 0);
  const iva = subtotal * IVA;
  const total = subtotal + iva;
  const kwhMensual = kwh / MESES_POR_RECIBO;
  const limiteDacMensual = LIMITES_MENSUALES[tarifa].dac;

  return {
    tarifa,
    kwh,
    escalones,
    subtotal,
    iva,
    total,
    kwhMensual,
    limiteDacMensual,
    avanceDac: limiteDacMensual > 0 ? kwhMensual / limiteDacMensual : 0,
    superaDac: kwhMensual > limiteDacMensual,
    precioPromedio: kwh > 0 ? total / kwh : 0,
  };
}

export function formatoPesos(valor: number): string {
  return valor.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
