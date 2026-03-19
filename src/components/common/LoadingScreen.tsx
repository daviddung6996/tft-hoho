import './LoadingScreen.css';

interface LoadingScreenProps {
    message?: string;
    /** Wraps in a full-area overlay (for main app loading state) */
    shell?: boolean;
}

/**
 * Hextech-branded loading screen — TFTISEASY identity.
 * Pure CSS animations, GPU-composited (transform + opacity only).
 */
export function LoadingScreen({ message = 'Đang tải...', shell = false }: LoadingScreenProps) {
    const content = (
        <div className="hex-load">
            <div className="hex-load__ring">
                {/* Orbiting energy particles */}
                <div className="hex-load__orbit">
                    <span className="hex-load__particle" />
                    <span className="hex-load__particle" />
                    <span className="hex-load__particle" />
                </div>

                {/* Central hextech mark */}
                <svg
                    className="hex-load__mark"
                    width="96"
                    height="96"
                    viewBox="0 0 120 120"
                    fill="none"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="hlBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.7" />
                            <stop offset="50%" stopColor="#A07828" stopOpacity="0.22" />
                            <stop offset="100%" stopColor="#FFD700" stopOpacity="0.7" />
                        </linearGradient>
                        <radialGradient id="hlCoin" cx="42%" cy="38%" r="55%">
                            <stop offset="0%" stopColor="#FFE082" />
                            <stop offset="45%" stopColor="#C89B3C" />
                            <stop offset="100%" stopColor="#8B6914" />
                        </radialGradient>
                        <linearGradient id="hlInner" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.5" />
                            <stop offset="50%" stopColor="#C89B3C" stopOpacity="0.12" />
                            <stop offset="100%" stopColor="#FFD700" stopOpacity="0.5" />
                        </linearGradient>
                        <linearGradient id="hlShine" x1="30%" y1="10%" x2="70%" y2="60%">
                            <stop offset="0%" stopColor="white" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Circuit lines radiating from hex vertices */}
                    {[
                        [60, 10, 60, 2], [104, 33, 114, 27], [104, 87, 114, 93],
                        [60, 110, 60, 118], [16, 87, 6, 93], [16, 33, 6, 27],
                    ].map(([x1, y1, x2, y2], i) => (
                        <line
                            key={i}
                            x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke="#FFD700" strokeWidth="0.7" opacity="0.18"
                        />
                    ))}

                    {/* Hexagonal border frame */}
                    <polygon
                        points="60,10 104,33 104,87 60,110 16,87 16,33"
                        fill="none"
                        stroke="url(#hlBorder)"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />

                    {/* Vertex accent gems */}
                    {[[60,10],[104,33],[104,87],[60,110],[16,87],[16,33]].map(([cx, cy], i) => (
                        <circle key={i} cx={cx} cy={cy} r="2" fill="#FFD700" opacity="0.45" />
                    ))}

                    {/* Gold coin face */}
                    <circle cx="60" cy="60" r="30" fill="url(#hlCoin)" />

                    {/* Inner ornate ring */}
                    <circle cx="60" cy="60" r="25" fill="none" stroke="url(#hlInner)" strokeWidth="0.8" />

                    {/* Rune dots on inner ring (6 points) */}
                    {[0, 60, 120, 180, 240, 300].map((angle) => {
                        const rad = (angle * Math.PI) / 180;
                        return (
                            <circle
                                key={angle}
                                cx={60 + 25 * Math.cos(rad)}
                                cy={60 + 25 * Math.sin(rad)}
                                r="1.2"
                                fill="#FFD700"
                                opacity="0.4"
                            />
                        );
                    })}

                    {/* Bold T letter — brand mark */}
                    <text
                        x="60" y="70"
                        textAnchor="middle"
                        fontFamily="'Spectral', 'Georgia', serif"
                        fontWeight="800"
                        fontSize="30"
                        fill="#5C3D0E"
                        letterSpacing="-0.5"
                    >T</text>
                    {/* T highlight stroke */}
                    <text
                        x="60" y="70"
                        textAnchor="middle"
                        fontFamily="'Spectral', 'Georgia', serif"
                        fontWeight="800"
                        fontSize="30"
                        fill="none"
                        stroke="#FFE082"
                        strokeWidth="0.3"
                        opacity="0.4"
                        letterSpacing="-0.5"
                    >T</text>

                    {/* Top-left shine (3D depth) */}
                    <ellipse cx="48" cy="48" rx="14" ry="10" fill="url(#hlShine)" />
                </svg>
            </div>

            {/* Brand identity */}
            <span className="hex-load__brand">TFTISEASY</span>

            {/* Shimmer loading bar */}
            <div className="hex-load__track">
                <div className="hex-load__fill" />
            </div>

            {/* Status message */}
            <span className="hex-load__msg">{message}</span>
        </div>
    );

    if (!shell) return content;

    return (
        <div className="hex-load__shell" aria-live="polite">
            {content}
        </div>
    );
}
