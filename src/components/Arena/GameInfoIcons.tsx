import React, { useState, useRef, useCallback, useId, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './GameInfoIcons.css';
import { IoniaPath, VoidMod } from '../../data/gameInfoData';
import { getTraitIconUrl } from '../../utils/assetUrlBuilder';

// Ionia trait icon from CDN
const IONIA_ICON_URL = getTraitIconUrl('Ionia');
// Void trait icon from CDN
const VOID_ICON_URL = getTraitIconUrl('Void');

interface GameInfoIconsProps {
    ioniaPath: IoniaPath;
    voidMods: VoidMod[];
    streakCount?: number;
}

/**
 * Game Info Icons - Displays Ionia Path and Void Mod indicators
 * Pro players check these at the start of every match
 */
export const GameInfoIcons: React.FC<GameInfoIconsProps> = ({
    ioniaPath,
    voidMods,
    streakCount,
}) => {
    return (
        <div className="game-info-icons">
            {typeof streakCount === 'number' && streakCount !== 0 && (
                <StreakIcon
                    count={Math.abs(streakCount)}
                    type={streakCount > 0 ? 'win' : 'loss'}
                />
            )}
            <div className="game-info-icons__trait-group">
                <IoniaIcon path={ioniaPath} />
                <VoidIcon mods={voidMods} />
            </div>
        </div>
    );
};

type StreakType = 'win' | 'loss';

interface StreakIconProps {
    count: number;
    type: StreakType;
}

const StreakIcon: React.FC<StreakIconProps> = ({ count, type }) => {
    const isLoss = type === 'loss';
    const uid = useId().replace(/:/g, '');
    const bgGradientId = `streak-bg-${uid}`;
    const rimGradientId = `streak-rim-${uid}`;
    const flameOuterId = `streak-flame-outer-${uid}`;
    const flameMidId = `streak-flame-mid-${uid}`;
    const flameInnerId = `streak-flame-inner-${uid}`;
    const glowFilterId = `streak-glow-${uid}`;
    const titleText = isLoss ? `Chuoi thua: ${count}` : `Chuoi thang: ${count}`;
    const palette = isLoss
        ? {
            bgStart: '#0D1219',
            bgMid: '#070B10',
            bgEnd: '#020406',
            rimStart: '#7DD3FC',
            rimMid: '#38BDF8',
            rimEnd: '#0C4A6E',
            coreFill: 'rgba(1, 8, 15, 0.74)',
            flameOuterStart: '#1B8AC9',
            flameOuterMid: '#0D6FA8',
            flameOuterEnd: '#05436D',
            flameMidStart: '#6AC2EE',
            flameMidMid: '#3EA8DC',
            flameMidEnd: '#0F79B1',
            flameInnerStart: '#CDEBFA',
            flameInnerMid: '#A4D9F2',
            flameInnerEnd: '#6EB9E0',
            glowColor: '#38BDF8',
            glowOpacity: '0.16',
            sparkA: '#9FD3EE',
            sparkB: '#64ADD6',
            sparkAO: '0.24',
            sparkBO: '0.2',
            glintO: '0.08',
            flameTranslate: 'translate(5.9 5.0) scale(0.185)',
        }
        : {
            bgStart: '#6B4B1A',
            bgMid: '#4A3210',
            bgEnd: '#2A1A08',
            rimStart: '#F3D38A',
            rimMid: '#C8AA6E',
            rimEnd: '#7B5A2A',
            coreFill: 'rgba(28, 18, 6, 0.46)',
            flameOuterStart: '#FF8A1D',
            flameOuterMid: '#FF5B0A',
            flameOuterEnd: '#BF2500',
            flameMidStart: '#FFD34A',
            flameMidMid: '#FF9E18',
            flameMidEnd: '#FF6400',
            flameInnerStart: '#FFF4B2',
            flameInnerMid: '#FFE36B',
            flameInnerEnd: '#FFBF2E',
            glowColor: '#FF8A1D',
            glowOpacity: '0.58',
            sparkA: '#FFCC63',
            sparkB: '#FFB34A',
            sparkAO: '0.88',
            sparkBO: '0.72',
            glintO: '0.25',
            flameTranslate: 'translate(4.3 2.9) scale(0.24)',
        };

    return (
        <div className={`game-info-streak game-info-streak--${type}`} title={titleText}>
            <span className="game-info-streak__emblem">
                <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <defs>
                        <radialGradient id={bgGradientId} cx="50%" cy="35%" r="72%">
                            <stop offset="0%" stopColor={palette.bgStart} />
                            <stop offset="55%" stopColor={palette.bgMid} />
                            <stop offset="100%" stopColor={palette.bgEnd} />
                        </radialGradient>
                        <linearGradient id={rimGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={palette.rimStart} />
                            <stop offset="60%" stopColor={palette.rimMid} />
                            <stop offset="100%" stopColor={palette.rimEnd} />
                        </linearGradient>
                        <radialGradient id={flameOuterId} cx="50%" cy="82%" r="78%">
                            <stop offset="0%" stopColor={palette.flameOuterStart} />
                            <stop offset="60%" stopColor={palette.flameOuterMid} />
                            <stop offset="100%" stopColor={palette.flameOuterEnd} />
                        </radialGradient>
                        <radialGradient id={flameMidId} cx="50%" cy="76%" r="68%">
                            <stop offset="0%" stopColor={palette.flameMidStart} />
                            <stop offset="65%" stopColor={palette.flameMidMid} />
                            <stop offset="100%" stopColor={palette.flameMidEnd} />
                        </radialGradient>
                        <radialGradient id={flameInnerId} cx="50%" cy="86%" r="58%">
                            <stop offset="0%" stopColor={palette.flameInnerStart} />
                            <stop offset="55%" stopColor={palette.flameInnerMid} />
                            <stop offset="100%" stopColor={palette.flameInnerEnd} />
                        </radialGradient>
                        <filter id={glowFilterId} x="-35%" y="-35%" width="170%" height="170%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="1.35" result="blur" />
                            <feFlood floodColor={palette.glowColor} floodOpacity={palette.glowOpacity} result="tint" />
                            <feComposite in="tint" in2="blur" operator="in" result="glow" />
                            <feMerge>
                                <feMergeNode in="glow" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <circle cx="16" cy="16" r="14.4" fill={`url(#${bgGradientId})`} />
                    <circle cx="16" cy="16" r="13.8" stroke={`url(#${rimGradientId})`} strokeWidth="1.2" />
                    <circle cx="16" cy="16" r="9.4" fill={palette.coreFill} />

                    <g transform={palette.flameTranslate} filter={`url(#${glowFilterId})`}>
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
                            fill={`url(#${flameOuterId})`}
                        />
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
                            fill={`url(#${flameMidId})`}
                        />
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
                            fill={`url(#${flameInnerId})`}
                        />
                    </g>

                    <path d="M10 7.4L11 5.8L12 7.4L11 8.6Z" fill={palette.sparkA} opacity={palette.sparkAO} />
                    <path d="M22.4 8.9L23.2 7.5L24 8.9L23.2 10.1Z" fill={palette.sparkB} opacity={palette.sparkBO} />
                    <ellipse cx="16.1" cy="9.9" rx="1.1" ry="1.7" fill="#FFF1B8" opacity={palette.glintO} />
                </svg>
            </span>
            <span className="game-info-streak__count">{count}</span>
        </div>
    );
};
// ============================================================================
// IONIA ICON WITH TOOLTIP
// ============================================================================

interface IoniaIconProps {
    path: IoniaPath;
}

const IoniaIcon: React.FC<IoniaIconProps> = ({ path }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });
    const [posClass, setPosClass] = useState('position-right');
    const triggerRef = useRef<HTMLDivElement>(null);
    const isTouchedRef = useRef(false);

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const isTouch = isTouchedRef.current;
        if (isTouch) {
            // Place above the icon, centered horizontally
            setTooltipPos({
                left: rect.left + rect.width / 2,
                top: rect.top - 8
            });
            setPosClass('position-top');
        } else {
            setTooltipPos({
                left: rect.right + 8,
                top: rect.top + rect.height / 2
            });
            setPosClass('position-right');
        }
    }, []);

    const handleTouchStart = useCallback(() => { isTouchedRef.current = true; }, []);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!isTouchedRef.current) return;
        e.stopPropagation();
        e.preventDefault();
        updatePosition();
        setIsVisible(prev => !prev);
    }, [updatePosition]);

    const handleMouseEnter = useCallback(() => {
        if (isTouchedRef.current) return;
        updatePosition();
        setIsVisible(true);
    }, [updatePosition]);

    const handleMouseLeave = useCallback(() => {
        if (isTouchedRef.current) return;
        setIsVisible(false);
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        const dismiss = (e: Event) => {
            const target = e.target as Node;
            if (triggerRef.current?.contains(target)) return;
            setIsVisible(false);
        };
        const timer = setTimeout(() => {
            document.addEventListener('touchstart', dismiss, { passive: true });
            document.addEventListener('mousedown', dismiss);
        }, 10);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('touchstart', dismiss);
            document.removeEventListener('mousedown', dismiss);
        };
    }, [isVisible]);

    const tooltipContent = isVisible ? createPortal(
        <div
            className={`game-info-tooltip-portal ${posClass}`}
            style={{
                left: tooltipPos.left,
                top: tooltipPos.top,
            }}
        >
            <div className="game-info-header">
                <div className="game-info-header-icon">
                    <img src={IONIA_ICON_URL} alt="Ionia" />
                </div>
                <div className="game-info-title">{path.nameVi}</div>
            </div>
            <div className="game-info-description">{path.description}</div>
            <div className="game-info-breakpoints">
                {path.breakpoints.map((bp, index) => (
                    <div key={index} className="game-info-breakpoint">
                        <span className="game-info-breakpoint-level">({bp.level})</span>
                        <span className="game-info-breakpoint-stats">{bp.stats}</span>
                    </div>
                ))}
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div
            ref={triggerRef}
            className="game-info-icon ionia-icon"
            onTouchStart={handleTouchStart}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <img src={IONIA_ICON_URL} alt="Ionia Path" draggable={false} />
            {tooltipContent}
        </div>
    );
};

