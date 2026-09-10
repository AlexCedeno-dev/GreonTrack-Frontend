// Un dato opcional adicional que sí importa según el tipo de dispositivo —
// no tendría sentido pedir "tamaño de pantalla" a un refrigerador, ni
// "capacidad en litros" a una laptop. Se guarda como { etiqueta, valor } en
// info_registro.atributoCategoria (ver lib/deviceInfo.ts) para que quede
// autodescriptivo sin necesitar una columna nueva por cada tipo.
export interface CampoOpcionalCategoria {
  campo: string;
  etiqueta: string;
  tipo: 'texto' | 'numero' | 'select';
  placeholder?: string;
  unidad?: string;
  opciones?: string[];
}

const CAMPOS_POR_TIPO: Record<string, CampoOpcionalCategoria> = {
  Laptop: { campo: 'pulgadas', etiqueta: 'Tamaño de pantalla', tipo: 'numero', placeholder: 'Ej. 15.6', unidad: 'pulgadas' },
  'Computadora de escritorio': {
    campo: 'fuentePoder',
    etiqueta: 'Fuente de poder',
    tipo: 'numero',
    placeholder: 'Ej. 500',
    unidad: 'W',
  },
  'Televisión (LED)': { campo: 'pulgadas', etiqueta: 'Tamaño de pantalla', tipo: 'numero', placeholder: 'Ej. 43', unidad: 'pulgadas' },
  Refrigerador: { campo: 'capacidad', etiqueta: 'Capacidad', tipo: 'numero', placeholder: 'Ej. 14', unidad: 'pies³' },
  Congelador: { campo: 'capacidad', etiqueta: 'Capacidad', tipo: 'numero', placeholder: 'Ej. 7', unidad: 'pies³' },
  'Aire acondicionado': { campo: 'btu', etiqueta: 'Capacidad', tipo: 'numero', placeholder: 'Ej. 12000', unidad: 'BTU' },
  'Celular (carga)': { campo: 'bateria', etiqueta: 'Batería', tipo: 'numero', placeholder: 'Ej. 4500', unidad: 'mAh' },
  'Consola de videojuegos': { campo: 'modelo', etiqueta: 'Modelo o generación', tipo: 'texto', placeholder: 'Ej. PS5 Slim' },
  Lavadora: { campo: 'capacidad', etiqueta: 'Capacidad', tipo: 'numero', placeholder: 'Ej. 18', unidad: 'kg' },
  'Secadora de ropa': { campo: 'capacidad', etiqueta: 'Capacidad', tipo: 'numero', placeholder: 'Ej. 18', unidad: 'kg' },
  Microondas: { campo: 'capacidad', etiqueta: 'Capacidad', tipo: 'numero', placeholder: 'Ej. 20', unidad: 'litros' },
  'Foco / iluminación': {
    campo: 'tipoFoco',
    etiqueta: 'Tipo de foco',
    tipo: 'select',
    opciones: ['LED', 'Incandescente', 'Halógeno', 'Fluorescente compacto'],
  },
  'Dispositivo IoT': { campo: 'modelo', etiqueta: 'Modelo', tipo: 'texto', placeholder: 'Ej. Echo Dot' },
  'Router / Modem': { campo: 'modelo', etiqueta: 'Modelo', tipo: 'texto', placeholder: 'Ej. Infinitum' },
  Impresora: {
    campo: 'tipoImpresora',
    etiqueta: 'Tipo',
    tipo: 'select',
    opciones: ['Láser', 'Inyección de tinta', 'Térmica'],
  },
  'Calentador de agua': { campo: 'capacidad', etiqueta: 'Capacidad', tipo: 'numero', placeholder: 'Ej. 40', unidad: 'litros' },
  Ventilador: { campo: 'tamano', etiqueta: 'Tamaño', tipo: 'select', opciones: ['De mesa', 'De piso', 'De techo', 'Torre'] },
  'Bomba de agua': { campo: 'hp', etiqueta: 'Potencia', tipo: 'numero', placeholder: 'Ej. 1', unidad: 'HP' },
  Cafetera: { campo: 'tipoCafetera', etiqueta: 'Tipo', tipo: 'select', opciones: ['De filtro', 'Espresso', 'Cápsulas'] },
  Aspiradora: {
    campo: 'tipoAspiradora',
    etiqueta: 'Tipo',
    tipo: 'select',
    opciones: ['De mano', 'Vertical', 'Robot', 'Industrial'],
  },
};

export function campoOpcionalDeTipo(tipo: string): CampoOpcionalCategoria | null {
  return CAMPOS_POR_TIPO[tipo] ?? null;
}

// La IP del dispositivo solo tiene sentido para lo que de verdad se
// conecta a la red de casa (y es lo que el GreonTrack Sniffer sabe
// detectar) — un refrigerador o una cafetera común no tienen una IP que
// capturar.
const TIPOS_CON_IP = new Set([
  'Laptop',
  'Computadora de escritorio',
  'Televisión (LED)',
  'Celular (carga)',
  'Consola de videojuegos',
  'Dispositivo IoT',
  'Impresora',
  'Router / Modem',
]);

export function tipoTieneIp(tipo: string): boolean {
  return TIPOS_CON_IP.has(tipo);
}
