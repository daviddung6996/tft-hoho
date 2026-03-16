import { getVisianChatHeaders, getVisianChatUrl } from '../../lib/visianChat';
import type { VisianGameContext } from './visianCoach.types';

export const visianCoachService = {
    async askQuestion(
        question: string,
        gameContext: VisianGameContext | null,
    ): Promise<{ answer: string }> {
        const response = await fetch(getVisianChatUrl(), {
            method: 'POST',
            headers: getVisianChatHeaders(),
            body: JSON.stringify({
                coachId: 'visian',
                question,
                gameContext,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error('Visian chat error:', {
                status: response.status,
                errorText,
            });
            throw new Error('Visian khong the tra loi luc nay.');
        }

        const data = await response.json() as { answer?: unknown };
        const answer = typeof data.answer === 'string'
            ? data.answer.trim()
            : '';

        if (!answer) {
            console.error('Visian chat returned empty answer');
            throw new Error('Visian khong the tra loi luc nay.');
        }

        return { answer };
    },
};
