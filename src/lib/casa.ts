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
  | 'tv' | 'minisplit' | 'refri' | 'congelador' | 'ventilador' | 'ventiTecho' | 'foco' | 'laptop' | 'compu'
  | 'consola' | 'plancha' | 'secadora' | 'micro' | 'lavadora' | 'secadoraRopa' | 'boiler' | 'router'
  | 'cafetera' | 'aspiradora' | 'coche' | 'bici' | 'horno' | 'estufa' | 'tostador' | 'licuadora'
  | 'lavavajillas' | 'hervidor' | 'olla' | 'calefactor' | 'deshumidificador' | 'bocina' | 'proyector'
  | 'tablet' | 'impresora' | 'bomba' | 'generico';

// Algunos aparatos van colgados del techo o la pared: no ocupan lugar en el piso.
export function capaDe(visual: Visual): 'piso' | 'alto' {
  return visual === 'foco' || visual === 'ventiTecho' || visual === 'minisplit' ? 'alto' : 'piso';
}

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
  { visual: 'refri', nombre: 'Refrigerador', tipoDb: 'Refrigerador', watts: 150, horas: 8, cuarto: 'cocina' },
  { visual: 'congelador', nombre: 'Congelador', tipoDb: 'Congelador', watts: 220, horas: 8, cuarto: 'garage' },
  { visual: 'micro', nombre: 'Microondas', tipoDb: 'Microondas', watts: 1000, horas: 0.4, cuarto: 'cocina' },
  { visual: 'horno', nombre: 'Horno eléctrico', tipoDb: 'Horno eléctrico', watts: 1500, horas: 0.6, cuarto: 'cocina' },
  { visual: 'estufa', nombre: 'Estufa eléctrica', tipoDb: 'Estufa eléctrica', watts: 1800, horas: 1, cuarto: 'cocina' },
  { visual: 'tostador', nombre: 'Tostador', tipoDb: 'Tostador', watts: 800, horas: 0.2, cuarto: 'cocina' },
  { visual: 'licuadora', nombre: 'Licuadora', tipoDb: 'Licuadora', watts: 400, horas: 0.15, cuarto: 'cocina' },
  { visual: 'hervidor', nombre: 'Hervidor eléctrico', tipoDb: 'Hervidor eléctrico', watts: 1500, horas: 0.3, cuarto: 'cocina' },
  { visual: 'olla', nombre: 'Olla arrocera', tipoDb: 'Olla arrocera', watts: 600, horas: 0.5, cuarto: 'cocina' },
  { visual: 'cafetera', nombre: 'Cafetera', tipoDb: 'Cafetera', watts: 800, horas: 0.4, cuarto: 'cocina' },
  { visual: 'lavavajillas', nombre: 'Lavavajillas', tipoDb: 'Lavavajillas', watts: 1200, horas: 1, cuarto: 'cocina' },
  { visual: 'lavadora', nombre: 'Lavadora', tipoDb: 'Lavadora', watts: 500, horas: 1, cuarto: 'garage' },
  { visual: 'secadoraRopa', nombre: 'Secadora de ropa', tipoDb: 'Secadora de ropa', watts: 3000, horas: 0.8, cuarto: 'garage' },
  { visual: 'plancha', nombre: 'Plancha', tipoDb: 'Plancha', watts: 1200, horas: 0.5, cuarto: 'principal' },
  { visual: 'aspiradora', nombre: 'Aspiradora', tipoDb: 'Aspiradora', watts: 1200, horas: 0.3, cuarto: 'sala' },
  { visual: 'minisplit', nombre: 'Minisplit', tipoDb: 'Aire acondicionado', watts: 900, horas: 6, cuarto: 'principal' },
  { visual: 'ventilador', nombre: 'Ventilador', tipoDb: 'Ventilador', watts: 55, horas: 6, cuarto: 'ninos' },
  { visual: 'ventiTecho', nombre: 'Ventilador de techo', tipoDb: 'Ventilador de techo', watts: 75, horas: 6, cuarto: 'sala' },
  { visual: 'calefactor', nombre: 'Calefactor', tipoDb: 'Calefactor', watts: 1500, horas: 2, cuarto: 'principal' },
  { visual: 'deshumidificador', nombre: 'Deshumidificador', tipoDb: 'Deshumidificador', watts: 300, horas: 5, cuarto: 'sala' },
  { visual: 'boiler', nombre: 'Calentador de agua', tipoDb: 'Calentador de agua', watts: 1500, horas: 1.5, cuarto: 'garage' },
  { visual: 'bomba', nombre: 'Bomba de agua', tipoDb: 'Bomba de agua', watts: 750, horas: 1, cuarto: 'garage' },
  { visual: 'tv', nombre: 'Televisión', tipoDb: 'Televisión (LED)', watts: 100, horas: 5, cuarto: 'sala' },
  { visual: 'consola', nombre: 'Consola', tipoDb: 'Consola de videojuegos', watts: 150, horas: 3, cuarto: 'ninos' },
  { visual: 'bocina', nombre: 'Bocina o estéreo', tipoDb: 'Bocina o estéreo', watts: 40, horas: 4, cuarto: 'sala' },
  { visual: 'proyector', nombre: 'Proyector', tipoDb: 'Proyector', watts: 250, horas: 2, cuarto: 'sala' },
  { visual: 'laptop', nombre: 'Laptop', tipoDb: 'Laptop', watts: 65, horas: 6, cuarto: 'oficina' },
  { visual: 'compu', nombre: 'Computadora', tipoDb: 'Computadora de escritorio', watts: 200, horas: 5, cuarto: 'oficina' },
  { visual: 'impresora', nombre: 'Impresora', tipoDb: 'Impresora', watts: 30, horas: 0.3, cuarto: 'oficina' },
  { visual: 'router', nombre: 'Router de internet', tipoDb: 'Router', watts: 10, horas: 24, cuarto: 'sala' },
  { visual: 'foco', nombre: 'Focos LED', tipoDb: 'Iluminación', watts: 60, horas: 5, cuarto: 'sala' },
  { visual: 'tablet', nombre: 'Tablet cargando', tipoDb: 'Tablet (carga)', watts: 15, horas: 4, cuarto: 'ninos' },
  { visual: 'secadora', nombre: 'Secadora de pelo', tipoDb: 'Secadora de pelo', watts: 1800, horas: 0.3, cuarto: 'principal' },
  { visual: 'coche', nombre: 'Coche eléctrico', tipoDb: 'Coche eléctrico', watts: 3300, horas: 3, cuarto: 'garage' },
  { visual: 'bici', nombre: 'Bicicleta eléctrica', tipoDb: 'Bicicleta eléctrica', watts: 250, horas: 2, cuarto: 'garage' },
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
  ...Object.fromEntries(CATALOGO.map((c) => [c.tipoDb, { visual: c.visual, cuarto: c.cuarto }])),
  'Celular (carga)': { visual: 'tablet', cuarto: 'principal' },
  'Dispositivo IoT': { visual: 'router', cuarto: 'sala' },
};

