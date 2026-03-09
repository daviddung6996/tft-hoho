import { useCallback, useEffect, useRef } from 'react';
import { isFullscreenActive, requestDocumentFullscreenSafe } from '../utils/fullscreen';

interface UseMobileAutoFullscreenOptions {
    enabled: boolean;
}

export const useMobileAutoFullscreen = ({ enabled }: UseMobileAutoFullscreenOptions) => {
    const hasAttemptedRef = useRef(false);
    const isAttemptingRef = useRef(false);

    useEffect(() => {
        if (!enabled) {
            hasAttemptedRef.current = false;
            isAttemptingRef.current = false;
            return;
        }

        if (isFullscreenActive()) {
            hasAttemptedRef.current = true;
        }
    }, [enabled]);

    return useCallback(() => {
        if (!enabled || hasAttemptedRef.current || isAttemptingRef.current || isFullscreenActive()) {
            return;
        }

        hasAttemptedRef.current = true;
        isAttemptingRef.current = true;

        void requestDocumentFullscreenSafe().finally(() => {
            isAttemptingRef.current = false;
        });
    }, [enabled]);
};