// ============================================================================
// VOID ICON WITH TOOLTIP
// ============================================================================

interface VoidIconProps {
    mods: VoidMod[];
}

const VoidIcon: React.FC<VoidIconProps> = ({ mods }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });
    const [posClass, setPosClass] = useState('position-right');
    const triggerRef = useRef<HTMLDivElement>(null);
    const isTouchedRef = useRef(false);

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const isTouch = isTouchedRef.current;
        if (isTouch) {
            setTooltipPos({
                left: rect.left + rect.width / 2,
                top: rect.top - 8
            });
            setPosClass('position-top');
        } else {
            setTooltipPos({
                left: rect.right + 8,
                top: rect.top + rect.height / 2
            });
            setPosClass('position-right');
        }
    }, []);

    const handleTouchStart = useCallback(() => { isTouchedRef.current = true; }, []);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!isTouchedRef.current) return;
        e.stopPropagation();
        e.preventDefault();
        updatePosition();
        setIsVisible(prev => !prev);
    }, [updatePosition]);

    const handleMouseEnter = useCallback(() => {
        if (isTouchedRef.current) return;
        updatePosition();
        setIsVisible(true);
    }, [updatePosition]);

    const handleMouseLeave = useCallback(() => {
        if (isTouchedRef.current) return;
        setIsVisible(false);
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        const dismiss = (e: Event) => {
            const target = e.target as Node;
            if (triggerRef.current?.contains(target)) return;
            setIsVisible(false);
        };
        const timer = setTimeout(() => {
            document.addEventListener('touchstart', dismiss, { passive: true });
            document.addEventListener('mousedown', dismiss);
        }, 10);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('touchstart', dismiss);
            document.removeEventListener('mousedown', dismiss);
        };
    }, [isVisible]);

    const tooltipContent = isVisible ? createPortal(
        <div
            className={`game-info-tooltip-portal ${posClass}`}
            style={{
                left: tooltipPos.left,
                top: tooltipPos.top,
            }}
        >
            <div className="game-info-header">
                <div className="game-info-header-icon">
                    <img src={VOID_ICON_URL} alt="Void" />
                </div>
                <div className="game-info-title">Hư Không</div>
            </div>
            <div className="game-info-mods-list">
                {mods.map((mod, index) => (
                    <div key={mod.id} className="game-info-mod-item">
                        <span className="game-info-mod-index">{index + 1}.</span>
                        <div className="game-info-mod-icon">
                            <img src={mod.icon} alt={mod.nameVi} />
                        </div>
                        <div className="game-info-mod-details">
                            <div className="game-info-mod-name">{mod.nameVi}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div
            ref={triggerRef}
            className="game-info-icon void-icon"
            onTouchStart={handleTouchStart}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <img src={VOID_ICON_URL} alt="Void Mods" draggable={false} />
            {tooltipContent}
        </div>
    );
};

export default GameInfoIcons;


