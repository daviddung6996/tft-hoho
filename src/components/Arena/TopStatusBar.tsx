import React from 'react';
import './TopStatusBar.css';

interface TopStatusBarProps {
    stage: string;
    streakHistory?: boolean[]; // W/L per round (true = win, false = loss)
    streakCount?: number;
    dimmed?: boolean;
}

type RoundType = 'pvp' | 'augment' | 'carousel' | 'pve';

/* ════════════════════════════════════════════════════════════
   SVG ICONS — following TierIcon / IqRankIcon project style:
   · polygon-based geometry + facet overlays (max 4-5 elements)
   · strong silhouette readable at ~30px
   · gradient defs with fixed IDs (one instance per component)
   ════════════════════════════════════════════════════════════ */

/**
 * Crossed swords — PvP combat.
 * 4 paths: 2 blades (thick) + 2 offset cross-guards (thin).
 * Color driven by W/L state — no defs needed.
 */
const SwordsIcon: React.FC<{ won?: boolean; isFuture?: boolean }> = ({ won, isFuture }) => {
    const c =
        isFuture    ? '#1A3035'
        : won === true  ? '#10B981'
        : won === false ? '#EF4444'
        :                 '#c8aa6e';
    const dimGuard = isFuture ? 0.4 : 0.75;

    return (
        <svg className="tsb-icon" viewBox="0 0 24 24" fill="none">
            {/* Blade 1: NW tip → SE pommel */}
            <path d="M5 5 L19 19" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
            {/* Guard 1: perpendicular on blade 1 at ~38% from tip */}
            <path d="M8 13 L13 8"  stroke={c} strokeWidth="1.6" strokeLinecap="round" opacity={dimGuard} />
            {/* Blade 2: NE tip → SW pommel */}
            <path d="M19 5 L5 19"  stroke={c} strokeWidth="2.6" strokeLinecap="round" />
            {/* Guard 2: perpendicular on blade 2 at ~38% from tip */}
            <path d="M11 7 L16 12" stroke={c} strokeWidth="1.6" strokeLinecap="round" opacity={dimGuard} />
        </svg>
    );
};

/**
 * Augment glyph — chọn lõi (3-2).
 * Visual target: teal "tech core" symbol similar to compact client glyph.
 */
const AugmentIcon: React.FC = () => (
    <svg className="tsb-icon tsb-icon--augment" viewBox="0 0 24 24" fill="none">
        <defs>
            <linearGradient id="tsb-aug-card-front" x1="4.4" y1="5.2" x2="14.8" y2="18.6" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6DE1E6" />
                <stop offset="100%" stopColor="#2A8B91" />
            </linearGradient>
            <linearGradient id="tsb-aug-card-back" x1="9" y1="3.4" x2="18.6" y2="15.2" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#41B8BF" />
                <stop offset="100%" stopColor="#1A6A72" />
            </linearGradient>
        </defs>

        {/* Back square card */}
        <path
            d="M9.1 3.8H18.1V14.8H9.1Z"
            transform="rotate(8 13.6 9.3)"
            fill="url(#tsb-aug-card-back)"
            stroke="#2FB6BE"
            strokeWidth="0.7"
            strokeLinejoin="round"
        />

        {/* Front square card */}
        <path
            d="M4.4 5.2H14.8V18.6H4.4Z"
            transform="rotate(8 9.6 11.9)"
            fill="url(#tsb-aug-card-front)"
            stroke="#7BEAF0"
            strokeWidth="0.75"
            strokeLinejoin="round"
        />

        {/* Small core mark */}
        <rect x="7.95" y="8.95" width="3.2" height="3.2" rx="0.35" fill="#0F3E45" stroke="#66D2D8" strokeWidth="0.55" />
    </svg>
);

/**
 * Gear glyph — đi chợ / Shared Draft carousel (3-4).
 * Visual target: compact square-like cog icon similar to client glyph.
 */
const CarouselIcon: React.FC = () => (
    <svg className="tsb-icon tsb-icon--carousel" viewBox="0 0 24 24" fill="none">
        <defs>
            <linearGradient id="tsb-car-gear" x1="6" y1="5" x2="18" y2="19" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFE88C" />
                <stop offset="100%" stopColor="#B67C14" />
            </linearGradient>
        </defs>
        {/* Gear body */}
        <path
            d="M10.7 3.9H13.3L13.7 6.1C14.3 6.3 14.8 6.5 15.3 6.8L17.2 5.6L19 7.4L17.8 9.3C18.1 9.8 18.3 10.3 18.5 10.9L20.7 11.3V13.9L18.5 14.3C18.3 14.9 18.1 15.4 17.8 15.9L19 17.8L17.2 19.6L15.3 18.4C14.8 18.7 14.3 18.9 13.7 19.1L13.3 21.3H10.7L10.3 19.1C9.7 18.9 9.2 18.7 8.7 18.4L6.8 19.6L5 17.8L6.2 15.9C5.9 15.4 5.7 14.9 5.5 14.3L3.3 13.9V11.3L5.5 10.9C5.7 10.3 5.9 9.8 6.2 9.3L5 7.4L6.8 5.6L8.7 6.8C9.2 6.5 9.7 6.3 10.3 6.1L10.7 3.9Z"
            fill="url(#tsb-car-gear)"
            stroke="#F6D67A"
            strokeWidth="0.75"
            strokeLinejoin="round"
        />

        {/* Inner hole */}
        <circle cx="12" cy="12.6" r="2.7" fill="#0A2528" stroke="#E4BE57" strokeWidth="0.7" />
    </svg>
);

