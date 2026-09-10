import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import mascota from '../assets/mascota-greon-sm.png';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAppData } from '../context/AppDataContext';
import { generarAudioElevenLabs } from '../lib/voces';
import { estadoSegunConsumo, FRASES_POR_ESTADO } from '../lib/mascotMood';

// La nube invitando a picarle se puede cerrar con la "x" — queda oculta
// para siempre en este navegador, no solo por hoy.
const HINT_OCULTO_KEY = 'greontrack-mascot-hint-oculto';

const ETIQUETA_ESTADO: Record<string, string> = {
  feliz: 'Greon está contento — tu consumo bajó esta semana',
  neutral: 'Greon está tranquilo',
  triste: 'Greon está un poco triste — tu consumo subió esta semana',
  frustrado: 'Greon está frustrado — tu consumo subió bastante esta semana',
};

// De las voces que ofrezca el navegador/SO, prefiere una en español latino
// que suene amigable para Greon (Paulina/Mónica son voces femeninas
// cálidas, disponibles de fábrica en macOS/iOS/Safari); si no encuentra
// ninguna de esa lista, usa cualquier voz en español, y si tampoco hay,
// la que el navegador ponga por defecto (sigue hablando, solo que con el
// acento que le toque).
const VOCES_PREFERIDAS = ['Paulina', 'Mónica', 'Google español', 'Helena', 'Lucia', 'Lupe'];

// macOS trae, además de las voces "normales", un montón de voces de broma
// (Eddy, Grandma, Shelley, Zarvox...) que suenan robóticas o raras a
// propósito — si Greon no encuentra ninguna de las preferidas, mejor que
// no caiga en una de estas por accidente.
const VOCES_A_EVITAR = [
  'Eddy', 'Flo', 'Grandma', 'Grandpa', 'Reed', 'Rocko', 'Sandy', 'Shelley',
  'Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Cellos',
  'Wobble', 'Organ', 'Superstar', 'Trinoids', 'Whisper', 'Zarvox', 'Jester',
  'Kathy', 'Ralph', 'Fred', 'Good News', 'Hysterical', 'Bruce', 'Junior',
];

function elegirVoz(): SpeechSynthesisVoice | null {
  const voces = window.speechSynthesis.getVoices();
  if (voces.length === 0) return null;
  for (const nombre of VOCES_PREFERIDAS) {
    const encontrada = voces.find((v) => v.name.includes(nombre));
    if (encontrada) return encontrada;
  }
  return (
    voces.find(
      (v) => v.lang.startsWith('es') && !VOCES_A_EVITAR.some((mala) => v.name.includes(mala))
    ) ?? null
  );
}

export function MascotWidget() {
  const { voiceId } = useAccessibility();
  const { datos } = useAppData();
  const estado = estadoSegunConsumo(datos?.cambioPct);
  const frasesEstado = FRASES_POR_ESTADO[estado];
  const [abierto, setAbierto] = useState(false);
  const [frase, setFrase] = useState(frasesEstado[0]);
  const [saltando, setSaltando] = useState(false);
  const [hintOculto, setHintOculto] = useState(
    () => localStorage.getItem(HINT_OCULTO_KEY) === '1'
  );

  const ocultarHint = (e: MouseEvent) => {
    e.stopPropagation();
    setHintOculto(true);
    localStorage.setItem(HINT_OCULTO_KEY, '1');
  };

  // Referencia viva del utterance actual: si no la guardamos en algún lado,
  // Chrome a veces la recolecta con el garbage collector a la mitad y se
  // calla sin avisar. audioRef guarda el clip de ElevenLabs cuando ese sí
  // funciona, para poder pausarlo si se cierra la burbuja o se pide otro.
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const callarTodo = () => {
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
  };

  // Voz del navegador (gratis, siempre disponible) — se usa como respaldo
  // si la voz de ElevenLabs falla o tarda demasiado.
  const hablarConNavegador = (texto: string) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const decirYa = () => {
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-MX';
      utterance.pitch = 1.5;
      utterance.rate = 1.02;
      const voz = elegirVoz();
      if (voz) utterance.voice = voz;
      utteranceRef.current = utterance;
      synth.resume();
      synth.speak(utterance);
    };

    // Pedir cancel() cuando no hay nada sonando confunde a Chrome y el
    // siguiente speak() se queda mudo sin error — solo cancelamos si de
    // verdad hay algo en curso, y le damos un respiro antes de hablar.
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setTimeout(decirYa, 50);
    } else {
      decirYa();
    }
  };

  // Voz "de a de veras" de ElevenLabs, generada en el servidor (la API key
  // nunca sale de la función de Supabase). Si por lo que sea falla —sin
  // internet, cuota agotada, etc.— cae a la voz del navegador.
  const hablar = async (texto: string) => {
    callarTodo();
    try {
      const audio = await generarAudioElevenLabs(texto, voiceId);
      audioRef.current = audio;
      await audio.play();
    } catch {
      hablarConNavegador(texto);
    }
  };

  const handleClick = () => {
    const abriendo = !abierto;
    if (abriendo) {
      const opciones = frasesEstado.filter((f) => f !== frase);
      const nueva = opciones.length > 0 ? opciones[Math.floor(Math.random() * opciones.length)] : frasesEstado[0];
      setFrase(nueva);
      hablar(nueva);
    } else {
      callarTodo();
    }
    setAbierto(abriendo);
    setSaltando(true);
    setTimeout(() => setSaltando(false), 400);
  };

  useEffect(() => {
    return () => callarTodo();
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const t = setTimeout(() => {
      setAbierto(false);
      callarTodo();
    }, 9000);
    return () => clearTimeout(t);
  }, [abierto, frase]);

  return (
    <div className="mascot-widget">
      {abierto && (
        <div className="mascot-widget-bubble" role="status">
          <span className="mascot-widget-bubble-tail" aria-hidden="true" />
          <span>{frase}</span>
          <Link to="/greon" className="mascot-widget-bubble-link" onClick={() => setAbierto(false)}>
            Ir con Greon →
          </Link>
        </div>
      )}
      {!abierto && !hintOculto && (
        <div className="mascot-widget-hint">
          <span className="mascot-widget-hint-tail" />
          <button
            type="button"
            className="mascot-widget-hint-close"
            onClick={ocultarHint}
            aria-label="Ocultar este mensaje"
            title="Ocultar"
          >
            ✕
          </button>
          Púlsame para una recomendación
        </div>
      )}
      <div className="mascot-widget-row">
        <button
          type="button"
          className={`mascot-widget-btn${saltando ? ' bounce' : ''}`}
          onClick={handleClick}
          aria-label="Greon, la mascota de GreonTrack — dale clic para un consejo"
          title="¡Salúdame!"
        >
          <img src={mascota} alt="" className={`mascot-widget-img mascot-mood-${estado}`} />
          <span
            className={`mascot-mood-dot mascot-mood-dot-${estado}`}
            title={ETIQUETA_ESTADO[estado]}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
