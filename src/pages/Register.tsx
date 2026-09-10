import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { GoogleIcon } from '../components/icons';
import { PasswordField } from '../components/PasswordField';
import { PasswordStrength } from '../components/PasswordStrength';
import { evaluarFortaleza } from '../lib/passwordStrength';

export function Register() {
  const { signUp, signInWithGoogle, session } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [aceptaAviso, setAceptaAviso] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!evaluarFortaleza(password).esValida) {
      setError('Tu contraseña no cumple con todos los requisitos de seguridad.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!aceptaAviso) {
      setError('Debes leer y aceptar el Aviso de Privacidad para crear tu cuenta.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, nombre);
    setLoading(false);

    if (error) {
      setError(error);
      return;
    }

    if (!session) {
      setSuccess('¡Cuenta creada! Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.');
      return;
    }

    navigate('/');
  };

  const handleGoogle = async () => {
    setError(null);
    if (!aceptaAviso) {
      setError('Debes leer y aceptar el Aviso de Privacidad para crear tu cuenta.');
      return;
    }
    const { error } = await signInWithGoogle();
    if (error) setError(error);
  };

  return (
    <AuthLayout eyebrow="Comienza gratis">
      <h1 className="form-title">Crea tu cuenta</h1>
      <p className="form-subtitle">Configúrala en un minuto y empieza a monitorear hoy mismo.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            required
            autoComplete="name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
          />
        </div>

        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <PasswordField
            id="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            placeholder="Mínimo 8 caracteres, con mayúscula, número y símbolo"
          />
          <PasswordStrength password={password} />
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <PasswordField
            id="confirmPassword"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="••••••••"
          />
        </div>

        <label className="auth-check-row">
          <input
            type="checkbox"
            checked={aceptaAviso}
            onChange={(e) => setAceptaAviso(e.target.checked)}
          />
          <span>
            He leído y acepto el{' '}
            <Link to="/aviso-privacidad" target="_blank" rel="noopener noreferrer">
              Aviso de Privacidad
            </Link>{' '}
            — incluyendo que mis datos se usan dentro de la app y con Greon (IA) para generar mis
            estadísticas y recomendaciones. Al entrar por primera vez te pediremos firmarlo.
          </span>
        </label>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <button
          type="submit"
          className="btn-primary"
          disabled={
            loading || !evaluarFortaleza(password).esValida || password !== confirmPassword || !aceptaAviso
          }
        >
          {loading ? 'Creando cuenta…' : 'Registrarme'}
        </button>
      </form>

      <div className="auth-divider">
        <span>o</span>
      </div>

      <button type="button" className="btn-google" onClick={handleGoogle} disabled={!aceptaAviso}>
        <GoogleIcon /> Registrarme con Google
      </button>

      <p className="auth-footer">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </AuthLayout>
  );
}
