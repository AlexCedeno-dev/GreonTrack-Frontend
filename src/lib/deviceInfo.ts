export interface InfoRegistroDispositivo {
  origen: 'manual' | 'sniffer';
  fecha: string; // ISO
  // Identificador de este navegador/equipo (se guarda en localStorage) para
  // saber si ya se agregó el equipo desde el que se entra.
  equipoId?: string;
  // Alta manual: datos del equipo/navegador que hizo el registro.
  ipPublicaRegistro?: string | null;
  sistemaOperativo?: string;
  navegador?: string;
  nucleosCpu?: number | null;
  memoriaAproxGB?: number | null;
  resolucionPantalla?: string;
  // Del dispositivo en sí: lo llena el sniffer automáticamente, o el
  // usuario a mano si quiere (ambos casos opcionales).
  ipDispositivo?: string | null;
  mac?: string | null;
  vendor?: string | null;
  // Año de compra/fabricación, si el usuario lo captura a mano — se usa
  // solo para afinar la sugerencia de consumo en watts (ver
  // lib/deviceEnergyAdjustment.ts), no cambia el consumo ya guardado.
  anioDispositivo?: number | null;
  // Dato extra que varía según el tipo de dispositivo (tamaño de pantalla
  // en una TV, capacidad en un refrigerador, etc.) — ver
  // lib/deviceCategoryFields.ts. Se guarda con su propia etiqueta para que
  // se entienda solo, sin tener que saber a qué tipo pertenecía.
  atributoCategoria?: { etiqueta: string; valor: string } | null;
}

export function detectarSistemaOperativo(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  if (userAgent.includes('Linux')) return 'Linux';
  return 'Desconocido';
}

export function detectarNavegador(userAgent: string): string {
  if (userAgent.includes('Edg/')) return 'Edge';
  if (userAgent.includes('Chrome/')) return 'Chrome';
  if (userAgent.includes('Firefox/')) return 'Firefox';
  if (userAgent.includes('Safari/')) return 'Safari';
  return 'Desconocido';
}

async function obtenerIpPublica(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as { ip?: string };
    return data.ip ?? null;
  } catch {
    // Sin red o el servicio no respondió a tiempo: no bloquea el registro del dispositivo.
    return null;
  }
}

// Qué tipo de equipo es el que está usando la página, según lo que dice el navegador.
export function detectarTipoEquipoActual(userAgent = navigator.userAgent): string {
  const esIpad = userAgent.includes('iPad') || (userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1);
  if (esIpad) return 'Tablet (carga)';
  if (userAgent.includes('iPhone')) return 'Celular (carga)';
  if (userAgent.includes('Android')) return userAgent.includes('Mobile') ? 'Celular (carga)' : 'Tablet (carga)';
  return 'Laptop';
}

interface DatosManualesOpcionales {
  ipDispositivo?: string;
  vendor?: string;
  anioDispositivo?: number;
  atributoCategoria?: { etiqueta: string; valor: string };
}

export async function capturarInfoDispositivo(
  opcionales: DatosManualesOpcionales & { equipoId?: string } = {}
): Promise<InfoRegistroDispositivo> {
  const userAgent = navigator.userAgent;
  // deviceMemory es una extensión no estándar (solo Chrome/Edge); en Safari/Firefox queda null.
  const memoriaAproxGB = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null;

  return {
    origen: 'manual',
    fecha: new Date().toISOString(),
    equipoId: opcionales.equipoId,
    ipPublicaRegistro: await obtenerIpPublica(),
    sistemaOperativo: detectarSistemaOperativo(userAgent),
    navegador: detectarNavegador(userAgent),
    nucleosCpu: navigator.hardwareConcurrency ?? null,
    memoriaAproxGB,
    resolucionPantalla: `${screen.width} x ${screen.height}`,
    ipDispositivo: opcionales.ipDispositivo?.trim() || null,
    vendor: opcionales.vendor?.trim() || null,
    anioDispositivo: opcionales.anioDispositivo ?? null,
    atributoCategoria: opcionales.atributoCategoria ?? null,
  };
}
