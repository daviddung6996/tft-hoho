import type { CSSProperties } from 'react';

interface SwordsIconProps {
    size?: number;
    className?: string;
    style?: CSSProperties;
}

export function SwordsIcon({ size = 24, className = '', style }: SwordsIconProps) {
    return (
        <svg
            className={className}
            style={style}
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Crossed Swords"
        >
            <defs>
                <linearGradient id="sw-blade1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F0F4FF" />
                    <stop offset="40%" stopColor="#C8D4E8" />
                    <stop offset="100%" stopColor="#8898B0" />
                </linearGradient>
                <linearGradient id="sw-blade2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F0F4FF" />
                    <stop offset="40%" stopColor="#C8D4E8" />
                    <stop offset="100%" stopColor="#8898B0" />
                </linearGradient>
                <linearGradient id="sw-guard" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFE082" />
                    <stop offset="100%" stopColor="#A07020" />
                </linearGradient>
                <linearGradient id="sw-guard2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFE082" />
                    <stop offset="100%" stopColor="#A07020" />
                </linearGradient>
                <filter id="sw-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#AACCFF" floodOpacity="0.4" result="gc" />
                    <feComposite in="gc" in2="blur" operator="in" result="g" />
                    <feMerge>
                        <feMergeNode in="g" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Sword 1: top-left to bottom-right */}
            <g filter="url(#sw-glow)">
                {/* Blade */}
                <polygon
                    points="18,10 22,10 82,88 78,88"
                    fill="url(#sw-blade1)"
                />
                {/* Blade edge highlight */}
                <line x1="19" y1="10" x2="79" y2="88" stroke="white" strokeWidth="1" opacity="0.5" />
                {/* Tip */}
                <polygon points="78,88 82,88 80,94" fill="#C8D4E8" />
                {/* Guard */}
                <rect x="13" y="33" width="26" height="6" rx="2" fill="url(#sw-guard)" transform="rotate(52 26 36)" />
                {/* Handle */}
                <rect x="10" y="12" width="6" height="20" rx="2" fill="#8B6914" transform="rotate(52 13 22)" />
                {/* Pommel */}
                <circle cx="10" cy="11" r="4" fill="url(#sw-guard)" />
            </g>

            {/* Sword 2: top-right to bottom-left */}
            <g filter="url(#sw-glow)">
                {/* Blade */}
                <polygon
                    points="78,10 82,10 22,88 18,88"
                    fill="url(#sw-blade2)"
                />
                {/* Blade edge highlight */}
                <line x1="81" y1="10" x2="21" y2="88" stroke="white" strokeWidth="1" opacity="0.5" />
                {/* Tip */}
                <polygon points="18,88 22,88 20,94" fill="#C8D4E8" />
                {/* Guard */}
                <rect x="61" y="33" width="26" height="6" rx="2" fill="url(#sw-guard2)" transform="rotate(-52 74 36)" />
                {/* Handle */}
                <rect x="84" y="12" width="6" height="20" rx="2" fill="#8B6914" transform="rotate(-52 87 22)" />
                {/* Pommel */}
                <circle cx="90" cy="11" r="4" fill="url(#sw-guard2)" />
            </g>

            {/* Center clash sparkle */}
            <circle cx="50" cy="50" r="4" fill="white" opacity="0.7" filter="url(#sw-glow)" />
        </svg>
    );
}
