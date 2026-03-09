import React from 'react';
import './AugmentButton.css';

interface AugmentButtonProps {
    isActive: boolean;
    onClick: () => void;
    variant?: 'default' | 'return';
    needsScouting?: boolean;
    rollChargesRemaining?: number;
}

const AugmentPrismIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer hexagonal shape */}
        <polygon
            points="16,2 28,9 28,23 16,30 4,23 4,9"
            fill="#8c7a58"
            stroke="#c8aa6e"
            strokeWidth="0.8"
        />
        {/* Top-left facet */}
        <polygon points="16,2 4,9 16,16" fill="#d4c4a0" opacity="0.9" />
        {/* Top-right facet */}
        <polygon points="16,2 28,9 16,16" fill="#b8a47a" opacity="0.9" />
        {/* Left facet */}
        <polygon points="4,9 4,23 16,16" fill="#c0a87c" opacity="0.85" />
        {/* Right facet */}
        <polygon points="28,9 28,23 16,16" fill="#917a54" opacity="0.85" />
        {/* Bottom-left facet */}
        <polygon points="4,23 16,30 16,16" fill="#a08e68" opacity="0.8" />
        {/* Bottom-right facet */}
        <polygon points="28,23 16,30 16,16" fill="#7a6a4a" opacity="0.8" />
        {/* Inner highlight - top diamond */}
        <polygon points="16,6 22,12 16,16 10,12" fill="#F0E6D2" opacity="0.35" />
        {/* Center glow */}
        <circle cx="16" cy="16" r="3" fill="#F0E6D2" opacity="0.25" />
        {/* Edge highlights */}
        <line x1="16" y1="2" x2="4" y2="9" stroke="#e0d0b0" strokeWidth="0.5" opacity="0.4" />
        <line x1="16" y1="2" x2="28" y2="9" stroke="#d4c4a0" strokeWidth="0.5" opacity="0.3" />
    </svg>
);

export const AugmentButton: React.FC<AugmentButtonProps> = ({ isActive, onClick, variant = 'default', needsScouting = false, rollChargesRemaining }) => {
    const showRollBadge = rollChargesRemaining !== undefined && rollChargesRemaining > 0;
    return (
        <div className="augment-button-container">
            {needsScouting && (
                <div className="scout-hint">
                    <span className="scout-hint-text">Bắt đầu quan sát board</span>
                    <div className="scout-hint-arrow" />
                </div>
            )}
            <button
                className={`augment-button ${isActive ? 'active' : ''} ${needsScouting ? 'needs-scouting' : ''}`}
                onClick={onClick}
                aria-label={variant === 'return' ? 'Return to board' : 'Toggle augment panel'}
            >
                <div className="augment-button-content">
                    {variant === 'return' ? (
                        <AugmentPrismIcon />
                    ) : (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H16C17.1 21 18 20.1 18 19V5C18 3.9 17.1 3 16 3Z"
                                fill="currentColor" fillOpacity="0.8" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M21 5V19C21 20.1 20.1 21 19 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    )}
                </div>
                {showRollBadge && (
                    <span className="augment-button-roll-badge">{rollChargesRemaining}</span>
                )}
            </button>
        </div>
    );
};
