
import { PuzzleTier, TCOIN_SPEND_COSTS } from '../tcoin.types';
import { TierIcon, TIER_META } from '../../../components/common/TierIcon';
import { TCoinIcon } from './TCoinIcon';
import { ProSupporterIcon } from '../../../components/common/ProSupporterIcon';
import './PuzzleLockOverlay.css';

interface PuzzleLockOverlayProps {
    tier: PuzzleTier;
    isProSupporter: boolean;
    canAfford: boolean;
    onUnlock: () => void;
    onProSupporter: () => void;
    onSkipToFree?: () => void; // NEW: Skip to free puzzle
    title?: string;
    subtitle?: string;
    isLoading?: boolean;
    requiresLogin?: boolean;
    unlockLabel?: string;
}



export function PuzzleLockOverlay({
    tier,
    isProSupporter,
    canAfford,
    onUnlock,
    onProSupporter,
    onSkipToFree,
    title,
    subtitle,
    isLoading,
    requiresLogin,
    unlockLabel,
}: PuzzleLockOverlayProps) {
    if (tier === 'free') return null;

    const config = TIER_META[tier];
    const cost = tier === 'advanced' ? TCOIN_SPEND_COSTS.unlock_advanced : TCOIN_SPEND_COSTS.unlock_rare;

    const defaultTitle = 'Puzzle xịn được chọn lọc từ game đấu hay của Pro.';
    const defaultSubtitle = 'Có giải thích chi tiết giúp bạn nâng cấp tư duy chọn lõi.';

    const resolvedUnlockLabel = requiresLogin
        ? 'Đăng nhập để mở khóa'
        : unlockLabel || 'Mở khóa';

    return (
        <div className="puzzle-lock-overlay">
            <div className="puzzle-lock-content">
                <div className="puzzle-lock-icon">
                    {/* Hextech lock SVG */}
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="lock-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#c8aa6e" />
                                <stop offset="100%" stopColor="#7a5c28" />
                            </linearGradient>
                        </defs>
                        <rect x="5" y="11" width="14" height="10" rx="1.5" fill="url(#lock-grad)" />
                        <rect x="7" y="11" width="10" height="8" rx="1" fill="#4a3010" fillOpacity="0.5" />
                        <path d="M8 11V7.5a4 4 0 0 1 8 0V11" stroke="#c8aa6e" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                        <circle cx="12" cy="15.5" r="1.5" fill="#c8aa6e" />
                        <line x1="12" y1="16.5" x2="12" y2="18.5" stroke="#c8aa6e" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                </div>
                <div className="puzzle-lock-tier">
                    <TierIcon tier={tier} size={16} />
                    <span className="puzzle-lock-tier-label" style={{ color: config.color }}>{config.label}</span>
                </div>
                {(title || subtitle) && (
                    <div className="puzzle-lock-description">
                        <p className="puzzle-lock-title">{title || defaultTitle}</p>
                        {subtitle && <p className="puzzle-lock-subtitle">{subtitle}</p>}
                    </div>
                )}
                {!title && !subtitle && (
                    <div className="puzzle-lock-description">
                        <p className="puzzle-lock-title">{defaultTitle}</p>
                        <p className="puzzle-lock-subtitle">{defaultSubtitle}</p>
                    </div>
                )}
                {!requiresLogin && (
                    <div className="puzzle-lock-cost">
                        <TCoinIcon size={20} />
                        <span className="puzzle-lock-cost-amount">{cost}</span>
                    </div>
                )}
                <div className="puzzle-lock-actions">
                    {isLoading ? (
                        <button className="puzzle-lock-btn puzzle-lock-btn--unlock" disabled>
                            Đang mở khóa...
                        </button>
                    ) : requiresLogin ? (
                        <button className="puzzle-lock-btn puzzle-lock-btn--unlock" onClick={onUnlock}>
                            {resolvedUnlockLabel}
                        </button>
                    ) : canAfford ? (
                        <button className="puzzle-lock-btn puzzle-lock-btn--unlock" onClick={onUnlock}>
                            {resolvedUnlockLabel}
                        </button>
                    ) : (
                        <button className="puzzle-lock-btn puzzle-lock-btn--insufficient" disabled>
                            Không đủ T-Coin
                        </button>
                    )}
                    {!isProSupporter && !requiresLogin && (
                        <button className="puzzle-lock-btn puzzle-lock-btn--pro" onClick={onProSupporter}>
                            <span className="puzzle-lock-btn--pro-sweep" />
                            <ProSupporterIcon size={18} style={{ flexShrink: 0, verticalAlign: 'middle' }} />
                            Pro Supporter — Mở tất cả
                        </button>
                    )}
                    {onSkipToFree && (
                        <button className="puzzle-lock-btn puzzle-lock-btn--skip" onClick={onSkipToFree}>
                            Giải câu đố khác — FREE
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/** Small tier badge for puzzle list items */
export function PuzzleTierBadge({ tier }: { tier: PuzzleTier }) {
    const meta = TIER_META[tier];
    return (
        <span className={`puzzle-tier-badge puzzle-tier-badge--${tier}`}>
            <TierIcon tier={tier} size={12} />
            <span style={{ color: meta.color }}>{meta.label}</span>
        </span>
    );
}
