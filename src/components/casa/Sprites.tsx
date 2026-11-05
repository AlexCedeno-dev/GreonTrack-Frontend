// Dibujos de los aparatos de "Mi casa". Cada uno se dibuja con el origen en
// el piso, centrado: y negativa es hacia arriba. Todo se pinta con clases
// (.sp-*) para que el tema claro/oscuro y la noche los afecten desde el CSS.

import type { ReactNode } from 'react';
import { visualDeTipo } from '../../lib/casa';
import type { Visual } from '../../lib/casa';

interface SpriteProps {
  on: boolean;
}

function Tv({ on }: SpriteProps) {
  return (
    <g>
      {on && <ellipse className="sp-tv-luz" cx={0} cy={-26} rx={62} ry={44} />}
      <rect className="sp-madera" x={-26} y={-12} width={52} height={12} rx={2} />
      <rect className="sp-negro" x={-23} y={-44} width={46} height={30} rx={3} />
      <rect className={`sp-pantalla${on ? ' on' : ''}`} x={-20} y={-41} width={40} height={24} rx={1.5} />
      {on && <path className="sp-tv-brillo" d="M-20 -41 L-4 -41 L-20 -22 Z" />}
      <rect className="sp-negro" x={-3} y={-14} width={6} height={3} />
    </g>
  );
}

function Minisplit({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-blanco" x={-28} y={-112} width={56} height={18} rx={6} />
      <rect className="sp-sombra" x={-22} y={-100} width={44} height={3} rx={1.5} />
      <circle className={`sp-led${on ? ' on frio' : ''}`} cx={20} cy={-106} r={1.8} />
      {on && (
        <g className="sp-aire">
          <path d="M-18 -92 q4 8 0 16 q-4 8 0 16" />
          <path d="M0 -92 q4 8 0 16 q-4 8 0 16" />
          <path d="M18 -92 q4 8 0 16 q-4 8 0 16" />
        </g>
      )}
    </g>
  );
}

function Refri({ on }: SpriteProps) {
  return (
    <g className={on ? 'sp-vibra' : undefined}>
      <rect className="sp-blanco" x={-17} y={-66} width={34} height={66} rx={4} />
      <rect className="sp-sombra" x={-17} y={-42} width={34} height={2} />
      <rect className="sp-gris" x={11} y={-60} width={2.5} height={12} rx={1} />
      <rect className="sp-gris" x={11} y={-36} width={2.5} height={16} rx={1} />
      <circle className={`sp-led${on ? ' on frio' : ''}`} cx={-8} cy={-58} r={1.8} />
      {on && <path className="sp-frio-vapor" d="M-9 -70 q-3 -5 0 -9 M0 -70 q-3 -5 0 -9 M9 -70 q-3 -5 0 -9" />}
    </g>
  );
}

function Ventilador({ on }: SpriteProps) {
  return (
    <g>
      <ellipse className="sp-gris" cx={0} cy={-2} rx={13} ry={3.5} />
      <rect className="sp-gris" x={-1.8} y={-40} width={3.6} height={38} />
      <circle className="sp-malla" cx={0} cy={-46} r={15} />
      <g className={`sp-aspas${on ? ' gira' : ''}`}>
        <ellipse className="sp-aspa" cx={0} cy={-53} rx={4} ry={8} />
        <ellipse className="sp-aspa" cx={7} cy={-42} rx={4} ry={8} transform="rotate(120 7 -42)" />
        <ellipse className="sp-aspa" cx={-7} cy={-42} rx={4} ry={8} transform="rotate(-120 -7 -42)" />
      </g>
      <circle className="sp-gris" cx={0} cy={-46} r={3} />
      {on && <path className="sp-viento" d="M18 -50 h14 M20 -44 h18 M18 -38 h14" />}
    </g>
  );
}

