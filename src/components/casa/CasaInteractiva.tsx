// La maqueta de "Mi casa": un corte de casa de dos pisos dibujado en SVG.
// Los aparatos se prenden y apagan con un clic, la electricidad viaja por
// los cables desde el medidor, y la familia camina hacia los cuartos donde
// hay algo prendido.

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { colorCielo, esDeNoche, intensidadSol, posicionAstro } from '../../lib/cielo';
import {
  CASA,
  CUARTOS,
  ESCALERA_ALTA_X,
  ESCALERA_BAJA_X,
  ESCENA,
  pisoY,
  posicionAparato,
  type AparatoCasa,
} from '../../lib/casa';
import { ALTO_APARATO, Sprite } from './Sprites';

interface Props {
  aparatos: AparatoCasa[];
  seleccionadoUid: string | null;
  onSeleccionar: (uid: string | null) => void;
  hora: number;
  paneles: number;
  // Lo que gasta la casa ahora, lo que producen los paneles y la diferencia
  // (negativa = está mandando luz a la red).
  kwConsumo: number;
  kwSolar: number;
  velocidad: number;
  onMonoHabla?: () => void;
}

// ── Monitos ────────────────────────────────────────────────────────────────

interface Mono {
  id: string;
  x: number;
  piso: 0 | 1;
  dur: number;
  camina: boolean;
  mirandoIzq: boolean;
  usando: boolean;
}

const FAMILIA = [
  { id: 'papa', nombre: 'Papá', escala: 1, clase: 'mono-a' },
  { id: 'mama', nombre: 'Mamá', escala: 0.96, clase: 'mono-b' },
  { id: 'nino', nombre: 'Niño', escala: 0.74, clase: 'mono-c' },
];

const VELOCIDAD = 70; // px por segundo

const FRASES = [
  '¡Apaga lo que no uses!',
  'El minisplit es el que más pesa.',
  'Un foco LED gasta mucho menos.',
  'Los cargadores gastan aunque no cargues.',
  'La plancha jala un montón, pero poquito rato.',
  '¡Mira cómo viaja la luz!',
  'Entre más escalones, más caro el kWh.',
];

function useMonitos(aparatosRef: React.MutableRefObject<AparatoCasa[]>, activo: boolean, velocidad: number) {
  const inicial = useMemo<Record<string, Mono>>(() => {
    const posiciones: Array<[number, 0 | 1]> = [
      [470, 0],
      [690, 0],
      [520, 1],
    ];
    const r: Record<string, Mono> = {};
    FAMILIA.forEach((f, i) => {
      r[f.id] = { id: f.id, x: posiciones[i][0], piso: posiciones[i][1], dur: 0, camina: false, mirandoIzq: false, usando: false };
    });
    return r;
  }, []);

  const [estado, setEstado] = useState(inicial);
  const ref = useRef(inicial);

  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    const timers: number[] = [];
    const esperar = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(() => vivo && fn(), ms));
    };
    const poner = (id: string, parche: Partial<Mono>) => {
      ref.current = { ...ref.current, [id]: { ...ref.current[id], ...parche } };
      setEstado(ref.current);
    };

    const caminar = (id: string, x: number, listo: () => void) => {
      const actual = ref.current[id];
      const dist = Math.abs(x - actual.x);
      if (dist < 4) return listo();
      const dur = Math.max(0.3, dist / (VELOCIDAD * velocidad));
      poner(id, { x, dur, camina: true, mirandoIzq: x < actual.x, usando: false });
      esperar(dur * 1000 + 40, () => {
        poner(id, { camina: false });
        listo();
      });
    };

    const subir = (id: string, piso: 0 | 1, listo: () => void) => {
      poner(id, {
        x: piso === 1 ? ESCALERA_ALTA_X : ESCALERA_BAJA_X,
        piso,
        dur: 1.3 / velocidad,
        camina: true,
        mirandoIzq: false,
      });
      esperar((1.3 / velocidad) * 1000 + 40, () => {
        poner(id, { camina: false });
        listo();
      });
    };

    const siguiente = (id: string) => {
      const lista = aparatosRef.current;
      const conAlgoPrendido = CUARTOS.filter((c) => lista.some((a) => a.cuarto === c.id && a.encendido));
      const pool = conAlgoPrendido.length > 0 && Math.random() < 0.8 ? conAlgoPrendido : CUARTOS;
      const destino = pool[Math.floor(Math.random() * pool.length)];
      const x = destino.x + 40 + Math.random() * (destino.w - 80);

      const llegar = () => {
        const prendido = aparatosRef.current.some((a) => a.cuarto === destino.id && a.encendido);
        poner(id, { usando: prendido });
        esperar((3200 + Math.random() * 4500) / velocidad, () => siguiente(id));
      };

      const actual = ref.current[id];
      if (actual.piso === destino.piso) {
        caminar(id, x, llegar);
      } else {
        const entrada = actual.piso === 0 ? ESCALERA_BAJA_X : ESCALERA_ALTA_X;
        caminar(id, entrada, () => subir(id, destino.piso, () => caminar(id, x, llegar)));
      }
    };

    FAMILIA.forEach((f, i) => esperar((900 + i * 1400) / velocidad, () => siguiente(f.id)));

    return () => {
      vivo = false;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [activo, aparatosRef, velocidad]);

  return estado;
}

