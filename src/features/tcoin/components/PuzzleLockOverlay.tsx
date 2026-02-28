
import { PuzzleTier, TCOIN_SPEND_COSTS } from '../tcoin.types';
import './PuzzleLockOverlay.css';

interface PuzzleLockOverlayProps {
    tier: PuzzleTier;
    isProSupporter: boolean;
    canAfford: boolean;
    onUnlock: () => void;
    onProSupporter: () => void;
}

const TIER_CONFIG: Record<PuzzleTier, { icon: string; label: string; color: string }> = {
    free: { icon: '🟢', label: 'Free', color: '#4ade80' },
    advanced: { icon: '🟡', label: 'Advanced', color: '#facc15' },
    rare: { icon: '🔴', label: 'Rare', color: '#ef4444' },
};

export function PuzzleLockOverlay({ tier, isProSupporter, canAfford, onUnlock, onProSupporter }: PuzzleLockOverlayProps) {
    if (tier === 'free') return null;

    const config = TIER_CONFIG[tier];
    const cost = tier === 'advanced' ? TCOIN_SPEND_COSTS.unlock_advanced : TCOIN_SPEND_COSTS.unlock_rare;

    return (
        <div className="puzzle-lock-overlay">
            <div className="puzzle-lock-content">
                <div className="puzzle-lock-icon">🔒</div>
                <div className="puzzle-lock-tier">
                    <span className="puzzle-lock-tier-icon">{config.icon}</span>
                    <span className="puzzle-lock-tier-label" style={{ color: config.color }}>{config.label}</span>
                </div>
                <div className="puzzle-lock-cost">
                    <span className="tcoin-icon">🪙</span>
                    <span className="puzzle-lock-cost-amount">{cost}</span>
                </div>
                <div className="puzzle-lock-actions">
                    {canAfford ? (
                        <button className="puzzle-lock-btn puzzle-lock-btn--unlock" onClick={onUnlock}>
                            Mở khóa
                        </button>
                    ) : (
                        <button className="puzzle-lock-btn puzzle-lock-btn--insufficient" disabled>
                            Không đủ T-Coin
                        </button>
                    )}
                    {!isProSupporter && (
                        <button className="puzzle-lock-btn puzzle-lock-btn--pro" onClick={onProSupporter}>
                            ⭐ Pro Supporter — Mở tất cả
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/** Small tier badge for puzzle list items */
export function PuzzleTierBadge({ tier }: { tier: PuzzleTier }) {
    const config = TIER_CONFIG[tier];
    return (
        <span className={`puzzle-tier-badge puzzle-tier-badge--${tier}`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}