function Foco({ on }: SpriteProps) {
  return (
    <g>
      <line className="sp-cable" x1={0} y1={-158} x2={0} y2={-140} />
      <path className="sp-casquillo" d="M-4 -140 h8 v6 h-8 Z" />
      {on && <path className="sp-cono" d="M-5 -130 L-46 -2 L46 -2 L5 -130 Z" />}
      <circle className={`sp-foco${on ? ' on' : ''}`} cx={0} cy={-128} r={8} />
      {on && <circle className="sp-halo" cx={0} cy={-128} r={18} />}
    </g>
  );
}

function Laptop({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-28} y={-26} width={56} height={4} rx={1} />
      <rect className="sp-madera" x={-24} y={-22} width={3} height={22} />
      <rect className="sp-madera" x={21} y={-22} width={3} height={22} />
      <rect className="sp-gris" x={-14} y={-30} width={28} height={4} rx={1.5} />
      <path className="sp-negro" d="M-12 -30 L-9 -50 L9 -50 L12 -30 Z" />
      <path className={`sp-pantalla${on ? ' on' : ''}`} d="M-10 -32 L-7.5 -48 L7.5 -48 L10 -32 Z" />
    </g>
  );
}

function Compu({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-30} y={-26} width={60} height={4} rx={1} />
      <rect className="sp-madera" x={-26} y={-22} width={3} height={22} />
      <rect className="sp-madera" x={23} y={-22} width={3} height={22} />
      <rect className="sp-negro" x={-16} y={-56} width={32} height={22} rx={2} />
      <rect className={`sp-pantalla${on ? ' on' : ''}`} x={-14} y={-54} width={28} height={17} rx={1} />
      <rect className="sp-gris" x={-3} y={-34} width={6} height={8} />
      <rect className="sp-negro" x={17} y={-48} width={9} height={22} rx={1.5} />
      <circle className={`sp-led${on ? ' on' : ''}`} cx={21.5} cy={-44} r={1.4} />
    </g>
  );
}

function Consola({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-24} y={-14} width={48} height={14} rx={2} />
      <rect className="sp-blanco" x={-17} y={-24} width={34} height={10} rx={2.5} />
      <circle className={`sp-led${on ? ' on azul' : ''}`} cx={-10} cy={-19} r={1.6} />
      <circle className={`sp-led${on ? ' on azul' : ''}`} cx={-5} cy={-19} r={1.6} />
      <rect className="sp-negro" x={21} y={-12} width={9} height={5} rx={2} transform="rotate(-8 25 -10)" />
      {on && <circle className="sp-pulso" cx={0} cy={-19} r={22} />}
    </g>
  );
}

function Plancha({ on }: SpriteProps) {
  return (
    <g>
      <path className="sp-madera" d="M-26 -24 L24 -24 L18 -20 L-20 -20 Z" />
      <line className="sp-cable" x1={-16} y1={-20} x2={-22} y2={0} />
      <line className="sp-cable" x1={14} y1={-20} x2={20} y2={0} />
      <path className={`sp-plancha${on ? ' on' : ''}`} d="M-12 -26 q0 -9 10 -9 h10 q8 0 10 9 Z" />
      <path className="sp-gris" d="M-8 -34 q8 -8 16 0" fill="none" strokeWidth={3} strokeLinecap="round" />
      {on && <path className="sp-vapor" d="M-8 -42 q-3 -5 0 -9 M0 -42 q-3 -5 0 -9 M8 -42 q-3 -5 0 -9" />}
    </g>
  );
}

function Secadora({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-22} y={-26} width={44} height={4} rx={1} />
      <rect className="sp-madera" x={-16} y={-22} width={3} height={22} />
      <rect className="sp-madera" x={13} y={-22} width={3} height={22} />
      <g className={on ? 'sp-vibra' : undefined}>
        <rect className="sp-secadora" x={-14} y={-42} width={24} height={11} rx={5} />
        <rect className="sp-secadora" x={-6} y={-34} width={8} height={12} rx={3} transform="rotate(12 -2 -28)" />
      </g>
      {on && <path className="sp-viento" d="M12 -40 h12 M12 -36 h16 M12 -32 h12" />}
    </g>
  );
}

