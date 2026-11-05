// Dispositivos que se acaban de agregar: Dispositivos los marca como "recién
// instalados" un rato. Se guarda en sessionStorage para que sobreviva al cambio
// de pantalla sin ensuciar la base de datos.

const CLAVE = 'greontrack-recien-instalados';
const VIGENCIA_MS = 60_000;

export function marcarRecienInstalados(ids: string[]) {
  if (ids.length === 0) return;
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify({ ids, hasta: Date.now() + VIGENCIA_MS }));
  } catch {
    // sin sessionStorage solo se pierde el efecto
  }
}

export function leerRecienInstalados(): string[] {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    if (!crudo) return [];
    const dato = JSON.parse(crudo) as { ids?: string[]; hasta?: number };
    if (!Array.isArray(dato.ids) || !dato.hasta || dato.hasta < Date.now()) return [];
    return dato.ids;
  } catch {
    return [];
  }
}

export function limpiarRecienInstalados() {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    // nada
  }
}
