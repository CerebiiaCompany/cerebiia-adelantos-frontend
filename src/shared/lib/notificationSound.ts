// ⚠️ AGNOSTIC — sonidos de notificación (Web Audio API)

let audioContext: AudioContext | null = null;
let unlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextCtor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextCtor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextCtor();
  }

  return audioContext;
}

function playSilentUnlockBuffer(ctx: AudioContext): void {
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
}

/** Activa el audio del navegador (requerido tras login / primera interacción). */
export function unlockNotificationSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      return;
    }

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    if (!unlocked) {
      playSilentUnlockBuffer(ctx);
      unlocked = true;
    }
  } catch {
    // Autoplay policy
  }
}

function playTone(
  ctx: AudioContext,
  destination: AudioNode,
  frequency: number,
  startAt: number,
  duration: number,
  peakGain: number,
  wave: OscillatorType = "sine",
  attack = 0.012,
): void {
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();

  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, startAt);

  envelope.gain.setValueAtTime(0.0001, startAt);
  envelope.gain.exponentialRampToValueAtTime(peakGain, startAt + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(envelope);
  envelope.connect(destination);

  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

function playWithContext(run: (ctx: AudioContext, now: number) => void): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      return;
    }

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    run(ctx, ctx.currentTime);
  } catch {
    // Autoplay policy u otro bloqueo del navegador
  }
}

/** Soporte: dos notas ágiles, estilo mensaje (≈400 ms). */
export function playSupportNotificationSound(): void {
  playWithContext((ctx, now) => {
    const master = ctx.createGain();
    master.gain.setValueAtTime(1, now);
    master.connect(ctx.destination);

    playTone(ctx, master, 987.77, now, 0.11, 0.32, "triangle");
    playTone(ctx, master, 1318.51, now + 0.08, 0.3, 0.28, "triangle");
  });
}

/** General: campana suave pero claramente audible (≈650 ms). */
export function playGeneralNotificationSound(): void {
  playWithContext((ctx, now) => {
    const master = ctx.createGain();
    master.gain.setValueAtTime(1, now);
    master.connect(ctx.destination);

    playTone(ctx, master, 523.25, now, 0.62, 0.48, "triangle", 0.025);
    playTone(ctx, master, 659.25, now + 0.1, 0.48, 0.28, "sine", 0.03);
  });
}

/** @deprecated Usar playSupportNotificationSound */
export function playNotificationSound(): void {
  playSupportNotificationSound();
}

export function resetNotificationSoundState(): void {
  unlocked = false;
}
