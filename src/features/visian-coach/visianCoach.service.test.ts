import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { visianCoachService } from './visianCoach.service';

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
let fetchMock: ReturnType<typeof vi.fn>;

describe('visianCoachService', () => {
    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        vi.unstubAllGlobals();
    });

    it('posts the chat request to visian-chat', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({
            answer: 'Len cap va giu mau round nay.',
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        }));

        const result = await visianCoachService.askQuestion('Nen roll hay len cap?', {
            stage: '3-2',
            gold: 24,
            level: 6,
            hp: 70,
            augments: ['Kinh te', 'Trang bi'],
            synergies: ['Sentinel'],
            boardChampions: ['Illaoi', 'Maddie'],
            items: ['Sword', 'Bow'],
            previousAugment: 'Kinh te',
        });

        expect(result).toEqual({
            answer: 'Len cap va giu mau round nay.',
        });
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/functions/v1/visian-chat'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    coachId: 'visian',
                    question: 'Nen roll hay len cap?',
                    gameContext: {
                        stage: '3-2',
                        gold: 24,
                        level: 6,
                        hp: 70,
                        augments: ['Kinh te', 'Trang bi'],
                        synergies: ['Sentinel'],
                        boardChampions: ['Illaoi', 'Maddie'],
                        items: ['Sword', 'Bow'],
                        previousAugment: 'Kinh te',
                    },
                }),
            }),
        );
    });

    it('throws when visian-chat returns an error', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({
            error: 'boom',
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        }));

        await expect(visianCoachService.askQuestion('Hoi gi do', null)).rejects.toThrow(
            'Visian khong the tra loi luc nay.',
        );
    });
});
