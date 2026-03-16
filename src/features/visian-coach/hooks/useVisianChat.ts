import { useState, useCallback, useRef } from 'react';
import type { VisianMessage, VisianGameContext } from '../visianCoach.types';
import { VISIAN_FREE_HOURLY_LIMIT } from '../visianCoach.types';
import { visianCoachService } from '../visianCoach.service';

const GREETING_MESSAGE: VisianMessage = {
    id: 'greeting',
    role: 'visian',
    content: 'Chào! Bạn đang bí gì? Hỏi Visian về meta, comp, augment, item — mình sẽ tư vấn dựa trên data thật.',
    timestamp: Date.now(),
};

export function useVisianChat(
    gameContext: VisianGameContext | null,
    isProSupporter: boolean,
) {
    const [messages, setMessages] = useState<VisianMessage[]>([GREETING_MESSAGE]);
    const [isLoading, setIsLoading] = useState(false);
    const sendTimestamps = useRef<number[]>([]);

    const getRemainingQuestions = useCallback((): number => {
        if (isProSupporter) return Infinity;
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;
        sendTimestamps.current = sendTimestamps.current.filter(t => t > oneHourAgo);
        return Math.max(0, VISIAN_FREE_HOURLY_LIMIT - sendTimestamps.current.length);
    }, [isProSupporter]);

    const isRateLimited = useCallback((): boolean => {
        return getRemainingQuestions() <= 0;
    }, [getRemainingQuestions]);

    const sendMessage = useCallback(async (question: string) => {
        const trimmed = question.trim();
        if (!trimmed || isLoading) return;

        if (isRateLimited()) return;

        const userMsg: VisianMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: trimmed,
            timestamp: Date.now(),
            gameContext,
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        sendTimestamps.current.push(Date.now());

        try {
            const { answer } = await visianCoachService.askQuestion(trimmed, gameContext);
            const visianMsg: VisianMessage = {
                id: `visian-${Date.now()}`,
                role: 'visian',
                content: answer,
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, visianMsg]);
        } catch {
            const errorMsg: VisianMessage = {
                id: `error-${Date.now()}`,
                role: 'visian',
                content: 'Xin lỗi, Visian không thể trả lời lúc này. Thử lại sau nhé!',
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, isRateLimited, gameContext]);

    const clearChat = useCallback(() => {
        setMessages([GREETING_MESSAGE]);
    }, []);

    return {
        messages,
        isLoading,
        sendMessage,
        clearChat,
        getRemainingQuestions,
        isRateLimited,
    };
}
