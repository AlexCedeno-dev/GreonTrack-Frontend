import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import type { DispositivoSugerido } from '../types/database';
import { CheckIcon, TrashIcon, ArrowLeftIcon, RefreshIcon, CopyIcon } from '../components/icons';
import { DibujoTipo } from '../components/casa/Sprites';
import { useSnifferEstado } from '../lib/useSnifferEstado';
import { CATEGORIAS, categoriaDe, tipoRealDeDetectado, Categoria } from '../lib/deviceCategories';
import {
  fetchSugerenciasPendientes,
  confirmarSugerencia,
  descartarSugerencia,
  segundosDesdeSondeo,
  ponerMonitorEncendido,
  pedirEscaneoAhora,
} from '../lib/deviceSuggestions';
import { detectarSistemaOperativo } from '../lib/deviceInfo';

const POLL_SUGERENCIAS_MS = 5_000;

type Plataforma = 'mac' | 'windows' | 'linux';

const PROBLEMAS_COMUNES: Array<[string, string]> = [
  [
    '"no such file or directory" o "No se encuentra la carpeta"',
    'No estás dentro de la carpeta GreonTrack-Sniffer. Repite el paso de escribir cd, un espacio, y arrastrar la carpeta a la ventana.',
  ],
  [
    '"Permission denied"',
    'Usa el comando tal cual está, con "bash" al inicio (sudo bash instalar.sh). Así funciona aunque la carpeta se haya descargado sin permisos.',
  ],
  [
    '"python3: command not found" o "python no se reconoce"',
    'Falta instalar Python 3. Bájalo de python.org, ábrelo y vuelve a correr el comando.',
  ],
  [
    '"No se pudo iniciar sesión en GreenTrack"',
    'Revisa tu correo y contraseña. Si entras a GreonTrack solo con Google, primero crea una contraseña en Configuración y usa esa aquí.',
  ],
  [
    'Pasó más de un minuto y esta página sigue diciendo "sin conectar"',
    'Revisa que la compu esté prendida y en la misma red Wi-Fi que tus aparatos. En Mac puedes ver qué pasa con: tail -f logs/sniffer.log',
  ],
];

const INSTALACION: Record<Plataforma, { nombre: string; pasos: string[]; comando: string; nota: string }> = {
  mac: {
    nombre: 'Mac',
    pasos: [
      'Abre la Terminal: presiona Cmd + Espacio, escribe "Terminal" y dale Enter.',
      'En la Terminal escribe cd y un espacio (sin dar Enter todavía). Luego arrastra la carpeta GreonTrack-Sniffer a la ventana: la ruta se escribe sola. Ahora sí dale Enter.',
      'Pega el comando de abajo y dale Enter.',
      'Cuando diga "Password:", escribe la contraseña de tu Mac. No se ve nada mientras escribes; es normal. Dale Enter.',
      'Cuando pida "Correo:" y "Contraseña:", escribe los de tu cuenta de GreonTrack (solo esta vez).',
      'Espera el mensaje "El Sniffer ya corre solo" y regresa a esta página: se actualiza sola.',
    ],
    comando: 'sudo bash instalar.sh',
    nota: 'Queda como servicio: arranca solo cada vez que prendes la Mac, sin volver a abrir la Terminal.',
  },
  windows: {
    nombre: 'Windows',
    pasos: [
      'Instala Python 3 (python.org; marca "Add Python to PATH") y Npcap (npcap.com) si no los tienes.',
      'Abre el menú Inicio, escribe PowerShell, haz clic derecho en "Windows PowerShell" y elige "Ejecutar como administrador".',
      'Escribe cd y un espacio, arrastra la carpeta GreonTrack-Sniffer a la ventana y dale Enter.',
      'Pega el comando de abajo y dale Enter.',
      'Cuando pida "Correo:" y "Contraseña:", escribe los de tu cuenta de GreonTrack (solo esta vez).',
      'Espera el mensaje "El Sniffer ya corre solo" y regresa a esta página: se actualiza sola.',
    ],
    comando: 'powershell -ExecutionPolicy Bypass -File .\\instalar.ps1',
    nota: 'Queda como tarea de Windows: arranca sola cada vez que prendes la PC.',
  },
  linux: {
    nombre: 'Linux',
    pasos: [
      'Abre una terminal.',
      'Escribe cd y un espacio, arrastra la carpeta GreonTrack-Sniffer a la terminal y dale Enter.',
      'Pega el comando de abajo y dale Enter. Escribe tu contraseña de administrador si la pide.',
      'Cuando pida "Correo:" y "Contraseña:", escribe los de tu cuenta de GreonTrack (solo esta vez).',
      'Espera el mensaje "El Sniffer ya corre solo" y regresa a esta página: se actualiza sola.',
    ],
    comando: 'sudo bash instalar.sh',
    nota: 'Queda como servicio de systemd: arranca solo con el equipo.',
  },
};

