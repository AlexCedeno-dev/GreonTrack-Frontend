import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import mascota from '../assets/mascota-greon-sm.png';

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

function elegirVoz(): SpeechSynthesisVoice | null {
  const voces = window.speechSynthesis.getVoices();
  if (voces.length === 0) return null;
  for (const nombre of VOCES_PREFERIDAS) {
    const encontrada = voces.find((v) => v.name.includes(nombre));
    if (encontrada) return encontrada;
  }
  return voces.find((v) => v.lang.startsWith('es')) ?? null;
}

export function MascotWidget() {
  const [abierto, setAbierto] = useState(false);
  const [frase, setFrase] = useState(FRASES[0]);
  const [saltando, setSaltando] = useState(false);

  // Referencia viva del utterance actual: si no la guardamos en algún lado,
  // Chrome a veces la recolecta con el garbage collector a la mitad y se
  // calla sin avisar.
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const hablar = (texto: string) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const decirYa = () => {
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-MX';
      utterance.pitch = 1.2;
      utterance.rate = 0.95;
      const voz = elegirVoz();
      if (voz) utterance.voice = voz;
      utteranceRef.current = utterance;
      synth.resume();
      synth.speak(utterance);
    };

    // Pedir cancel() cuando no hay nada sonando (por ejemplo, en el primer
    // clic) confunde a Chrome y el siguiente speak() se queda mudo sin
    // error — solo cancelamos si de verdad hay algo en curso, y le damos
    // un respiro antes de hablar de nuevo.
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setTimeout(decirYa, 50);
    } else {
      decirYa();
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
      window.speechSynthesis?.cancel();
    }
    setAbierto(abriendo);
    setSaltando(true);
    setTimeout(() => setSaltando(false), 400);
  };

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const t = setTimeout(() => {
      setAbierto(false);
      window.speechSynthesis?.cancel();
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
  );
}
