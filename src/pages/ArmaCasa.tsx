import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { EntregaOverlay } from '../components/EntregaOverlay';
import { DibujoTipo } from '../components/casa/Sprites';
import { ArrowLeftIcon, CasaIcon, CheckIcon, MinusIcon, PlusIcon } from '../components/icons';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SECCIONES } from '../lib/deviceCategories';
import { PAQUETES } from '../lib/paquetesCasa';
import { marcarRecienInstalados } from '../lib/recienInstalados';
import { supabase } from '../lib/supabase';
import { TIPOS_DISPOSITIVO } from '../types/database';

const wattsDe = (tipo: string) => TIPOS_DISPOSITIVO.find((t) => t.tipo === tipo)?.wattsPromedio ?? 100;

export function ArmaCasa() {
  const { user } = useAuth();
  const { datos, refrescar } = useAppData();
  const { mostrarExito, mostrarError } = useToast();
  const navigate = useNavigate();
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [paqueteActivo, setPaqueteActivo] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [entregando, setEntregando] = useState<string[] | null>(null);

  const yaTiene = useMemo(() => {
    const conteo: Record<string, number> = {};
    (datos?.dispositivos ?? []).forEach((d) => {
      conteo[d.tipo] = (conteo[d.tipo] ?? 0) + 1;
    });
    return conteo;
  }, [datos]);

  const total = Object.values(cantidades).reduce((s, n) => s + n, 0);
  const watts = Object.entries(cantidades).reduce((s, [tipo, n]) => s + wattsDe(tipo) * n, 0);

  const cambiar = (tipo: string, delta: number) => {
    setPaqueteActivo(null);
    setCantidades((c) => {
      const nuevo = Math.min(20, Math.max(0, (c[tipo] ?? 0) + delta));
      const { [tipo]: _quitado, ...resto } = c;
      return nuevo > 0 ? { ...resto, [tipo]: nuevo } : resto;
    });
  };

  const elegirPaquete = (id: string) => {
    if (paqueteActivo === id) {
      setPaqueteActivo(null);
      setCantidades({});
      return;
    }
    setPaqueteActivo(id);
    setCantidades({ ...(PAQUETES.find((p) => p.id === id)?.items ?? {}) });
  };

  const agregar = async () => {
    if (!user || total === 0) return;
    setGuardando(true);
    const fecha = new Date().toISOString();
    const filas = Object.entries(cantidades).flatMap(([tipo, n]) =>
      Array.from({ length: n }, (_, i) => {
        // Si hay varios del mismo tipo (o ya tenía uno), se numeran: "Foco 2", "Foco 3"…
        const numero = (yaTiene[tipo] ?? 0) + i + 1;
        const nombreBase = tipo.replace(/ \(.*\)$/, '');
        return {
          usuario_id: user.id,
          nombre: n > 1 || yaTiene[tipo] ? `${nombreBase} ${numero}` : nombreBase,
          tipo,
          consumo_watts_promedio: wattsDe(tipo),
          origen: 'manual',
          info_registro: { origen: 'manual', fecha },
        };
      })
    );
    const { data: creados, error } = await supabase.from('dispositivos').insert(filas).select('id');
    setGuardando(false);
    if (error) {
      mostrarError(error.message);
      return;
    }
    refrescar();
    marcarRecienInstalados((creados ?? []).map((d) => d.id as string));
    setEntregando(filas.map((f) => f.tipo));
  };

  const terminarEntrega = () => {
    const cantidad = entregando?.length ?? 0;
    setEntregando(null);
    mostrarExito(`Agregué ${cantidad} ${cantidad === 1 ? 'dispositivo' : 'dispositivos'} a tu casa.`);
    navigate('/dispositivos');
  };

  return (
    <AppShell title="Arma tu casa" subtitle="Toca lo que tienes y agrégalo todo de una vez.">
      {entregando && <EntregaOverlay tipos={entregando} onTermina={terminarEntrega} />}
      <div className="devices-toolbar">
        <button type="button" className="icon-btn" onClick={() => navigate('/dispositivos')} aria-label="Volver" title="Volver">
          <ArrowLeftIcon />
        </button>
      </div>

      <section className="arma-bloque">
        <div className="casa-sec-cab">
          <span className="casa-sec-icono">
            <CasaIcon />
          </span>
          <div className="casa-sec-texto">
            <span className="casa-sec-etiqueta">Empieza con un paquete</span>
            <h2 className="casa-sec-titulo">
              ¿Cómo es <em>tu casa?</em>
            </h2>
          </div>
        </div>
        <div className="arma-paquetes">
          {PAQUETES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`arma-paquete${paqueteActivo === p.id ? ' activo' : ''}`}
              onClick={() => elegirPaquete(p.id)}
              aria-pressed={paqueteActivo === p.id}
            >
              <strong>{p.nombre}</strong>
              <span>{p.detalle}</span>
              <small>{Object.values(p.items).reduce((s, n) => s + n, 0)} aparatos</small>
              {paqueteActivo === p.id && (
                <i className="arma-paquete-palomita">
                  <CheckIcon />
                </i>
              )}
            </button>
          ))}
        </div>
        <p className="muted">Después ajusta lo que quieras: suma o quita aparatos abajo antes de agregarlos.</p>
      </section>

      {SECCIONES.map((seccion) => {
        const tipos = TIPOS_DISPOSITIVO.filter((t) => seccion.tipos.includes(t.tipo));
        if (tipos.length === 0) return null;
        const IconoSeccion = seccion.icono;
        return (
          <section key={seccion.id} className="arma-seccion">
            <h3 className="type-picker-grupo-titulo">
              <IconoSeccion /> {seccion.nombre}
            </h3>
            <div className="arma-grid">
              {tipos.map((t) => {
                const n = cantidades[t.tipo] ?? 0;
                const antes = yaTiene[t.tipo] ?? 0;
                return (
                  <div key={t.tipo} className={`arma-tarjeta${n > 0 ? ' elegido' : ''}`}>
                    <button
                      type="button"
                      className="arma-tarjeta-cuerpo"
                      onClick={() => cambiar(t.tipo, 1)}
                      aria-label={`Agregar ${t.tipo}`}
                    >
                      <span className="type-picker-dibujo">
                        <DibujoTipo tipo={t.tipo} />
                      </span>
                      <span className="arma-nombre">{t.tipo}</span>
                      <span className="arma-dato">
                        ~{t.wattsPromedio} W{antes > 0 ? ` · ya tienes ${antes}` : ''}
                      </span>
                    </button>
                    {n > 0 && (
                      <div className="arma-contador">
                        <button type="button" onClick={() => cambiar(t.tipo, -1)} aria-label={`Quitar un ${t.tipo}`}>
                          <MinusIcon />
                        </button>
                        <output key={n}>{n}</output>
                        <button type="button" onClick={() => cambiar(t.tipo, 1)} aria-label={`Sumar un ${t.tipo}`}>
                          <PlusIcon />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className={`arma-barra${total > 0 ? ' visible' : ''}`} role="region" aria-label="Resumen">
        <div>
          <strong>
            {total} {total === 1 ? 'aparato' : 'aparatos'}
          </strong>
          <span>~{watts.toLocaleString('es-MX')} W en total</span>
        </div>
        <button type="button" className="btn-add btn-add-outline" onClick={() => { setCantidades({}); setPaqueteActivo(null); }}>
          Limpiar
        </button>
        <button type="button" className="btn-add" onClick={agregar} disabled={guardando || total === 0}>
          <CheckIcon /> {guardando ? 'Agregando…' : 'Agregar a mis dispositivos'}
        </button>
      </div>
    </AppShell>
  );
}
