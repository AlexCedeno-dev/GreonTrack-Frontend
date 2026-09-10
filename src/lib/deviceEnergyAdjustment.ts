// Ajuste de la sugerencia de consumo (watts) según la antigüedad y, de forma
// más leve, la marca del dispositivo. Es una estimación de apoyo para el
// formulario de alta — el valor final en watts siempre lo puede corregir el
// usuario a mano (idealmente con el dato de la etiqueta de eficiencia
// energética o el manual del equipo).

// Entre más viejo el equipo, menos eficiente suele ser: motores/compresores,
// fuentes de poder y baterías pierden eficiencia con el uso, y los modelos
// antiguos rara vez traen los modos de bajo consumo de los equipos actuales.
export function factorPorAntiguedad(anio: number | null | undefined): number {
  if (!anio || anio <= 0) return 1;
  const antiguedad = new Date().getFullYear() - anio;
  if (antiguedad <= 2) return 1;
  if (antiguedad <= 5) return 1.08;
  if (antiguedad <= 8) return 1.15;
  return 1.25;
}

// Marcas que de forma consistente certifican gran parte de su catálogo bajo
// estándares de eficiencia energética (p. ej. ENERGY STAR/EPEAT), lo que en
// promedio se traduce en un consumo ligeramente menor al de la sugerencia
// genérica por tipo de dispositivo.
const MARCAS_ALTA_EFICIENCIA = ['apple', 'samsung', 'lg', 'sony', 'dell', 'hp', 'lenovo', 'asus'];

// Marcas comunes en hogares mexicanos, agrupadas por tipo de dispositivo —
// no tendría sentido ofrecer "Whirlpool" al dar de alta un celular, ni
// "Xiaomi" al dar de alta un refrigerador. "Otra" siempre está disponible y
// habilita un campo de texto libre.
const OTRA = 'Otra';

export const MARCAS_POR_TIPO: Record<string, string[]> = {
  Laptop: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', OTRA],
  'Computadora de escritorio': ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', OTRA],
  'Televisión (LED)': ['Samsung', 'LG', 'Sony', 'Hisense', 'TCL', OTRA],
  Refrigerador: ['Whirlpool', 'Mabe', 'LG', 'Samsung', 'GE', OTRA],
  'Aire acondicionado': ['Mirage', 'LG', 'Samsung', 'Carrier', 'York', OTRA],
  'Celular (carga)': ['Apple', 'Samsung', 'Xiaomi', 'Motorola', 'Huawei', OTRA],
  'Consola de videojuegos': ['Sony', 'Microsoft', 'Nintendo', OTRA],
  Lavadora: ['Whirlpool', 'Mabe', 'LG', 'Samsung', 'Easy', OTRA],
  Microondas: ['LG', 'Samsung', 'Panasonic', 'Mabe', 'Whirlpool', OTRA],
  'Foco / iluminación': ['Philips', 'GE', 'Sylvania', OTRA],
  'Dispositivo IoT': ['Xiaomi', 'TP-Link', 'Amazon', 'Google', OTRA],
  Impresora: ['HP', 'Epson', 'Canon', 'Brother', OTRA],
  Congelador: ['Whirlpool', 'Mabe', 'LG', 'Samsung', 'GE', OTRA],
  'Secadora de ropa': ['Whirlpool', 'Mabe', 'LG', 'Samsung', 'Easy', OTRA],
  'Calentador de agua': ['Calorex', 'Rheem', 'Bosch', OTRA],
  Ventilador: ['Lasko', 'Honeywell', 'KDK', OTRA],
  'Bomba de agua': ['Pedrollo', 'Truper', 'Evans', OTRA],
  'Router / Modem': ['TP-Link', 'Xiaomi', 'Huawei', OTRA],
  Cafetera: ['Oster', 'Mr. Coffee', 'Nespresso', OTRA],
  Aspiradora: ['Hoover', 'Black+Decker', 'iRobot', OTRA],
  Otro: [OTRA],
};

export function marcasParaTipo(tipo: string): string[] {
  return MARCAS_POR_TIPO[tipo] ?? [OTRA];
}

export function factorPorMarca(marca: string | null | undefined): number {
  const normalizada = marca?.trim().toLowerCase();
  if (!normalizada) return 1;
  return MARCAS_ALTA_EFICIENCIA.some((m) => normalizada.includes(m)) ? 0.95 : 1;
}

// Aplica ambos factores sobre el watts base sugerido por tipo de
// dispositivo. Redondeado a watts enteros, que es la unidad del formulario.
export function ajustarConsumoSugerido(
  wattsBase: number,
  marca?: string | null,
  anio?: number | null
): number {
  const factor = factorPorAntiguedad(anio) * factorPorMarca(marca);
  return Math.round(wattsBase * factor);
}
