import type { CSSProperties } from 'react';

interface FlameIconProps {
    size?: number;
    className?: string;
    style?: CSSProperties;
}

export function FlameIcon({ size = 24, className = '', style }: FlameIconProps) {
    return (
        <svg
            className={className}
            style={style}
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Flame"
        >
            <defs>
                <radialGradient id="fl-outer" cx="50%" cy="80%" r="70%">
                    <stop offset="0%" stopColor="#FF6B00" />
                    <stop offset="50%" stopColor="#FF4500" />
                    <stop offset="100%" stopColor="#CC2200" />
                </radialGradient>
                <radialGradient id="fl-mid" cx="50%" cy="75%" r="65%">
                    <stop offset="0%" stopColor="#FFCC00" />
                    <stop offset="60%" stopColor="#FF8C00" />
                    <stop offset="100%" stopColor="#FF5500" />
                </radialGradient>
                <radialGradient id="fl-inner" cx="50%" cy="85%" r="55%">
                    <stop offset="0%" stopColor="#FFF5A0" />
                    <stop offset="50%" stopColor="#FFE040" />
                    <stop offset="100%" stopColor="#FFAA00" />
                </radialGradient>
                <filter id="fl-glow" x="-25%" y="-25%" width="150%" height="150%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                    <feFlood floodColor="#FF6600" floodOpacity="0.5" result="gc" />
                    <feComposite in="gc" in2="blur" operator="in" result="g" />
                    <feMerge>
                        <feMergeNode in="g" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Outer flame */}
            <g filter="url(#fl-glow)">
                <path
                    d="M50 8
                       C50 8 62 22 65 34
                       C68 28 66 18 60 12
                       C72 20 78 36 76 50
                       C80 44 80 36 76 28
                       C84 38 86 54 80 66
                       C86 60 88 50 84 40
                       C90 52 88 68 80 78
                       C74 88 62 94 50 94
                       C38 94 26 88 20 78
                       C12 68 10 52 16 40
                       C12 50 14 60 20 66
                       C14 54 16 38 24 28
                       C20 36 20 44 24 50
                       C18 36 24 20 36 12
                       C30 18 28 28 31 34
                       C34 22 50 8 50 8Z"
                    fill="url(#fl-outer)"
                />
            </g>

            {/* Mid flame */}
            <path
                d="M50 28
                   C50 28 58 38 60 48
                   C63 42 62 34 58 28
                   C66 36 70 48 66 58
                   C70 54 70 46 68 40
                   C72 50 70 62 64 70
                   C68 64 68 56 64 50
                   C68 58 66 70 60 78
                   C56 84 52 88 50 88
                   C48 88 44 84 40 78
                   C34 70 32 58 36 50
                   C32 56 32 64 36 70
                   C30 62 28 50 32 40
                   C30 46 30 54 34 58
                   C30 48 34 36 42 28
                   C38 34 37 42 40 48
                   C42 38 50 28 50 28Z"
                fill="url(#fl-mid)"
            />

            {/* Inner bright core */}
            <path
                d="M50 50
                   C50 50 56 56 57 62
                   C60 58 59 52 56 48
                   C61 54 62 62 58 68
                   C61 64 60 58 58 54
                   C60 60 58 68 54 74
                   C52 78 51 80 50 80
                   C49 80 48 78 46 74
                   C42 68 40 60 42 54
                   C40 58 39 64 42 68
                   C38 62 39 54 44 48
                   C41 52 40 58 43 62
                   C44 56 50 50 50 50Z"
                fill="url(#fl-inner)"
            />

            {/* Bright tip glint */}
            <ellipse cx="50" cy="20" rx="4" ry="7" fill="white" opacity="0.25" />
        </svg>
    );
}
