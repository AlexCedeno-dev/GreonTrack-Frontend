// La entrega de aparatos nuevos: una camioneta llega a la calle, el repartidor
// baja las cajas en la puerta y un instalador lleva cada una a su cuarto, la
// abre y la conecta. Todo es SVG; los tiempos salen de planEntrega().

import { useMemo } from 'react';
import {
  CASA,
  ENTREGA,
  ESCALERA_ALTA_X,
  ESCALERA_BAJA_X,
  ESCENA,
  cuartoPorId,
  pisoY,
  planEntrega,
  posicionAparato,
  type AparatoCasa,
  type Entrega,
} from '../../lib/casa';

interface Props {
  aparatos: AparatoCasa[];
  entrega: Entrega;
}

const VAN_X = 70;
const VAN_Y = ESCENA.sueloY + 76;
const PUERTA_X = CASA.x + 8;

type Punto = [pct: number, x: number, y: number];

function keyframes(nombre: string, puntos: Punto[]) {
  const pasos = puntos.map(([pct, x, y]) => `${pct}%{transform:translate(${x}px,${y}px)}`).join('');
  return `@keyframes ${nombre}{${pasos}}`;
}

// Ruta del instalador desde la puerta hasta el aparato (sube por la escalera si hace falta).
function rutaInstalador(a: AparatoCasa): Punto[] {
  const { x } = posicionAparato(a);
  const arriba = cuartoPorId(a.cuarto).piso === 1;
  const y0 = pisoY(0);
  const inicio: [number, number] = [PUERTA_X + 6, y0];
  if (!arriba) return [[0, inicio[0], inicio[1]], [100, x, y0]];
  const y1 = pisoY(1);
  const d1 = Math.abs(ESCALERA_BAJA_X - inicio[0]);
  const d2 = 60;
  const d3 = Math.abs(x - ESCALERA_ALTA_X);
  const suma = d1 + d2 + d3;
  const p1 = Math.round((d1 / suma) * 100);
  const p2 = Math.round(((d1 + d2) / suma) * 100);
  return [
    [0, inicio[0], inicio[1]],
    [p1, ESCALERA_BAJA_X, y0],
    [p2, ESCALERA_ALTA_X, y1],
    [100, x, y1],
  ];
}

export function Persona({ uniforme, gorra }: { uniforme: string; gorra: string }) {
  return (
    <g>
      <rect className="rep-pierna pa" x={-5.5} y={-15} width={4.6} height={15} rx={2.2} />
      <rect className="rep-pierna pb" x={0.9} y={-15} width={4.6} height={15} rx={2.2} />
      <rect className={uniforme} x={-8.5} y={-33} width={17} height={20} rx={6} />
      <rect className="rep-brazo" x={-11.5} y={-31} width={4.2} height={14} rx={2.1} />
      <circle className="rep-cara" cx={0} cy={-41} r={8} />
      <path className={gorra} d="M-8.4 -42 q0 -10 8.4 -10 q8.4 0 8.4 10 Z" />
      <rect className={gorra} x={2} y={-43.5} width={9} height={2.6} rx={1.3} />
      <circle className="rep-ojo" cx={3.2} cy={-40.5} r={1} />
    </g>
  );
}

// La camioneta de entregas, dibujada con las ruedas en el origen.
export function VanDibujo() {
  return (
    <g>
      <ellipse className="aparato-sombra" cx={0} cy={1} rx={58} ry={4} />
      <path className="rep-van-cuerpo" d="M-54 -8 V-40 q0 -4 4 -4 H16 V-8 Z" />
      <path className="rep-van-cabina" d="M16 -8 V-44 H34 q8 0 12 10 l8 9 V-8 Z" />
      <path className="rep-van-vidrio" d="M22 -39 H33 q5 0 8 7 l4 7 H22 Z" />
      <rect className="rep-van-franja" x={-54} y={-27} width={70} height={8} />
      <text className="rep-van-texto" x={-48} y={-21} fontSize={7}>
        GreonTrack · Entregas
      </text>
      <circle className="auto-llanta" cx={-32} cy={-4} r={7} />
      <circle className="auto-llanta" cx={36} cy={-4} r={7} />
      <circle className="rep-van-rin" cx={-32} cy={-4} r={2.6} />
      <circle className="rep-van-rin" cx={36} cy={-4} r={2.6} />
    </g>
  );
}

export function Caja({ escala = 1 }: { escala?: number }) {
  return (
    <g transform={`scale(${escala})`}>
      <rect className="rep-caja-cuerpo" x={-9} y={-14} width={18} height={14} rx={1.5} />
      <rect className="rep-caja-cinta" x={-1.6} y={-14} width={3.2} height={14} />
    </g>
  );
}