function Micro({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-26} y={-26} width={52} height={26} rx={2} />
      <rect className="sp-blanco" x={-20} y={-48} width={40} height={22} rx={3} />
      <rect className={`sp-ventana-micro${on ? ' on' : ''}`} x={-16} y={-44} width={23} height={14} rx={1.5} />
      <rect className="sp-gris" x={11} y={-44} width={6} height={14} rx={1.5} />
      {on && <ellipse className="sp-plato" cx={-4.5} cy={-33} rx={7} ry={2.2} />}
    </g>
  );
}

function Lavadora({ on }: SpriteProps) {
  return (
    <g className={on ? 'sp-vibra-fuerte' : undefined}>
      <rect className="sp-blanco" x={-19} y={-44} width={38} height={44} rx={4} />
      <rect className="sp-sombra" x={-19} y={-37} width={38} height={2} />
      <circle className="sp-gris" cx={0} cy={-19} r={13} />
      <circle className={`sp-tambor${on ? ' on' : ''}`} cx={0} cy={-19} r={10} />
      {on && <path className="sp-remolino" d="M-6 -19 a6 6 0 0 1 12 0" />}
      <circle className="sp-led on" cx={-12} cy={-40.5} r={1.4} style={{ opacity: on ? 1 : 0.3 }} />
    </g>
  );
}

function Boiler({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-gris-claro" x={-13} y={-58} width={26} height={58} rx={11} />
      <rect className={`sp-boiler-banda${on ? ' on' : ''}`} x={-13} y={-34} width={26} height={7} />
      <rect className="sp-gris" x={-8} y={-64} width={4} height={8} />
      <rect className="sp-gris" x={4} y={-64} width={4} height={8} />
      {on && (
        <g className="sp-burbujas">
          <circle cx={-3} cy={-44} r={1.8} />
          <circle cx={4} cy={-48} r={1.4} />
          <circle cx={0} cy={-52} r={1.6} />
        </g>
      )}
    </g>
  );
}

function Router({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-22} y={-28} width={44} height={4} rx={1} />
      <rect className="sp-madera" x={-16} y={-24} width={3} height={24} />
      <rect className="sp-madera" x={13} y={-24} width={3} height={24} />
      <rect className="sp-negro" x={-14} y={-35} width={28} height={7} rx={2} />
      <line className="sp-negro-linea" x1={-10} y1={-35} x2={-14} y2={-48} />
      <line className="sp-negro-linea" x1={10} y1={-35} x2={14} y2={-48} />
      <circle className={`sp-led${on ? ' on verde' : ''}`} cx={-7} cy={-31.5} r={1.3} />
      <circle className={`sp-led${on ? ' on verde' : ''}`} cx={-2} cy={-31.5} r={1.3} />
      {on && (
        <g className="sp-wifi">
          <path d="M-8 -58 a11 11 0 0 1 16 0" />
          <path d="M-13 -64 a18 18 0 0 1 26 0" />
        </g>
      )}
    </g>
  );
}

function Cafetera({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-24} y={-26} width={48} height={26} rx={2} />
      <rect className="sp-negro" x={-11} y={-48} width={22} height={22} rx={3} />
      <rect className="sp-negro" x={-11} y={-48} width={22} height={5} rx={2} />
      <rect className={`sp-cafe${on ? ' on' : ''}`} x={-5} y={-34} width={10} height={8} rx={1.5} />
      <circle className={`sp-led${on ? ' on rojo' : ''}`} cx={7} cy={-44.5} r={1.3} />
      {on && <path className="sp-vapor" d="M-4 -52 q-3 -5 0 -9 M4 -52 q-3 -5 0 -9" />}
    </g>
  );
}

function Aspiradora({ on }: SpriteProps) {
  return (
    <g className={on ? 'sp-vibra' : undefined}>
      <ellipse className="sp-aspiradora" cx={-4} cy={-9} rx={17} ry={9} />
      <circle className="sp-negro" cx={-14} cy={-3} r={3.5} />
      <circle className="sp-negro" cx={8} cy={-3} r={3.5} />
      <path className="sp-negro-linea" d="M10 -12 q14 -4 14 -24 l6 -14" fill="none" strokeWidth={3} strokeLinecap="round" />
      {on && (
        <g className="sp-polvo">
          <circle cx={30} cy={-4} r={1.2} />
          <circle cx={36} cy={-8} r={1} />
          <circle cx={40} cy={-3} r={1.2} />
        </g>
      )}
    </g>
  );
}

