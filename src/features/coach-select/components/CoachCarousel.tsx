import React, { memo, useCallback } from 'react';
import type { CoachId, CoachProfile } from '../coachSelect.types';
import { CoachPortraitImage } from './CoachPortraitImage';

interface CoachCarouselProps {
    coaches: CoachProfile[];
    selectedCoachId: CoachId;
    onSelect: (coachId: CoachId) => void;
    disabled?: boolean;
}

interface CoachCarouselItemProps {
    coach: CoachProfile;
    isSelected: boolean;
    isDisabled: boolean;
    orderLabel: string;
    onSelect: (coachId: CoachId) => void;
}

const CoachCarouselItem: React.FC<CoachCarouselItemProps> = memo(({
    coach,
    isSelected,
    isDisabled,
    orderLabel,
    onSelect,
}) => {
    const handleClick = useCallback(() => {
        onSelect(coach.id);
    }, [coach.id, onSelect]);

    return (
        <button
            type="button"
            className={`coach-carousel__item${isSelected ? ' is-active' : ''}`}
            style={{ ['--coach-card-accent' as string]: coach.accentColor }}
            onClick={handleClick}
            aria-label={`Chọn coach ${coach.displayName}`}
            aria-pressed={isSelected}
            disabled={isDisabled}
        >
            <div className="coach-carousel__thumb">
                <CoachPortraitImage
                    coach={coach}
                    className="coach-carousel__portrait"
                    placeholderClassName="coach-carousel__portrait coach-carousel__portrait--fallback"
                    alt={coach.displayName}
                    decorative
                />
            </div>
            <span className="coach-carousel__name">{coach.displayName}</span>
            {isSelected && <span className="coach-carousel__marker" aria-hidden="true" />}
            <span className="coach-carousel__order">{orderLabel}</span>
        </button>
    );
});

export const CoachCarousel: React.FC<CoachCarouselProps> = memo(({
    coaches,
    selectedCoachId,
    onSelect,
    disabled = false,
}) => {
    return (
        <div className="coach-carousel" role="tablist" aria-label="Danh sách coach">
            {coaches.map((coach, index) => (
                <CoachCarouselItem
                    key={coach.id}
                    coach={coach}
                    isSelected={coach.id === selectedCoachId}
                    isDisabled={disabled}
                    orderLabel={String(index + 1).padStart(2, '0')}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
});
