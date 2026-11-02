// Modelo de "Mi casa": la maqueta interactiva donde se prenden y apagan los
// aparatos para ver cuánta luz gastan y cómo se va armando el recibo.
//
// La maqueta es un simulador: lo que se agrega aquí NO se guarda como
// dispositivo real ni cambia tu historial de consumo. Solo se acuerda de tu
// casa de juguete en este navegador.

import type { ConsumoDispositivo } from './consumption';
import { DIAS_POR_BIMESTRE } from './cfe';

export type CuartoId = 'principal' | 'ninos' | 'oficina' | 'garage' | 'sala' | 'cocina';

export interface Cuarto {
  id: CuartoId;
  nombre: string;
  piso: 0 | 1; // 0 = planta baja, 1 = planta alta
  x: number;
  w: number;
  // Espacio libre a la izquierda (la escalera ocupa un pedazo de la sala).
  padIzq: number;
}

// Medidas del dibujo (viewBox 960 × 560).
export const ESCENA = { w: 960, h: 560, sueloY: 470, pisoAltoY: 290, pisoBajoY: 460, techoGrosor: 10 };
export const CASA = { x: 120, w: 720 };
export const SLOTS_POR_CUARTO = 4;

export const CUARTOS: Cuarto[] = [
  { id: 'principal', nombre: 'Recámara principal', piso: 1, x: 120, w: 250, padIzq: 36 },
  { id: 'ninos', nombre: 'Recámara de los niños', piso: 1, x: 370, w: 240, padIzq: 36 },
  { id: 'oficina', nombre: 'Oficina', piso: 1, x: 610, w: 230, padIzq: 36 },
  { id: 'garage', nombre: 'Garage', piso: 0, x: 120, w: 220, padIzq: 36 },
  { id: 'sala', nombre: 'Sala', piso: 0, x: 340, w: 250, padIzq: 70 },
  { id: 'cocina', nombre: 'Cocina', piso: 0, x: 590, w: 250, padIzq: 36 },
];

// La escalera sube en diagonal: entra por abajo en ESCALERA_BAJA_X y sale
// arriba en ESCALERA_ALTA_X.
export const ESCALERA_BAJA_X = 354;
export const ESCALERA_ALTA_X = 392;

export function cuartoPorId(id: CuartoId): Cuarto {
  return CUARTOS.find((c) => c.id === id) ?? CUARTOS[0];
}

export function pisoY(piso: 0 | 1): number {
  return piso === 1 ? ESCENA.pisoAltoY : ESCENA.pisoBajoY;
}

export function slotX(cuarto: Cuarto, slot: number): number {
  const util = cuarto.w - cuarto.padIzq - 34;
  return cuarto.x + cuarto.padIzq + (util / (SLOTS_POR_CUARTO - 1)) * slot;
}

export type Visual =
  | 'tv'
  | 'minisplit'
  | 'refri'
  | 'ventilador'
  | 'foco'
  | 'laptop'
  | 'compu'
  | 'consola'
  | 'plancha'
  | 'secadora'
  | 'micro'
  | 'lavadora'
  | 'boiler'
  | 'router'
  | 'cafetera'
  | 'aspiradora'
  | 'coche'
  | 'generico';

export interface AparatoCatalogo {
  visual: Visual;
  nombre: string;
  // Tipo equivalente en la lista de dispositivos de GreonTrack.
  tipoDb: string;
  watts: number;
  horas: number; // horas de uso al día, típicas
  cuarto: CuartoId;
}

