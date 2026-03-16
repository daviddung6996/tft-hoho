import React, { memo, useEffect, useState } from 'react';
import type { CoachHeroMode, CoachProfile } from '../coachSelect.types';

export type ResolvedCoachHeroMode = CoachHeroMode | 'art-fallback' | 'placeholder';

interface CoachHeroPortraitProps {
    coach: CoachProfile;
    alt: string;
    testId?: string;
    onModeResolved?: (mode: ResolvedCoachHeroMode) => void;
}

export const CoachHeroPortrait: React.FC<CoachHeroPortraitProps> = memo(({
    coach,
    alt,
    testId,
    onModeResolved,
}) => {
    const heroMode = coach.heroPresentation?.mode ?? 'art';
    const primarySrc = coach.heroImageSrc || coach.imageSrc || null;
    const fallbackSrc = coach.heroFallbackImageSrc || coach.fallbackImageSrc || null;
    const [src, setSrc] = useState<string | null>(primarySrc || fallbackSrc || null);
    const [usedFallback, setUsedFallback] = useState(!primarySrc && !!fallbackSrc);

    useEffect(() => {
        setSrc(primarySrc || fallbackSrc || null);
        setUsedFallback(!primarySrc && !!fallbackSrc);
    }, [coach.id, fallbackSrc, primarySrc]);

    useEffect(() => {
        if (!onModeResolved) {
            return;
        }

        if (!src) {
            onModeResolved('placeholder');
            return;
        }

        if (usedFallback && heroMode === 'pose') {
            onModeResolved('art-fallback');
            return;
        }

        onModeResolved(heroMode);
    }, [heroMode, onModeResolved, src, usedFallback]);

    const handleError = () => {
        if (!usedFallback && fallbackSrc && src !== fallbackSrc) {
            setSrc(fallbackSrc);
            setUsedFallback(true);
            return;
        }

        setSrc(null);
    };

    if (src) {
        return (
            <img
                data-testid={testId}
                className="coach-select-portrait coach-hero-portrait__img"
                src={src}
                alt={alt}
                decoding="async"
                draggable={false}
                onError={handleError}
            />
        );
    }

    return (
        <div
            data-testid={testId}
            className="coach-select-portrait coach-select-portrait--fallback coach-hero-portrait__placeholder"
            aria-label={alt}
        >
            <span>{coach.avatarText}</span>
        </div>
    );
});
