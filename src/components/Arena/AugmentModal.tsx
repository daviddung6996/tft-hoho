import React, { useRef } from 'react';
import './AugmentModal.css';

import { AugmentData } from '../../services/augmentService';
import { PuzzleTier } from '../../features/tcoin/tcoin.types';
import { TierIcon } from '../common/TierIcon';

// Duration must match CSS keyframe durations
const SWEEP_DURATION: Record<string, number> = {
    advanced: 5000,
    rare: 4000,
};

interface AugmentCardProps extends AugmentData {
    onReroll: () => void;
    isRerolled: boolean;
    onSelect: () => void;
    puzzleTier?: PuzzleTier;
}

const AugmentCard: React.FC<AugmentCardProps> = ({ title, description, icon, tier, onReroll, isRerolled, onSelect, puzzleTier = 'free' }) => {
    // Compute phase-aligned animationDelay once at mount.
    // Uses performance.now() so every card — including re-rendered ones after roll —
    // joins the SAME global animation timeline instead of restarting from 0.
    const delayRef = useRef<string>((() => {
        const duration = SWEEP_DURATION[puzzleTier] ?? 5000;
        const phase = performance.now() % duration;
        return `-${phase}ms`;
    })());

    const cardStyle = (puzzleTier === 'advanced' || puzzleTier === 'rare')
        ? { animationDelay: delayRef.current } as React.CSSProperties
        : undefined;

    return (
        <div className="augment-column">
            <div className={`augment-card tier-${tier}`} onClick={onSelect} style={cardStyle}>
                <div className="augment-content">
                    <div className="augment-icon-container">
                        <img src={icon} alt={title} className="augment-icon" />
                    </div>

                    <h3 className="augment-title">{title}</h3>
                    <p className="augment-description">{description}</p>
                </div>
            </div>

            <div className="reroll-container">
                <button
                    className={`reroll-btn ${isRerolled ? 'disabled' : ''}`}
                    onClick={onReroll}
                    disabled={isRerolled}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M23 4v6h-6"></path>
                        <path d="M1 20v-6h6"></path>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
};

// Props for the Modal (State Lifted Up)
interface AugmentModalProps {
    currentAugments: AugmentData[];
    rerollOrder: number[];
    secondRerollOrder?: number[];
    rollChargesRemaining?: number;
    onReroll: (index: number) => void;
    onSelect: (augment: AugmentData) => void;
    allPuzzlesCompleted?: boolean;
    puzzleTier?: PuzzleTier;
}

export const AugmentModal: React.FC<AugmentModalProps> = ({ currentAugments, rerollOrder, secondRerollOrder = [0, 0, 0], rollChargesRemaining, onReroll, onSelect, allPuzzlesCompleted, puzzleTier = 'free' }) => {
    // Filter nulls and limit to exactly 3 augments
    const validAugments = currentAugments.filter((a): a is AugmentData => a !== null).slice(0, 3);

    return (
        <div className={`augment-modal-overlay tier-${puzzleTier}`}>
            {puzzleTier !== 'free' && (
                <div className="augment-tier-badge">
                    <TierIcon tier={puzzleTier} size={20} />
                    <span className={`augment-tier-label tier-${puzzleTier}`}>
                        {puzzleTier === 'advanced' ? 'Tình huống nâng cao' : 'Tình huống hiếm'}
                    </span>
                </div>
            )}
            <h2 className="augment-header-title">
                {allPuzzlesCompleted ? 'Bạn đang giải lại tình huống cũ' : 'Chọn một'}
            </h2>

            <div className="augment-cards-container">
                {validAugments.map((augment, index) => {
                    // Slot is fully rerolled when second reroll used, OR first rerolled with no charges left
                    const isRerolled = (secondRerollOrder[index] ?? 0) > 0
                        || ((rerollOrder[index] ?? 0) > 0 && (rollChargesRemaining ?? 1) === 0);
                    return (
                        <AugmentCard
                            key={`slot-${index}-${augment.id}`}
                            id={augment.id}
                            tier={augment.tier}
                            title={augment.title}
                            description={augment.description}
                            icon={augment.icon}
                            puzzleTier={puzzleTier}
                            onReroll={() => onReroll(index)}
                            isRerolled={isRerolled}
                            onSelect={() => onSelect(augment)}
                        />
                    );
                })}
            </div>
        </div>
    );
};