function Coche({ on }: SpriteProps) {
  return (
    <g>
      <path className="sp-coche" d="M-62 -6 q0 -14 12 -16 l14 -4 q8 -14 22 -14 h26 q12 0 20 14 l12 4 q10 2 10 16 Z" />
      <path className="sp-vidrio" d="M-30 -26 q6 -10 16 -10 h14 v10 Z M4 -26 v-10 h12 q8 0 14 10 Z" />
      <circle className="sp-llanta" cx={-38} cy={-5} r={10} />
      <circle className="sp-llanta" cx={38} cy={-5} r={10} />
      <circle className="sp-rin" cx={-38} cy={-5} r={4} />
      <circle className="sp-rin" cx={38} cy={-5} r={4} />
      <rect className="sp-faro" x={58} y={-17} width={5} height={4} rx={1.5} />
      {/* Puerto de carga + batería */}
      <rect className="sp-bateria-marco" x={-14} y={-18} width={28} height={8} rx={2} />
      <rect className={`sp-bateria-nivel${on ? ' carga' : ''}`} x={-12.5} y={-16.5} width={25} height={5} rx={1.2} />
      {on && <path className="sp-rayo" d="M2 -50 l-6 10 h5 l-3 9 l9 -12 h-5 Z" />}
    </g>
  );
}

function Generico({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-18} y={-16} width={36} height={16} rx={2} />
      <rect className="sp-blanco" x={-12} y={-30} width={24} height={14} rx={3} />
      <circle className={`sp-led${on ? ' on verde' : ''}`} cx={0} cy={-23} r={2} />
      {on && <circle className="sp-pulso" cx={0} cy={-23} r={20} />}
    </g>
  );
}

// ── Aparatos agregados después ─────────────────────────────────────────────

function Congelador({ on }: SpriteProps) {
  return (
    <g className={on ? 'sp-vibra' : undefined}>
      <rect className="sp-blanco" x={-26} y={-28} width={52} height={28} rx={3} />
      <rect className="sp-sombra" x={-26} y={-22} width={52} height={2} />
      <rect className="sp-gris" x={-9} y={-26.5} width={18} height={2.6} rx={1.3} />
      <circle className={`sp-led${on ? ' on frio' : ''}`} cx={19} cy={-12} r={1.8} />
      {on && <path className="sp-frio-vapor" d="M-14 -32 q-3 -5 0 -9 M-2 -32 q-3 -5 0 -9 M10 -32 q-3 -5 0 -9" />}
    </g>
  );
}

function VentiTecho({ on }: SpriteProps) {
  return (
    <g>
      <line className="sp-cable" x1={0} y1={-158} x2={0} y2={-148} />
      <rect className="sp-gris" x={-9} y={-148} width={18} height={9} rx={4} />
      <g className={`sp-aspas-techo${on ? ' gira' : ''}`}>
        <rect className="sp-aspa" x={-36} y={-141} width={72} height={3.4} rx={1.7} />
      </g>
      <path className="sp-casquillo" d="M-4 -139 h8 v4 h-8 Z" />
      <circle className={`sp-foco${on ? ' on' : ''}`} cx={0} cy={-131} r={5} />
      {on && <path className="sp-viento sp-viento-v" d="M-22 -128 v10 M0 -124 v14 M22 -128 v10" />}
    </g>
  );
}

