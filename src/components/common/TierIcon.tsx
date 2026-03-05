
import React from 'react';
import { PuzzleTier } from '../../features/tcoin/tcoin.types';

/**
 * Hextech-themed SVG tier icons — aligned with hextech-core design system.
 * - Free:     Hexagon with teal-cyan fill (Hextech atmosphere tone)
 * - Advanced: Diamond gem with Hextech gold gradient (#C89B3C → #A07828)
 * - Rare:     Rune crystal with deep crimson-ruby (warm, prestigious)
 *
 * Rules: NO emoji, NO AI icons — inline SVG only. (hextech-core §B)
 */

interface TierIconProps {
    tier: PuzzleTier;
    size?: number;
    className?: string;
}

/** Free tier — Hexagon (teal-cyan, Hextech atmospheric) */
const FreeIcon: React.FC<{ size: number }> = ({ size }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <radialGradient id="free-fill" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#5eead4" />
                <stop offset="100%" stopColor="#0d9488" />
            </radialGradient>
            <radialGradient id="free-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
            </radialGradient>
        </defs>
        {/* Outer glow */}
        <circle cx="12" cy="12" r="11" fill="url(#free-glow)" />
        {/* Hexagon shape */}
        <polygon
            points="12,2.5 20.66,7.25 20.66,16.75 12,21.5 3.34,16.75 3.34,7.25"
            fill="url(#free-fill)"
            stroke="#2dd4bf"
            strokeWidth="0.6"
            strokeOpacity="0.8"
        />
        {/* Inner highlight */}
        <polygon
            points="12,5 18.2,8.5 18.2,15.5 12,19 5.8,15.5 5.8,8.5"
            fill="none"
            stroke="#99f6e4"
            strokeWidth="0.4"
            strokeOpacity="0.45"
        />
        {/* Center dot */}
        <circle cx="12" cy="12" r="2.2" fill="#ccfbf1" fillOpacity="0.65" />
    </svg>
);

/** Advanced tier — Diamond gem (Hextech gold, precious) */
const AdvancedIcon: React.FC<{ size: number }> = ({ size }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="adv-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e8c252" />
                <stop offset="50%" stopColor="#C89B3C" />
                <stop offset="100%" stopColor="#A07828" />
            </linearGradient>
            <linearGradient id="adv-facet" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F0E6D2" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#c8aa6e" stopOpacity="0.25" />
            </linearGradient>
            <radialGradient id="adv-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c8aa6e" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#c8aa6e" stopOpacity="0" />
            </radialGradient>
        </defs>
        {/* Outer glow */}
        <circle cx="12" cy="12" r="11" fill="url(#adv-glow)" />
        {/* Diamond body */}
        <polygon
            points="12,2 21,9 12,22 3,9"
            fill="url(#adv-fill)"
            stroke="#c8aa6e"
            strokeWidth="0.5"
        />
        {/* Top facet highlight */}
        <polygon
            points="12,2 21,9 12,9"
            fill="url(#adv-facet)"
            opacity="0.55"
        />
        {/* Left facet */}
        <polygon
            points="12,2 3,9 12,9"
            fill="#F0E6D2"
            opacity="0.12"
        />
        {/* Center shimmer line */}
        <line x1="12" y1="2" x2="12" y2="9" stroke="#F0E6D2" strokeWidth="0.5" strokeOpacity="0.7" />
        <line x1="3" y1="9" x2="21" y2="9" stroke="#F0E6D2" strokeWidth="0.4" strokeOpacity="0.35" />
    </svg>
);

/** Rare tier — Rune crystal (electric prismatic purple, luxury flex) */
const RareIcon: React.FC<{ size: number }> = ({ size }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <radialGradient id="rare-fill" cx="45%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#e9d5ff" />
                <stop offset="40%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#581c87" />
            </radialGradient>
            <linearGradient id="rare-facet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3e8ff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.15" />
            </linearGradient>
            <radialGradient id="rare-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
            </radialGradient>
        </defs>
        {/* Outer glow aura */}
        <circle cx="12" cy="12" r="11" fill="url(#rare-glow)" />
        {/* Rune crystal — octagonal */}
        <polygon
            points="12,2 18,4 22,10 22,14 18,20 12,22 6,20 2,14 2,10 6,4"
            fill="url(#rare-fill)"
            stroke="#c084fc"
            strokeWidth="0.6"
            strokeOpacity="0.9"
        />
        {/* Inner bright facet top-left */}
        <polygon
            points="12,2 18,4 12,10 6,4"
            fill="url(#rare-facet)"
            opacity="0.6"
        />
        {/* Central rune mark */}
        <polygon
            points="12,7 15,11 12,17 9,11"
            fill="#e9d5ff"
            opacity="0.5"
        />
        <circle cx="12" cy="12" r="1.5" fill="#ffffff" opacity="0.8" />
    </svg>
);

export const TIER_META: Record<PuzzleTier, { label: string; color: string; costLabel: string }> = {
    free: { label: 'Free', color: '#2dd4bf', costLabel: 'Miễn phí' },
    advanced: { label: 'Advanced', color: '#c8aa6e', costLabel: '30 T-Coin' },
    rare: { label: 'Rare', color: '#c084fc', costLabel: '100 T-Coin' },
};

export const TierIcon: React.FC<TierIconProps> = ({ tier, size = 16, className }) => {
    const icons: Record<PuzzleTier, React.ReactNode> = {
        free: <FreeIcon size={size} />,
        advanced: <AdvancedIcon size={size} />,
        rare: <RareIcon size={size} />,
    };

    return (
        <span
            className={className}
            style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
            role="img"
            aria-label={`Tier: ${TIER_META[tier].label}`}
        >
            {icons[tier]}
        </span>
    );
};

export default TierIcon;
