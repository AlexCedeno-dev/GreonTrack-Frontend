import { FormEvent, RefObject, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { TIPOS_DISPOSITIVO } from '../types/database';
import { capturarInfoDispositivo } from '../lib/deviceInfo';
import { iconoDeTipo } from '../lib/deviceCategories';
import { ajustarConsumoSugerido, marcasParaTipo } from '../lib/deviceEnergyAdjustment';
import { campoOpcionalDeTipo, tipoTieneIp } from '../lib/deviceCategoryFields';
import { ArrowLeftIcon, BoltIcon, SparkChartIcon } from '../components/icons';
import type { Configuracion } from '../types/database';

const ANIO_MINIMO = 1900;
const ANIO_ACTUAL = new Date().getFullYear();
// Descendente (el año más reciente primero) — es como la gente suele
// buscar el suyo, de más nuevo a más viejo.
const ANIOS_DISPONIBLES = Array.from({ length: ANIO_ACTUAL - ANIO_MINIMO + 1 }, (_, i) => ANIO_ACTUAL - i);

// Pequeño helper para poder "repetir" la animación de sacudida en un campo
// cada vez que falla, incluso si el usuario le da guardar varias veces
// seguido — quitando la clase y volviéndola a poner en el siguiente frame
// (en vez de solo dejarla puesta, que no reinicia la animación una segunda
// vez) forzamos a que el navegador la vuelva a correr desde cero.
function useShake() {
  const [shaking, setShaking] = useState(false);
  const disparar = () => {
    setShaking(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setShaking(true)));
  };
  return { shaking, disparar, onAnimationEnd: () => setShaking(false) };
}

