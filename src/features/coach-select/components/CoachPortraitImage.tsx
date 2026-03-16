import React, { memo, useEffect, useState } from 'react';
import type { CoachProfile } from '../coachSelect.types';

interface CoachPortraitImageProps {
    coach: CoachProfile;
    alt: string;
    className: string;
    placeholderClassName: string;
    decorative?: boolean;
    testId?: string;
}

export const CoachPortraitImage: React.FC<CoachPortraitImageProps> = memo(({
    coach,
    alt,
    className,
    placeholderClassName,
    decorative = false,
    testId,
}) => {
    const [src, setSrc] = useState<string | null>(coach.imageSrc || coach.fallbackImageSrc || null);
    const [usedFallback, setUsedFallback] = useState(false);

    useEffect(() => {
        setSrc(coach.imageSrc || coach.fallbackImageSrc || null);
        setUsedFallback(false);
    }, [coach.id, coach.imageSrc, coach.fallbackImageSrc]);

    const handleError = () => {
        if (!usedFallback && coach.fallbackImageSrc && src !== coach.fallbackImageSrc) {
            setSrc(coach.fallbackImageSrc);
            setUsedFallback(true);
            return;
        }

        setSrc(null);
    };

    if (src) {
        return (
            <img
                data-testid={testId}
                className={className}
                src={src}
                alt={decorative ? '' : alt}
                decoding="async"
                draggable={false}
                onError={handleError}
            />
        );
    }

    return (
        <div
            data-testid={testId}
            className={placeholderClassName}
            aria-label={decorative ? undefined : alt}
        >
            <span>{coach.avatarText}</span>
        </div>
    );
});
