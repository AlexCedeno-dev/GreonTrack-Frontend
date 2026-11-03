import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckIcon } from './icons';
import { DibujoTipo } from './casa/Sprites';
import { TIPOS_DISPOSITIVO } from '../types/database';
import {
  capturarInfoDispositivo,
  detectarNavegador,
  detectarSistemaOperativo,
  detectarTipoEquipoActual,
} from '../lib/deviceInfo';

const CLAVE_ID = 'greontrack-equipo-id';
const CLAVE_OMITIDO = 'greontrack-equipo-omitido';

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: string) {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    /* sin almacenamiento: la tarjeta simplemente puede volver a salir */
  }
}

function idDeEsteEquipo(): string {
  let id = leer(CLAVE_ID);
  if (!id) {
    id = crypto.randomUUID();
    escribir(CLAVE_ID, id);
  }
  return id;
}

// Reconoce solo el equipo desde el que se entra a GreonTrack (lo mismo que
// ve cualquier sitio: sistema, navegador, procesador) y lo ofrece con un clic.
// Un navegador no puede ver el resto de la red; eso lo hace el Sniffer.
export function EquipoActual({ userId, onAgregado }: { userId: string; onAgregado?: () => void }) {
  const [visible, setVisible] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const so = detectarSistemaOperativo(navigator.userAgent);
  const navegador = detectarNavegador(navigator.userAgent);
  const tipo = detectarTipoEquipoActual();
  const watts = TIPOS_DISPOSITIVO.find((t) => t.tipo === tipo)?.wattsPromedio ?? 65;
  const nombre = tipo === 'Laptop' ? `Mi laptop (${so})` : tipo === 'Celular (carga)' ? `Mi celular (${so})` : `Mi tablet (${so})`;

  useEffect(() => {
    if (leer(CLAVE_OMITIDO) === userId) return;
    let cancelado = false;
    (async () => {
      const { data } = await supabase
        .from('dispositivos')
        .select('id')
        .eq('usuario_id', userId)
        .contains('info_registro', { equipoId: idDeEsteEquipo() })
        .limit(1);
      if (!cancelado) setVisible(!data || data.length === 0);
    })();
    return () => {
      cancelado = true;
    };
  }, [userId]);

  if (!visible) return null;

  const agregar = async () => {
    setAgregando(true);
    setError(null);
    const info = await capturarInfoDispositivo({ equipoId: idDeEsteEquipo() });
    const { error: err } = await supabase.from('dispositivos').insert({
      usuario_id: userId,
      nombre,
      tipo,
      consumo_watts_promedio: watts,
      origen: 'manual',
      info_registro: info,
    });
    setAgregando(false);
    if (err) {
      setError(err.message);
      return;
    }
    setVisible(false);
    onAgregado?.();
  };

  const omitir = () => {
    escribir(CLAVE_OMITIDO, userId);
    setVisible(false);
  };

  return (
    <div className="card equipo-actual">
      <span className="equipo-actual-dibujo">
        <DibujoTipo tipo={tipo} />
      </span>
      <div className="equipo-actual-texto">
        <p className="equipo-actual-titulo">Detectamos el equipo que estás usando</p>
        <p className="muted">
          {so} · {navegador} · {navigator.hardwareConcurrency ?? '?'} núcleos · ~{watts} W de referencia
        </p>
        {error && <p className="device-form-error-text">{error}</p>}
      </div>
      <div className="equipo-actual-acciones">
        <button className="device-action-btn" onClick={agregar} disabled={agregando}>
          <CheckIcon /> {agregando ? 'Agregando…' : 'Agregar este equipo'}
        </button>
        <button className="device-action-btn device-action-btn-ghost" onClick={omitir}>
          Ahora no
        </button>
      </div>
    </div>
  );
}