export function DeviceForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mostrarExito, mostrarError } = useToast();

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState(TIPOS_DISPOSITIVO[0].tipo);
  const [watts, setWatts] = useState(String(TIPOS_DISPOSITIVO[0].wattsPromedio));
  const [ipDispositivo, setIpDispositivo] = useState('');
  const [marcaSel, setMarcaSel] = useState('');
  const [marcaOtra, setMarcaOtra] = useState('');
  const [anio, setAnio] = useState('');
  const [atributoValor, setAtributoValor] = useState('');
  const marca = marcaSel === 'Otra' ? marcaOtra : marcaSel;

  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);

  const nombreRef = useRef<HTMLInputElement>(null);
  const wattsRef = useRef<HTMLInputElement>(null);
  const shakeNombre = useShake();
  const shakeWatts = useShake();

  useEffect(() => {
    supabase
      .from('configuracion')
      .select('*')
      .single()
      .then(({ data, error }) => {
        if (!error) setConfiguracion(data as Configuracion);
      });
  }, []);

  const redirectTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    supabase
      .from('dispositivos')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setLoadError(error.message);
        } else if (data) {
          setNombre(data.nombre);
          setTipo(data.tipo);
          setWatts(String(data.consumo_watts_promedio));
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  useEffect(() => {
    return () => {
      if (redirectTimeout.current) clearTimeout(redirectTimeout.current);
    };
  }, []);

  const wattsNumber = Number(watts);
  const nombreValido = nombre.trim().length > 0;
  const wattsValido = watts.trim() !== '' && Number.isFinite(wattsNumber) && wattsNumber > 0;

  const anioNumber = Number(anio);
  // Ya no hace falta validar rango: al ser un <select> con solo los años
  // de ANIOS_DISPONIBLES como opciones, es imposible elegir algo fuera de
  // rango o negativo.
  const anioValido = anio.trim() !== '';

  const wattsSugeridosBase = TIPOS_DISPOSITIVO.find((t) => t.tipo === tipo)?.wattsPromedio;
  const wattsSugeridosAjustados =
    wattsSugeridosBase !== undefined && (marca.trim() || anioValido)
      ? ajustarConsumoSugerido(wattsSugeridosBase, marca, anioValido ? anioNumber : null)
      : undefined;

  const handleTipoChange = (nuevoTipo: string) => {
    setTipo(nuevoTipo);
    const sugerido = TIPOS_DISPOSITIVO.find((t) => t.tipo === nuevoTipo);
    if (sugerido) setWatts(String(sugerido.wattsPromedio));
    // Las marcas dependen del tipo (no tendría sentido ofrecer "Whirlpool"
    // para un celular) — al cambiar de tipo, la selección anterior ya no
    // aplica.
    setMarcaSel('');
    setMarcaOtra('');
    // El dato extra ("tamaño de pantalla", "capacidad", etc.) también
    // depende del tipo — el que se había escrito ya no aplica.
    setAtributoValor('');
    // Y la IP solo aplica a dispositivos que de verdad están en la red.
    setIpDispositivo('');
  };

  const marcasDisponibles = marcasParaTipo(tipo);
  const IconoTipo = iconoDeTipo(tipo);
  const campoOpcional = campoOpcionalDeTipo(tipo);
  const mostrarIp = tipoTieneIp(tipo);

  const kwhPorHora = wattsValido ? wattsNumber / 1000 : null;
  const costoPorHora = kwhPorHora !== null && configuracion ? kwhPorHora * configuracion.tarifa_kwh : null;
  const co2PorHora = kwhPorHora !== null && configuracion ? kwhPorHora * configuracion.factor_co2 : null;

  const enfocar = (ref: RefObject<HTMLInputElement>) => {
    ref.current?.focus();
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError(null);
    setSuccess(null);

    if (!nombreValido || !wattsValido) {
      const faltantes = [!nombreValido && 'el nombre del dispositivo', !wattsValido && 'el consumo en watts'].filter(
        Boolean
      );
      mostrarError(`Falta completar ${faltantes.join(' y ')} antes de guardar.`);
      if (!nombreValido) {
        shakeNombre.disparar();
        enfocar(nombreRef);
      } else {
        shakeWatts.disparar();
        enfocar(wattsRef);
      }
      return;
    }

    if (!user) {
      setError('No hay una sesión activa.');
      return;
    }

    setSaving(true);

    const payload = {
      nombre: nombre.trim(),
      tipo,
      consumo_watts_promedio: wattsNumber,
    };

    const { error } =
      isEdit && id
        ? await supabase.from('dispositivos').update(payload).eq('id', id)
        : await supabase.from('dispositivos').insert({
            ...payload,
            usuario_id: user.id,
            origen: 'manual',
            info_registro: await capturarInfoDispositivo({
              ipDispositivo: ipDispositivo.trim() || undefined,
              vendor: marca.trim() || undefined,
              anioDispositivo: anioValido ? anioNumber : undefined,
              atributoCategoria:
                campoOpcional && atributoValor.trim()
                  ? {
                      etiqueta: campoOpcional.unidad
                        ? `${campoOpcional.etiqueta} (${campoOpcional.unidad})`
                        : campoOpcional.etiqueta,
                      valor: atributoValor.trim(),
                    }
                  : undefined,
            }),
          });

    setSaving(false);

    if (error) {
      setError(error.message);
      mostrarError('No pude guardar el dispositivo. Intenta de nuevo.');
      return;
    }

    setSuccess(isEdit ? 'Dispositivo actualizado.' : 'Dispositivo agregado.');
    mostrarExito(isEdit ? 'Dispositivo actualizado.' : '¡Dispositivo agregado! Actualizando tu lista…');
    redirectTimeout.current = setTimeout(() => navigate('/dispositivos'), 800);
  };

  return (
    <AppShell
      title={isEdit ? 'Editar dispositivo' : 'Nuevo dispositivo'}
      subtitle={isEdit ? 'Actualiza los datos de este equipo.' : 'Registra un nuevo equipo para monitorear.'}
    >
      <button
        type="button"
        className="icon-btn device-form-back"
        onClick={() => navigate('/dispositivos')}
        aria-label="Volver a dispositivos"
        title="Volver"
      >
        <ArrowLeftIcon />
      </button>

      {loading ? (
        <p className="muted">Cargando dispositivo…</p>
      ) : loadError ? (
        <div className="alert-error">{loadError}</div>
      ) : (
        <div className="card device-form-card device-form-card-wide">
          <form className="device-form-fields" onSubmit={handleSubmit} noValidate>
            <div className="device-form-field">
              <label htmlFor="nombre">Nombre del dispositivo</label>
              <input
                id="nombre"
                ref={nombreRef}
                type="text"
                className={`device-form-input${touched && !nombreValido ? ' device-form-input-error' : ''}${
                  shakeNombre.shaking ? ' device-form-shake' : ''
                }`}
                onAnimationEnd={shakeNombre.onAnimationEnd}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Laptop de trabajo"
              />
              {touched && !nombreValido && <span className="device-form-error-text">Escribe un nombre.</span>}
            </div>

            <div className="device-form-field">
              <label>Tipo de dispositivo</label>
              <div className="type-picker">
                {TIPOS_DISPOSITIVO.map((t) => {
                  const Icono = iconoDeTipo(t.tipo);
                  const activo = tipo === t.tipo;
                  return (
                    <button
                      key={t.tipo}
                      type="button"
                      className={`type-picker-option${activo ? ' active' : ''}`}
                      onClick={() => handleTipoChange(t.tipo)}
                      aria-pressed={activo}
                    >
                      <span className="type-picker-icon">
                        <Icono />
                      </span>
                      <span className="type-picker-label">{t.tipo}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="device-form-preview-strip">
              <span className="device-form-preview-icon">
                <IconoTipo />
              </span>
              <div className="device-form-preview-strip-name">
                <p className="device-form-preview-name">{nombre.trim() || 'Tu dispositivo'}</p>
                <p className="device-form-preview-type">{tipo}</p>
              </div>
              <div className="device-form-preview-strip-watts">
                <span>{wattsValido ? wattsNumber : '—'}</span>
                <small>W</small>
              </div>
              {kwhPorHora !== null ? (
                <div className="device-form-preview-strip-stats">
                  <div>
                    <span>Energía/h</span>
                    <strong>{kwhPorHora.toFixed(3)} kWh</strong>
                  </div>
                  <div>
                    <span>Costo/h</span>
                    <strong>{costoPorHora !== null ? `$${costoPorHora.toFixed(2)}` : '—'}</strong>
                  </div>
                  <div>
                    <span>CO₂/h</span>
                    <strong>{co2PorHora !== null ? `${(co2PorHora * 1000).toFixed(0)} g` : '—'}</strong>
                  </div>
                </div>
              ) : (
                <p className="device-form-preview-strip-hint muted">Pon el consumo en watts para ver el costo y la huella por hora.</p>
              )}
            </div>

            {!isEdit && (
              <div className="device-form-section">
                <p className="device-form-section-title">
                  <SparkChartIcon /> Para afinar el estimado <span>(opcional)</span>
                </p>
                <div className="device-form-row">
                  <div className="device-form-field">
                    <label htmlFor="marca">Marca</label>
                    <select
                      id="marca"
                      className="device-form-select"
                      value={marcaSel}
                      onChange={(e) => setMarcaSel(e.target.value)}
                    >
                      <option value="">Sin especificar</option>
                      {marcasDisponibles.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="device-form-field">
                    <label htmlFor="anio">Año de compra o fabricación</label>
                    <select
                      id="anio"
                      className="device-form-select"
                      value={anio}
                      onChange={(e) => setAnio(e.target.value)}
                    >
                      <option value="">Sin especificar</option>
                      {ANIOS_DISPONIBLES.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {marcaSel === 'Otra' && (
                  <div className="device-form-field">
                    <label htmlFor="marcaOtra">¿Cuál marca?</label>
                    <input
                      id="marcaOtra"
                      type="text"
                      className="device-form-input"
                      value={marcaOtra}
                      onChange={(e) => setMarcaOtra(e.target.value)}
                      placeholder="Escribe la marca"
                    />
                  </div>
                )}

                {wattsSugeridosAjustados !== undefined && wattsSugeridosAjustados !== wattsNumber && (
                  <div className="device-form-callout">
                    <span className="device-form-callout-icon">
                      <BoltIcon />
                    </span>
                    <div className="device-form-callout-body">
                      <p>
                        Con la marca y el año que diste (los equipos más viejos suelen consumir un
                        poco más), el estimado ajustado es <strong>{wattsSugeridosAjustados} W</strong>.
                        Es solo un apoyo, no un dato certificado — si conoces el consumo real de la
                        etiqueta o el manual del equipo, mejor ingresa esa cifra directamente abajo.
                      </p>
                      <button
                        type="button"
                        className="device-form-callout-btn"
                        onClick={() => setWatts(String(wattsSugeridosAjustados))}
                      >
                        Usar {wattsSugeridosAjustados} W
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="device-form-field">
              <label htmlFor="watts">Consumo promedio (Watts)</label>
              <input
                id="watts"
                ref={wattsRef}
                type="number"
                min="0"
                step="1"
                className={`device-form-input${touched && !wattsValido ? ' device-form-input-error' : ''}${
                  shakeWatts.shaking ? ' device-form-shake' : ''
                }`}
                onAnimationEnd={shakeWatts.onAnimationEnd}
                value={watts}
                onChange={(e) => setWatts(e.target.value)}
                placeholder="65"
              />
              {wattsSugeridosBase !== undefined && (
                <span className="device-form-hint">
                  Sugerido para {tipo}: {wattsSugeridosBase} W — pero si conoces el consumo real de tu
                  equipo (etiqueta o manual), esa cifra siempre es mejor que cualquier sugerencia.
                </span>
              )}
              {touched && !wattsValido && (
                <span className="device-form-error-text">Ingresa un número mayor a 0.</span>
              )}
            </div>

            {!isEdit && (mostrarIp || campoOpcional) && (
              <div className="device-form-optional-group">
                <p className="device-form-optional-title">Opcional</p>
                {mostrarIp && (
                  <div className="device-form-field">
                    <label htmlFor="ipDispositivo">IP del dispositivo</label>
                    <input
                      id="ipDispositivo"
                      type="text"
                      className="device-form-input"
                      value={ipDispositivo}
                      onChange={(e) => setIpDispositivo(e.target.value)}
                      placeholder="Ej. 192.168.1.25"
                    />
                  </div>
                )}

                {campoOpcional && (
                  <div className="device-form-field">
                    <label htmlFor="atributoCategoria">
                      {campoOpcional.etiqueta}
                      {campoOpcional.unidad ? ` (${campoOpcional.unidad})` : ''}
                    </label>
                    {campoOpcional.tipo === 'select' ? (
                      <select
                        id="atributoCategoria"
                        className="device-form-select"
                        value={atributoValor}
                        onChange={(e) => setAtributoValor(e.target.value)}
                      >
                        <option value="">Sin especificar</option>
                        {campoOpcional.opciones?.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="atributoCategoria"
                        type={campoOpcional.tipo === 'numero' ? 'number' : 'text'}
                        step={campoOpcional.tipo === 'numero' ? 'any' : undefined}
                        className="device-form-input"
                        value={atributoValor}
                        onChange={(e) => setAtributoValor(e.target.value)}
                        placeholder={campoOpcional.placeholder}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {error && <div className="alert-error">{error}</div>}

            <div className="device-form-actions">
              <button
                type="button"
                className="device-form-cancel"
                onClick={() => navigate('/dispositivos')}
                disabled={saving}
              >
                Cancelar
              </button>
              <button type="submit" className="device-form-submit" disabled={saving || !!success}>
                {saving ? 'Guardando…' : isEdit ? 'Actualizar dispositivo' : 'Guardar dispositivo'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
