import React, { memo } from 'react';
import type { CoachGameContext } from '../coachSelect.types';

interface CoachContextBarProps {
    gameContext: CoachGameContext | null;
}

const CoachAugmentIcon: React.FC = () => (
    <svg
        className="coach-context-augment__icon-svg"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <path
            d="M8.8 4.4L16.6 5.8L14.8 16L7 14.6L8.8 4.4Z"
            fill="rgba(8, 20, 28, 0.9)"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
        />
        <path
            d="M5.2 7.1L13.6 8.7L11.6 19.6L3.2 18L5.2 7.1Z"
            fill="rgba(0, 209, 193, 0.12)"
            stroke="currentColor"
            strokeWidth="1.15"
            strokeLinejoin="round"
        />
        <path
            d="M8.3 11.1H11.1M9.7 9.7V12.5"
            stroke="#f8fafc"
            strokeWidth="1.1"
            strokeLinecap="round"
        />
    </svg>
);

export const CoachContextBar: React.FC<CoachContextBarProps> = memo(({ gameContext }) => {
    if (!gameContext) {
        return null;
    }

    const decisionType = gameContext.decisionType ?? 'augment';
    const decisionLabel = gameContext.decisionLabel
        ?? (decisionType === 'path'
            ? 'Hướng augment'
            : decisionType === 'plan'
                ? 'Kế hoạch'
                : 'Hướng Augment');
    const optionSlots = [
        ...(
            gameContext.currentDecisionOptions?.slice(0, 4)
            ?? gameContext.currentAugmentOptions?.slice(0, 4)
            ?? []
        ),
    ];

    while (decisionType === 'augment' && optionSlots.length < Math.min(3, gameContext.currentAugments.length)) {
        const nextTitle = gameContext.currentAugments[optionSlots.length];
        optionSlots.push({
            id: `fallback-${optionSlots.length}`,
            title: nextTitle,
            icon: '',
            tier: 1,
        });
    }

    const targetSlotCount = decisionType === 'augment' ? 3 : 4;

    while (optionSlots.length < targetSlotCount) {
        optionSlots.push({
            id: `placeholder-${optionSlots.length}`,
            title: decisionType === 'path'
                ? 'Đang cập nhật hướng'
                : decisionType === 'plan'
                    ? 'Đang cập nhật kế hoạch'
                    : 'Đang cập nhật augment',
            icon: '',
            tier: 1,
        });
    }

    return (
        <div className="coach-context-bar">
            <div className="coach-context-bar__meta">
                <div className="coach-context-chip">
                    <span className="coach-context-chip__label">Round</span>
                    <span className="coach-context-chip__value">{gameContext.stage}</span>
                </div>
                <div className="coach-context-chip">
                    <span className="coach-context-chip__label">Comp</span>
                    <span className="coach-context-chip__value">{gameContext.comp}</span>
                </div>
                <div className="coach-context-chip">
                    <span className="coach-context-chip__label">HP</span>
                    <span className="coach-context-chip__value">{gameContext.hp}</span>
                </div>
                <div className="coach-context-chip">
                    <span className="coach-context-chip__label">Vàng</span>
                    <span className="coach-context-chip__value">{gameContext.gold}</span>
                </div>
                <div className="coach-context-chip">
                    <span className="coach-context-chip__label">Lv</span>
                    <span className="coach-context-chip__value">{gameContext.level}</span>
                </div>
            </div>

            <div className="coach-context-bar__choices">
                <div className="coach-context-bar__choices-label">{decisionLabel}</div>
                <div className={decisionType === 'augment' ? 'coach-context-bar__augments' : 'coach-context-bar__decisions'}>
                    {optionSlots.map((option, index) => (
                        <div
                            key={`${option.id}-${index}`}
                            className={decisionType === 'augment' ? 'coach-context-augment' : 'coach-context-decision'}
                        >
                            {decisionType === 'augment' && (
                                <span className="coach-context-augment__icon" aria-hidden="true">
                                    {option.icon ? (
                                        <img
                                            src={option.icon}
                                            alt=""
                                            className="coach-context-augment__icon-img"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <CoachAugmentIcon />
                                    )}
                                </span>
                            )}
                            <span className="coach-context-decision__copy">
                                <span className="coach-context-augment__name">{option.title}</span>
                                {decisionType !== 'augment' && option.subtitle && (
                                    <span className="coach-context-decision__subtitle">{option.subtitle}</span>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});
