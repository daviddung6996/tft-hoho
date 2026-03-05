import type { CSSProperties } from 'react';

interface ShieldIconProps {
    size?: number;
    className?: string;
    style?: CSSProperties;
}

export function ShieldIcon({ size = 24, className = '', style }: ShieldIconProps) {
    return (
        <svg
            className={className}
            style={style}
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Shield"
        >
            <defs>
                <linearGradient id="sh-body" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#41B8BF" />
                    <stop offset="50%" stopColor="#2A8B91" />
                    <stop offset="100%" stopColor="#153A3E" />
                </linearGradient>
                <linearGradient id="sh-rim" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#FFE082" />
                    <stop offset="100%" stopColor="#A07020" />
                </linearGradient>
                <radialGradient id="sh-shine" cx="50%" cy="25%" r="50%">
                    <stop offset="0%" stopColor="#7BEAF0" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#2A8B91" stopOpacity="0" />
                </radialGradient>
                <filter id="sh-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#C89B3C" floodOpacity="0.35" result="gc" />
                    <feComposite in="gc" in2="blur" operator="in" result="g" />
                    <feMerge>
                        <feMergeNode in="g" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Shield border */}
            <g filter="url(#sh-glow)">
                <path
                    d="M50 8 L88 26 L88 50 C88 72 72 88 50 96 C28 88 12 72 12 50 L12 26 Z"
                    fill="url(#sh-rim)"
                />
            </g>

            {/* Shield face */}
            <path
                d="M50 14 L82 30 L82 50 C82 70 68 84 50 90 C32 84 18 70 18 50 L18 30 Z"
                fill="url(#sh-body)"
            />

            {/* Shine highlight */}
            <path
                d="M50 14 L82 30 L82 50 C82 70 68 84 50 90 C32 84 18 70 18 50 L18 30 Z"
                fill="url(#sh-shine)"
            />

            {/* Cross / plus symbol — gold */}
            <rect x="44" y="34" width="12" height="32" rx="2.5" fill="#FFE082" opacity="0.85" />
            <rect x="34" y="44" width="32" height="12" rx="2.5" fill="#FFE082" opacity="0.85" />
        </svg>
    );
}
