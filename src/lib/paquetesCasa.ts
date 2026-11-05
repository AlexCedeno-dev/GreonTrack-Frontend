import { DISENO_BASE, type Diseno } from './casa';

// Paquetes: lo típico de cada tipo de hogar, para no ir aparato por aparato.
// Los usan "Arma tu casa" (Dispositivos) y la bandeja de Mi casa.
export interface PaqueteCasa {
  id: string;
  nombre: string;
  detalle: string;
  items: Record<string, number>;
}

export const PAQUETES: PaqueteCasa[] = [
  {
    id: 'depa',
    nombre: 'Depa de estudiante',
    detalle: 'Laptop, celular, internet y lo básico',
    items: {
      Laptop: 1, 'Celular (carga)': 1, Router: 1, Iluminación: 3, Ventilador: 1, Microondas: 1, Refrigerador: 1,
      Cafetera: 1,
    },
  },
  {
    id: 'familia',
    nombre: 'Casa familiar',
    detalle: 'Cocina, lavandería, clima y pantallas',
    items: {
      Refrigerador: 1, 'Televisión (LED)': 2, Lavadora: 1, Microondas: 1, Iluminación: 8, Ventilador: 3,
      Router: 1, Laptop: 2, 'Celular (carga)': 3, Licuadora: 1, Plancha: 1, 'Calentador de agua': 1,
      'Aire acondicionado': 1,
    },
  },
  {
    id: 'oficina',
    nombre: 'Oficina en casa',
    detalle: 'Compu, impresora e internet',
    items: {
      'Computadora de escritorio': 1, Laptop: 1, Impresora: 1, Router: 1, Iluminación: 2, Ventilador: 1,
      'Aire acondicionado': 1, Cafetera: 1,
    },
  },
  {
    id: 'cocina',
    nombre: 'Cocina completa',
    detalle: 'Todo lo que se prende para cocinar',
    items: {
      Refrigerador: 1, Microondas: 1, 'Horno eléctrico': 1, 'Estufa eléctrica': 1, Licuadora: 1, Tostador: 1,
      Cafetera: 1, 'Hervidor eléctrico': 1, Lavavajillas: 1, 'Olla arrocera': 1,
    },
  },
  {
    id: 'gamer',
    nombre: 'Cuarto gamer',
    detalle: 'Consola, compu, pantalla y sonido',
    items: {
      'Consola de videojuegos': 1, 'Computadora de escritorio': 1, 'Televisión (LED)': 1, Router: 1,
      'Bocina o estéreo': 1, Iluminación: 2, Ventilador: 1,
    },
  },
  {
    id: 'tienda',
    nombre: 'Tienda o local',
    detalle: 'Refris, caja, iluminación y clima',
    items: {
      Refrigerador: 2, Congelador: 1, Iluminación: 8, 'Televisión (LED)': 1, Router: 1, Ventilador: 2,
      'Computadora de escritorio': 1, Impresora: 1, 'Aire acondicionado': 1, Cafetera: 1, Microondas: 1,
    },
  },
];

// Tipos de lugar: cambian cómo se llaman los cuartos, los colores y los aparatos de arranque.
export interface LugarCasa {
  id: 'casa' | 'depa' | 'oficina' | 'tienda';
  nombre: string;
  // "Tu casa", "Tu oficina"… para el título de la maqueta.
  tu: string;
  paquete: string;
  diseno: Diseno;
}

export const LUGARES: LugarCasa[] = [
  { id: 'casa', nombre: 'Casa', tu: 'casa', paquete: 'familia', diseno: DISENO_BASE },
  {
    id: 'depa',
    nombre: 'Departamento',
    tu: 'departamento',
    paquete: 'depa',
    diseno: {
      techo: '#363b41',
      fachada: '#faf9f5',
      nombres: { sala: 'Sala-comedor', principal: 'Recámara', ninos: 'Recámara 2', oficina: 'Estudio', garage: 'Bodega' },
      paredes: { principal: '#ddd4f2', ninos: '#cfe6f5', oficina: '#d5d8dc', garage: '#d5d8dc', sala: '#fbfaf6', cocina: '#fbfaf6' },
    },
  },
  {
    id: 'oficina',
    nombre: 'Oficina',
    tu: 'oficina',
    paquete: 'oficina',
    diseno: {
      techo: '#53707a',
      fachada: '#b9b2a4',
      nombres: {
        sala: 'Recepción', cocina: 'Cocineta', principal: 'Dirección', ninos: 'Sala de juntas',
        oficina: 'Área de trabajo', garage: 'Bodega',
      },
      paredes: { principal: '#d5d8dc', ninos: '#cfe6f5', oficina: '#e5f0d8', garage: '#bfc4ca', sala: '#fbfaf6', cocina: '#f4eeb0' },
    },
  },
  {
    id: 'tienda',
    nombre: 'Tienda',
    tu: 'tienda',
    paquete: 'tienda',
    diseno: {
      techo: '#b5593a',
      fachada: '#f2e2c4',
      nombres: {
        sala: 'Piso de venta', cocina: 'Cocineta', principal: 'Gerencia', ninos: 'Almacén',
        oficina: 'Caja y oficina', garage: 'Bodega',
      },
      paredes: { principal: '#f6ecd8', ninos: '#e8dcc6', oficina: '#d3ecd8', garage: '#dde1e4', sala: '#fbfaf6', cocina: '#f4eeb0' },
    },
  },
];
