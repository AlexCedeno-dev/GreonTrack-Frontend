// La silueta de cada tipo de lugar: una casa con techo de cuatro aguas, un
// departamento entre edificios, una oficina de vidrio y una tienda con toldo.
// Los cuartos de adentro son los mismos; cambia lo que se ve por fuera.

import { CASA, ESCENA, pisoY } from '../../lib/casa';
import type { LugarCasa } from '../../lib/paquetesCasa';

type LugarId = LugarCasa['id'];

const X0 = CASA.x;
const X1 = CASA.x + CASA.w;

// Un número "al azar" estable para que las ventanas prendidas no cambien en cada pintada.
function azar(semilla: number, i: number) {
  const v = Math.sin(semilla * 12.9898 + i * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function Torre({
  x,
  w,
  tope,
  clase,
  noche,
  semilla,
  cristal = false,
}: {
  x: number;
  w: number;
  tope: number;
  clase: string;
  noche: boolean;
  semilla: number;
  cristal?: boolean;
}) {
  const alto = ESCENA.sueloY - tope;
  const columnas = Math.max(2, Math.floor((w - 8) / 14));
  const filas = Math.floor((alto - 10) / 17);
  const ventanas = [];
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      const prendida = noche && azar(semilla, f * 9 + c) > 0.45;
      ventanas.push(
        <rect
          key={`${f}-${c}`}
          className={`sil-ventana${prendida ? ' lit' : ''}${cristal ? ' cristal' : ''}`}
          x={x + 6 + c * ((w - 12) / columnas)}
          y={tope + 8 + f * 17}
          width={(w - 12) / columnas - 3}
          height={10}
          rx={1}
        />
      );
    }
  }
  return (
    <g>
      <rect className={clase} x={x} y={tope} width={w} height={alto} />
      <rect className="sil-torre-tope" x={x - 2} y={tope - 4} width={w + 4} height={5} />
      {ventanas}
    </g>
  );
}

// Lo que va detrás de la casa: edificios que asoman por arriba y por los lados.
export function FondoLugar({ lugar, noche }: { lugar: LugarId; noche: boolean }) {
  if (lugar === 'depa') {
    return (
      <g className="sil-fondo" aria-hidden="true">
        <Torre x={8} w={92} tope={84} clase="sil-torre-calida-a" noche={noche} semilla={1} />
        <Torre x={300} w={84} tope={62} clase="sil-torre-calida-b" noche={noche} semilla={2} />
        <Torre x={520} w={96} tope={78} clase="sil-torre-calida-a" noche={noche} semilla={3} />
        <Torre x={858} w={96} tope={40} clase="sil-torre-calida-b" noche={noche} semilla={4} />
      </g>
    );
  }
  if (lugar === 'oficina') {
    return (
      <g className="sil-fondo" aria-hidden="true">
        <Torre x={6} w={96} tope={52} clase="sil-torre-vidrio-a" noche={noche} semilla={5} cristal />
        <Torre x={250} w={78} tope={70} clase="sil-torre-vidrio-b" noche={noche} semilla={6} cristal />
        <Torre x={470} w={104} tope={44} clase="sil-torre-vidrio-a" noche={noche} semilla={7} cristal />
        <Torre x={856} w={98} tope={60} clase="sil-torre-vidrio-b" noche={noche} semilla={8} cristal />
      </g>
    );
  }
  return null;
}

