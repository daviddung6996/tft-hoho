import type { CSSProperties } from 'react';

interface CoinBagIconProps {
    size?: number;
    className?: string;
    style?: CSSProperties;
}

export function CoinBagIcon({ size = 24, className = '', style }: CoinBagIconProps) {
    return (
        <svg
            className={className}
            style={style}
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Coin Bag"
        >
            <defs>
                <linearGradient id="cb-bag" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#2A8B91" />
                    <stop offset="50%" stopColor="#1A6A72" />
                    <stop offset="100%" stopColor="#0A2528" />
                </linearGradient>
                <linearGradient id="cb-tie" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#FFE082" />
                    <stop offset="100%" stopColor="#A07020" />
                </linearGradient>
                <radialGradient id="cb-shine" cx="38%" cy="35%" r="50%">
                    <stop offset="0%" stopColor="#7BEAF0" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2A8B91" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="cb-coin" cx="45%" cy="38%" r="60%">
                    <stop offset="0%" stopColor="#FFE57A" />
                    <stop offset="50%" stopColor="#C89B3C" />
                    <stop offset="100%" stopColor="#7A5210" />
                </radialGradient>
                <filter id="cb-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#C89B3C" floodOpacity="0.35" result="gc" />
                    <feComposite in="gc" in2="blur" operator="in" result="g" />
                    <feMerge>
                        <feMergeNode in="g" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Bag body */}
            <g filter="url(#cb-glow)">
                <path
                    d="M50 30 C26 30 14 50 14 68 C14 84 28 94 50 94 C72 94 86 84 86 68 C86 50 74 30 50 30 Z"
                    fill="url(#cb-bag)"
                    stroke="#A07020"
                    strokeWidth="2"
                />
            </g>

            {/* Bag shine */}
            <path
                d="M50 30 C26 30 14 50 14 68 C14 84 28 94 50 94 C72 94 86 84 86 68 C86 50 74 30 50 30 Z"
                fill="url(#cb-shine)"
            />

            {/* Tie / neck */}
            <path
                d="M38 30 C38 22 42 18 50 18 C58 18 62 22 62 30"
                fill="url(#cb-tie)"
                stroke="#7A5210"
                strokeWidth="1.5"
            />
            {/* Tie knot */}
            <ellipse cx="50" cy="30" rx="14" ry="5" fill="url(#cb-tie)" stroke="#7A5210" strokeWidth="1.5" />

            {/* Ears / ribbon tops — gold */}
            <path d="M38 18 C34 8 40 4 44 10" stroke="#FFE082" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M62 18 C66 8 60 4 56 10" stroke="#FFE082" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Gold coin symbol on bag */}
            <circle cx="50" cy="64" r="14" fill="url(#cb-coin)" stroke="#7A5210" strokeWidth="1.5" />
            <text x="50" y="70" textAnchor="middle" fill="#0A2528" fontSize="18" fontWeight="700" fontFamily="serif">$</text>
        </svg>
    );
}
