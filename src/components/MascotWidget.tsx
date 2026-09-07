import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import mascota from '../assets/mascota-greon-sm.png';
import { useAccessibility } from '../context/AccessibilityContext';
import { generarAudioElevenLabs } from '../lib/voces';

// La nube invitando a picarle se puede cerrar con la "x" — queda oculta
// para siempre en este navegador, no solo por hoy.
const HINT_OCULTO_KEY = 'greontrack-mascot-hint-oculto';

const FRASES = [
  '¡Hola! Soy Greon 🌍 — cada dato que registras ayuda a cuidar el planeta.',
  '¿Sabías que reducir 1 hora de uso al día en tu dispositivo de mayor consumo sí se nota al mes?',
  'Desconecta los cargadores que no estés usando — el consumo fantasma suma al final del mes.',
  'Revisa tu Huella de carbono para ver a cuántos árboles equivale tu ahorro.',
  '¡Pequeñas acciones, grandes cambios! Así cuidamos el planeta juntos.',
  'No necesitas cambios drásticos: la constancia registrando tu uso es lo que más ayuda.',
  '¿Ya viste tus Recomendaciones? Hay ahorro estimado esperando por ti.',
];

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
  const [abierto, setAbierto] = useState(false);
  const [frase, setFrase] = useState(FRASES[0]);
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
      const opciones = FRASES.filter((f) => f !== frase);
      const nueva = opciones[Math.floor(Math.random() * opciones.length)];
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
          <img src={mascota} alt="" className="mascot-widget-img" />
        </button>
      </div>
    </div>
  );
}