// El dibujo que le toca a cada tipo de dispositivo (para el formulario y la lista).
export function visualDeTipo(tipo: string): Visual {
  return VISUAL_POR_TIPO_DB[tipo]?.visual ?? 'generico';
}

// A qué altura del piso se conecta el cable de cada aparato.
export const ALTURA_ENCHUFE: Record<Visual, number> = {
  tv: 14, minisplit: 94, refri: 14, congelador: 12, ventilador: 8, ventiTecho: 138, foco: 138, laptop: 14,
  compu: 14, consola: 10, plancha: 14, secadora: 14, micro: 14, lavadora: 14, secadoraRopa: 14, boiler: 14,
  router: 14, cafetera: 14, aspiradora: 8, coche: 22, bici: 10, horno: 14, estufa: 14, tostador: 14,
  licuadora: 14, lavavajillas: 14, hervidor: 14, olla: 14, calefactor: 10, deshumidificador: 10, bocina: 10,
  proyector: 14, tablet: 10, impresora: 14, bomba: 10, generico: 10,
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

function ocupados(lista: AparatoCasa[], cuarto: CuartoId, capa: 'piso' | 'alto'): Set<number> {
  const set = new Set<number>();
  for (const a of lista) {
    if (a.cuarto !== cuarto || capaDe(a.visual) !== capa) continue;
    if (a.visual === 'coche') slotsQueOcupa('coche').forEach((n) => set.add(n));
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
  const capa = capaDe(visual);
  for (const cuarto of orden) {
    const usados = ocupados(lista, cuarto, capa);
    if (necesarios.length > 1) {
      if (necesarios.every((n) => !usados.has(n))) return { cuarto, slot: 0 };
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

// ── Generador eléctrico (opcional) ─────────────────────────────────────────
// Una planta de gasolina de 3.5 kW que ayuda a cubrir parte del consumo. Se
// cuenta cuánto cuesta el combustible porque casi siempre sale más caro que la
// luz de CFE: sirve de apoyo (apagones, cargas grandes), no para ahorrar.

export const GENERADOR = {
  kw: 3.5,
  litrosPorKwh: 0.45,
  precioLitro: 24.5,
  co2KgPorLitro: 2.3,
  maxHoras: 8,
};

export function kwhGeneradorPorDia(horas: number, consumoDiarioKwh: number): number {
  return Math.min(GENERADOR.kw * horas, Math.max(0, consumoDiarioKwh));
}

// ── Personalizar la casa ────────────────────────────────────────────────────

export interface Diseno {
  nombres: Partial<Record<CuartoId, string>>;
  paredes: Partial<Record<CuartoId, string>>;
  techo: string;
  fachada: string;
}

export const PARED_BASE: Record<CuartoId, string> = {
  principal: '#f5e1d7',
  ninos: '#dcecf4',
  oficina: '#e5f0d8',
  garage: '#dde1e4',
  sala: '#f6ecd8',
  cocina: '#f8f1cf',
};

export const DISENO_BASE: Diseno = { nombres: {}, paredes: {}, techo: '#53707a', fachada: '#ece7da' };

export const PINTURAS: Array<{ nombre: string; color: string }> = [
  { nombre: 'Crema', color: '#f6ecd8' },
  { nombre: 'Durazno', color: '#f5d5c3' },
  { nombre: 'Rosa', color: '#f3cfdc' },
  { nombre: 'Cielo', color: '#cfe6f5' },
  { nombre: 'Menta', color: '#d3ecd8' },
  { nombre: 'Limón', color: '#f4eeb0' },
  { nombre: 'Lavanda', color: '#ddd4f2' },
  { nombre: 'Terracota', color: '#e3a98a' },
  { nombre: 'Salvia', color: '#a9c4a3' },
  { nombre: 'Azul noche', color: '#7d96c4' },
  { nombre: 'Gris', color: '#d5d8dc' },
  { nombre: 'Blanco', color: '#fbfaf6' },
];

export const TECHOS: Array<{ nombre: string; color: string }> = [
  { nombre: 'Pizarra', color: '#53707a' },
  { nombre: 'Teja', color: '#b5593a' },
  { nombre: 'Bosque', color: '#3f6b4e' },
  { nombre: 'Vino', color: '#7d3b4a' },
  { nombre: 'Negro', color: '#363b41' },
  { nombre: 'Arena', color: '#c4a46f' },
];

export const FACHADAS: Array<{ nombre: string; color: string }> = [
  { nombre: 'Hueso', color: '#ece7da' },
  { nombre: 'Blanco', color: '#faf9f5' },
  { nombre: 'Ladrillo', color: '#c9805f' },
  { nombre: 'Piedra', color: '#b9b2a4' },
  { nombre: 'Verde', color: '#a8c9a6' },
  { nombre: 'Azul', color: '#a7c1dd' },
];

// Estilos listos: con un clic cambian todo el diseño.
export const ESTILOS_CASA: Array<{ id: string; nombre: string; diseno: Diseno }> = [
  { id: 'clasica', nombre: 'Clásica', diseno: DISENO_BASE },
  {
    id: 'colonial',
    nombre: 'Colonial',
    diseno: {
      nombres: {},
      techo: '#b5593a',
      fachada: '#f2e2c4',
      paredes: { principal: '#f3cfdc', ninos: '#f4eeb0', oficina: '#d3ecd8', garage: '#e8dcc6', sala: '#f5d5c3', cocina: '#f4eeb0' },
    },
  },
  {
    id: 'moderna',
    nombre: 'Moderna',
    diseno: {
      nombres: {},
      techo: '#363b41',
      fachada: '#faf9f5',
      paredes: { principal: '#d5d8dc', ninos: '#fbfaf6', oficina: '#d5d8dc', garage: '#bfc4ca', sala: '#fbfaf6', cocina: '#fbfaf6' },
    },
  },
  {
    id: 'bosque',
    nombre: 'Bosque',
    diseno: {
      nombres: {},
      techo: '#3f6b4e',
      fachada: '#a8c9a6',
      paredes: { principal: '#d3ecd8', ninos: '#cfe6f5', oficina: '#a9c4a3', garage: '#d5d8dc', sala: '#e6f0d6', cocina: '#f4eeb0' },
    },
  },
  {
    id: 'playa',
    nombre: 'Playa',
    diseno: {
      nombres: {},
      techo: '#c4a46f',
      fachada: '#a7c1dd',
      paredes: { principal: '#cfe6f5', ninos: '#f3cfdc', oficina: '#fbfaf6', garage: '#ddd4f2', sala: '#f6ecd8', cocina: '#f4eeb0' },
    },
  },
];

export function nombreDeCuarto(diseno: Diseno, id: CuartoId): string {
  return diseno.nombres[id]?.trim() || cuartoPorId(id).nombre;
}

export function colorDePared(diseno: Diseno, id: CuartoId): string {
  return diseno.paredes[id] ?? PARED_BASE[id];
}

// Oscurece un color #rrggbb (para el borde del techo).
export function oscurecer(hex: string, cuanto: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.round(v * (1 - cuanto)));
  return `rgb(${f((n >> 16) & 255)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
}

export function leerDiseno(crudo: unknown): Diseno {
  const d = (crudo ?? {}) as Partial<Diseno>;
  return {
    nombres: { ...(d.nombres ?? {}) },
    paredes: { ...(d.paredes ?? {}) },
    techo: typeof d.techo === 'string' ? d.techo : DISENO_BASE.techo,
    fachada: typeof d.fachada === 'string' ? d.fachada : DISENO_BASE.fachada,
  };
}
