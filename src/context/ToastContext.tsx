import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckIcon, WarningIcon, CloseIcon } from '../components/icons';

interface ToastItem {
  id: string;
  tipo: 'success' | 'error';
  mensaje: string;
}

interface ToastContextValue {
  mostrarExito: (mensaje: string) => void;
  mostrarError: (mensaje: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DURACION_MS = 4200;

// Notificaciones flotantes (arriba a la derecha) para confirmaciones que
// importa que se noten — a diferencia de un texto inline dentro de una
// tarjeta, esto no se pierde de vista ni se lo lleva un scroll o un
// redirect. Vive en un provider global (ver App.tsx) para que sobreviva a
// cualquier navegación.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const quitar = useCallback((id: string) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (tipo: 'success' | 'error', mensaje: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((cur) => [...cur, { id, tipo, mensaje }]);
      setTimeout(() => quitar(id), DURACION_MS);
    },
    [quitar]
  );

  const mostrarExito = useCallback((mensaje: string) => mostrar('success', mensaje), [mostrar]);
  const mostrarError = useCallback((mensaje: string) => mostrar('error', mensaje), [mostrar]);

  return (
    <ToastContext.Provider value={{ mostrarExito, mostrarError }}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tipo}`} role="status">
            <span className="toast-icon">{t.tipo === 'success' ? <CheckIcon /> : <WarningIcon />}</span>
            <span className="toast-message">{t.mensaje}</span>
            <button type="button" className="toast-close" onClick={() => quitar(t.id)} aria-label="Cerrar aviso">
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
