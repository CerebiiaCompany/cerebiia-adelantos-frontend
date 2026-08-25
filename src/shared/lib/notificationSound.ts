let audioContext: AudioContext | null = null;
let unlocked = false;

function getAudioContext(createIfMissing = true): AudioContext | null {
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

  if (!audioContext || audioContext.state === "closed") {
    if (!createIfMissing) return null;
    try {
      audioContext = new AudioContextCtor();
    } catch {
      return null;
    }
  }

  return audioContext;
}

function playSilentUnlockBuffer(ctx: AudioContext): void {
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    // Ignore unlock buffer errors
  }
}

/** Activa el audio del navegador (requerido tras login / primera interacción). */
export function unlockNotificationSound(): void {
  try {
    const ctx = getAudioContext(true);
    if (!ctx) {
      return;
    }

    if (ctx.state === "suspended") {
      ctx.resume().then(() => {
        playSilentUnlockBuffer(ctx);
        unlocked = true;
      }).catch(() => {
        // Autoplay policy pending user gesture
      });
      return;
    }

    if (ctx.state === "running") {
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
  attack = 0.015,
): void {
  const startTime = Math.max(startAt, ctx.currentTime) + 0.005;
  const attackEnd = startTime + attack;
  const stopTime = startTime + duration;

  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();

  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  envelope.gain.setValueAtTime(0.0001, startTime);
  envelope.gain.linearRampToValueAtTime(peakGain, attackEnd);
  envelope.gain.exponentialRampToValueAtTime(0.0001, stopTime);

  oscillator.connect(envelope);
  envelope.connect(destination);

  oscillator.start(startTime);
  oscillator.stop(stopTime + 0.05);
}

function playWithContext(run: (ctx: AudioContext, now: number) => void): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      return;
    }

    const execute = () => {
      try {
        const now = ctx.currentTime;
        run(ctx, now);
      } catch {
        // audio node error
      }
    };

    if (ctx.state === "suspended") {
      void ctx.resume().then(execute).catch(() => {});
      return;
    }

    execute();
  } catch {
    // Autoplay policy u otro bloqueo del navegador
  }
}

/** Soporte: dos notas ágiles, estilo mensaje (≈400 ms). */
export function playSupportNotificationSound(): void {
  playWithContext((ctx, now) => {
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.9, now);
    master.connect(ctx.destination);

    playTone(ctx, master, 987.77, now, 0.12, 0.45, "triangle", 0.012);
    playTone(ctx, master, 1318.51, now + 0.08, 0.32, 0.4, "triangle", 0.012);
  });
}

/** General: campana clara y agradable (≈650 ms). */
export function playGeneralNotificationSound(): void {
  playWithContext((ctx, now) => {
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.9, now);
    master.connect(ctx.destination);

    playTone(ctx, master, 523.25, now, 0.62, 0.5, "triangle", 0.025);
    playTone(ctx, master, 659.25, now + 0.1, 0.48, 0.38, "sine", 0.03);
  });
}

/** @deprecated Usar playSupportNotificationSound */
export function playNotificationSound(): void {
  playSupportNotificationSound();
}

export function resetNotificationSoundState(): void {
  unlocked = false;
}
