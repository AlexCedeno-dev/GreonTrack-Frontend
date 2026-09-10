import { Link, Navigate } from 'react-router-dom';
import { useRef, useState, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { SignaturePad, type SignaturePadHandle } from './SignaturePad';
import mascota from '../assets/mascota-greon-sm.png';

// Pantalla que bloquea el resto de la app hasta que la cuenta tenga
// perfil.aviso_privacidad_aceptado_en — a cualquier cuenta a la que le
// falte (nuevas o viejas, da igual), se le pide firmar antes de seguir.
function CandadoAvisoPrivacidad() {
  const { aceptarAvisoPrivacidad, signOut } = useAuth();
  const firmaRef = useRef<SignaturePadHandle>(null);
  const [hayFirma, setHayFirma] = useState(false);
  const [aceptando, setAceptando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAceptar = async () => {
    const firma = firmaRef.current?.exportar();
    if (!firma) return;

    setError(null);
    setAceptando(true);
    const { error } = await aceptarAvisoPrivacidad(firma);
    setAceptando(false);
    if (error) setError(error);
  };

  return (
    <div className="consent-gate">
      <div className="card consent-gate-card">
        <img src={mascota} alt="" className="consent-gate-mascot" />
        <span className="form-eyebrow">Antes de seguir</span>
        <h1>Acepta el Aviso de Privacidad</h1>
        <p>
          Actualizamos cómo te contamos el uso de tus datos — incluyendo que los usamos dentro de la
          app y con Greon (IA) para tus estadísticas y recomendaciones. Revísalo y fírmalo para seguir
          usando GreonTrack.
        </p>
        <Link
          to="/aviso-privacidad"
          target="_blank"
          rel="noopener noreferrer"
          className="link-button-dark"
          style={{ fontSize: '0.85rem' }}
        >
          Leer el Aviso de Privacidad completo →
        </Link>

        <div className="consent-gate-signature">
          <span className="consent-gate-signature-label">Tu firma</span>
          <SignaturePad ref={firmaRef} onCambio={setHayFirma} />
          <div className="consent-gate-signature-row">
            <p className="muted">
              Solo se guarda como evidencia de que tú aceptaste — nadie más tiene acceso a ella.
            </p>
            <button type="button" className="link-button-dark" onClick={() => firmaRef.current?.limpiar()}>
              Borrar firma
            </button>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <div className="consent-gate-actions">
          <button type="button" className="device-form-cancel" onClick={() => signOut()}>
            Cerrar sesión
          </button>
          <button
            type="button"
            className="device-form-submit"
            onClick={handleAceptar}
            disabled={aceptando || !hayFirma}
          >
            {aceptando ? 'Guardando…' : 'Acepto y firmo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, perfil, loading } = useAuth();

  if (loading) return <div className="page-loading">Cargando…</div>;
  if (!session) return <Navigate to="/login" replace />;
  // El perfil se carga aparte, tras confirmarse la sesión — sin esto, una
  // cuenta con el aviso pendiente alcanzaría a ver un parpadeo de la página
  // real antes de que aparezca el candado.
  if (!perfil) return <div className="page-loading">Cargando…</div>;

  if (!perfil.aviso_privacidad_aceptado_en) return <CandadoAvisoPrivacidad />;

  return <>{children}</>;
}
