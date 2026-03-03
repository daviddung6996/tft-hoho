import type { CSSProperties } from 'react';

interface GoldenChestIconProps {
    size?: number;
    className?: string;
    style?: CSSProperties;
}

export function GoldenChestIcon({ size = 24, className = '', style }: GoldenChestIconProps) {
    return (
        <svg
            className={className}
            style={style}
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Golden Chest"
        >
            <defs>
                <linearGradient id="gc-lid-border" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFE082" />
                    <stop offset="100%" stopColor="#A0720A" />
                </linearGradient>
                <linearGradient id="gc-lid-face" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#C89B3C" />
                    <stop offset="100%" stopColor="#7A5210" />
                </linearGradient>
                <linearGradient id="gc-body-border" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#C89B3C" />
                    <stop offset="100%" stopColor="#5A3A08" />
                </linearGradient>
                <linearGradient id="gc-body-face" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8B5E10" />
                    <stop offset="100%" stopColor="#4A2C04" />
                </linearGradient>
                <radialGradient id="gc-lock" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#FFE57A" />
                    <stop offset="100%" stopColor="#C89B3C" />
                </radialGradient>
                <filter id="gc-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#FFD700" floodOpacity="0.35" result="gc" />
                    <feComposite in="gc" in2="blur" operator="in" result="g" />
                    <feMerge>
                        <feMergeNode in="g" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Body border */}
            <rect x="12" y="52" width="76" height="40" rx="5" fill="url(#gc-body-border)" filter="url(#gc-glow)" />
            {/* Body face */}
            <rect x="16" y="56" width="68" height="33" rx="3" fill="url(#gc-body-face)" />
            {/* Body highlight */}
            <rect x="16" y="56" width="68" height="6" rx="2" fill="rgba(255,224,100,0.12)" />

            {/* Lid border */}
            <rect x="12" y="28" width="76" height="28" rx="5" fill="url(#gc-lid-border)" filter="url(#gc-glow)" />
            {/* Lid face */}
            <rect x="16" y="31" width="68" height="22" rx="3" fill="url(#gc-lid-face)" />
            {/* Lid arc highlight */}
            <ellipse cx="50" cy="31" rx="30" ry="6" fill="rgba(255,240,160,0.22)" />

            {/* Horizontal band across join */}
            <rect x="12" y="49" width="76" height="7" rx="2" fill="url(#gc-lid-border)" />
            <rect x="14" y="50" width="72" height="5" rx="1" fill="#C89B3C" />

            {/* Lock plate */}
            <rect x="41" y="46" width="18" height="16" rx="3" fill="url(#gc-lock)" filter="url(#gc-glow)" />
            {/* Lock shackle */}
            <path d="M46 46 Q46 38 50 38 Q54 38 54 46" stroke="#FFE082" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Lock keyhole */}
            <circle cx="50" cy="55" r="3" fill="#7A5210" />
            <rect x="48.5" y="55" width="3" height="4" rx="1" fill="#7A5210" />

            {/* Corner rivets */}
            {[18, 82].map(cx =>
                [35, 65].map(cy => (
                    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="#FFE082" stroke="#A07020" strokeWidth="0.8" />
                ))
            )}
        </svg>
    );
}