export const CATALOGO: AparatoCatalogo[] = [
  { visual: 'tv', nombre: 'Televisión', tipoDb: 'Televisión (LED)', watts: 100, horas: 5, cuarto: 'sala' },
  { visual: 'minisplit', nombre: 'Minisplit', tipoDb: 'Aire acondicionado', watts: 900, horas: 6, cuarto: 'principal' },
  { visual: 'refri', nombre: 'Refrigerador', tipoDb: 'Refrigerador', watts: 150, horas: 8, cuarto: 'cocina' },
  { visual: 'foco', nombre: 'Focos LED', tipoDb: 'Iluminación', watts: 60, horas: 5, cuarto: 'sala' },
  { visual: 'ventilador', nombre: 'Ventilador', tipoDb: 'Ventilador', watts: 55, horas: 6, cuarto: 'ninos' },
  { visual: 'laptop', nombre: 'Laptop', tipoDb: 'Laptop', watts: 65, horas: 6, cuarto: 'oficina' },
  { visual: 'compu', nombre: 'Computadora', tipoDb: 'Computadora de escritorio', watts: 200, horas: 5, cuarto: 'oficina' },
  { visual: 'consola', nombre: 'Consola', tipoDb: 'Consola de videojuegos', watts: 150, horas: 3, cuarto: 'ninos' },
  { visual: 'plancha', nombre: 'Plancha', tipoDb: 'Otro', watts: 1200, horas: 0.5, cuarto: 'principal' },
  { visual: 'secadora', nombre: 'Secadora de pelo', tipoDb: 'Otro', watts: 1800, horas: 0.3, cuarto: 'principal' },
  { visual: 'micro', nombre: 'Microondas', tipoDb: 'Microondas', watts: 1000, horas: 0.4, cuarto: 'cocina' },
  { visual: 'cafetera', nombre: 'Cafetera', tipoDb: 'Cafetera', watts: 800, horas: 0.4, cuarto: 'cocina' },
  { visual: 'lavadora', nombre: 'Lavadora', tipoDb: 'Lavadora', watts: 500, horas: 1, cuarto: 'garage' },
  { visual: 'boiler', nombre: 'Calentador de agua', tipoDb: 'Calentador de agua', watts: 1500, horas: 1.5, cuarto: 'garage' },
  { visual: 'router', nombre: 'Router de internet', tipoDb: 'Router', watts: 10, horas: 24, cuarto: 'sala' },
  { visual: 'aspiradora', nombre: 'Aspiradora', tipoDb: 'Aspiradora', watts: 1200, horas: 0.3, cuarto: 'sala' },
  { visual: 'coche', nombre: 'Coche eléctrico', tipoDb: 'Otro', watts: 3300, horas: 3, cuarto: 'garage' },
];

export interface AparatoCasa {
  uid: string;
  visual: Visual;
  nombre: string;
  watts: number;
  horas: number;
  cuarto: CuartoId;
  slot: number;
  encendido: boolean;
}

// Mismo mapeo, pero desde el tipo de un dispositivo real de GreonTrack.
const VISUAL_POR_TIPO_DB: Record<string, { visual: Visual; cuarto: CuartoId }> = {
  Laptop: { visual: 'laptop', cuarto: 'oficina' },
  'Computadora de escritorio': { visual: 'compu', cuarto: 'oficina' },
  'Televisión (LED)': { visual: 'tv', cuarto: 'sala' },
  Refrigerador: { visual: 'refri', cuarto: 'cocina' },
  'Aire acondicionado': { visual: 'minisplit', cuarto: 'principal' },
  'Celular (carga)': { visual: 'generico', cuarto: 'principal' },
  'Consola de videojuegos': { visual: 'consola', cuarto: 'ninos' },
  Lavadora: { visual: 'lavadora', cuarto: 'garage' },
  Microondas: { visual: 'micro', cuarto: 'cocina' },
  Iluminación: { visual: 'foco', cuarto: 'sala' },
  'Dispositivo IoT': { visual: 'router', cuarto: 'sala' },
  Impresora: { visual: 'generico', cuarto: 'oficina' },
  Congelador: { visual: 'refri', cuarto: 'garage' },
  'Secadora de ropa': { visual: 'lavadora', cuarto: 'garage' },
  'Calentador de agua': { visual: 'boiler', cuarto: 'garage' },
  Ventilador: { visual: 'ventilador', cuarto: 'ninos' },
  'Bomba de agua': { visual: 'boiler', cuarto: 'garage' },
  Router: { visual: 'router', cuarto: 'oficina' },
  Cafetera: { visual: 'cafetera', cuarto: 'cocina' },
  Aspiradora: { visual: 'aspiradora', cuarto: 'sala' },
};

// A qué altura del piso se conecta el cable de cada aparato.
export const ALTURA_ENCHUFE: Record<Visual, number> = {
  tv: 14, minisplit: 94, refri: 14, ventilador: 8, foco: 138, laptop: 14, compu: 14, consola: 10,
  plancha: 14, secadora: 14, micro: 14, lavadora: 14, boiler: 14, router: 14, cafetera: 14,
  aspiradora: 8, coche: 22, generico: 10,
};

// Punto de la maqueta donde está un aparato (sobre el piso) y donde se enchufa.
export function posicionAparato(a: AparatoCasa): { x: number; y: number; enchufeY: number } {
  const cuarto = cuartoPorId(a.cuarto);
  const y = pisoY(cuarto.piso);
  // El coche ocupa tres casillas: se dibuja centrado entre ellas.
  const x = a.visual === 'coche' ? slotX(cuarto, 1) : slotX(cuarto, a.slot);
  return { x, y, enchufeY: y - ALTURA_ENCHUFE[a.visual] };
}

export const CUARTOS_ORDEN: CuartoId[] = ['sala', 'cocina', 'principal', 'ninos', 'oficina', 'garage'];

// Casillas que ocupa un aparato dentro de su cuarto (el coche ocupa casi todo el garage).
export function slotsQueOcupa(visual: Visual): number[] {
  return visual === 'coche' ? [0, 1, 2] : [0];
}