/**
 * Fox head glyph — đánh quái / PvE round (3-7).
 * Visual target: compact steel fox silhouette similar to client icon.
 */
const PveIcon: React.FC = () => (
    <svg className="tsb-icon tsb-icon--pve" viewBox="0 0 24 24" fill="none">
        <defs>
            <linearGradient id="tsb-pve-fox" x1="6.2" y1="4.2" x2="17.8" y2="19.5" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#A8B6C6" />
                <stop offset="100%" stopColor="#5B6776" />
            </linearGradient>
        </defs>

        {/* Outer fox silhouette */}
        <path
            d="M12 4.1L8.7 7L6.1 4.6L6.6 9.9L4.2 12.9L7.3 13.9L8.7 17.3L12 19.6L15.3 17.3L16.7 13.9L19.8 12.9L17.4 9.9L17.9 4.6L15.3 7L12 4.1Z"
            fill="url(#tsb-pve-fox)"
            stroke="#C3CFDA"
            strokeWidth="0.65"
            strokeLinejoin="round"
        />

        {/* Inner face cut */}
        <path
            d="M12 8.2L9.3 10.3L10.2 13.8L12 15L13.8 13.8L14.7 10.3L12 8.2Z"
            fill="#0D1824"
            opacity="0.9"
        />

        {/* Eyes */}
        <path d="M10.1 10.9L8.9 11.9L10.4 12.3L11.1 11.4L10.1 10.9Z" fill="#D8E2EC" opacity="0.82" />
        <path d="M13.9 10.9L15.1 11.9L13.6 12.3L12.9 11.4L13.9 10.9Z" fill="#D8E2EC" opacity="0.82" />
    </svg>
);

/* ════════════════════════════════════════════════════════════
   Round pattern
   Stage 2: 2-1 chọn lõi | 2-2 combat | 2-3 combat | 2-4 đi chợ
            2-5 combat   | 2-6 combat | 2-7 đánh quái
   Stage 3: 3-1 combat  | 3-2 chọn lõi | 3-3 combat | 3-4 đi chợ
            3-5 combat  | 3-6 combat   | 3-7 đánh quái
   ════════════════════════════════════════════════════════════ */
const ROUND_PATTERN: Record<string, RoundType[]> = {
    '2': ['augment', 'pvp', 'pvp', 'carousel', 'pvp', 'pvp', 'pve'],
    '3': ['pvp', 'augment', 'pvp', 'carousel', 'pvp', 'pvp', 'pve'],
    '4': ['pvp', 'augment', 'pvp', 'carousel', 'pvp', 'pvp', 'pve'],
    '5': ['pvp', 'pvp',     'pvp', 'pvp',      'pvp', 'augment', 'pve'],
};

const ROUND_LABELS: Record<RoundType, string> = {
    pvp:      'Combat',
    augment:  'Chọn lõi',
    carousel: 'Đi chợ',
    pve:      'Đánh quái',
};

/* ════════════════════════════════════════════════════════════
   Component
   ════════════════════════════════════════════════════════════ */
export const TopStatusBar: React.FC<TopStatusBarProps> = ({
    stage,
    streakHistory,
    dimmed,
}) => {
    const [stageNum, roundStr] = stage.split('-');
    const roundNum = parseInt(roundStr ?? '1', 10);
    const pattern  = ROUND_PATTERN[stageNum] ?? ROUND_PATTERN['3'];

    return (
        <div className={`top-status-bar${dimmed ? ' top-status-bar--dimmed' : ''}`}>
            {/* Corner accent frames — Hextech Core pattern */}
            <div className="tsb-corner tsb-corner-tl" />
            <div className="tsb-corner tsb-corner-tr" />
            <div className="tsb-corner tsb-corner-bl" />
            <div className="tsb-corner tsb-corner-br" />

            {/* Stage badge */}
            <div className="tsb-stage-badge">
                <span className="tsb-stage-label">Round</span>
                <span className="tsb-stage-num">{stage}</span>
            </div>

            <div className="tsb-separator" />

            {/* Round slots */}
            <div className="tsb-rounds">
                {pattern.map((type, i) => {
                    const roundIdx = i + 1;
                    const isActive = roundIdx === roundNum;
                    const isPast   = roundIdx < roundNum;
                    const isFuture = roundIdx > roundNum;
                    const won: boolean | undefined = isPast ? streakHistory?.[i] : undefined;

                    return (
                        <div
                            key={i}
                            className={[
                                'tsb-slot',
                                isActive && 'tsb-slot--active',
                                isFuture && 'tsb-slot--future',
                                isPast && won === true  && 'tsb-slot--win',
                                isPast && won === false && 'tsb-slot--loss',
                            ].filter(Boolean).join(' ')}
                            title={`${stageNum}-${roundIdx} · ${ROUND_LABELS[type]}`}
                        >
                            {/* Active top bar */}
                            {isActive && <div className="tsb-active-bar" />}

                            <div className="tsb-icon-wrap">
                                {type === 'augment'  && <AugmentIcon />}
                                {type === 'carousel' && <CarouselIcon />}
                                {type === 'pve'      && <PveIcon />}
                                {type === 'pvp'      && (
                                    <SwordsIcon won={won} isFuture={isFuture} />
                                )}
                            </div>

                            <span className="tsb-round-lbl">{stageNum}-{roundIdx}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopStatusBar;
