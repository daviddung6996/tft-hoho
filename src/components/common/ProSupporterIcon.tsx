import type { CSSProperties } from 'react';

interface ProSupporterIconProps {
    size?: number;
    className?: string;
    style?: CSSProperties;
}

/**
 * ProSupporterIcon — simplified shield badge with star + blue gem.
 * Hextech gold palette. Inline SVG, no deps.
 */
export function ProSupporterIcon({ size = 24, className = '', style }: ProSupporterIconProps) {
    return (
        <svg
            className={className}
            style={style}
            width={size}
            height={size}
            viewBox="0 -10 100 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Pro Supporter"
        >
            <defs>
                <linearGradient id="ps2-shield-border" x1="20%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor="#FFE082" />
                    <stop offset="50%" stopColor="#C89B3C" />
                    <stop offset="100%" stopColor="#7A5210" />
                </linearGradient>

                <linearGradient id="ps2-shield-face" x1="30%" y1="0%" x2="70%" y2="100%">
                    <stop offset="0%" stopColor="#1e4a50" />
                    <stop offset="100%" stopColor="#0d2228" />
                </linearGradient>

                <linearGradient id="ps2-star" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#FFE57A" />
                    <stop offset="100%" stopColor="#C89B3C" />
                </linearGradient>

                <radialGradient id="ps2-gem" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor="#B8E8FF" />
                    <stop offset="45%" stopColor="#3D9FE0" />
                    <stop offset="100%" stopColor="#1056A0" />
                </radialGradient>

                <filter id="ps2-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                    <feFlood floodColor="#C89B3C" floodOpacity="0.4" result="gc" />
                    <feComposite in="gc" in2="blur" operator="in" result="g" />
                    <feMerge>
                        <feMergeNode in="g" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                <filter id="ps2-gem-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#60CFFF" floodOpacity="0.6" result="gc" />
                    <feComposite in="gc" in2="blur" operator="in" result="g" />
                    <feMerge>
                        <feMergeNode in="g" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* ── SHIELD OUTER (gold border) ── */}
            <g filter="url(#ps2-glow)">
                {/* Shield border shape — shifted down 8px */}
                <path
                    d="M50 22 L78 32 L78 60 C78 77 64 88 50 93 C36 88 22 77 22 60 L22 32 Z"
                    fill="url(#ps2-shield-border)"
                />
                {/* Shield inner face */}
                <path
                    d="M50 27 L73 36 L73 60 C73 73 60 83 50 88 C40 83 27 73 27 60 L27 36 Z"
                    fill="url(#ps2-shield-face)"
                />
            </g>

            {/* Shield inner rim highlight */}
            <path
                d="M50 27 L73 36 L73 60 C73 73 60 83 50 88"
                stroke="rgba(255,224,130,0.18)"
                strokeWidth="1.2"
                fill="none"
            />

            {/* ── GEM (centered in shield) ── */}
            <g filter="url(#ps2-gem-glow)">
                {/* Main gem (rotated square = diamond shape) */}
                <polygon
                    points="50,40 62,52 50,68 38,52"
                    fill="url(#ps2-gem)"
                />
                {/* Top-left facet (lighter) */}
                <polygon
                    points="50,40 62,52 50,54"
                    fill="rgba(190,235,255,0.55)"
                />
                {/* Top-right facet (mid) */}
                <polygon
                    points="50,40 38,52 50,54"
                    fill="rgba(40,150,220,0.65)"
                />
                {/* Bottom facet (dark) */}
                <polygon
                    points="50,54 62,52 50,68 38,52"
                    fill="rgba(10,60,130,0.45)"
                />
                {/* Shine */}
                <ellipse cx="47" cy="46" rx="4" ry="2.5" fill="white" opacity="0.38" transform="rotate(-30 47 46)" />
            </g>

            {/* ── 3 STARS at shield corners — bigger, floating above ── */}
            {/* Top-left corner */}
            <g transform="translate(20, 18)" filter="url(#ps2-glow)">
                <StarPath outerR={11} innerR={4.5} fill="url(#ps2-star)" stroke="#A07020" strokeWidth={0.7} />
            </g>
            {/* Top center apex */}
            <g transform="translate(50, 8)" filter="url(#ps2-glow)">
                <StarPath outerR={11} innerR={4.5} fill="url(#ps2-star)" stroke="#A07020" strokeWidth={0.7} />
            </g>
            {/* Top-right corner */}
            <g transform="translate(80, 18)" filter="url(#ps2-glow)">
                <StarPath outerR={11} innerR={4.5} fill="url(#ps2-star)" stroke="#A07020" strokeWidth={0.7} />
            </g>
        </svg>
    );
}

function StarPath({ outerR, innerR, fill, stroke, strokeWidth }: {
    outerR: number;
    innerR: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
}) {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        pts.push(`${(Math.cos(angle) * r).toFixed(2)},${(Math.sin(angle) * r).toFixed(2)}`);
    }
    return (
        <polygon
            points={pts.join(' ')}
            fill={fill}
            stroke={stroke}
            strokeWidth={String(strokeWidth)}
        />
    );
}