function ocupados(lista: AparatoCasa[], cuarto: CuartoId): Set<number> {
  const set = new Set<number>();
  for (const a of lista) {
    if (a.cuarto !== cuarto) continue;
    if (a.visual === 'coche') slotsQueOcupa('coche').forEach((s) => set.add(s));
    else set.add(a.slot);
  }
  return set;
}

// Busca lugar en el cuarto preferido y, si está lleno, en los demás.
export function buscarLugar(
  lista: AparatoCasa[],
  visual: Visual,
  preferido: CuartoId
): { cuarto: CuartoId; slot: number } | null {
  const orden = [preferido, ...CUARTOS_ORDEN.filter((c) => c !== preferido)];
  const necesarios = slotsQueOcupa(visual);
  for (const cuarto of orden) {
    const usados = ocupados(lista, cuarto);
    if (necesarios.length > 1) {
      if (necesarios.every((s) => !usados.has(s))) return { cuarto, slot: 0 };
      continue;
    }
    for (let slot = 0; slot < SLOTS_POR_CUARTO; slot++) {
      if (!usados.has(slot)) return { cuarto, slot };
    }
  }
  return null;
}

export function crearAparato(lista: AparatoCasa[], base: AparatoCatalogo): AparatoCasa | null {
  const lugar = buscarLugar(lista, base.visual, base.cuarto);
  if (!lugar) return null;
  return {
    uid: `${base.visual}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    visual: base.visual,
    nombre: base.nombre,
    watts: base.watts,
    horas: base.horas,
    cuarto: lugar.cuarto,
    slot: lugar.slot,
    encendido: false,
  };
}

// Arma la casa a partir de los dispositivos reales del usuario.
export function casaDesdeDispositivos(consumos: ConsumoDispositivo[]): AparatoCasa[] {
  const lista: AparatoCasa[] = [];
  for (const c of consumos) {
    const d = c.dispositivo;
    const regla = VISUAL_POR_TIPO_DB[d.tipo] ?? { visual: 'generico' as Visual, cuarto: 'sala' as CuartoId };
    const lugar = buscarLugar(lista, regla.visual, regla.cuarto);
    if (!lugar) break;
    lista.push({
      uid: `real-${d.id}`,
      visual: regla.visual,
      nombre: d.nombre,
      watts: d.consumo_watts_promedio,
      // Si todavía no registra horas, se usa un tiempo de uso típico del tipo.
      horas: c.horasPromedioDiaria > 0 ? Math.round(c.horasPromedioDiaria * 10) / 10 : 2,
      cuarto: lugar.cuarto,
      slot: lugar.slot,
      encendido: false,
    });
  }
  return lista;
}

export const CASA_DE_EJEMPLO: AparatoCasa[] = (() => {
  const base = ['refri', 'tv', 'foco', 'router', 'laptop', 'ventilador'];
  const lista: AparatoCasa[] = [];
  for (const v of base) {
    const cat = CATALOGO.find((c) => c.visual === v);
    if (!cat) continue;
    const nuevo = crearAparato(lista, cat);
    if (nuevo) lista.push(nuevo);
  }
  return lista;
})();

export function kwhPorDia(a: AparatoCasa): number {
  return (a.watts * a.horas) / 1000;
}

export function kwhPorBimestre(a: AparatoCasa): number {
  return kwhPorDia(a) * DIAS_POR_BIMESTRE;
}

export function totalKwhBimestre(lista: AparatoCasa[]): number {
  return lista.reduce((suma, a) => suma + kwhPorBimestre(a), 0);
}

// Lo que están jalando ahora mismo los aparatos prendidos, en kW.
export function kwAhora(lista: AparatoCasa[]): number {
  return lista.reduce((suma, a) => suma + (a.encendido ? a.watts / 1000 : 0), 0);
}

// ── Paneles solares ────────────────────────────────────────────────────────
// Estimación sencilla: cada panel de 620 W rinde ~5.4 horas de sol "pleno" al
// día en promedio en México, con ~82% de eficiencia real del sistema (cables,
// inversor, calor). Es una aproximación para entender el ahorro, no un
// cálculo de ingeniería.

export const PANEL = { watts: 620, horasSol: 5.4, eficiencia: 0.82, max: 10 };

export function kwhSolarPorDia(paneles: number): number {
  return (paneles * PANEL.watts * PANEL.horasSol * PANEL.eficiencia) / 1000;
}

export function kwhSolarBimestre(paneles: number): number {
  return kwhSolarPorDia(paneles) * DIAS_POR_BIMESTRE;
}

// Lo que están produciendo los paneles ahora mismo, en kW (intensidad 0–1 según la hora).
export function kwSolarAhora(paneles: number, intensidad: number): number {
  return (paneles * PANEL.watts * PANEL.eficiencia * intensidad) / 1000;
}
