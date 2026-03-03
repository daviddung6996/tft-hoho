import type { CSSProperties } from 'react';

interface MedalIconProps {
    size?: number;
    className?: string;
    style?: CSSProperties;
}

export function MedalIcon({ size = 24, className = '', style }: MedalIconProps) {
    return (
        <svg
            className={className}
            style={style}
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Emblem Medal"
        >
            <defs>
                <linearGradient id="md-ribbon-l" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3A7BD5" />
                    <stop offset="100%" stopColor="#1A4A9A" />
                </linearGradient>
                <linearGradient id="md-ribbon-r" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#5B9EF0" />
                    <stop offset="100%" stopColor="#2C6ACC" />
                </linearGradient>
                <linearGradient id="md-ring" x1="30%" y1="0%" x2="70%" y2="100%">
                    <stop offset="0%" stopColor="#FFE082" />
                    <stop offset="40%" stopColor="#C89B3C" />
                    <stop offset="100%" stopColor="#7A5210" />
                </linearGradient>
                <radialGradient id="md-face" cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#FFE57A" />
                    <stop offset="50%" stopColor="#C89B3C" />
                    <stop offset="100%" stopColor="#7A5210" />
                </radialGradient>
                <radialGradient id="md-gem" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor="#B8E8FF" />
                    <stop offset="45%" stopColor="#3D9FE0" />
                    <stop offset="100%" stopColor="#1056A0" />
                </radialGradient>
                <filter id="md-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                    <feFlood floodColor="#C89B3C" floodOpacity="0.4" result="gc" />
                    <feComposite in="gc" in2="blur" operator="in" result="g" />
                    <feMerge>
                        <feMergeNode in="g" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id="md-gem-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#60CFFF" floodOpacity="0.6" result="gc" />
                    <feComposite in="gc" in2="blur" operator="in" result="g" />
                    <feMerge>
                        <feMergeNode in="g" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Ribbon left */}
            <polygon points="50,38 32,8 20,8 38,38" fill="url(#md-ribbon-l)" />
            <polygon points="50,38 32,8 38,8 50,32" fill="rgba(255,255,255,0.12)" />

            {/* Ribbon right */}
            <polygon points="50,38 68,8 80,8 62,38" fill="url(#md-ribbon-r)" />

            {/* Ribbon fold highlights */}
            <line x1="38" y1="8" x2="50" y2="38" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="62" y1="8" x2="50" y2="38" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

            {/* Medal ring (outer gold) */}
            <circle cx="50" cy="65" r="30" fill="url(#md-ring)" filter="url(#md-glow)" />
            {/* Medal face */}
            <circle cx="50" cy="65" r="26" fill="url(#md-face)" />
            {/* Inner ring groove */}
            <circle cx="50" cy="65" r="22" fill="none" stroke="rgba(120,80,10,0.5)" strokeWidth="1.5" />

            {/* Center gem diamond */}
            <g filter="url(#md-gem-glow)">
                <polygon points="50,50 62,65 50,80 38,65" fill="url(#md-gem)" />
                {/* Top facet */}
                <polygon points="50,50 62,65 50,67" fill="rgba(190,235,255,0.55)" />
                {/* Left facet */}
                <polygon points="50,50 38,65 50,67" fill="rgba(40,150,220,0.55)" />
                {/* Bottom facet */}
                <polygon points="50,67 62,65 50,80 38,65" fill="rgba(10,60,130,0.4)" />
                {/* Shine */}
                <ellipse cx="47" cy="56" rx="4" ry="2.5" fill="white" opacity="0.4" transform="rotate(-30 47 56)" />
            </g>

            {/* Outer ring decorative notches */}
            {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * Math.PI * 2) / 8;
                const x = 50 + Math.cos(angle) * 28.5;
                const y = 65 + Math.sin(angle) * 28.5;
                return <circle key={i} cx={x} cy={y} r="1.8" fill="#FFE082" opacity="0.7" />;
            })}
        </svg>
    );
}
