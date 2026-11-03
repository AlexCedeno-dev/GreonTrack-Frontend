import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { fetchConsumptionData, ConsumptionData } from '../lib/consumption';
import { generarNotificaciones, NotificacionItem } from '../lib/notifications';
import { estaDescartadaHoy, descartarNotificacion } from '../lib/notifDismiss';
import { calcularRacha, RachaInfo } from '../lib/streak';
import { guardarCache, leerCache } from '../lib/cacheLocal';

interface AppDataContextValue {
  datos: ConsumptionData | null;
  cargando: boolean;
  notificaciones: NotificacionItem[];
  racha: RachaInfo | null;
  refrescar: () => void;
  quitarNotificacion: (id: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

// Este provider vive por ARRIBA de las rutas (ver App.tsx), no dentro de
// cada página — así el consumo, la racha y las notificaciones se calculan
// una sola vez por sesión (o cuando se pide explícitamente con
// `refrescar`), en vez de recargarse cada que cambias de pantalla porque
// AppShell se vuelve a montar en cada página.
export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [datos, setDatos] = useState<ConsumptionData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const [racha, setRacha] = useState<RachaInfo | null>(null);

  const aplicar = useCallback(
    (resultado: ConsumptionData, userId: string) => {
      setDatos(resultado);
      const todas = generarNotificaciones(resultado);
      setNotificaciones(todas.filter((n) => !estaDescartadaHoy(userId, n.id)));
      setRacha(calcularRacha(resultado.porDia));
    },
    []
  );

  const cargar = useCallback(() => {
    if (!user) {
      setDatos(null);
      setNotificaciones([]);
      setRacha(null);
      setCargando(false);
      return;
    }

    // Con una copia de la última vez, la app se pinta al instante y se
    // actualiza por detrás; sin copia (primera vez) sí espera al servidor.
    const copia = leerCache<ConsumptionData>(`datos-${user.id}`);
    if (copia) {
      aplicar(copia, user.id);
      setCargando(false);
    } else {
      setCargando(true);
    }
    fetchConsumptionData(user.id)
      .then((resultado) => {
        aplicar(resultado, user.id);
        guardarCache(`datos-${user.id}`, resultado);
      })
      .catch(() => {
        // Racha/notificaciones son un plus informativo; si falla la carga
        // no rompemos el resto de la app por esto.
      })
      .finally(() => setCargando(false));
  }, [user, aplicar]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const quitarNotificacion = (id: string) => {
    if (user) descartarNotificacion(user.id, id);
    setNotificaciones((cur) => cur.filter((n) => n.id !== id));
  };

  return (
    <AppDataContext.Provider
      value={{ datos, cargando, notificaciones, racha, refrescar: cargar, quitarNotificacion }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData debe usarse dentro de <AppDataProvider>');
  return ctx;
}
