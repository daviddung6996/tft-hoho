import React from 'react';
import './AugmentModal.css';

import { AugmentData } from '../../services/augmentService';

interface AugmentCardProps extends AugmentData {
    onReroll: () => void;
    isRerolled: boolean;
    onSelect: () => void;
}

const AugmentCard: React.FC<AugmentCardProps> = ({ title, description, icon, rarity, onReroll, isRerolled, onSelect }) => {
    return (
        <div className="augment-column">
            <div className={`augment-card rarity-${rarity}`} onClick={onSelect}>
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
    onReroll: (index: number) => void;
    onSelect: (augment: AugmentData) => void;
}

export const AugmentModal: React.FC<AugmentModalProps> = ({ currentAugments, rerollOrder, onReroll, onSelect }) => {
    // Filter nulls and limit to exactly 3 augments
    const validAugments = currentAugments.filter((a): a is AugmentData => a !== null).slice(0, 3);

    return (
        <div className="augment-modal-overlay">
            <h2 className="augment-header-title">Chọn một</h2>

            <div className="augment-cards-container">
                {validAugments.map((augment, index) => (
                    <AugmentCard
                        key={`slot-${index}-${augment.id}`}
                        id={augment.id}
                        tier={augment.tier}
                        title={augment.title}
                        description={augment.description}
                        icon={augment.icon}
                        rarity={augment.rarity}
                        onReroll={() => onReroll(index)}
                        isRerolled={(rerollOrder[index] ?? 0) > 0}
                        onSelect={() => onSelect(augment)}
                    />
                ))}
            </div>
        </div>
    );
};
