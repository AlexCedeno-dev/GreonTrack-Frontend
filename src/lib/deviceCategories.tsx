import type { ComponentType } from 'react';
import type { TipoDetectado } from '../types/database';
import {
  LaptopIcon,
  MonitorIcon,
  PhoneIcon,
  TvIcon,
  GameConsoleIcon,
  FridgeIcon,
  AcIcon,
  WashingMachineIcon,
  MicrowaveIcon,
  LightbulbIcon,
  IotIcon,
  PrinterIcon,
  PlugIcon,
  FanIcon,
  WaterHeaterIcon,
  CoffeeMakerIcon,
  VacuumIcon,
  CarIcon,
  IronIcon,
  HairDryerIcon,
  KettleIcon,
  BlenderIcon,
  ToasterIcon,
  OvenIcon,
  DishwasherIcon,
  StoveIcon,
  PotIcon,
  HeaterIcon,
  DehumidifierIcon,
  SpeakerIcon,
  ProjectorIcon,
  TabletIcon,
  BikeIcon,
  PumpIcon,
  ChefIcon,
  WaveIcon,
  ScissorsIcon,
  WifiIcon,
} from '../components/icons';

type Icono = ComponentType<{ className?: string }>;

// Las secciones agrupan los aparatos por lo que hacen en la casa. Se usan igual
// en Dispositivos, en el formulario y en el menú de Mi casa.
export interface Seccion {
  id: string;
  nombre: string;
  icono: Icono;
  tipos: string[];
}

export const SECCIONES: Seccion[] = [
  {
    id: 'cocina',
    nombre: 'Cocina',
    icono: ChefIcon,
    tipos: [
      'Refrigerador',
      'Congelador',
      'Microondas',
      'Horno eléctrico',
      'Estufa eléctrica',
      'Tostador',
      'Licuadora',
      'Hervidor eléctrico',
      'Olla arrocera',
      'Cafetera',
      'Lavavajillas',
    ],
  },
  {
    id: 'lavanderia',
    nombre: 'Lavandería y limpieza',
    icono: WashingMachineIcon,
    tipos: ['Lavadora', 'Secadora de ropa', 'Plancha', 'Aspiradora'],
  },
  {
    id: 'clima',
    nombre: 'Clima y agua',
    icono: WaveIcon,
    tipos: [
      'Aire acondicionado',
      'Ventilador',
      'Ventilador de techo',
      'Calefactor',
      'Deshumidificador',
      'Calentador de agua',
      'Bomba de agua',
    ],
  },
  {
    id: 'entretenimiento',
    nombre: 'Entretenimiento',
    icono: TvIcon,
    tipos: ['Televisión (LED)', 'Consola de videojuegos', 'Bocina o estéreo', 'Proyector'],
  },
  {
    id: 'computo',
    nombre: 'Cómputo y oficina',
    icono: LaptopIcon,
    tipos: ['Laptop', 'Computadora de escritorio', 'Impresora', 'Router'],
  },
  {
    id: 'luz',
    nombre: 'Luz y hogar inteligente',
    icono: LightbulbIcon,
    tipos: ['Iluminación', 'Dispositivo IoT'],
  },
  {
    id: 'cuidado',
    nombre: 'Cuidado personal',
    icono: ScissorsIcon,
    tipos: ['Secadora de pelo'],
  },
  {
    id: 'moviles',
    nombre: 'Móviles',
    icono: PhoneIcon,
    tipos: ['Celular (carga)', 'Tablet (carga)'],
  },
  {
    id: 'movilidad',
    nombre: 'Movilidad eléctrica',
    icono: CarIcon,
    tipos: ['Coche eléctrico', 'Bicicleta eléctrica'],
  },
  {
    id: 'otros',
    nombre: 'Otros',
    icono: PlugIcon,
    tipos: ['Otro'],
  },
];

export const CATEGORIAS = ['Todos', ...SECCIONES.map((s) => s.nombre)] as const;
export type Categoria = (typeof CATEGORIAS)[number];

