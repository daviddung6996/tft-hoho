import type { CSSProperties } from 'react';

interface ArrowUpIconProps {
    size?: number;
    className?: string;
    style?: CSSProperties;
}

export function ArrowUpIcon({ size = 24, className = '', style }: ArrowUpIconProps) {
    return (
        <svg
            className={className}
            style={style}
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Arrow Up"
        >
            <defs>
                <linearGradient id="au-plate" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#2A8B91" />
                    <stop offset="100%" stopColor="#0A2528" />
                </linearGradient>
                <linearGradient id="au-rim" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#FFE082" />
                    <stop offset="100%" stopColor="#A07020" />
                </linearGradient>
                <linearGradient id="au-arrow" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#FFE082" />
                    <stop offset="60%" stopColor="#C89B3C" />
                    <stop offset="100%" stopColor="#7A5210" />
                </linearGradient>
                <radialGradient id="au-shine" cx="50%" cy="30%" r="50%">
                    <stop offset="0%" stopColor="#7BEAF0" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#2A8B91" stopOpacity="0" />
                </radialGradient>
                <filter id="au-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#C89B3C" floodOpacity="0.35" result="gc" />
                    <feComposite in="gc" in2="blur" operator="in" result="g" />
                    <feMerge>
                        <feMergeNode in="g" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Hexagonal plate border */}
            <g filter="url(#au-glow)">
                <path
                    d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28 Z"
                    fill="url(#au-rim)"
                />
            </g>

            {/* Hexagonal plate face */}
            <path
                d="M50 10 L84 30 L84 70 L50 90 L16 70 L16 30 Z"
                fill="url(#au-plate)"
            />

            {/* Shine */}
            <path
                d="M50 10 L84 30 L84 70 L50 90 L16 70 L16 30 Z"
                fill="url(#au-shine)"
            />

            {/* Up arrow — gold */}
            <path
                d="M50 22 L72 48 L60 48 L60 76 L40 76 L40 48 L28 48 Z"
                fill="url(#au-arrow)"
            />
        </svg>
    );
}
