import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './icons';

interface PasswordFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  inputClassName?: string;
  autoFocus?: boolean;
}

// Envuelve un <input type="password"> con un botón de ojo para
// mostrar/ocultar el texto — sin librería, solo alterna el `type` del
// input entre "password" y "text".
export function PasswordField({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  inputClassName,
  autoFocus,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        className="password-field-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