const SECCION_POR_TIPO: Record<string, Seccion> = Object.fromEntries(
  SECCIONES.flatMap((s) => s.tipos.map((t) => [t, s] as const))
);

export function seccionDeTipo(tipo: string): Seccion {
  return SECCION_POR_TIPO[tipo] ?? SECCIONES[SECCIONES.length - 1];
}

export function categoriaDe(tipo: string): Categoria {
  return seccionDeTipo(tipo).nombre as Categoria;
}

export function iconoDeCategoria(cat: Categoria): Icono {
  return SECCIONES.find((s) => s.nombre === cat)?.icono ?? PlugIcon;
}

const ICONO_POR_TIPO: Record<string, Icono> = {
  Laptop: LaptopIcon,
  'Computadora de escritorio': MonitorIcon,
  'Celular (carga)': PhoneIcon,
  'Tablet (carga)': TabletIcon,
  'Televisión (LED)': TvIcon,
  'Consola de videojuegos': GameConsoleIcon,
  'Bocina o estéreo': SpeakerIcon,
  Proyector: ProjectorIcon,
  Refrigerador: FridgeIcon,
  Congelador: FridgeIcon,
  Microondas: MicrowaveIcon,
  'Horno eléctrico': OvenIcon,
  'Estufa eléctrica': StoveIcon,
  Tostador: ToasterIcon,
  Licuadora: BlenderIcon,
  'Hervidor eléctrico': KettleIcon,
  'Olla arrocera': PotIcon,
  Cafetera: CoffeeMakerIcon,
  Lavavajillas: DishwasherIcon,
  Lavadora: WashingMachineIcon,
  'Secadora de ropa': WashingMachineIcon,
  Plancha: IronIcon,
  Aspiradora: VacuumIcon,
  'Aire acondicionado': AcIcon,
  Ventilador: FanIcon,
  'Ventilador de techo': FanIcon,
  Calefactor: HeaterIcon,
  Deshumidificador: DehumidifierIcon,
  'Calentador de agua': WaterHeaterIcon,
  'Bomba de agua': PumpIcon,
  Impresora: PrinterIcon,
  Router: WifiIcon,
  'Iluminación': LightbulbIcon,
  'Dispositivo IoT': IotIcon,
  'Secadora de pelo': HairDryerIcon,
  'Coche eléctrico': CarIcon,
  'Bicicleta eléctrica': BikeIcon,
};

export function iconoDeTipo(tipo: string): ComponentType<{ className?: string }> {
  return ICONO_POR_TIPO[tipo] ?? PlugIcon;
}

// ── Sugerencias de red (tipo_detectado del sniffer) ─────────────────────────

const ICONO_POR_TIPO_DETECTADO: Record<TipoDetectado, ComponentType<{ className?: string }>> = {
  phone: PhoneIcon,
  laptop: LaptopIcon,
  desktop: MonitorIcon,
  tv: TvIcon,
  gaming: GameConsoleIcon,
  iot: IotIcon,
  printer: PrinterIcon,
  unknown: PlugIcon,
};

export function iconoDeTipoDetectado(tipo: TipoDetectado): ComponentType<{ className?: string }> {
  return ICONO_POR_TIPO_DETECTADO[tipo] ?? PlugIcon;
}

// Tipo real de GreonTrack (uno de TIPOS_DISPOSITIVO) al confirmar una sugerencia.
const TIPO_REAL_POR_DETECTADO: Record<TipoDetectado, string> = {
  phone: 'Celular (carga)',
  laptop: 'Laptop',
  desktop: 'Computadora de escritorio',
  tv: 'Televisión (LED)',
  gaming: 'Consola de videojuegos',
  iot: 'Dispositivo IoT',
  printer: 'Impresora',
  unknown: 'Otro',
};

export function tipoRealDeDetectado(tipo: TipoDetectado): string {
  return TIPO_REAL_POR_DETECTADO[tipo] ?? 'Otro';
}
