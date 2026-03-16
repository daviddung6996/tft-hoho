import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { coachSelectService } from './coachSelect.service';
import type { CoachStreamEvent } from './coachSelect.types';

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
let fetchMock: ReturnType<typeof vi.fn>;

function createEventStreamResponse(chunks: string[], init?: ResponseInit): Response {
    const encoder = new TextEncoder();

    return new Response(new ReadableStream({
        start(controller) {
            chunks.forEach(chunk => controller.enqueue(encoder.encode(chunk)));
            controller.close();
        },
    }), {
        status: 200,
        headers: {
            'Content-Type': 'text/event-stream',
        },
        ...init,
    });
}

describe('coachSelectService', () => {
    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        vi.unstubAllGlobals();
    });

    it('sends the expected JSON payload to visian-chat', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({
            answer: 'Featherweights III. Tempo tot cho board nay.',
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }));

        await coachSelectService.askCoach('visian', 'question', {
            stage: '2-1',
            comp: 'Bruiser / Sniper',
            gold: 30,
            level: 4,
            hp: 92,
            decisionType: 'augment',
            currentAugments: ['A', 'B', 'C'],
            chosenAugments: ['Starter Kit'],
            synergies: ['Bruiser'],
            boardChampions: ['Maddie', 'Steb'],
            items: ['Sword'],
        });

        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/functions/v1/visian-chat'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    coachId: 'visian',
                    question: 'question',
                    gameContext: {
                        stage: '2-1',
                        comp: 'Bruiser / Sniper',
                        gold: 30,
                        level: 4,
                        hp: 92,
                        decisionType: 'augment',
                        currentAugments: ['A', 'B', 'C'],
                        chosenAugments: ['Starter Kit'],
                        synergies: ['Bruiser'],
                        boardChampions: ['Maddie', 'Steb'],
                        items: ['Sword'],
                    },
                    mode: 'coach_select',
                }),
            }),
        );
    });

    it('parses SSE pick, status, chunk, and complete events in order', async () => {
        const events: CoachStreamEvent[] = [];
        fetchMock.mockResolvedValue(createEventStreamResponse([
            'event: pick\ndata: {"pick":"Component Grab Bag","pickId":"aug-123"}\n\n',
            'event: status\ndata: {"phase":"thinking"}\n\n',
            'event: upstream_chunk\ndata: {"text":"Vi board dang yeu [1]"}\n\n',
            'event: status\ndata: {"phase":"explaining"}\n\n',
            'event: reasoning_chunk\ndata: {"text":"Vi board dang yeu"}\n\n',
            'event: reasoning_chunk\ndata: {"text":" va can tempo som."}\n\n',
            'event: complete\ndata: {"reasoning":"Tai sao: Vi board dang yeu va can tempo som."}\n\n',
        ]));

        await coachSelectService.streamCoachExplanation(
            'visian',
            'question',
            {
                stage: '2-1',
                comp: 'Bruiser / Sniper',
                gold: 10,
                level: 4,
                hp: 100,
                decisionType: 'augment',
                proChoiceId: 'aug-123',
                proChoiceLabel: 'Component Grab Bag',
                currentAugments: ['A', 'B', 'C'],
                chosenAugments: [],
                synergies: [],
                boardChampions: [],
                items: [],
            },
            event => {
                events.push(event);
            },
        );

        expect(events).toEqual([
            { type: 'pick', pick: 'Component Grab Bag', pickId: 'aug-123' },
            { type: 'status', phase: 'thinking' },
            { type: 'upstream_chunk', text: 'Vi board dang yeu [1]' },
            { type: 'status', phase: 'explaining' },
            { type: 'reasoning_chunk', text: 'Vi board dang yeu' },
            { type: 'reasoning_chunk', text: ' va can tempo som.' },
            { type: 'complete', reasoning: 'Tai sao: Vi board dang yeu va can tempo som.' },
        ]);
    });

    it('accepts a legacy JSON response when the deployed edge function has not switched to SSE yet', async () => {
        const events: CoachStreamEvent[] = [];
        fetchMock.mockResolvedValue(new Response(JSON.stringify({
            answer: 'Featherweights III. Backend dang tra JSON nen client phai tu compat.',
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        }));

        await coachSelectService.streamCoachExplanation(
            'visian',
            'question',
            {
                stage: '3-2',
                comp: 'Flex',
                gold: 20,
                level: 6,
                hp: 80,
                decisionType: 'augment',
                proChoiceId: 'component-grab-bag',
                proChoiceLabel: 'Component Grab Bag',
                currentAugments: ['Component Grab Bag', 'Hedge Fund', 'Jeweled Lotus II'],
                chosenAugments: [],
                synergies: [],
                boardChampions: [],
                items: [],
            },
            event => {
                events.push(event);
            },
        );

        expect(events).toEqual([
            {
                type: 'complete',
                reasoning: 'Featherweights III. Backend dang tra JSON nen client phai tu compat.',
            },
        ]);
    });

    it('throws a coach unavailable error when the stream transport fails before events start', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: 'boom' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        }));

        await expect(coachSelectService.streamCoachExplanation(
            'buffalow',
            'question',
            {
                stage: '3-2',
                comp: 'Bruiser / Sniper',
                gold: 18,
                level: 6,
                hp: 51,
                decisionType: 'path',
                proChoiceId: 'econ',
                proChoiceLabel: 'Kinh te',
                currentDecisionOptions: [
                    { id: 'econ', title: 'Kinh te' },
                    { id: 'item', title: 'Trang bi' },
                    { id: 'combat', title: 'Danh nhau' },
                    { id: 'emblem', title: 'An' },
                ],
                currentAugments: ['Jeweled Lotus II', 'Hedge Fund', 'Component Grab Bag'],
                chosenAugments: ['Starter Kit'],
                synergies: ['Bruiser'],
                boardChampions: ['Maddie', 'Steb'],
                items: ['Sword'],
            },
            vi.fn(),
        )).rejects.toThrow('Buffalow đang bận train, thử lại sau nha.');
    });

    it('passes through stream error events so backward-compatible consumers can handle them', async () => {
        const events: CoachStreamEvent[] = [];
        fetchMock.mockResolvedValue(createEventStreamResponse([
            'event: pick\ndata: {"pick":"Kinh te","pickId":"econ"}\n\n',
            'event: error\ndata: {"message":"Coach đang bận train, thử lại sau nha."}\n\n',
        ]));

        await coachSelectService.streamCoachExplanation(
            'visian',
            'question',
            {
                stage: '3-2',
                comp: 'Flex',
                gold: 20,
                level: 6,
                hp: 80,
                decisionType: 'path',
                proChoiceId: 'econ',
                proChoiceLabel: 'Kinh te',
                currentDecisionOptions: [{ id: 'econ', title: 'Kinh te' }],
                currentAugments: [],
                chosenAugments: [],
                synergies: [],
                boardChampions: [],
                items: [],
            },
            event => {
                events.push(event);
            },
        );

        expect(events).toEqual([
            { type: 'pick', pick: 'Kinh te', pickId: 'econ' },
            { type: 'error', message: 'Coach đang bận train, thử lại sau nha.' },
        ]);
    });

    it('throws a coach unavailable error when the request throws', async () => {
        fetchMock.mockRejectedValue(new Error('network down'));

        await expect(coachSelectService.askCoach('visian', 'question', {
            stage: '2-1',
            comp: 'Faerie / Mage',
            gold: 30,
            level: 4,
            hp: 88,
            decisionType: 'augment',
            currentAugments: ['Component Grab Bag', 'Hedge Fund', 'Ascension'],
            chosenAugments: [],
            synergies: ['Mage'],
            boardChampions: ['Lux'],
            items: ['Rod'],
        })).rejects.toThrow('Visian đang bận train, thử lại sau nha.');
    });

    it('throws a coach unavailable error when the edge function returns an empty answer', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({
            answer: '   ',
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }));

        await expect(coachSelectService.askCoach('one_by_one', 'question', {
            stage: '4-2',
            comp: 'Sentinel / Flex',
            gold: 12,
            level: 8,
            hp: 37,
            decisionType: 'plan',
            currentDecisionOptions: [
                { id: 'stabilize', title: 'Choi top 4' },
                { id: 'cap', title: 'Choi top cao' },
                { id: 'patch', title: 'Fix item lai cho dep' },
                { id: 'greed', title: 'Choi Loto' },
            ],
            currentAugments: ['A', 'B', 'C'],
            chosenAugments: [],
            synergies: ['Sentinel'],
            boardChampions: ['Illaoi'],
            items: ['Belt'],
        })).rejects.toThrow('1by1 đang bận train, thử lại sau nha.');
    });
});
