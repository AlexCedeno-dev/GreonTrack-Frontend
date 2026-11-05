import { supabase } from './supabase';
import type { DispositivoSugerido, SnifferEstado } from '../types/database';
import { tipoRealDeDetectado } from './deviceCategories';

// El sniffer sondea cada ~30s (más lo que tarda el escaneo); si pasan más de
// dos minutos sin latido se muestra como desactivado, para no parpadear entre
// estados pero tampoco tardar en avisar cuando se detuvo.
export const TOLERANCIA_SEGUNDOS = 90;

export async function fetchEstadoSniffer(userId: string): Promise<SnifferEstado | null> {
  const { data, error } = await supabase
    .from('sniffer_estado')
    .select('*')
    .eq('usuario_id', userId)
    .maybeSingle();

  if (error) return null;
  return data as SnifferEstado | null;
}

export function segundosDesdeSondeo(estado: SnifferEstado | null): number | null {
  if (!estado) return null;
  return Math.max(0, Math.round((Date.now() - new Date(estado.ultimo_sondeo).getTime()) / 1000));
}

export function snifferActivo(estado: SnifferEstado | null): boolean {
  if (!estado) return false;
  const segundosDesde = (Date.now() - new Date(estado.ultimo_sondeo).getTime()) / 1000;
  return segundosDesde < TOLERANCIA_SEGUNDOS;
}

export async function fetchSugerenciasPendientes(userId: string): Promise<DispositivoSugerido[]> {
  const { data, error } = await supabase
    .from('dispositivos_sugeridos')
    .select('*')
    .eq('usuario_id', userId)
    .eq('estado', 'pendiente')
    .order('fecha_deteccion', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as DispositivoSugerido[];
}

export async function confirmarSugerencia(sugerencia: DispositivoSugerido, userId: string): Promise<void> {
  const { error: insertError } = await supabase.from('dispositivos').insert({
    usuario_id: userId,
    nombre: sugerencia.nombre_sugerido,
    tipo: tipoRealDeDetectado(sugerencia.tipo_detectado),
    consumo_watts_promedio: sugerencia.watts_estimados,
    origen: 'manual',
    info_registro: {
      origen: 'sniffer',
      fecha: sugerencia.fecha_deteccion,
      ipDispositivo: sugerencia.ip,
      mac: sugerencia.mac,
      vendor: sugerencia.vendor,
    },
  });

  if (insertError) throw new Error(insertError.message);

  const { error: updateError } = await supabase
    .from('dispositivos_sugeridos')
    .update({ estado: 'agregado' })
    .eq('id', sugerencia.id);

  if (updateError) throw new Error(updateError.message);
}

export async function descartarSugerencia(id: string): Promise<void> {
  const { error } = await supabase.from('dispositivos_sugeridos').update({ estado: 'descartado' }).eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Control del monitor de red desde la web ─────────────────────────────────

const AVISO_MIGRACION =
  'Falta un paso en la base de datos para controlar el monitor desde aquí (migración del sniffer).';

async function escribirControl(userId: string, parche: Record<string, unknown>): Promise<void> {
  const { data, error } = await supabase
    .from('sniffer_estado')
    .update(parche)
    .eq('usuario_id', userId)
    .select('usuario_id');
  if (error) throw new Error(/column|schema cache/i.test(error.message) ? AVISO_MIGRACION : error.message);
  if (data && data.length > 0) return;

  // Todavía no hay fila (el sniffer nunca se ha conectado): se crea marcada como
  // "sin latido" para que no parezca encendido.
  const { error: insertError } = await supabase
    .from('sniffer_estado')
    .insert({ usuario_id: userId, ultimo_sondeo: '1970-01-01T00:00:00Z', ...parche });
  if (insertError) {
    throw new Error(/column|schema cache/i.test(insertError.message) ? AVISO_MIGRACION : insertError.message);
  }
}

export function ponerMonitorEncendido(userId: string, encendido: boolean): Promise<void> {
  return escribirControl(userId, { encendido });
}

export function pedirEscaneoAhora(userId: string): Promise<void> {
  return escribirControl(userId, { escanear_ahora: new Date().toISOString() });
}