function SecadoraRopa({ on }: SpriteProps) {
  return (
    <g className={on ? 'sp-vibra' : undefined}>
      <rect className="sp-blanco" x={-19} y={-44} width={38} height={44} rx={4} />
      <rect className="sp-sombra" x={-19} y={-37} width={38} height={2} />
      <circle className="sp-gris" cx={0} cy={-19} r={13} />
      <circle className={`sp-tambor-seco${on ? ' on' : ''}`} cx={0} cy={-19} r={10} />
      {on && (
        <g className="sp-ropa">
          <circle cx={-4} cy={-19} r={2.6} />
          <circle cx={4} cy={-22} r={2.2} />
          <circle cx={1} cy={-14} r={2.4} />
        </g>
      )}
      <circle className={`sp-led${on ? ' on rojo' : ''}`} cx={-12} cy={-40.5} r={1.4} />
      {on && <path className="sp-vapor" d="M-6 -48 q-3 -5 0 -9 M5 -48 q-3 -5 0 -9" />}
    </g>
  );
}

function Bici({ on }: SpriteProps) {
  return (
    <g>
      <circle className="sp-llanta-linea" cx={-22} cy={-10} r={9.5} />
      <circle className="sp-llanta-linea" cx={22} cy={-10} r={9.5} />
      <path className="sp-bici-cuadro" d="M-22 -10 L-8 -28 H12 L22 -10 M-8 -28 L0 -10 H-22 M0 -10 L10 -28 M12 -28 L8 -37 M4 -37 H13" />
      <rect className="sp-bateria-marco" x={-3} y={-25} width={12} height={5.5} rx={1.5} />
      <rect className={`sp-bateria-nivel${on ? ' carga' : ''}`} x={-2} y={-24} width={10} height={3.5} rx={1} />
      {on && <path className="sp-rayo" d="M2 -44 l-5 8 h4 l-2.5 7 l7.5 -9.5 h-4 Z" />}
    </g>
  );
}

function Horno({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-acero" x={-24} y={-36} width={48} height={36} rx={3} />
      <rect className="sp-negro" x={-18} y={-27} width={36} height={20} rx={2} />
      <rect className={`sp-ventana-horno${on ? ' on' : ''}`} x={-16} y={-25} width={32} height={16} rx={1.5} />
      <rect className="sp-gris" x={-14} y={-31} width={28} height={2.5} rx={1.2} />
      <circle className="sp-gris" cx={-17} cy={-33} r={1.3} />
      <circle className="sp-gris" cx={17} cy={-33} r={1.3} />
      {on && <path className="sp-calor-linea" d="M-10 -40 q-3 -5 0 -9 M0 -40 q-3 -5 0 -9 M10 -40 q-3 -5 0 -9" />}
    </g>
  );
}

function Estufa({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-26} y={-26} width={52} height={26} rx={2} />
      <rect className="sp-negro" x={-26} y={-30} width={52} height={5} rx={2} />
      <ellipse className={`sp-hornilla${on ? ' on' : ''}`} cx={-12} cy={-31} rx={9} ry={2.4} />
      <ellipse className={`sp-hornilla${on ? ' on' : ''}`} cx={12} cy={-31} rx={9} ry={2.4} />
      <circle className="sp-gris" cx={-14} cy={-13} r={2.2} />
      <circle className="sp-gris" cx={14} cy={-13} r={2.2} />
      {on && <path className="sp-calor-linea" d="M-12 -35 q-3 -5 0 -9 M12 -35 q-3 -5 0 -9" />}
    </g>
  );
}

function Tostador({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-24} y={-26} width={48} height={26} rx={2} />
      <rect className="sp-acero" x={-15} y={-42} width={30} height={16} rx={5} />
      <rect className="sp-negro" x={-10} y={-43} width={8} height={2.6} rx={1} />
      <rect className="sp-negro" x={2} y={-43} width={8} height={2.6} rx={1} />
      {on && (
        <g className="sp-tostadas">
          <rect x={-9.5} y={-49} width={7} height={8} rx={1.5} />
          <rect x={2.5} y={-49} width={7} height={8} rx={1.5} />
        </g>
      )}
      <circle className={`sp-led${on ? ' on rojo' : ''}`} cx={11} cy={-31} r={1.3} />
    </g>
  );
}

