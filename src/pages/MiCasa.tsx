import { useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { CasaInteractiva } from '../components/casa/CasaInteractiva';
import { IconoAparato } from '../components/casa/Sprites';
import {
  BoltIcon,
  CasaIcon,
  CloseIcon,
  GeneratorIcon,
  MinusIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  PlugIcon,
  PlusIcon,
  SolarPanelIcon,
  SparkChartIcon,
  SpeedIcon,
  SunIcon,
  VolumeIcon,
  VolumeOffIcon,
} from '../components/icons';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import {
  CASA_DE_EJEMPLO,
  CATALOGO,
  CUARTOS,
  GENERADOR,
  ESCENA,
  casaDesdeDispositivos,
  crearAparato,
  PANEL,
  kwAhora,
  kwSolarAhora,
  kwhPorBimestre,
  kwhSolarBimestre,
  posicionAparato,
  totalKwhBimestre,
  type AparatoCasa,
  type CuartoId,
} from '../lib/casa';
import { esDeNoche, formatoHora, intensidadSol } from '../lib/cielo';
import { SECCIONES, seccionDeTipo } from '../lib/deviceCategories';
import { sonidos } from '../lib/sonidos';
import {
  DIAS_POR_BIMESTRE,
  PRECIOS_CFE,
  TARIFAS,
  calcularRecibo,
  formatoPesos,
  limitesBimestre,
  type TarifaCfe,
} from '../lib/cfe';

const CLAVE = 'greontrack-casa-v1-';

interface Guardado {
  aparatos: AparatoCasa[];
  tarifa: TarifaCfe;
  paneles: number;
  generador?: { activo: boolean; horas: number };
}

const CLAVE_SONIDO = 'greontrack-casa-sonido';
const VELOCIDADES = [1, 2, 4];

function leerGuardado(userId: string | undefined): Guardado | null {
  if (!userId) return null;
  try {
    const crudo = localStorage.getItem(CLAVE + userId);
    if (!crudo) return null;
    const dato = JSON.parse(crudo) as Guardado;
    if (!Array.isArray(dato.aparatos)) return null;
    return dato;
  } catch {
    return null;
  }
}

function formatoKwh(v: number): string {
  return v.toLocaleString('es-MX', { maximumFractionDigits: v < 10 ? 1 : 0 });
}

export function MiCasa() {
  const { user } = useAuth();
  const { datos } = useAppData();

  const guardado = useMemo(() => leerGuardado(user?.id), [user?.id]);
  const [aparatos, setAparatos] = useState<AparatoCasa[]>(guardado?.aparatos ?? CASA_DE_EJEMPLO);
  const [tarifa, setTarifa] = useState<TarifaCfe>(guardado?.tarifa ?? '1');
  const [paneles, setPaneles] = useState(guardado?.paneles ?? 0);
  const [generador, setGenerador] = useState(guardado?.generador ?? { activo: false, horas: 3 });
  const [hora, setHora] = useState(14);
  const [reloj, setReloj] = useState(false);
  const [velocidad, setVelocidad] = useState(1);
  const [sonido, setSonido] = useState(() => {
    try {
      return localStorage.getItem(CLAVE_SONIDO) === '1';
    } catch {
      return false;
    }
  });
  const [seleccionadoUid, setSeleccionadoUid] = useState<string | null>(null);
  const [bandeja, setBandeja] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  // Si nunca ha armado su casa, se prellena con sus dispositivos reales.
  const prellenado = useRef(guardado !== null);
  useEffect(() => {
    if (prellenado.current || !datos || datos.porDispositivo.length === 0) return;
    prellenado.current = true;
    const desdeReales = casaDesdeDispositivos(datos.porDispositivo);
    if (desdeReales.length > 0) setAparatos(desdeReales);
  }, [datos]);

  useEffect(() => {
    if (!user?.id) return;
    try {
      localStorage.setItem(CLAVE + user.id, JSON.stringify({ aparatos, tarifa, paneles, generador } satisfies Guardado));
    } catch {
      // Es solo una comodidad: si el navegador no deja guardar, la casa sigue funcionando.
    }
  }, [aparatos, tarifa, paneles, generador, user?.id]);

  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(null), 3200);
    return () => window.clearTimeout(t);
  }, [aviso]);

  // Reloj de la casa: pasa un día completo en unos 40 segundos (más rápido con 2x y 4x).
  useEffect(() => {
    if (!reloj) return;
    const t = window.setInterval(() => setHora((h) => (h + 0.06 * velocidad) % 24), 100);
    return () => window.clearInterval(t);
  }, [reloj, velocidad]);

  const alternarSonido = () => {
    const nuevo = !sonido;
    setSonido(nuevo);
    try {
      localStorage.setItem(CLAVE_SONIDO, nuevo ? '1' : '0');
    } catch {
      // solo es una comodidad
    }
    if (nuevo) sonidos.prender();
  };
  const tocar = (nombre: keyof typeof sonidos) => {
    if (sonido) sonidos[nombre]();
  };

  const noche = esDeNoche(hora);
  const seleccionado = aparatos.find((a) => a.uid === seleccionadoUid) ?? null;

  const totalKwh = totalKwhBimestre(aparatos);
  const solarBim = kwhSolarBimestre(paneles);
  // Medición neta: lo que producen los paneles se descuenta de lo que se usa.
  const trasSolar = Math.max(0, totalKwh - solarBim);
  // El generador (opcional) cubre una parte de lo que los paneles no alcanzan.
  const generadoBim = generador.activo
    ? Math.min(GENERADOR.kw * generador.horas * DIAS_POR_BIMESTRE, trasSolar)
    : 0;
  const litrosBim = generadoBim * GENERADOR.litrosPorKwh;
  const costoCombustible = litrosBim * GENERADOR.precioLitro;
  const co2Generador = litrosBim * GENERADOR.co2KgPorLitro;
  const kwhFacturados = Math.max(0, trasSolar - generadoBim);
  const sobraSolar = Math.max(0, solarBim - totalKwh);
  const recibo = useMemo(() => calcularRecibo(kwhFacturados, tarifa), [kwhFacturados, tarifa]);
  const reciboSinPaneles = useMemo(() => calcularRecibo(totalKwh, tarifa), [totalKwh, tarifa]);
  const reciboConSolar = useMemo(() => calcularRecibo(trasSolar, tarifa), [trasSolar, tarifa]);
  const ahorroSolar = reciboSinPaneles.total - reciboConSolar.total;
  const bajaGenerador = reciboConSolar.total - recibo.total;
  const ahorroNetoGenerador = bajaGenerador - costoCombustible;
  const ahorroBimestre = reciboSinPaneles.total - recibo.total;
  const kwConsumo = kwAhora(aparatos);
  const kwSolar = kwSolarAhora(paneles, intensidadSol(hora));

  // Lo que cuesta de verdad cada aparato: la diferencia del recibo con y sin él
  // (con escalones, un aparato "cuesta" más si lo que quita es excedente).
  const ranking = useMemo(
    () =>
      aparatos
        .map((a) => {
          const kwh = kwhPorBimestre(a);
          const sin = calcularRecibo(Math.max(0, kwhFacturados - kwh), tarifa).total;
          return { aparato: a, kwh, costo: recibo.total - sin };
        })
        .sort((x, y) => y.kwh - x.kwh),
    [aparatos, kwhFacturados, tarifa, recibo.total]
  );
  const maxKwh = ranking[0]?.kwh ?? 0;

  const actualizar = (uid: string, parche: Partial<AparatoCasa>) =>
    setAparatos((lista) => lista.map((a) => (a.uid === uid ? { ...a, ...parche } : a)));

  const agregar = (indice: number) => {
    const nuevo = crearAparato(aparatos, CATALOGO[indice]);
    if (!nuevo) {
      setAviso('La casa está llena: quita algo para poder agregar otro aparato.');
      return;
    }
    nuevo.encendido = true;
    setAparatos((lista) => [...lista, nuevo]);
    tocar('agregar');
    setBandeja(false);
    setSeleccionadoUid(nuevo.uid);
    setAviso(`${nuevo.nombre} agregado en ${CUARTOS.find((c) => c.id === nuevo.cuarto)?.nombre.toLowerCase()}.`);
  };

  const quitar = (uid: string) => {
    setAparatos((lista) => lista.filter((a) => a.uid !== uid));
    tocar('quitar');
    setSeleccionadoUid(null);
  };

  const moverACuarto = (a: AparatoCasa, cuarto: CuartoId) => {
    const sinEste = aparatos.filter((x) => x.uid !== a.uid);
    const base = CATALOGO.find((c) => c.visual === a.visual);
    const probado = crearAparato(sinEste, { ...(base ?? CATALOGO[0]), visual: a.visual, cuarto });
    if (!probado || probado.cuarto !== cuarto) {
      setAviso('Ese cuarto ya no tiene lugar.');
      return;
    }
    actualizar(a.uid, { cuarto, slot: probado.slot });
  };

  const todosPrendidos = aparatos.length > 0 && aparatos.every((a) => a.encendido);
  const prenderTodo = () => {
    tocar(todosPrendidos ? 'apagar' : 'prender');
    setAparatos((lista) => lista.map((a) => ({ ...a, encendido: !todosPrendidos })));
  };

  const cambiarPaneles = (delta: number) => {
    const nuevo = Math.min(PANEL.max, Math.max(0, paneles + delta));
    if (nuevo === paneles) return;
    setPaneles(nuevo);
    if (delta > 0) tocar('panel');
  };

  const usarMisDispositivos = () => {
    if (!datos || datos.porDispositivo.length === 0) {
      setAviso('Todavía no tienes dispositivos registrados.');
      return;
    }
    setAparatos(casaDesdeDispositivos(datos.porDispositivo));
    setSeleccionadoUid(null);
    setAviso('Armé tu casa con tus dispositivos registrados.');
  };

  const lim = limitesBimestre(tarifa);
  const maxEscala = Math.max(recibo.kwh * 1.08, lim.basico + lim.intermedio + 40, 1);
  const pct = (kwh: number) => `${Math.min(100, (kwh / maxEscala) * 100)}%`;

  const punto = seleccionado ? posicionAparato(seleccionado) : null;
  const costoSeleccionado = seleccionado ? ranking.find((r) => r.aparato.uid === seleccionado.uid) : null;

  return (
    <AppShell
      title="Mi casa"
      subtitle="Tu casa en miniatura, con luz de verdad."
    >
      <header className="casa-portada">
        <span className="casa-portada-etiqueta">
          <CasaIcon /> Simulador de consumo
        </span>
        <h2 className="casa-portada-titulo">
          La luz de tu casa,
          <em> al descubierto.</em>
        </h2>
        <p className="casa-portada-texto">
          Prende lo que quieras, ve cómo viaja la electricidad y cómo se arma tu recibo de CFE. Súbele paneles solares y
          mira cuánto baja.
        </p>
        <ul className="casa-portada-datos">
          <li>
            <span className="casa-dato-icono">
              <BoltIcon />
            </span>
            <div>
              <strong>{Math.abs(kwConsumo - kwSolar).toFixed(2)} kW</strong>
              <small>{kwConsumo - kwSolar < -0.005 ? 'mandando a la red' : 'jalando ahora'}</small>
            </div>
          </li>
          <li>
            <span className="casa-dato-icono">
              <SparkChartIcon />
            </span>
            <div>
              <strong>{formatoKwh(totalKwh)} kWh</strong>
              <small>de consumo al bimestre</small>
            </div>
          </li>
          <li>
            <span className="casa-dato-icono">
              <SolarPanelIcon />
            </span>
            <div>
              <strong>{formatoPesos(recibo.total)}</strong>
              <small>{paneles > 0 ? `con ${paneles} ${paneles === 1 ? 'panel' : 'paneles'}` : 'tu recibo estimado'}</small>
            </div>
          </li>
        </ul>
      </header>

      <section className="casa-hero card">
        <div className="casa-escena" data-noche={noche ? '1' : '0'}>
          <CasaInteractiva
            aparatos={aparatos}
            seleccionadoUid={seleccionadoUid}
            onSeleccionar={setSeleccionadoUid}
            hora={hora}
            paneles={paneles}
            kwConsumo={kwConsumo}
            kwSolar={kwSolar}
            velocidad={velocidad}
            generador={generador.activo}
            onMonoHabla={() => tocar('hola')}
          />

          {seleccionado && punto && (
            <div
              className="casa-popover"
              data-lado={punto.x > ESCENA.w / 2 ? 'izq' : 'der'}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="casa-popover-cerrar" onClick={() => setSeleccionadoUid(null)} aria-label="Cerrar">
                <CloseIcon />
              </button>
              <strong>{seleccionado.nombre}</strong>
              <span className="casa-popover-dato">
                {seleccionado.watts} W · {formatoKwh(kwhPorBimestre(seleccionado))} kWh al bimestre
                {costoSeleccionado ? ` · ${formatoPesos(costoSeleccionado.costo)}` : ''}
              </span>

              <label className="casa-campo">
                <span>
                  Horas al día: <b>{seleccionado.horas.toLocaleString('es-MX')}</b>
                </span>
                <input
                  type="range"
                  min={0.1}
                  max={24}
                  step={0.1}
                  value={seleccionado.horas}
                  onChange={(e) => actualizar(seleccionado.uid, { horas: Number(e.target.value) })}
                />
              </label>

              <label className="casa-campo casa-campo-fila">
                <span>Cuarto</span>
                <select
                  value={seleccionado.cuarto}
                  onChange={(e) => moverACuarto(seleccionado, e.target.value as CuartoId)}
                >
                  {CUARTOS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <div className="casa-popover-acciones">
                <button
                  type="button"
                  className={`casa-btn ${seleccionado.encendido ? 'casa-btn-apagar' : 'casa-btn-prender'}`}
                  onClick={() => {
                    tocar(seleccionado.encendido ? 'apagar' : 'prender');
                    actualizar(seleccionado.uid, { encendido: !seleccionado.encendido });
                  }}
                >
                  <BoltIcon /> {seleccionado.encendido ? 'Apagar' : 'Prender'}
                </button>
                <button type="button" className="casa-btn casa-btn-quitar" onClick={() => quitar(seleccionado.uid)}>
                  Quitar
                </button>
              </div>
            </div>
          )}

          <div className="casa-pista">Toca un aparato para prenderlo o ajustarlo. Toca a los monitos para que te hablen.</div>

          {aviso && (
            <div className="casa-aviso" role="status">
              {aviso}
            </div>
          )}

          {bandeja && (
            <div className="casa-bandeja" role="dialog" aria-label="Agregar aparato">
              {SECCIONES.map((seccion) => {
                const items = CATALOGO.map((c, indice) => ({ c, indice })).filter(
                  ({ c }) => seccionDeTipo(c.tipoDb).id === seccion.id
                );
                if (items.length === 0) return null;
                const IconoSeccion = seccion.icono;
                return (
                  <section key={seccion.id} className="casa-bandeja-seccion">
                    <h3>
                      <IconoSeccion /> {seccion.nombre}
                    </h3>
                    <div className="casa-bandeja-grid">
                      {items.map(({ c, indice }, n) => (
                        <button
                          key={c.visual}
                          type="button"
                          className="casa-bandeja-item"
                          onClick={() => agregar(indice)}
                          style={{ animationDelay: `${n * 28}ms` }}
                        >
                          <IconoAparato visual={c.visual} />
                          <span className="casa-bandeja-nombre">{c.nombre}</span>
                          <span className="casa-bandeja-dato">
                            {c.watts >= 1000 ? `${c.watts / 1000} kW` : `${c.watts} W`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          <div className="casa-barra">
            <button type="button" className="casa-btn casa-btn-principal" onClick={() => setBandeja((v) => !v)} aria-expanded={bandeja}>
              {bandeja ? 'Cerrar' : <><PlugIcon /> Agregar aparato</>}
            </button>
            <button type="button" className="casa-btn casa-btn-suave" onClick={prenderTodo} disabled={aparatos.length === 0}>
              <BoltIcon /> {todosPrendidos ? 'Apagar todo' : 'Prender todo'}
            </button>

            <div className="casa-apoyo" role="group" aria-label="Apoyo opcional">
              <span className="casa-apoyo-etiqueta">Apoyo opcional</span>
              <div className="casa-paneles" role="group" aria-label="Paneles solares">
              <SolarPanelIcon />
              <button type="button" onClick={() => cambiarPaneles(-1)} disabled={paneles === 0} aria-label="Quitar un panel">
                <MinusIcon />
              </button>
              <span className="casa-paneles-n" key={paneles}>
                {paneles}
              </span>
              <button type="button" onClick={() => cambiarPaneles(1)} disabled={paneles >= PANEL.max} aria-label="Agregar un panel">
                <PlusIcon />
              </button>
              <small>paneles</small>
            </div>

              <div className={`casa-generador${generador.activo ? ' activo' : ''}`}>
                <button
                  type="button"
                  className="casa-generador-btn"
                  aria-pressed={generador.activo}
                  onClick={() => {
                    tocar(generador.activo ? 'apagar' : 'prender');
                    setGenerador((g) => ({ ...g, activo: !g.activo }));
                  }}
                >
                  <GeneratorIcon /> Generador
                </button>
                {generador.activo && (
                  <>
                    <input
                      type="range"
                      min={1}
                      max={GENERADOR.maxHoras}
                      step={1}
                      value={generador.horas}
                      onChange={(e) => setGenerador((g) => ({ ...g, horas: Number(e.target.value) }))}
                      aria-label="Horas al día que trabaja el generador"
                    />
                    <output>{generador.horas} h/día</output>
                  </>
                )}
              </div>
            </div>

            <div className="casa-reloj">
              <span className={`casa-reloj-astro${noche ? ' luna' : ''}`}>{noche ? <MoonIcon /> : <SunIcon />}</span>
              <input
                type="range"
                min={0}
                max={23.99}
                step={0.05}
                value={hora}
                onChange={(e) => setHora(Number(e.target.value))}
                aria-label="Hora del día"
              />
              <output>{formatoHora(hora)}</output>
              <button
                type="button"
                className="casa-btn-redondo"
                onClick={() => setReloj((v) => !v)}
                aria-pressed={reloj}
                aria-label={reloj ? 'Pausar el reloj' : 'Correr el día'}
                title={reloj ? 'Pausar el reloj' : 'Correr el día'}
              >
                {reloj ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                type="button"
                className="casa-btn-redondo casa-btn-velocidad"
                onClick={() => setVelocidad((v) => VELOCIDADES[(VELOCIDADES.indexOf(v) + 1) % VELOCIDADES.length])}
                aria-label={`Velocidad ${velocidad}x`}
                title="Velocidad del reloj y de los monitos"
              >
                <SpeedIcon />
                <b>{velocidad}x</b>
              </button>
              <button
                type="button"
                className="casa-btn-redondo"
                onClick={alternarSonido}
                aria-pressed={sonido}
                aria-label={sonido ? 'Silenciar' : 'Activar sonidos'}
                title={sonido ? 'Silenciar' : 'Activar sonidos'}
              >
                {sonido ? <VolumeIcon /> : <VolumeOffIcon />}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="casa-cuentas">
        <article className="card casa-recibo">
          <header className="casa-recibo-cab">
            <div>
              <span className="casa-etiqueta">Tu recibo estimado, cada 2 meses</span>
              <strong className="casa-total" key={Math.round(recibo.total)}>
                {formatoPesos(recibo.total)}
                {(paneles > 0 || generador.activo) && ahorroBimestre > 0.5 && (
                  <s className="casa-total-antes">{formatoPesos(reciboSinPaneles.total)}</s>
                )}
              </strong>
              <span className="muted">
                {formatoKwh(recibo.kwh)} kWh facturados al bimestre · {formatoKwh(recibo.kwhMensual)} al mes · con IVA
              </span>
            </div>
            <label className="casa-tarifa">
              <span>Tu tarifa</span>
              <div className="casa-chips" role="radiogroup" aria-label="Tarifa de CFE">
                {TARIFAS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={tarifa === t}
                    className={`casa-chip${tarifa === t ? ' activa' : ''}`}
                    onClick={() => setTarifa(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </label>
          </header>

          <div className="casa-escalones" aria-label="Cómo se reparte tu consumo en los escalones de CFE">
            <div className="casa-pista-wrap">
              <div className="casa-pista-escalones">
                {recibo.escalones.map((e) => (
                  <div
                    key={e.clave}
                    className={`casa-tramo casa-tramo-${e.clave}`}
                    style={{ width: pct(e.kwh) }}
                    title={`${e.nombre}: ${formatoKwh(e.kwh)} kWh`}
                  />
                ))}
              </div>
              {lim.dac < maxEscala && (
                <div className="casa-marca-dac" style={{ left: pct(lim.dac) }}>
                  <span>Límite DAC</span>
                </div>
              )}
            </div>
            <div className="casa-leyenda">
              {recibo.escalones.map((e) => (
                <span key={e.clave} className="casa-leyenda-item">
                  <i className={`casa-punto casa-tramo-${e.clave}`} /> {e.nombre}
                </span>
              ))}
            </div>
          </div>

          <div className={`casa-solar-resumen${paneles > 0 ? ' activo' : ''}`}>
            <span className="casa-solar-icono">
              <SolarPanelIcon />
            </span>
            {paneles === 0 ? (
              <p>Sin paneles solares. Súbele paneles con el control de la barra de abajo y mira cuánto baja tu recibo.</p>
            ) : (
              <p>
                <strong>
                  {paneles} {paneles === 1 ? 'panel' : 'paneles'} de {PANEL.watts} W
                </strong>{' '}
                producen unos {formatoKwh(solarBim)} kWh al bimestre ({Math.round((solarBim / Math.max(totalKwh, 1)) * 100)}%
                de lo que gastas). Tu recibo baja {formatoPesos(Math.max(0, ahorroSolar))} cada dos meses, unos{' '}
                <strong>{formatoPesos(Math.max(0, ahorroSolar) * 6)} al año</strong>.
                {sobraSolar > 0 &&
                  ` Te sobran ${formatoKwh(sobraSolar)} kWh: se quedan a tu favor para los recibos siguientes.`}
              </p>
            )}
          </div>

          {generador.activo && (
            <div className="casa-solar-resumen activo casa-gen-resumen">
              <span className="casa-solar-icono">
                <GeneratorIcon />
              </span>
              <p>
                <strong>Generador de {GENERADOR.kw} kW</strong>, {generador.horas} {generador.horas === 1 ? 'hora' : 'horas'} al
                día: cubre unos {formatoKwh(generadoBim)} kWh al bimestre y gasta unos {formatoKwh(litrosBim)} litros de
                gasolina ({formatoPesos(costoCombustible)}). Tu recibo baja {formatoPesos(Math.max(0, bajaGenerador))}, pero el
                combustible cuesta más:{' '}
                <strong>
                  {ahorroNetoGenerador >= 0
                    ? `ahorras ${formatoPesos(ahorroNetoGenerador)} en total`
                    : `te sale ${formatoPesos(-ahorroNetoGenerador)} más caro en total`}
                </strong>
                . Sirve de apoyo en apagones o cuando se junta mucha carga, no para ahorrar. Emite unos{' '}
                {formatoKwh(co2Generador)} kg de CO₂.
              </p>
            </div>
          )}

          <table className="casa-tabla">
            <thead>
              <tr>
                <th>Escalón</th>
                <th>kWh</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {recibo.escalones.map((e) => (
                <tr key={e.clave} className={e.kwh === 0 ? 'vacio' : undefined}>
                  <td>
                    <i className={`casa-punto casa-tramo-${e.clave}`} /> {e.nombre}
                    {e.tope !== null && <small> hasta {e.tope}</small>}
                  </td>
                  <td>{formatoKwh(e.kwh)}</td>
                  <td>${e.precio.toFixed(3)}</td>
                  <td>{formatoPesos(e.subtotal)}</td>
                </tr>
              ))}
              <tr className="sub">
                <td colSpan={3}>IVA 16%</td>
                <td>{formatoPesos(recibo.iva)}</td>
              </tr>
              <tr className="total">
                <td colSpan={3}>Total</td>
                <td>{formatoPesos(recibo.total)}</td>
              </tr>
            </tbody>
          </table>

          {recibo.superaDac ? (
            <p className="casa-alerta casa-alerta-peligro">
              Con este consumo pasarías de {recibo.limiteDacMensual} kWh al mes, el límite de la tarifa {tarifa}: CFE te
              podría cambiar a la tarifa de alto consumo (DAC), mucho más cara.
            </p>
          ) : recibo.avanceDac > 0.8 ? (
            <p className="casa-alerta casa-alerta-aviso">
              Vas en {Math.round(recibo.avanceDac * 100)}% del límite de la tarifa {tarifa} ({recibo.limiteDacMensual} kWh al mes):
              cuidado con pasarte.
            </p>
          ) : (
            recibo.escalones[2].kwh > 0 && (
              <p className="casa-alerta casa-alerta-aviso">
                {formatoKwh(recibo.escalones[2].kwh)} kWh caen en el escalón más caro (${PRECIOS_CFE.excedente.toFixed(2)} cada uno).
                Bajar ahí es lo que más te ahorra.
              </p>
            )
          )}

          <p className="casa-nota">
            Precios de referencia de CFE ({PRECIOS_CFE.referencia}), sin alumbrado público y fuera de verano. Cada aparato
            se cuenta con sus horas de uso al día durante {DIAS_POR_BIMESTRE} días. Los paneles se estiman con{' '}
            {PANEL.horasSol} horas de sol pleno al día y {Math.round(PANEL.eficiencia * 100)}% de eficiencia. Tu recibo
            real puede variar.
          </p>
        </article>

        <article className="card casa-ranking">
          <header className="casa-ranking-cab">
            <h2>Quién gasta más</h2>
            <button type="button" className="casa-btn casa-btn-suave casa-btn-chico" onClick={usarMisDispositivos}>
              Usar mis dispositivos
            </button>
          </header>
          {ranking.length === 0 ? (
            <p className="muted">Tu casa está vacía. Agrega un aparato para empezar.</p>
          ) : (
            <ul className="casa-ranking-lista">
              {ranking.map(({ aparato, kwh, costo }) => (
                <li key={aparato.uid}>
                  <button
                    type="button"
                    className={`casa-ranking-fila${aparato.uid === seleccionadoUid ? ' sel' : ''}`}
                    onClick={() => setSeleccionadoUid(aparato.uid)}
                  >
                    <span className="casa-ranking-nombre">
                      {aparato.nombre}
                      <small>
                        {aparato.watts} W · {aparato.horas.toLocaleString('es-MX')} h/día
                      </small>
                    </span>
                    <span className="casa-ranking-barra">
                      <span style={{ width: maxKwh > 0 ? `${(kwh / maxKwh) * 100}%` : '0%' }} />
                    </span>
                    <span className="casa-ranking-valor">
                      {formatoPesos(costo)}
                      <small>{formatoKwh(kwh)} kWh</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="casa-nota">
            Esta casa es un simulador: lo que agregues aquí no cambia tus dispositivos reales ni tu historial. El costo de
            cada aparato es lo que baja tu recibo si lo quitas.
          </p>
        </article>
      </section>
    </AppShell>
  );
}
