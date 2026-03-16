import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    playCoachCompletionChime,
    resetCoachCompletionChimeForTests,
} from './coachCompletionChime';

class FakeGainNode {
    gain = {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
    };

    connect = vi.fn();
}

class FakeOscillatorNode {
    type: OscillatorType = 'sine';
    frequency = {
        setValueAtTime: vi.fn(),
    };
    detune = {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
    };

    connect = vi.fn();
    start = vi.fn();
    stop = vi.fn();
}

describe('coachCompletionChime', () => {
    beforeEach(() => {
        resetCoachCompletionChimeForTests();
        vi.restoreAllMocks();
        delete (window as Window & { AudioContext?: unknown }).AudioContext;
    });

    it('does nothing when Web Audio is unavailable', async () => {
        await expect(playCoachCompletionChime()).resolves.toBeUndefined();
    });

    it('schedules a layered hextech chime when AudioContext exists', async () => {
        const oscillators: FakeOscillatorNode[] = [];
        const gains: FakeGainNode[] = [];
        const resumeMock = vi.fn().mockResolvedValue(undefined);

        class FakeAudioContext {
            state: AudioContextState = 'running';
            currentTime = 2;
            destination = {};
            resume = resumeMock;
            createOscillator() {
                const oscillator = new FakeOscillatorNode();
                oscillators.push(oscillator);
                return oscillator as unknown as OscillatorNode;
            }
            createGain() {
                const gain = new FakeGainNode();
                gains.push(gain);
                return gain as unknown as GainNode;
            }
        }

        (window as Window & { AudioContext?: typeof AudioContext }).AudioContext =
            FakeAudioContext as unknown as typeof AudioContext;

        await playCoachCompletionChime();

        expect(oscillators).toHaveLength(4);
        expect(gains).toHaveLength(4);
        expect(oscillators[0].start).toHaveBeenCalledTimes(1);
        expect(oscillators[1].start).toHaveBeenCalledTimes(1);
        expect(oscillators[2].start).toHaveBeenCalledTimes(1);
        expect(oscillators[3].start).toHaveBeenCalledTimes(1);
        expect(oscillators[1].detune.linearRampToValueAtTime).toHaveBeenCalledTimes(1);
        expect(resumeMock).not.toHaveBeenCalled();
    });
});
