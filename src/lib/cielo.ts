// El reloj de "Mi casa": a qué hora sale el sol, de qué color está el cielo
// y por dónde van el sol y la luna. Todo sale de un número, la hora (0–24).

export const SALIDA_SOL = 6;
export const PUESTA_SOL = 19;

export function esDeNoche(hora: number): boolean {
  return hora < SALIDA_SOL + 0.5 || hora >= PUESTA_SOL;
}

// Colores del cielo (arriba, abajo) a distintas horas; entre una y otra se mezclan.
const CIELO: Array<{ h: number; a: string; b: string }> = [
  { h: 0, a: '#0c1a3a', b: '#2b4672' },
  { h: 5, a: '#1d2f66', b: '#5a4f86' },
  { h: 6.5, a: '#5d79b8', b: '#f1a77c' },
  { h: 8, a: '#7fc4ec', b: '#ffeccf' },
  { h: 12, a: '#a9dcf2', b: '#e9f6ea' },
  { h: 16.5, a: '#8fc3ea', b: '#ffe6b8' },
  { h: 18.5, a: '#4a4a8c', b: '#f28c5e' },
  { h: 20, a: '#18244d', b: '#3c4f80' },
  { h: 24, a: '#0c1a3a', b: '#2b4672' },
];

function hexARgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mezclar(c1: string, c2: string, t: number): string {
  const a = hexARgb(c1);
  const b = hexARgb(c2);
  const m = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${m[0]}, ${m[1]}, ${m[2]})`;
}

export function colorCielo(hora: number): { a: string; b: string } {
  const h = ((hora % 24) + 24) % 24;
  for (let i = 0; i < CIELO.length - 1; i++) {
    const p = CIELO[i];
    const q = CIELO[i + 1];
    if (h >= p.h && h <= q.h) {
      const t = (h - p.h) / (q.h - p.h);
      return { a: mezclar(p.a, q.a, t), b: mezclar(p.b, q.b, t) };
    }
  }
  return { a: CIELO[0].a, b: CIELO[0].b };
}

// Posición del sol o de la luna: sube por la izquierda, cruza el cielo y baja por la derecha.
export function posicionAstro(hora: number): { x: number; y: number; esSol: boolean; visible: boolean } {
  const h = ((hora % 24) + 24) % 24;
  const dia = h >= SALIDA_SOL && h < PUESTA_SOL;
  const p = dia ? (h - SALIDA_SOL) / (PUESTA_SOL - SALIDA_SOL) : ((h - PUESTA_SOL + 24) % 24) / (24 - PUESTA_SOL + SALIDA_SOL);
  return {
    x: 80 + p * 800,
    y: 300 - Math.sin(Math.PI * p) * 235,
    esSol: dia,
    visible: true,
  };
}

// Qué tan fuerte pega el sol (0 de noche, 1 al mediodía solar).
export function intensidadSol(hora: number): number {
  const h = ((hora % 24) + 24) % 24;
  if (h <= SALIDA_SOL || h >= PUESTA_SOL) return 0;
  return Math.sin((Math.PI * (h - SALIDA_SOL)) / (PUESTA_SOL - SALIDA_SOL));
}

export function formatoHora(hora: number): string {
  const h = ((hora % 24) + 24) % 24;
  const horas = Math.floor(h);
  const minutos = Math.floor((h - horas) * 60);
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}
