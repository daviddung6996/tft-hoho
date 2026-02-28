import './TCoinIcon.css';

interface TCoinIconProps {
    size?: number;
    className?: string;
}

/**
 * Custom SVG T-Coin icon — Hextech gold coin with ornate border,
 * bold "T" letter, and ambient glow. Inspired by the TFTISEASY brand.
 */
export function TCoinIcon({ size = 20, className = '' }: TCoinIconProps) {
    return (
        <svg
            className={`tcoin-icon-svg ${className}`}
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* Outer glow */}
                <filter id="tcoin-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                    <feFlood floodColor="#FFD700" floodOpacity="0.4" result="glow-color" />
                    <feComposite in="glow-color" in2="blur" operator="in" result="glow" />
                    <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Coin face gradient */}
                <radialGradient id="tcoin-face" cx="40%" cy="35%" r="55%">
                    <stop offset="0%" stopColor="#FFE082" />
                    <stop offset="40%" stopColor="#FFD54F" />
                    <stop offset="75%" stopColor="#C89B3C" />
                    <stop offset="100%" stopColor="#8B6914" />
                </radialGradient>

                {/* Rim gradient for 3D depth */}
                <linearGradient id="tcoin-rim" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE082" />
                    <stop offset="30%" stopColor="#C89B3C" />
                    <stop offset="70%" stopColor="#A07828" />
                    <stop offset="100%" stopColor="#6B4F1A" />
                </linearGradient>

                {/* Inner ring gradient */}
                <linearGradient id="tcoin-inner-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#C89B3C" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#FFD700" stopOpacity="0.6" />
                </linearGradient>

                {/* T letter gradient */}
                <linearGradient id="tcoin-letter" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#6B4F1A" />
                    <stop offset="40%" stopColor="#8B6914" />
                    <stop offset="100%" stopColor="#5C3D0E" />
                </linearGradient>

                {/* Highlight shine */}
                <linearGradient id="tcoin-shine" x1="30%" y1="10%" x2="70%" y2="50%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
            </defs>

            <g filter="url(#tcoin-glow)">
                {/* Outer rim (3D edge) */}
                <circle cx="32" cy="33" r="27" fill="#6B4F1A" />
                <circle cx="32" cy="32" r="27" fill="url(#tcoin-rim)" />

                {/* Main coin face */}
                <circle cx="32" cy="32" r="23.5" fill="url(#tcoin-face)" />

                {/* Ornate inner ring */}
                <circle cx="32" cy="32" r="20" fill="none" stroke="url(#tcoin-inner-ring)" strokeWidth="1.2" />

                {/* Decorative dots around the inner ring (8 points like compass) */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                    const rad = (angle * Math.PI) / 180;
                    const cx = 32 + 20 * Math.cos(rad);
                    const cy = 32 + 20 * Math.sin(rad);
                    return <circle key={angle} cx={cx} cy={cy} r="1.2" fill="#FFD700" opacity="0.7" />;
                })}

                {/* Small decorative arcs between dots */}
                {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle) => {
                    const rad = (angle * Math.PI) / 180;
                    const cx = 32 + 20 * Math.cos(rad);
                    const cy = 32 + 20 * Math.sin(rad);
                    return <circle key={angle} cx={cx} cy={cy} r="0.6" fill="#C89B3C" opacity="0.5" />;
                })}

                {/* Bold "T" Letter — centered, strong serif style */}
                <text
                    x="32"
                    y="40"
                    textAnchor="middle"
                    fontFamily="'Spectral', 'Georgia', serif"
                    fontWeight="800"
                    fontSize="26"
                    fill="url(#tcoin-letter)"
                    letterSpacing="-0.5"
                >
                    T
                </text>

                {/* T letter shadow for depth */}
                <text
                    x="32"
                    y="40"
                    textAnchor="middle"
                    fontFamily="'Spectral', 'Georgia', serif"
                    fontWeight="800"
                    fontSize="26"
                    fill="none"
                    stroke="#FFE082"
                    strokeWidth="0.3"
                    opacity="0.4"
                    letterSpacing="-0.5"
                >
                    T
                </text>

                {/* Top-left highlight shine (3D illusion) */}
                <ellipse cx="25" cy="24" rx="10" ry="7" fill="url(#tcoin-shine)" />
            </g>
        </svg>
    );
}
