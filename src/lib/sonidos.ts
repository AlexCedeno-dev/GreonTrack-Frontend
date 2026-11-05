// Sonidos chiquitos de "Mi casa", hechos con Web Audio (nada que descargar).
// Empiezan apagados: solo suenan si la persona los activa.

let contexto: AudioContext | null = null;

function ctx(): AudioContext | null {
  try {
    if (!contexto) {
      const Constructor =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Constructor) return null;
      contexto = new Constructor();
    }
    if (contexto.state === 'suspended') void contexto.resume();
    return contexto;
  } catch {
    return null;
  }
}

function nota(frecuencia: number, inicio: number, duracion: number, tipo: OscillatorType = 'sine', volumen = 0.07) {
  const c = ctx();
  if (!c) return;
  const osc = c.createOscillator();
  const ganancia = c.createGain();
  const t0 = c.currentTime + inicio;
  osc.type = tipo;
  osc.frequency.setValueAtTime(frecuencia, t0);
  ganancia.gain.setValueAtTime(0.0001, t0);
  ganancia.gain.exponentialRampToValueAtTime(volumen, t0 + 0.012);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);
  osc.connect(ganancia).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duracion + 0.02);
}

export const sonidos = {
  prender() {
    nota(520, 0, 0.12, 'triangle');
    nota(780, 0.07, 0.16, 'triangle');
  },
  apagar() {
    nota(660, 0, 0.1, 'triangle');
    nota(420, 0.07, 0.16, 'triangle');
  },
  agregar() {
    [392, 523, 659, 784].forEach((f, i) => nota(f, i * 0.06, 0.18, 'sine', 0.06));
  },
  quitar() {
    nota(300, 0, 0.18, 'sawtooth', 0.04);
    nota(200, 0.08, 0.2, 'sawtooth', 0.04);
  },
  panel() {
    [523, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.05, 0.22, 'sine', 0.05));
  },
  hola() {
    nota(700, 0, 0.09, 'square', 0.03);
    nota(900, 0.08, 0.12, 'square', 0.03);
  },
};
