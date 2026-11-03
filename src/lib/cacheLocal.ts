// Copia local de los últimos datos para que las pantallas se vean al instante
// y luego se actualicen por detrás. Es solo una comodidad: si el navegador no
// deja guardar, todo sigue funcionando como siempre (esperando al servidor).
// Se borra completa al cerrar sesión.

const PREFIJO = 'greontrack-cache-';

export function leerCache<T>(clave: string): T | null {
  try {
    const crudo = localStorage.getItem(PREFIJO + clave);
    return crudo ? (JSON.parse(crudo) as T) : null;
  } catch {
    return null;
  }
}

export function guardarCache(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch {
    // sin espacio o sin permiso: no pasa nada
  }
}

export function borrarCache(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIJO))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // nada que borrar
  }
}