// Lo que va sobre y alrededor de la casa (techo, toldo, balcones, letreros).
export function FrenteLugar({ lugar, paneles, noche }: { lugar: LugarId; paneles: number; noche: boolean }) {
  const centro = X0 + CASA.w / 2;

  if (lugar === 'casa') {
    return (
      <g className="c-techo sil-frente" aria-hidden="true">
        <rect className="sil-chimenea" x={X1 - 150} y={36} width={28} height={56} />
        <rect className="sil-chimenea-tapa" x={X1 - 154} y={32} width={36} height={8} rx={2} />
        <path className="sil-techo" d={`M${X0 - 30} 114 L${X0 + 74} 54 H${X1 - 74} L${X1 + 30} 114 Z`} />
        <path className="sil-techo-linea" d={`M${X0 + 74} 54 L${X0 + 74 + 14} 114 M${X1 - 74} 54 L${X1 - 74 - 14} 114`} />
        <path className="sil-techo-borde" d={`M${X0 - 30} 114 L${X1 + 30} 114`} />
        {paneles === 0 && (
          <g>
            <path className="sil-buhardilla-techo" d={`M${centro - 26} 98 L${centro} 76 L${centro + 26} 98 Z`} />
            <rect className="sil-ventana cristal" x={centro - 17} y={86} width={34} height={20} rx={2} />
            <line className="sil-marco" x1={centro} y1={86} x2={centro} y2={106} />
          </g>
        )}
      </g>
    );
  }

  if (lugar === 'depa') {
    const balcon = (y: number) => (
      <g key={y}>
        <rect className="sil-balcon-losa" x={X1 + 2} y={y} width={44} height={7} rx={1.5} />
        <path className="sil-baranda" d={`M${X1 + 6} ${y} V${y - 26} M${X1 + 18} ${y} V${y - 26} M${X1 + 30} ${y} V${y - 26} M${X1 + 42} ${y} V${y - 26} M${X1 + 4} ${y - 26} H${X1 + 46}`} />
        <path className="sil-planta" d={`M${X1 + 10} ${y} q-5 -10 3 -16 q3 8 5 16 Z M${X1 + 30} ${y} q-4 -9 3 -14 q3 7 4 14 Z`} />
      </g>
    );
    return (
      <g className="c-techo sil-frente" aria-hidden="true">
        {/* tinaco y antena sobre la azotea */}
        <path className="sil-pata" d={`M${X0 + 96} 88 V60 M${X0 + 124} 88 V60`} />
        <rect className="sil-tinaco" x={X0 + 88} y={36} width={44} height={26} rx={10} />
        <rect className="sil-tinaco-tapa" x={X0 + 104} y={30} width={12} height={8} rx={3} />
        <path className="sil-antena" d={`M${X1 - 70} 88 V24 M${X1 - 84} 40 H${X1 - 56} M${X1 - 80} 52 H${X1 - 60}`} />
        <rect className="sil-aire" x={centro - 20} y={72} width={40} height={20} rx={3} />
        <circle className="sil-aire-aspa" cx={centro - 8} cy={82} r={6} />
        <circle className="sil-aire-aspa" cx={centro + 8} cy={82} r={6} />
        {/* pretil de la azotea */}
        <rect className="sil-pretil" x={X0 - 20} y={94} width={CASA.w + 40} height={20} rx={2} />
        <rect className="sil-pretil-tapa" x={X0 - 24} y={90} width={CASA.w + 48} height={6} rx={2} />
        {/* balcones */}
        {balcon(pisoY(1))}
        {balcon(pisoY(0) - 4)}
      </g>
    );
  }

  if (lugar === 'oficina') {
    return (
      <g className="c-techo sil-frente" aria-hidden="true">
        {/* mástil con luz de aviso y bandera */}
        <path className="sil-antena" d={`M${X1 - 40} 112 V8`} />
        <circle className={`sil-luz-aviso${noche ? ' noche' : ''}`} cx={X1 - 40} cy={8} r={4} />
        <path className="sil-pata" d={`M${X0 + 50} 112 V34`} />
        <path className="sil-bandera" d={`M${X0 + 50} 36 H${X0 + 92} L${X0 + 84} 46 L${X0 + 92} 56 H${X0 + 50} Z`} />
        {/* letrero sobre la azotea */}
        <path className="sil-pata" d={`M${centro - 100} 112 V76 M${centro + 100} 112 V76`} />
        <rect className="sil-letrero-fondo" x={centro - 124} y={34} width={248} height={44} rx={8} />
        <text className="sil-letrero-texto" x={centro} y={65} textAnchor="middle">
          GREONTRACK OFFICE
        </text>
        {/* pretil de vidrio */}
        <rect className="sil-vidrio-pretil" x={X0 - 20} y={96} width={CASA.w + 40} height={18} rx={2} />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <line key={i} className="sil-vidrio-linea" x1={X0 - 20 + (i + 1) * ((CASA.w + 40) / 12)} y1={96} x2={X0 - 20 + (i + 1) * ((CASA.w + 40) / 12)} y2={114} />
        ))}
        {/* entrada con marquesina */}
        <rect className="sil-marquesina" x={X0 - 52} y={pisoY(0) - 62} width={58} height={7} rx={2} />
        <path className="sil-pata" d={`M${X0 - 48} ${pisoY(0) - 56} V${pisoY(0)}`} />
        <rect className="sil-puerta-vidrio" x={X0 - 44} y={pisoY(0) - 54} width={40} height={54} rx={2} />
        <line className="sil-marco" x1={X0 - 24} y1={pisoY(0) - 54} x2={X0 - 24} y2={pisoY(0)} />
      </g>
    );
  }

  // tienda
  const rayas = Math.round((CASA.w + 24) / 18);
  const ancho = (CASA.w + 24) / rayas;
  return (
    <g className="c-techo sil-frente" aria-hidden="true">
      {/* letrero luminoso sobre la azotea */}
      <path className="sil-pata" d={`M${centro - 90} 112 V78 M${centro + 90} 112 V78`} />
      <rect className={`sil-letrero-tienda${noche ? ' noche' : ''}`} x={centro - 118} y={30} width={236} height={50} rx={10} />
      <text className="sil-letrero-texto tienda" x={centro} y={64} textAnchor="middle">
        TIENDA
      </text>
      <path className="sil-foquitos" d={`M${centro - 118} 30 H${centro + 118}`} />
      {/* pretil */}
      <rect className="sil-pretil" x={X0 - 20} y={98} width={CASA.w + 40} height={16} rx={2} />
      <rect className="sil-pretil-tapa" x={X0 - 24} y={94} width={CASA.w + 48} height={6} rx={2} />
      {/* toldo rayado sobre la planta baja */}
      <g className="sil-toldo">
        {Array.from({ length: rayas }).map((_, i) => (
          <path
            key={i}
            className={i % 2 === 0 ? 'sil-toldo-roja' : 'sil-toldo-blanca'}
            d={`M${X0 - 12 + i * ancho} ${ESCENA.pisoAltoY + 2} h${ancho} v10 q${-ancho / 2} 9 ${-ancho} 0 Z`}
          />
        ))}
      </g>
      {/* letrero de "abierto" */}
      <path className="sil-pata" d={`M${X1 + 8} ${pisoY(0) - 130} h20`} />
      <rect className={`sil-abierto${noche ? ' noche' : ''}`} x={X1 + 20} y={pisoY(0) - 142} width={62} height={24} rx={6} />
      <text className="sil-abierto-texto" x={X1 + 51} y={pisoY(0) - 125} textAnchor="middle">
        ABIERTO
      </text>
    </g>
  );
}
