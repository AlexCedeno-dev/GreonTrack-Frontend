// La entrega al agregar dispositivos: llega la camioneta, el repartidor deja
// las cajas frente a la casa y cada una se abre y deja ver su aparato.

import { useEffect, useMemo, useState } from 'react';
import { Persona, Caja, VanDibujo } from './casa/Reparto';
import { Sprite } from './casa/Sprites';
import { visualDeTipo } from '../lib/casa';

interface Props {
  tipos: string[];
  onTermina: () => void;
}

const VAN_X = 86;
const CALLE_Y = 266;
const SUELO_Y = 238;
const PUERTA_X = 512;
const MAX_VISIBLES = 8;
const ESPACIO = 38;
const X0 = 196;

const T_VAN = 1.3;
const D_CAMINA = 1.4;

export function EntregaOverlay({ tipos, onTermina }: Props) {
  const visibles = tipos.slice(0, MAX_VISIBLES);
  const extra = tipos.length - visibles.length;

  const plan = useMemo(() => {
    const puerta = T_VAN + D_CAMINA;
    const paso = Math.min(0.32, 2.4 / Math.max(1, visibles.length));
    const caja = (i: number) => puerta + 0.1 + i * paso;
    const abre = (i: number) => caja(i) + 0.6;
    const ultima = visibles.length - 1;
    const regresa = caja(ultima) + 0.4;
    const vanSale = regresa + D_CAMINA;
    return { puerta, caja, abre, regresa, vanSale, total: Math.max(abre(ultima) + 1.4, vanSale + 1.5) };
  }, [visibles.length]);

  const [listo, setListo] = useState(false);
  useEffect(() => {
    const t1 = window.setTimeout(() => setListo(true), (plan.abre(visibles.length - 1) + 0.5) * 1000);
    const t2 = window.setTimeout(onTermina, plan.total * 1000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dx = PUERTA_X - 30 - (VAN_X + 26);
  const dy = SUELO_Y + 4 - (CALLE_Y - 6);
  const css =
    `@keyframes rep-ida{0%{transform:translate(${VAN_X + 26}px,${CALLE_Y - 6}px)}100%{transform:translate(${PUERTA_X - 30}px,${SUELO_Y + 4}px)}}` +
    `@keyframes rep-vuelta{0%{transform:translate(0,0)}100%{transform:translate(${-dx}px,${-dy}px)}}`;

  const t = (s: number) => `${s}s`;

  return (
    <div className="entrega-overlay" role="status" aria-live="polite">
      <div className="entrega-tarjeta">
        <svg className="casa-svg entrega-escena" viewBox="0 0 640 290" aria-hidden="true">
          <style>{css}</style>
          <defs>
            <linearGradient id="entrega-cielo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8ec9f0" />
              <stop offset="1" stopColor="#e4f3fb" />
            </linearGradient>
          </defs>
          <rect width={640} height={SUELO_Y + 6} fill="url(#entrega-cielo)" />
          <circle cx={560} cy={44} r={20} fill="#ffd45e" />
          <path d="M0 200 Q90 168 190 192 T380 188 T640 196 V250 H0 Z" fill="#a8d5a0" opacity={0.7} />

          {/* Casa */}
          <rect x={462} y={118} width={160} height={124} fill="#ece7da" stroke="#b9b2a4" strokeWidth={2} />
          <path d="M452 120 L542 66 L632 120 Z" fill="#53707a" />
          <rect x={482} y={140} width={34} height={30} rx={2} fill="#cfe6f5" stroke="#b9b2a4" strokeWidth={2} />
          <rect x={572} y={140} width={34} height={30} rx={2} fill="#cfe6f5" stroke="#b9b2a4" strokeWidth={2} />
          <rect className="rep-puerta" x={520} y={SUELO_Y - 58} width={30} height={58} rx={3} />
          <g className="rep-ventana" style={{ ['--t' as string]: t(plan.puerta - 0.2), ['--d' as string]: t(plan.regresa - plan.puerta + 0.8) }}>
            <rect className="rep-puerta-abierta" x={524} y={SUELO_Y - 54} width={20} height={54} rx={2} />
          </g>

          {/* Pasto, banqueta y calle */}
          <rect x={0} y={SUELO_Y} width={640} height={22} fill="#7fbf6e" />
          <rect x={0} y={SUELO_Y + 22} width={640} height={10} fill="#cfcabd" />
          <rect x={0} y={SUELO_Y + 32} width={640} height={26} fill="#5b666c" />
          <line x1={0} y1={SUELO_Y + 45} x2={640} y2={SUELO_Y + 45} stroke="#e8e2c9" strokeWidth={2} strokeDasharray="14 12" />

          {/* Camioneta */}
          <g className="rep-van-llega">
            <g className="rep-van-sale" style={{ ['--t' as string]: t(plan.vanSale) }}>
              <g transform={`translate(${VAN_X} ${CALLE_Y + 10})`}>
                <VanDibujo />
              </g>
            </g>
          </g>

          {/* Cajas que se abren y aparatos */}
          {visibles.map((tipo, i) => {
            const x = X0 + i * ESPACIO;
            return (
              <g key={`${tipo}-${i}`} transform={`translate(${x} ${SUELO_Y + 14})`}>
                <g className="rep-ventana" style={{ ['--t' as string]: t(plan.caja(i)), ['--d' as string]: t(plan.abre(i) - plan.caja(i) + 0.1) }}>
                  <g className="ov-cae" style={{ ['--t' as string]: t(plan.caja(i)) }}>
                    <g className="rep-caja-abre" style={{ ['--t' as string]: t(plan.abre(i) - 0.35) }}>
                      <Caja escala={1.2} />
                    </g>
                  </g>
                </g>
                <g className="ov-sprite" style={{ ['--t' as string]: t(plan.abre(i)) }}>
                  <Sprite visual={visualDeTipo(tipo)} on={false} />
                </g>
                <g className="rep-poof" style={{ ['--t' as string]: t(plan.abre(i)) }}>
                  {[0, 1, 2, 3, 4].map((n) => {
                    const ang = (n / 5) * Math.PI * 2;
                    return (
                      <circle
                        key={n}
                        r={3.4}
                        cy={-16}
                        style={{ ['--dx' as string]: `${Math.cos(ang) * 20}px`, ['--dy' as string]: `${Math.sin(ang) * 14}px` }}
                      />
                    );
                  })}
                </g>
              </g>
            );
          })}

          {/* Repartidor */}
          <g className="rep-ida" style={{ ['--t' as string]: t(T_VAN), ['--d' as string]: t(D_CAMINA) }}>
            <g className="rep-vuelta" style={{ ['--t' as string]: t(plan.regresa), ['--d' as string]: t(D_CAMINA) }}>
              <g className="rep-voltea" style={{ ['--t' as string]: t(plan.regresa) }}>
                <g
                  className="rep-piernas"
                  style={{ ['--t' as string]: t(T_VAN), ['--n' as string]: Math.round(D_CAMINA / 0.26) }}
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
        </svg>

        <div className="entrega-pie">
          <div className="entrega-texto">
            <strong>{listo ? '¡Listo, todo instalado!' : 'Tu pedido va en camino'}</strong>
            <span>
              {listo
                ? `${tipos.length} ${tipos.length === 1 ? 'dispositivo ya está' : 'dispositivos ya están'} en tu lista.`
                : 'El repartidor está dejando tus dispositivos.'}
              {extra > 0 && !listo ? ` (se muestran ${MAX_VISIBLES} de ${tipos.length})` : ''}
            </span>
          </div>
          <button type="button" className="casa-btn casa-btn-suave casa-btn-chico" onClick={onTermina}>
            {listo ? 'Continuar' : 'Saltar'}
          </button>
        </div>
      </div>
    </div>
  );
}