function plataformaActual(): Plataforma {
  const so = detectarSistemaOperativo(navigator.userAgent);
  if (so === 'Windows') return 'windows';
  if (so === 'Linux') return 'linux';
  return 'mac';
}

function horaCorta(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const PASOS_FUNCIONAMIENTO = [
  ['Pregunta quién está', 'Manda un aviso a toda tu red (ARP) y cada aparato conectado responde con su dirección.'],
  ['Los reconoce', 'Les pregunta su nombre y modelo (mDNS y SSDP) y mira al fabricante de su tarjeta de red.'],
  ['Estima su consumo', 'Según el tipo de aparato, le pone unos watts de referencia.'],
  ['Te lo sugiere', 'Aparece aquí abajo para que lo agregues con un clic o lo descartes.'],
];

function haceCuanto(segundos: number | null): string {
  if (segundos === null) return 'nunca';
  if (segundos < 5) return 'ahora mismo';
  if (segundos < 60) return `hace ${segundos} s`;
  if (segundos < 3600) return `hace ${Math.floor(segundos / 60)} min`;
  return `hace ${Math.floor(segundos / 3600)} h`;
}

export function DeviceSniffer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sugerencias, setSugerencias] = useState<DispositivoSugerido[]>([]);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const { estado: estadoSniffer, activo, recargar: recargarEstado } = useSnifferEstado(user?.id);
  const [vistosIds, setVistosIds] = useState<Set<string> | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [plataforma, setPlataforma] = useState<Plataforma>(plataformaActual);
  const [ordenando, setOrdenando] = useState(false);
  const esCelular = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('Todos');

  const loadSugerencias = async () => {
    if (!user) return;
    try {
      const nuevas = await fetchSugerenciasPendientes(user.id);
      setSugerencias(nuevas);
      setUltimaActualizacion(Date.now());
      // La primera carga no resalta nada; después, lo que llega de nuevo se marca.
      setVistosIds((previos) => previos ?? new Set(nuevas.map((n) => n.id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las sugerencias.');
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadSugerencias();
      setLoading(false);
    })();

    const interval = setInterval(loadSugerencias, POLL_SUGERENCIAS_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleActualizar = async () => {
    setActualizando(true);
    setError(null);
    await Promise.all([recargarEstado(), loadSugerencias()]);
    setActualizando(false);
  };

  const handleConfirmar = async (sugerencia: DispositivoSugerido) => {
    if (!user) return;
    setProcesandoId(sugerencia.id);
    setError(null);
    try {
      await confirmarSugerencia(sugerencia, user.id);
      setSugerencias((prev) => prev.filter((s) => s.id !== sugerencia.id));
      setSuccess(`${sugerencia.nombre_sugerido} se agregó a Mis dispositivos.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo agregar el dispositivo sugerido.');
    } finally {
      setProcesandoId(null);
    }
  };

  const handleDescartar = async (id: string) => {
    setProcesandoId(id);
    setError(null);
    try {
      await descartarSugerencia(id);
      setSugerencias((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo descartar la sugerencia.');
    } finally {
      setProcesandoId(null);
    }
  };

  const segundos = segundosDesdeSondeo(estadoSniffer);
  const encendido = estadoSniffer?.encendido !== false;
  const escaneando = Boolean(estadoSniffer?.escaneando) && activo;
  const bitacora = estadoSniffer?.bitacora ?? [];

  const mandarOrden = async (accion: () => Promise<void>) => {
    if (!user) return;
    setOrdenando(true);
    setError(null);
    try {
      await accion();
      await recargarEstado();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo mandar la orden al monitor.');
    } finally {
      setOrdenando(false);
    }
  };
  const alternarMonitor = () => user && mandarOrden(() => ponerMonitorEncendido(user.id, !encendido));
  const escanearAhora = () => user && mandarOrden(() => pedirEscaneoAhora(user.id));

  const copiarComando = async () => {
    try {
      await navigator.clipboard.writeText(INSTALACION[plataforma].comando);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setError('No se pudo copiar. Selecciona el comando y cópialo a mano.');
    }
  };
  const sugerenciasFiltradas =
    categoriaActiva === 'Todos'
      ? sugerencias
      : sugerencias.filter((s) => categoriaDe(tipoRealDeDetectado(s.tipo_detectado)) === categoriaActiva);

  return (
    <AppShell
      title="Detectar en mi red"
      subtitle="El GreonTrack Sniffer escanea tu red local y te sugiere dispositivos para agregar."
    >
      <div className="devices-toolbar">
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate('/dispositivos')}
          aria-label="Volver a dispositivos"
          title="Volver"
        >
          <ArrowLeftIcon />
        </button>
        <button className="btn-add btn-add-outline" onClick={handleActualizar} disabled={actualizando}>
          <RefreshIcon /> {actualizando ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      <section
        className={`sniffer-panel ${activo ? (encendido ? 'activo' : 'pausa') : 'inactivo'}`}
        aria-live="polite"
      >
        <div className="sniffer-panel-estado">
          <span className={`sniffer-radar${escaneando ? ' buscando' : ''}`} aria-hidden="true">
            <span />
            <span />
            <i />
          </span>
          <div>
            <p className="sniffer-panel-titulo">
              {!activo
                ? 'Monitor de red sin conectar'
                : !encendido
                  ? 'Monitor de red en pausa'
                  : escaneando
                    ? 'Buscando dispositivos…'
                    : 'Monitor de red encendido'}
            </p>
            <p className="sniffer-panel-dato">
              {activo
                ? `Última señal ${haceCuanto(segundos)} · ${estadoSniffer?.dispositivos_detectados ?? 0} dispositivos en tu red`
                : estadoSniffer && segundos !== null && segundos < 31_536_000
                  ? `Dejó de responder ${haceCuanto(segundos)}. Puede que la compu esté apagada.`
                  : 'Instálalo una vez en una compu de tu red y lo controlas desde aquí.'}
            </p>
          </div>
        </div>

        <div className="sniffer-panel-acciones">
          <button
            type="button"
            role="switch"
            aria-checked={activo && encendido}
            className={`sniffer-switch${activo && encendido ? ' on' : ''}`}
            onClick={alternarMonitor}
            disabled={ordenando || !activo}
            title={activo ? (encendido ? 'Pausar el monitor' : 'Encender el monitor') : 'Primero instálalo (abajo)'}
          >
            <span className="sniffer-switch-perilla" />
            <span className="sniffer-switch-texto">{activo && encendido ? 'Encendido' : 'Apagado'}</span>
          </button>
          <button
            type="button"
            className="btn-add btn-add-outline"
            onClick={escanearAhora}
            disabled={ordenando || !activo || escaneando}
          >
            <RefreshIcon /> Escanear ahora
          </button>
        </div>

        <span className="sniffer-panel-sync">
          Lista actualizada {ultimaActualizacion ? haceCuanto(Math.round((Date.now() - ultimaActualizacion) / 1000)) : '…'}
        </span>
      </section>

      {activo && (
        <div className="card sniffer-vivo">
          <h3>Lo que está haciendo ahora</h3>
          {bitacora.length === 0 ? (
            <p className="muted">Todavía no ha anotado nada. Dale "Escanear ahora" para verlo trabajar.</p>
          ) : (
            <ol className="sniffer-bitacora">
              {bitacora.slice(-12).map((b, i) => (
                <li key={`${b.t}-${i}`}>
                  <time>{horaCorta(b.t)}</time>
                  <span>{b.m}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {!loading && !activo && (
        <div className="card sniffer-ayuda">
          <h3>Instala el monitor (una sola vez)</h3>
          <p className="muted">
            Una página web no puede ver los otros aparatos de tu red, así que el monitor es un programa que corre en una
            compu conectada a esa red. Con una sola basta: tu celular, TV y demás los detecta solo, no necesitan nada
            instalado. Cuando termines, esta página lo detecta sola y lo prendes y pausas desde aquí.
          </p>
          {esCelular && (
            <p className="sniffer-ayuda-aviso">
              Estás en un celular o tablet: ahí no se puede instalar. Hazlo en una Mac, Windows o Linux conectada a tu
              mismo Wi-Fi.
            </p>
          )}
          <div className="sniffer-plataformas" role="tablist" aria-label="Sistema donde lo vas a instalar">
            {(Object.keys(INSTALACION) as Plataforma[]).map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={plataforma === p}
                className={`category-chip${plataforma === p ? ' active' : ''}`}
                onClick={() => setPlataforma(p)}
              >
                {INSTALACION[p].nombre}
              </button>
            ))}
          </div>
          <ol className="sniffer-pasos">
            {INSTALACION[plataforma].pasos.map((paso) => (
              <li key={paso}>{paso}</li>
            ))}
          </ol>
          <div className="sniffer-comando">
            <code>{INSTALACION[plataforma].comando}</code>
            <button type="button" className="device-action-btn" onClick={copiarComando}>
              {copiado ? <CheckIcon /> : <CopyIcon />} {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="muted sniffer-ayuda-nota">{INSTALACION[plataforma].nota}</p>
          <details className="sniffer-problemas">
            <summary>Si algo sale mal</summary>
            <dl>
              {PROBLEMAS_COMUNES.map(([problema, solucion]) => (
                <div key={problema}>
                  <dt>{problema}</dt>
                  <dd>{solucion}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
      )}

      <details className="card sniffer-funcionamiento">
        <summary>¿Cómo funciona?</summary>
        <ol>
          {PASOS_FUNCIONAMIENTO.map(([titulo, texto]) => (
            <li key={titulo}>
              <strong>{titulo}.</strong> {texto}
            </li>
          ))}
        </ol>
      </details>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {!loading && sugerencias.length > 0 && (
        <div className="category-filter">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              className={`category-chip${categoriaActiva === cat ? ' active' : ''}`}
              onClick={() => setCategoriaActiva(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="muted">Cargando sugerencias…</p>
      ) : sugerencias.length === 0 ? (
        <div className="device-empty">
          <div>
            <p className="device-empty-title">Sin sugerencias por ahora</p>
            <p className="muted">
              {activo
                ? 'El monitor está revisando tu red — en cuanto detecte algo nuevo, aparecerá aquí sin recargar.'
                : 'Prende el monitor de red (arriba) para empezar a detectar dispositivos.'}
            </p>
          </div>
        </div>
      ) : sugerenciasFiltradas.length === 0 ? (
        <div className="device-empty">
          <div>
            <p className="device-empty-title">Nada en "{categoriaActiva}"</p>
            <p className="muted">No hay sugerencias detectadas en esta categoría.</p>
          </div>
        </div>
      ) : (
        <div className="card suggestions-card">
          <h2 style={{ marginTop: 0 }}>Sugerencias detectadas en tu red</h2>
          <p className="muted">Revísalas y agrégalas con un clic, o descártalas si no quieres monitorearlas.</p>
          <ul className="suggestions-list">
            {sugerenciasFiltradas.map((s) => {
              const procesando = procesandoId === s.id;
              const esNueva = vistosIds !== null && !vistosIds.has(s.id);
              return (
                <li key={s.id} className={`suggestion-row${esNueva ? ' nueva' : ''}`}>
                  <span className="suggestion-row-icon con-dibujo">
                    <DibujoTipo tipo={tipoRealDeDetectado(s.tipo_detectado)} />
                  </span>
                  <div className="suggestion-row-text">
                    <p className="suggestion-row-name">{s.nombre_sugerido}</p>
                    <p className="suggestion-row-meta">
                      {s.ip} {s.vendor ? `· ${s.vendor}` : ''}
                    </p>
                  </div>
                  <span className="suggestion-row-watts">~{s.watts_estimados} W</span>
                  <div className="suggestion-row-actions">
                    <button
                      className="device-action-btn"
                      onClick={() => handleConfirmar(s)}
                      disabled={procesando}
                    >
                      <CheckIcon /> {procesando ? 'Agregando…' : 'Agregar'}
                    </button>
                    <button
                      className="device-action-btn device-action-btn-danger-outline"
                      onClick={() => handleDescartar(s.id)}
                      disabled={procesando}
                    >
                      <TrashIcon /> Descartar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </AppShell>
  );
}