function Licuadora({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-22} y={-26} width={44} height={26} rx={2} />
      <rect className="sp-negro" x={-9} y={-34} width={18} height={8} rx={2.5} />
      <g className={on ? 'sp-vibra-fuerte' : undefined}>
        <path className="sp-vaso" d="M-8.5 -34 L-11 -62 H11 L8.5 -34 Z" />
        {on && <path className="sp-remolino sp-remolino-v" d="M-6 -44 a6 3 0 0 1 12 0 M-6 -52 a6 3 0 0 0 12 0" />}
        <rect className="sp-negro" x={-12} y={-65} width={24} height={4} rx={2} />
      </g>
    </g>
  );
}

function Lavavajillas({ on }: SpriteProps) {
  return (
    <g className={on ? 'sp-vibra' : undefined}>
      <rect className="sp-acero" x={-22} y={-42} width={44} height={42} rx={3} />
      <rect className="sp-negro" x={-22} y={-42} width={44} height={8} rx={3} />
      <circle className={`sp-led${on ? ' on azul' : ''}`} cx={-14} cy={-38} r={1.4} />
      <rect className="sp-gris" x={-12} y={-30} width={24} height={2.6} rx={1.3} />
      {on && (
        <g className="sp-burbujas">
          <circle cx={-8} cy={-14} r={2.4} />
          <circle cx={2} cy={-18} r={1.8} />
          <circle cx={9} cy={-12} r={2.2} />
        </g>
      )}
    </g>
  );
}

function Hervidor({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-20} y={-24} width={40} height={24} rx={2} />
      <path className="sp-hervidor" d="M-11 -24 L-8 -48 H8 L11 -24 Z" />
      <path className="sp-negro-linea" d="M10 -44 q9 2 7 12 q-1 4 -7 4" fill="none" strokeWidth={2.6} />
      <rect className="sp-negro" x={-6} y={-52} width={12} height={4} rx={2} />
      <circle className={`sp-led${on ? ' on rojo' : ''}`} cx={0} cy={-27} r={1.4} />
      {on && <path className="sp-vapor" d="M-4 -56 q-3 -5 0 -9 M4 -56 q-3 -5 0 -9" />}
    </g>
  );
}

function Olla({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-22} y={-24} width={44} height={24} rx={2} />
      <ellipse className="sp-blanco" cx={0} cy={-36} rx={16} ry={13} />
      <path className="sp-sombra" d="M-14 -36 q14 8 28 0" />
      <ellipse className="sp-gris" cx={0} cy={-48} rx={5} ry={2.4} />
      <circle className={`sp-led${on ? ' on rojo' : ''}`} cx={0} cy={-30} r={1.5} />
      {on && <path className="sp-vapor" d="M-5 -53 q-3 -5 0 -9 M5 -53 q-3 -5 0 -9" />}
    </g>
  );
}

function Calefactor({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-gris" x={-14} y={-4} width={28} height={4} rx={2} />
      <rect className="sp-calefactor" x={-16} y={-34} width={32} height={31} rx={5} />
      {[-8, -3, 2, 7].map((x) => (
        <line key={x} className={`sp-rejilla${on ? ' on' : ''}`} x1={x} y1={-30} x2={x} y2={-8} />
      ))}
      {on && <path className="sp-calor-linea" d="M-10 -40 q-3 -5 0 -9 M0 -40 q-3 -5 0 -9 M10 -40 q-3 -5 0 -9" />}
    </g>
  );
}

function Deshumidificador({ on }: SpriteProps) {
  return (
    <g className={on ? 'sp-vibra' : undefined}>
      <rect className="sp-blanco" x={-15} y={-52} width={30} height={52} rx={5} />
      <rect className="sp-sombra" x={-10} y={-46} width={20} height={9} rx={2} />
      <circle className={`sp-led${on ? ' on azul' : ''}`} cx={9} cy={-30} r={1.6} />
      <rect className="sp-agua-tanque" x={-9} y={-22} width={18} height={14} rx={2} />
      {on && (
        <g className="sp-gotas">
          <path d="M-3 -30 q-2.5 4 0 5.5 q2.5 -1.5 0 -5.5 Z" />
          <path d="M4 -34 q-2 3.5 0 5 q2 -1.5 0 -5 Z" />
        </g>
      )}
    </g>
  );
}

