import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface SignaturePadHandle {
  limpiar: () => void;
  exportar: () => string | null;
}

interface SignaturePadProps {
  onCambio?: (tieneTrazo: boolean) => void;
}

// Firma sencilla a mano (mouse/trackpad/touch) sobre un canvas, para dejar
// evidencia de que la persona aceptó el Aviso de Privacidad — no es una
// firma electrónica avanzada ni tiene validez notarial, es el mismo
// espíritu que firmar en la pantalla de una terminal de pago.
export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(function SignaturePad(
  { onCambio },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);
  const tieneTrazo = useRef(false);
  const [vacio, setVacio] = useState(true);

  const contexto = () => canvasRef.current?.getContext('2d') ?? null;

  // El canvas se dibuja a resolución fija más alta que su tamaño en
  // pantalla (via CSS) para que la firma no se vea pixeleada en pantallas
  // de alta densidad.
  const ANCHO = 600;
  const ALTO = 200;

  const fondoBlanco = () => {
    const ctx = contexto();
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, ANCHO, ALTO);
  };

  useEffect(() => {
    fondoBlanco();
  }, []);

  const posicionRelativa = (e: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * ANCHO,
      y: ((e.clientY - rect.top) / rect.height) * ALTO,
    };
  };

  const empezarTrazo = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = contexto();
    if (!ctx) return;
    canvasRef.current?.setPointerCapture(e.pointerId);
    dibujando.current = true;
    const { x, y } = posicionRelativa(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const seguirTrazo = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dibujando.current) return;
    const ctx = contexto();
    if (!ctx) return;
    const { x, y } = posicionRelativa(e);
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#12241c';
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!tieneTrazo.current) {
      tieneTrazo.current = true;
      setVacio(false);
      onCambio?.(true);
    }
  };

  const terminarTrazo = () => {
    dibujando.current = false;
  };

  useImperativeHandle(ref, () => ({
    limpiar: () => {
      fondoBlanco();
      tieneTrazo.current = false;
      setVacio(true);
      onCambio?.(false);
    },
    exportar: () => (tieneTrazo.current ? canvasRef.current?.toDataURL('image/png') ?? null : null),
  }));

  return (
    <div className="signature-pad">
      <canvas
        ref={canvasRef}
        width={ANCHO}
        height={ALTO}
        className="signature-pad-canvas"
        onPointerDown={empezarTrazo}
        onPointerMove={seguirTrazo}
        onPointerUp={terminarTrazo}
        onPointerLeave={terminarTrazo}
      />
      {vacio && <span className="signature-pad-placeholder">Firma aquí con el trackpad, mouse o el dedo</span>}
    </div>
  );
});
