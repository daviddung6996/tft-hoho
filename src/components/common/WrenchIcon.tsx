import type { CSSProperties } from 'react';

interface WrenchIconProps {
    size?: number;
    className?: string;
    style?: CSSProperties;
}

export function WrenchIcon({ size = 24, className = '', style }: WrenchIconProps) {
    return (
        <svg
            className={className}
            style={style}
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Item Reforge"
        >
            <defs>
                <linearGradient id="wr-anvil" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#7BEAF0" />
                    <stop offset="40%" stopColor="#41B8BF" />
                    <stop offset="100%" stopColor="#1A6A72" />
                </linearGradient>
                <linearGradient id="wr-anvil-face" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#5DD5DC" />
                    <stop offset="100%" stopColor="#153A3E" />
                </linearGradient>
                <linearGradient id="wr-arrow" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#FFE082" />
                    <stop offset="60%" stopColor="#C89B3C" />
                    <stop offset="100%" stopColor="#A07020" />
                </linearGradient>
                <radialGradient id="wr-shine" cx="45%" cy="30%" r="50%">
                    <stop offset="0%" stopColor="#B8F4F8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#2A8B91" stopOpacity="0" />
                </radialGradient>
                <filter id="wr-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#C89B3C" floodOpacity="0.35" result="gc" />
                    <feComposite in="gc" in2="blur" operator="in" result="g" />
                    <feMerge>
                        <feMergeNode in="g" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Anvil body */}
            <g filter="url(#wr-glow)">
                {/* Anvil top (flat striking surface) */}
                <path
                    d="M28 48 L72 48 L68 56 L32 56 Z"
                    fill="url(#wr-anvil)"
                    stroke="#2A8B91"
                    strokeWidth="1.2"
                />
                {/* Anvil horn (left point) */}
                <path
                    d="M28 48 L16 44 L18 50 L28 56 Z"
                    fill="url(#wr-anvil)"
                    stroke="#2A8B91"
                    strokeWidth="1"
                />
                {/* Anvil waist */}
                <path
                    d="M36 56 L64 56 L62 64 L38 64 Z"
                    fill="url(#wr-anvil-face)"
                    stroke="#2A8B91"
                    strokeWidth="1"
                />
                {/* Anvil base (wide) */}
                <path
                    d="M26 64 L74 64 L78 74 L22 74 Z"
                    fill="url(#wr-anvil)"
                    stroke="#2A8B91"
                    strokeWidth="1.2"
                />
            </g>

            {/* Anvil shine */}
            <path
                d="M30 48 L70 48 L67 54 L33 54 Z"
                fill="url(#wr-shine)"
            />

            {/* Circular arrow — top arc (right to left) */}
            <path
                d="M68 34 C68 20 56 12 44 14"
                stroke="url(#wr-arrow)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
            />
            {/* Top arrow head */}
            <polygon points="44,8 38,16 46,18" fill="#FFE082" />

            {/* Circular arrow — bottom arc (left to right) */}
            <path
                d="M30 78 C30 90 44 96 56 92"
                stroke="url(#wr-arrow)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
            />
            {/* Bottom arrow head */}
            <polygon points="56,98 62,90 54,88" fill="#FFE082" />
        </svg>
    );
}