function Bocina({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-negro" x={-13} y={-50} width={26} height={50} rx={4} />
      <circle className={`sp-cono-bocina${on ? ' on' : ''}`} cx={0} cy={-18} r={8.5} />
      <circle className={`sp-cono-bocina${on ? ' on' : ''}`} cx={0} cy={-38} r={5} />
      <circle className="sp-gris" cx={0} cy={-18} r={2.8} />
      {on && (
        <g className="sp-notas">
          <path d="M17 -40 v-9 l6 -2 v9" />
          <circle cx={15.5} cy={-39} r={2} />
          <circle cx={21.5} cy={-41} r={2} />
        </g>
      )}
    </g>
  );
}

function Proyector({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-22} y={-24} width={44} height={4} rx={1} />
      <rect className="sp-madera" x={-16} y={-20} width={3} height={20} />
      <rect className="sp-madera" x={13} y={-20} width={3} height={20} />
      <rect className="sp-blanco" x={-14} y={-35} width={28} height={11} rx={3} />
      <circle className="sp-gris" cx={8} cy={-29.5} r={4} />
      <circle className={`sp-lente${on ? ' on' : ''}`} cx={8} cy={-29.5} r={2.4} />
      {on && <path className="sp-haz" d="M12 -30 L58 -64 L58 -6 Z" />}
    </g>
  );
}

function Tablet({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-18} y={-12} width={36} height={12} rx={2} />
      <rect className="sp-negro" x={-13} y={-40} width={26} height={30} rx={3} transform="rotate(-6 0 -25)" />
      <rect className={`sp-pantalla${on ? ' on' : ''}`} x={-11} y={-38} width={22} height={26} rx={1.5} transform="rotate(-6 0 -25)" />
      {on && <path className="sp-rayo" d="M1 -34 l-4 7 h3.5 l-2 6 l6 -8 h-3.5 Z" />}
    </g>
  );
}

function Impresora({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-madera" x={-22} y={-24} width={44} height={24} rx={2} />
      <rect className="sp-blanco" x={-17} y={-40} width={34} height={16} rx={3} />
      <rect className="sp-negro" x={-12} y={-30} width={24} height={3} rx={1} />
      <g className={on ? 'sp-hoja' : undefined}>
        <rect className="sp-papel" x={-10} y={-48} width={20} height={9} rx={1} />
      </g>
      <circle className={`sp-led${on ? ' on verde' : ''}`} cx={13} cy={-35} r={1.4} />
    </g>
  );
}

function Bomba({ on }: SpriteProps) {
  return (
    <g>
      <rect className="sp-gris" x={-20} y={-5} width={40} height={5} rx={2} />
      <g className={on ? 'sp-vibra-fuerte' : undefined}>
        <rect className="sp-bomba-motor" x={-18} y={-26} width={22} height={20} rx={6} />
        <circle className="sp-bomba-cuerpo" cx={10} cy={-16} r={9} />
        <circle className="sp-gris" cx={10} cy={-16} r={3.2} />
      </g>
      <path className="sp-tubo" d="M10 -25 V-36 H26 M19 -16 H30" />
      {on && (
        <g className="sp-gotas">
          <circle cx={30} cy={-12} r={1.8} />
          <circle cx={34} cy={-6} r={1.5} />
        </g>
      )}
    </g>
  );
}