export function Reparto({ aparatos, entrega }: Props) {
  const { items, plan, css } = useMemo(() => {
    const lista = entrega.uids
      .map((uid) => aparatos.find((a) => a.uid === uid))
      .filter((a): a is AparatoCasa => !!a);
    const plan = planEntrega(lista.length);
    const k = [
      keyframes('rep-ida', [[0, VAN_X + 26, VAN_Y - 6], [100, PUERTA_X - 22, ESCENA.sueloY + 8]]),
      keyframes('rep-vuelta', [[0, 0, 0], [100, VAN_X + 26 - (PUERTA_X - 22), VAN_Y - 6 - (ESCENA.sueloY + 8)]]),
      ...lista.slice(0, ENTREGA.maxOperarios).map((a, i) => keyframes(`rep-op-${i}`, rutaInstalador(a))),
    ];
    return { items: lista, plan, css: k.join('') };
  }, [aparatos, entrega.uids]);

  const t = (s: number) => `${s}s`;
  const dPuerta = plan.inicio(items.length - 1) + 0.9 - plan.puerta;

  return (
    <g className="reparto-capa" pointerEvents="none" key={entrega.id}>
      <style>{css}</style>

      {/* Camioneta: llega por la izquierda y se va por la derecha */}
      <g className="rep-van-llega">
        <g className="rep-van-sale" style={{ ['--t' as string]: t(plan.vanSale) }}>
          <g transform={`translate(${VAN_X} ${VAN_Y})`}>
            <VanDibujo />
          </g>
        </g>
      </g>

      {/* Puerta de la casa: se abre mientras entran las cajas */}
      <g className="rep-ventana" style={{ ['--t' as string]: t(plan.puerta - 0.3), ['--d' as string]: t(dPuerta + 0.5) }}>
        <rect className="rep-puerta" x={CASA.x - 3} y={pisoY(0) - 48} width={24} height={48} rx={3} />
        <rect className="rep-puerta-abierta" x={CASA.x + 1} y={pisoY(0) - 44} width={16} height={44} rx={2} />
      </g>

      {/* Repartidor: baja de la camioneta, deja las cajas en la puerta y regresa */}
      <g className="rep-ida" style={{ ['--t' as string]: t(ENTREGA.van), ['--d' as string]: t(ENTREGA.camina) }}>
        <g className="rep-vuelta" style={{ ['--t' as string]: t(plan.regresa), ['--d' as string]: t(ENTREGA.camina) }}>
          <g className="rep-voltea" style={{ ['--t' as string]: t(plan.regresa) }}>
            <g
              className="rep-piernas"
              style={{
                ['--t' as string]: t(ENTREGA.van),
                ['--n' as string]: Math.round(ENTREGA.camina / 0.26),
              }}
            >
              <Persona uniforme="rep-uniforme-a" gorra="rep-gorra-a" />
            </g>
            <g className="rep-suelta" style={{ ['--t' as string]: t(plan.puerta) }} transform="translate(12 -22)">
              <Caja />
              <g transform="translate(0 -14)">
                <Caja escala={0.8} />
              </g>
            </g>
          </g>
        </g>
      </g>

      {/* Instaladores: cada uno lleva una caja a su cuarto y conecta el aparato */}
      {items.map((a, i) => {
        const { x, y } = posicionAparato(a);
        const t0 = plan.inicio(i);
        const t1 = plan.llega(i);
        const t2 = plan.listo(i);
        const conOperario = i < ENTREGA.maxOperarios;
        return (
          <g key={a.uid}>
            {conOperario && (
              <g
                className="rep-op"
                style={{
                  animation: `rep-op-${i} ${t(ENTREGA.instalaCamina)} linear ${t(t0)} both`,
                }}
              >
                <g
                  className="rep-ventana rep-ventana-suave"
                  style={{ ['--t' as string]: t(t0), ['--d' as string]: t(t2 + 0.7 - t0) }}
                >
                  <g
                    className="rep-piernas"
                    style={{ ['--t' as string]: t(t0), ['--n' as string]: Math.round(ENTREGA.instalaCamina / 0.26) }}
                  >
                    <Persona uniforme="rep-uniforme-b" gorra="rep-gorra-b" />
                  </g>
                  <g className="rep-suelta" style={{ ['--t' as string]: t(t1) }} transform="translate(13 -17)">
                    <Caja escala={0.85} />
                  </g>
                  <g className="rep-ventana" style={{ ['--t' as string]: t(t1), ['--d' as string]: t(ENTREGA.instala) }}>
                    <g className="rep-llave" transform="translate(14 -26)">
                      <path d="M0 0 l8 -8" />
                      <circle cx={9.5} cy={-9.5} r={3.2} />
                    </g>
                  </g>
                </g>
              </g>
            )}

            {/* La caja en el cuarto: se abre, se instala y desaparece */}
            <g transform={`translate(${x + (conOperario ? 0 : 0)} ${y})`}>
              <g className="rep-ventana" style={{ ['--t' as string]: t(t1), ['--d' as string]: t(ENTREGA.instala + 0.05) }}>
                <g className="rep-caja-abre" style={{ ['--t' as string]: t(t1 + 0.35) }}>
                  <Caja escala={1.5} />
                </g>
                <g className="rep-chispas-instala" transform="translate(0 -22)">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <circle key={n} r={1.8} cx={(n - 2) * 7} cy={-(n % 2) * 6} style={{ animationDelay: `${n * 0.09}s` }} />
                  ))}
                </g>
              </g>
              <g className="rep-poof" style={{ ['--t' as string]: t(t2) }}>
                {[0, 1, 2, 3, 4, 5].map((n) => {
                  const ang = (n / 6) * Math.PI * 2;
                  return (
                    <circle
                      key={n}
                      r={4}
                      cy={-20}
                      style={{ ['--dx' as string]: `${Math.cos(ang) * 26}px`, ['--dy' as string]: `${Math.sin(ang) * 18}px` }}
                    />
                  );
                })}
              </g>
            </g>
          </g>
        );
      })}
    </g>
  );
}
