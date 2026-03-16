let audioContextRef: AudioContext | null = null;
let lastChimeAt = 0;

type WebAudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): WebAudioContextCtor | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const contextCtor = window.AudioContext
        ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        ?? null;

    return contextCtor;
}

function getAudioContextInstance(): AudioContext | null {
    if (audioContextRef) {
        return audioContextRef;
    }

    const AudioContextCtor = getAudioContextCtor();
    if (!AudioContextCtor) {
        return null;
    }

    audioContextRef = new AudioContextCtor();
    return audioContextRef;
}

function scheduleTone(
    context: AudioContext,
    startAt: number,
    frequency: number,
    duration: number,
    gainPeak: number,
    type: OscillatorType,
    detune = 0,
    pitchBendCents = 0,
) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    oscillator.detune.setValueAtTime(detune, startAt);

    if (pitchBendCents !== 0) {
        oscillator.detune.linearRampToValueAtTime(detune + pitchBendCents, startAt + duration);
    }

    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(gainPeak, startAt + 0.012);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.03);
}

export async function playCoachCompletionChime(): Promise<void> {
    const now = Date.now();
    if (now - lastChimeAt < 500) {
        return;
    }

    const context = getAudioContextInstance();
    if (!context) {
        return;
    }

    try {
        if (context.state === 'suspended') {
            await context.resume();
        }
    } catch {
        return;
    }

    const startAt = context.currentTime + 0.01;
    // Hextech-style crystalline cue: a soft sub-bed, bright core note,
    // then two higher sparkles with slight pitch lift for a more arcane feel.
    scheduleTone(context, startAt, 392, 0.16, 0.011, 'triangle', 0, 10);
    scheduleTone(context, startAt + 0.018, 783.99, 0.19, 0.024, 'triangle', 0, 18);
    scheduleTone(context, startAt + 0.082, 1174.66, 0.17, 0.016, 'sine', 2, 24);
    scheduleTone(context, startAt + 0.138, 1567.98, 0.14, 0.01, 'sine', -3, 30);
    lastChimeAt = now;
}

export function resetCoachCompletionChimeForTests() {
    audioContextRef = null;
    lastChimeAt = 0;
}
