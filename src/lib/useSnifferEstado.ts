import { useCallback, useEffect, useState } from 'react';
import type { SnifferEstado } from '../types/database';
import { fetchEstadoSniffer, snifferActivo } from './deviceSuggestions';

const CADA_MS = 5_000;

// Estado en vivo del Sniffer (el programa que escanea la red): se vuelve a
// preguntar cada pocos segundos y el reloj "hace X s" avanza solo.
export function useSnifferEstado(userId: string | undefined, cadaMs: number = CADA_MS) {
  const [estado, setEstado] = useState<SnifferEstado | null>(null);
  const [cargado, setCargado] = useState(false);
  const [, setReloj] = useState(0);

  const recargar = useCallback(async () => {
    if (!userId) return;
    setEstado(await fetchEstadoSniffer(userId));
    setCargado(true);
  }, [userId]);

  useEffect(() => {
    recargar();
    const consulta = window.setInterval(recargar, cadaMs);
    const reloj = window.setInterval(() => setReloj((n) => n + 1), 1000);
    return () => {
      window.clearInterval(consulta);
      window.clearInterval(reloj);
    };
  }, [recargar, cadaMs]);

  return { estado, activo: snifferActivo(estado), cargado, recargar };
}