// ── Escena ─────────────────────────────────────────────────────────────────

function ruta(a: AparatoCasa): string {
  const { x, y, enchufeY } = posicionAparato(a);
  const bus = y - 3;
  return `M100 418 L132 418 L132 ${bus} L${x} ${bus} L${x} ${enchufeY}`;
}

function cajaClic(a: AparatoCasa) {
  if (a.visual === 'coche') return { x: -66, y: -52, w: 132, h: 52 };
  if (a.visual === 'foco') return { x: -22, y: -150, w: 44, h: 40 };
  if (a.visual === 'minisplit') return { x: -32, y: -114, w: 64, h: 24 };
  const alto = ALTO_APARATO[a.visual];
  return { x: -30, y: -alto, w: 60, h: alto };
}

export function CasaInteractiva({
  aparatos,
  seleccionadoUid,
  onSeleccionar,
  hora,
  paneles,
  kwConsumo,
  kwSolar,
  velocidad,
  onMonoHabla,
}: Props) {
  const aparatosRef = useRef(aparatos);
  aparatosRef.current = aparatos;

  // Respeta tanto la preferencia del sistema como la opción de Accesibilidad de la app.
  const { reducedMotion } = useAccessibility();
  const reducirMovimiento = useMemo(
    () => reducedMotion || (typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),
    [reducedMotion]
  );
  const monos = useMonitos(aparatosRef, !reducirMovimiento, velocidad);

  const noche = esDeNoche(hora);
  const cielo = colorCielo(hora);
  const astro = posicionAstro(hora);
  const sol = intensidadSol(hora);
  const kw = kwConsumo - kwSolar;

  // Aparatos recién agregados: llevan la animación de "caer" y el cable se dibuja.
  const vistos = useRef<Set<string>>(new Set(aparatos.map((a) => a.uid)));
  const [, repintar] = useState(0);
  useEffect(() => {
    const nuevos = aparatos.filter((a) => !vistos.current.has(a.uid));
    if (nuevos.length === 0) return;
    const t = window.setTimeout(() => {
      nuevos.forEach((a) => vistos.current.add(a.uid));
      repintar((n) => n + 1);
    }, 1200);
    return () => window.clearTimeout(t);
  }, [aparatos]);

  const panelesVistos = useRef(paneles);
  useEffect(() => {
    if (paneles <= panelesVistos.current) {
      panelesVistos.current = paneles;
      return;
    }
    const t = window.setTimeout(() => {
      panelesVistos.current = paneles;
      repintar((n) => n + 1);
    }, 1200);
    return () => window.clearTimeout(t);
  }, [paneles]);

  const [dicho, setDicho] = useState<{ id: string; texto: string } | null>(null);
  useEffect(() => {
    if (!dicho) return;
    const t = window.setTimeout(() => setDicho(null), 3200);
    return () => window.clearTimeout(t);
  }, [dicho]);

  const hablar = (id: string) => {
    const texto = FRASES[Math.floor(Math.random() * FRASES.length)];
    setDicho({ id, texto });
    onMonoHabla?.();
  };

  const segundosDisco = Math.abs(kw) > 0.005 ? Math.max(0.35, 5 / (0.6 + Math.abs(kw) * 2.2)) : 0;
  const hayCorriente = kwConsumo > 0;
  const exportando = kw < -0.005;
  const generando = paneles > 0 && kwSolar > 0.01;

  return (
    <svg
      className={`casa-svg${noche ? ' noche' : ''}`}
      viewBox={`0 0 ${ESCENA.w} ${ESCENA.h}`}
      role="img"
      aria-label="Maqueta de una casa de dos pisos con sus aparatos eléctricos"
      style={{ '--cielo-a': cielo.a, '--cielo-b': cielo.b } as CSSProperties}
      onClick={() => onSeleccionar(null)}
    >
      <defs>
        <linearGradient id="casa-cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="cielo-a" />
          <stop offset="1" className="cielo-b" />
        </linearGradient>
        <filter id="casa-brillo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Cielo */}
      <rect className="casa-cielo" x={0} y={0} width={ESCENA.w} height={ESCENA.sueloY} fill="url(#casa-cielo)" />
      <g className="casa-astro" transform={`translate(${astro.x.toFixed(1)} ${astro.y.toFixed(1)})`}>
        {astro.esSol ? (
          <g className="sol">
            <circle className="sol-halo" r={44} />
            <g className="rayos">
              {Array.from({ length: 12 }).map((_, i) => (
                <line key={i} x1={0} y1={-34} x2={0} y2={-46} transform={`rotate(${i * 30})`} />
              ))}
            </g>
            <circle r={26} />
          </g>
        ) : (
          <g className="luna">
            <circle r={24} />
            <circle className="crater" cx={-8} cy={-6} r={5} />
            <circle className="crater" cx={8} cy={8} r={3.5} />
          </g>
        )}
      </g>
      {noche && (
        <g className="estrellas">
          {[[90, 60], [200, 110], [330, 50], [470, 90], [600, 40], [720, 100], [780, 40], [930, 130], [40, 150], [540, 130]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1.6} style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </g>
      )}
      <g className="nubes">
        <g className="nube n1">
          <ellipse cx={170} cy={86} rx={42} ry={14} />
          <ellipse cx={196} cy={78} rx={26} ry={14} />
          <ellipse cx={150} cy={80} rx={22} ry={12} />
        </g>
        <g className="nube n2">
          <ellipse cx={640} cy={60} rx={36} ry={11} />
          <ellipse cx={660} cy={53} rx={22} ry={11} />
        </g>
      </g>
      {paneles > 0 && sol > 0.12 && (
        <g className="rayos-solares" style={{ opacity: Math.min(1, sol * 1.3) }}>
          {[0.2, 0.5, 0.8].map((f) => (
            <line key={f} x1={astro.x} y1={astro.y + 30} x2={CASA.x + CASA.w * f} y2={104} />
          ))}
        </g>
      )}
      {!noche && (
        <g className="pajaros">
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(0 ${95 + i * 26})`}>
              <g className="pajaro" style={{ animationDelay: `${i * 2.2}s`, animationDuration: `${26 + i * 4}s` }}>
                <path d="M-7 0 q3.5 -6 7 0 q3.5 -6 7 0" />
              </g>
            </g>
          ))}
        </g>
      )}
      <path className="casa-colina" d="M0 400 Q120 340 260 380 T520 370 T800 380 T960 360 V470 H0 Z" />

      {/* Suelo */}
      <rect className="casa-pasto" x={0} y={ESCENA.sueloY} width={ESCENA.w} height={46} />
      <rect className="casa-banqueta" x={0} y={ESCENA.sueloY + 46} width={ESCENA.w} height={14} />
      <rect className="casa-calle" x={0} y={ESCENA.sueloY + 60} width={ESCENA.w} height={ESCENA.h - ESCENA.sueloY - 60} />
      <line className="casa-calle-raya" x1={0} y1={ESCENA.sueloY + 82} x2={ESCENA.w} y2={ESCENA.sueloY + 82} />

      {/* Un coche que pasa por la calle */}
      <g transform={`translate(0 ${ESCENA.sueloY + 76})`}>
        <g className="auto-pasa">
          <path className="auto-cuerpo" d="M-30 0 q0 -9 7 -10 l8 -2 q4 -9 12 -9 h12 q7 0 11 9 l6 2 q6 1 6 10 Z" />
          <path className="auto-vidrio" d="M-14 -11 q3 -6 8 -6 h7 v6 Z M3 -11 v-6 h6 q4 0 7 6 Z" />
          <circle className="auto-llanta" cx={-16} cy={0} r={5.5} />
          <circle className="auto-llanta" cx={16} cy={0} r={5.5} />
          <path className="auto-luz" d="M36 -5 L90 -14 L90 4 Z" />
        </g>
      </g>

      {/* Arbustos y árboles */}
      <g className="casa-planta">
        <rect x={886} y={400} width={9} height={70} className="tronco" />
        <circle cx={890} cy={388} r={34} className="copa" />
        <circle cx={868} cy={402} r={22} className="copa2" />
        <circle cx={914} cy={404} r={22} className="copa2" />
        <rect x={860} y={452} width={52} height={18} rx={9} className="arbusto" />
        <ellipse cx={170} cy={478} rx={26} ry={14} className="arbusto" />
        <ellipse cx={780} cy={500} rx={30} ry={11} className="arbusto" />
      </g>

      {/* Poste y medidor */}
      <g className="casa-poste">
        <rect x={26} y={262} width={8} height={208} className="poste" />
        <rect x={12} y={272} width={36} height={5} rx={2} className="poste" />
        <rect x={38} y={296} width={16} height={24} rx={4} className="transformador" />
        <circle cx={14} cy={272} r={3} className="aislante" />
        <circle cx={46} cy={272} r={3} className="aislante" />
      </g>
      <path className={`cable-red${hayCorriente || exportando ? ' corre' : ''}${exportando ? ' sale' : ''}`} d="M14 272 Q 36 372 76 400" />

      <g className="casa-medidor" transform="translate(66 392)">
        <rect className="medidor-caja" x={0} y={0} width={36} height={56} rx={7} />
        <circle className="medidor-vidrio" cx={18} cy={20} r={13} />
        <g
          className={`medidor-disco${segundosDisco > 0 ? ' gira' : ''}${exportando ? ' reversa' : ''}`}
          style={segundosDisco > 0 ? { animationDuration: `${segundosDisco}s` } : undefined}
        >
          <line x1={18} y1={20} x2={18} y2={9} />
          <line x1={18} y1={20} x2={27} y2={25} />
        </g>
        <rect className="medidor-pantalla" x={5} y={38} width={26} height={11} rx={2} />
        <text className={`medidor-kw${exportando ? ' exporta' : ''}`} x={18} y={46.5} textAnchor="middle">
          {kw.toFixed(2)}
        </text>
        <text className="medidor-etiqueta" x={18} y={70} textAnchor="middle">
          {exportando ? 'a la red' : 'kW ahora'}
        </text>
      </g>

      {/* Casa: cimientos, muros y techo */}
      <rect className="casa-cimiento" x={CASA.x - 8} y={ESCENA.pisoBajoY} width={CASA.w + 16} height={12} rx={2} />
      <rect className="casa-muro" x={CASA.x - 8} y={130} width={8} height={332} />
      <rect className="casa-muro" x={CASA.x + CASA.w} y={130} width={8} height={332} />

      {CUARTOS.map((c) => {
        const piso = pisoY(c.piso);
        const techo = piso - 158;
        const iluminado = aparatos.some((a) => a.cuarto === c.id && a.visual === 'foco' && a.encendido);
        return (
          <g key={c.id} className={`cuarto cuarto-${c.id}`}>
            <rect className="cuarto-pared" x={c.x} y={techo} width={c.w} height={158} />
            <rect className="cuarto-zocalo" x={c.x} y={piso - 10} width={c.w} height={10} />
            {c.id === 'garage' ? (
              <g className="garage-puerta">
                <rect x={c.x + 8} y={techo + 14} width={c.w - 16} height={120} rx={3} />
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line key={i} x1={c.x + 8} x2={c.x + c.w - 8} y1={techo + 34 + i * 19} y2={techo + 34 + i * 19} />
                ))}
              </g>
            ) : (
              <g className="ventana" transform={`translate(${c.x + c.w - 84} ${techo + 26})`}>
                <rect className="ventana-vidrio" x={0} y={0} width={58} height={46} rx={3} />
                <line x1={29} y1={0} x2={29} y2={46} />
                <line x1={0} y1={23} x2={58} y2={23} />
              </g>
            )}
            <text className="cuarto-nombre" x={c.x + 12} y={techo + 18}>
              {c.nombre}
            </text>
            <rect
              className={`cuarto-frio${aparatos.some((a) => a.cuarto === c.id && a.visual === 'minisplit' && a.encendido) ? ' activa' : ''}`}
              x={c.x}
              y={techo}
              width={c.w}
              height={158}
              pointerEvents="none"
            />
            <rect
              className={`cuarto-oscuro${noche && !iluminado ? ' activa' : ''}`}
              x={c.x}
              y={techo}
              width={c.w}
              height={158}
              pointerEvents="none"
            />
          </g>
        );
      })}

      {/* Escalera */}
      <g className="casa-escalera">
        <path d="M344 460 L358 460 L402 302 L388 302 Z" className="escalera-cuerpo" />
        {Array.from({ length: 9 }).map((_, i) => {
          const t = (i + 1) / 10;
          const y = 460 - t * 158;
          const x = 351 + t * 44;
          return <line key={i} x1={x - 7} y1={y} x2={x + 7} y2={y} className="escalera-peldano" />;
        })}
      </g>

      {/* Losa entre pisos, techo y divisiones */}
      <rect className="casa-losa" x={CASA.x - 8} y={ESCENA.pisoAltoY} width={CASA.w + 16} height={10} />
      <rect className="casa-techo" x={CASA.x - 20} y={112} width={CASA.w + 40} height={20} rx={4} />
      <rect className="casa-techo-borde" x={CASA.x - 20} y={128} width={CASA.w + 40} height={4} />
      {paneles > 0 && (
        <g className="casa-solar">
          <path className="solar-cable" d="M128 108 H106 V406 H102" />
          {generando && <path className="solar-flujo" d="M128 108 H106 V406 H102" filter="url(#casa-brillo)" />}
          {Array.from({ length: paneles }).map((_, i) => {
            const nuevo = i >= panelesVistos.current;
            return (
              <g key={i} transform={`translate(${CASA.x + 12 + i * 70} 112)`}>
                <g className={`panel-solar${nuevo ? ' entra' : ''}`}>
                  <path className="panel-pata" d="M10 0 V-5 M52 0 V-5" />
                  <path className="panel-cuerpo" d="M2 -5 L58 -5 L66 -23 L10 -23 Z" />
                  <path className="panel-rejilla" d="M16.7 -5 L24.7 -23 M31.3 -5 L39.3 -23 M46 -5 L54 -23 M6 -14 H62" />
                  {generando && (
                    <path
                      className="panel-brillo"
                      d="M2 -5 L14 -5 L22 -23 L10 -23 Z"
                      style={{ animationDelay: `${i * 0.28}s`, opacity: 0.2 + sol * 0.6 }}
                    />
                  )}
                </g>
                {nuevo && <circle className="onda-nueva solar" cx={34} cy={-14} r={8} />}
              </g>
            );
          })}
        </g>
      )}
      {[370, 610].map((x) => (
        <rect key={`a${x}`} className="casa-division" x={x - 3} y={132} width={6} height={72} />
      ))}
      {[340, 590].map((x) => (
        <rect key={`b${x}`} className="casa-division" x={x - 3} y={300} width={6} height={72} />
      ))}

      {/* Cables */}
      <g className="casa-cables">
        {aparatos.map((a) => (
          <path
            key={`c-${a.uid}`}
            className={`cable${!vistos.current.has(a.uid) ? ' dibuja' : ''}`}
            d={ruta(a)}
            pathLength={1}
          />
        ))}
        {aparatos
          .filter((a) => a.encendido)
          .map((a) => (
            <path
              key={`f-${a.uid}`}
              className="cable-flujo"
              d={ruta(a)}
              style={{ animationDuration: `${Math.max(0.5, 2.4 - a.watts / 1800)}s` }}
              filter="url(#casa-brillo)"
            />
          ))}
      </g>

      {/* Aparatos */}
      {aparatos.map((a) => {
        const { x, y, enchufeY } = posicionAparato(a);
        const nuevo = !vistos.current.has(a.uid);
        const seleccionado = a.uid === seleccionadoUid;
        const caja = cajaClic(a);
        return (
          <g key={a.uid} transform={`translate(${x} ${y})`}>
            <g
              className={`aparato${a.encendido ? ' on' : ' off'}${nuevo ? ' entra' : ''}${seleccionado ? ' sel' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onSeleccionar(a.uid);
              }}
              role="button"
              tabIndex={0}
              aria-label={`${a.nombre}, ${a.encendido ? 'prendido' : 'apagado'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSeleccionar(a.uid);
                }
              }}
            >
              <rect className="aparato-clic" x={caja.x} y={caja.y} width={caja.w} height={caja.h} />
              <ellipse className="aparato-sombra" cx={0} cy={1} rx={a.visual === 'coche' ? 70 : 22} ry={4} />
              <Sprite visual={a.visual} on={a.encendido} />
              {seleccionado && (
                <ellipse className="aparato-anillo" cx={0} cy={1} rx={a.visual === 'coche' ? 82 : 30} ry={6.5} />
              )}
            </g>
            {nuevo && <circle className="onda-nueva" cx={0} cy={enchufeY - y} r={8} />}
            {nuevo && (
              <g className="chispas" transform={`translate(0 ${enchufeY - y})`}>
                {Array.from({ length: 10 }).map((_, i) => {
                  const ang = (i / 10) * Math.PI * 2;
                  const radio = 26 + (i % 3) * 8;
                  return (
                    <circle
                      key={i}
                      r={2.6}
                      className={i % 2 === 0 ? 'chispa-a' : 'chispa-b'}
                      style={
                        {
                          '--dx': `${Math.cos(ang) * radio}px`,
                          '--dy': `${Math.sin(ang) * radio}px`,
                        } as CSSProperties
                      }
                    />
                  );
                })}
              </g>
            )}
            {a.encendido && a.watts >= 300 && a.visual !== 'foco' && (
              <g transform={`translate(0 ${caja.y - 12})`} pointerEvents="none">
                <g className="insignia">
                  <rect x={-26} y={-9} width={52} height={15} rx={7.5} />
                  <path d="M-17 -6 l-3 6 h3 l-1.5 5 l5 -7 h-3 l2 -4 Z" />
                  <text x={4} y={2.5} textAnchor="middle">
                    {a.watts >= 1000 ? `${(a.watts / 1000).toFixed(1)} kW` : `${a.watts} W`}
                  </text>
                </g>
              </g>
            )}
          </g>
        );
      })}

      {/* Monitos */}
      {FAMILIA.map((f) => {
        const m = monos[f.id];
        const y = pisoY(m.piso);
        return (
          <g
            key={f.id}
            className={`mono ${f.clase}${m.camina ? ' camina' : ''}${m.usando ? ' usando' : ''}`}
            style={{ transform: `translate(${m.x}px, ${y}px)`, transitionDuration: `${m.dur}s` }}
            onClick={(e) => {
              e.stopPropagation();
              hablar(f.id);
            }}
          >
            <g transform={`scale(${m.mirandoIzq ? -f.escala : f.escala} ${f.escala})`}>
              <g className="mono-cuerpo">
                <rect className="mono-pierna pa" x={-6} y={-16} width={5} height={16} rx={2.5} />
                <rect className="mono-pierna pb" x={1} y={-16} width={5} height={16} rx={2.5} />
                <rect className="mono-torso" x={-9} y={-34} width={18} height={21} rx={7} />
                <rect className="mono-brazo ba" x={-12} y={-32} width={4.5} height={15} rx={2.2} />
                <rect className="mono-brazo bb" x={7.5} y={-32} width={4.5} height={15} rx={2.2} />
                <circle className="mono-cara" cx={0} cy={-43} r={9} />
                <path className="mono-pelo" d="M-9 -44 q0 -11 9 -11 q9 0 9 11 q-4 -5 -9 -5 q-5 0 -9 5 Z" />
                <circle className="mono-ojo" cx={3} cy={-43} r={1.1} />
                <circle className="mono-ojo" cx={-2} cy={-43} r={1.1} />
              </g>
            </g>
          </g>
        );
      })}
      {dicho && (
        <g
          className="mono-globo"
          transform={`translate(${monos[dicho.id].x} ${pisoY(monos[dicho.id].piso) - 66})`}
          pointerEvents="none"
        >
          <rect x={-(dicho.texto.length * 3.1 + 10)} y={-20} width={dicho.texto.length * 6.2 + 20} height={24} rx={9} />
          <path d="M-4 3 L0 10 L4 3 Z" />
          <text x={0} y={-4} textAnchor="middle">
            {dicho.texto}
          </text>
        </g>
      )}
    </svg>
  );
}