// El generador vive afuera, en el jardín (no es parte del catálogo de cuartos).
export function Generador({ on }: SpriteProps) {
  return (
    <g className={on ? 'sp-vibra-fuerte' : undefined}>
      <rect className="sp-gen-jaula" x={-34} y={-44} width={68} height={38} rx={5} />
      <rect className="sp-gen-tanque" x={-28} y={-54} width={34} height={14} rx={6} />
      <rect className="sp-negro" x={10} y={-38} width={18} height={20} rx={2} />
      <circle className={`sp-led${on ? ' on verde' : ''}`} cx={15} cy={-33} r={1.8} />
      <circle className={`sp-led${on ? ' on rojo' : ''}`} cx={21} cy={-33} r={1.8} />
      <path className="sp-gris" d="M-30 -22 h38" strokeWidth={3} />
      <circle className="sp-llanta" cx={-24} cy={-4} r={6} />
      <circle className="sp-llanta" cx={24} cy={-4} r={6} />
      <circle className="sp-rin" cx={-24} cy={-4} r={2.5} />
      <circle className="sp-rin" cx={24} cy={-4} r={2.5} />
      <rect className="sp-gris" x={-6} y={-60} width={6} height={7} rx={1} />
      {on && (
        <g className="sp-humo">
          <circle cx={-3} cy={-66} r={4} />
          <circle cx={-3} cy={-66} r={4} />
          <circle cx={-3} cy={-66} r={4} />
        </g>
      )}
    </g>
  );
}

const SPRITES: Record<Visual, (p: SpriteProps) => ReactNode> = {
  tv: Tv,
  minisplit: Minisplit,
  refri: Refri,
  ventilador: Ventilador,
  foco: Foco,
  laptop: Laptop,
  compu: Compu,
  consola: Consola,
  plancha: Plancha,
  secadora: Secadora,
  micro: Micro,
  lavadora: Lavadora,
  boiler: Boiler,
  router: Router,
  cafetera: Cafetera,
  aspiradora: Aspiradora,
  coche: Coche,
  generico: Generico,
  congelador: Congelador,
  ventiTecho: VentiTecho,
  secadoraRopa: SecadoraRopa,
  bici: Bici,
  horno: Horno,
  estufa: Estufa,
  tostador: Tostador,
  licuadora: Licuadora,
  lavavajillas: Lavavajillas,
  hervidor: Hervidor,
  olla: Olla,
  calefactor: Calefactor,
  deshumidificador: Deshumidificador,
  bocina: Bocina,
  proyector: Proyector,
  tablet: Tablet,
  impresora: Impresora,
  bomba: Bomba,
};

export function Sprite({ visual, on }: { visual: Visual; on: boolean }) {
  const Componente = SPRITES[visual];
  return <>{Componente({ on })}</>;
}

// Alto del dibujo de cada aparato: sirve para el icono del catálogo y para
// el área donde se puede hacer clic en la maqueta.
export const ALTO_APARATO: Record<Visual, number> = {
  tv: 46, minisplit: 112, refri: 66, ventilador: 66, foco: 158, laptop: 52, compu: 56, consola: 24,
  plancha: 40, secadora: 44, micro: 48, lavadora: 44, boiler: 64, router: 66, cafetera: 48, aspiradora: 40,
  coche: 40, generico: 30,
  congelador: 30, ventiTecho: 160, secadoraRopa: 46, bici: 46, horno: 38, estufa: 32, tostador: 52,
  licuadora: 66, lavavajillas: 44, hervidor: 58, olla: 50, calefactor: 36, deshumidificador: 54,
  bocina: 52, proyector: 36, tablet: 42, impresora: 50, bomba: 36,
};

export function IconoAparato({ visual }: { visual: Visual }) {
  const alto = ALTO_APARATO[visual];
  const ancho = visual === 'coche' ? 140 : 60;
  // El minisplit y el foco cuelgan en lo alto de la pared: se recorta solo esa parte.
  const caja =
    visual === 'minisplit'
      ? '-34 -118 68 34'
      : visual === 'foco'
        ? '-26 -162 52 48'
        : visual === 'ventiTecho'
          ? '-40 -160 80 36'
          : `${-ancho / 2} ${-alto - 4} ${ancho} ${alto + 8}`;
  return (
    <svg className="casa-icono" viewBox={caja} aria-hidden="true">
      <Sprite visual={visual} on={false} />
    </svg>
  );
}

// El dibujo del aparato según el tipo con el que se guarda en GreonTrack.
export function DibujoTipo({ tipo }: { tipo: string }) {
  return <IconoAparato visual={visualDeTipo(tipo)} />;
}
