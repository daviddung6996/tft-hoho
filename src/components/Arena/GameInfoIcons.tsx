import React, { useState, useRef, useCallback } from 'react';
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
}

/**
 * Game Info Icons - Displays Ionia Path and Void Mod indicators
 * Pro players check these at the start of every match
 */
export const GameInfoIcons: React.FC<GameInfoIconsProps> = ({
    ioniaPath,
    voidMods
}) => {
    return (
        <div className="game-info-icons">
            <IoniaIcon path={ioniaPath} />
            <VoidIcon mods={voidMods} />
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
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setTooltipPos({
                left: rect.right + 8,
                top: rect.top + rect.height / 2
            });
            setIsVisible(true);
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsVisible(false);
    }, []);

    const tooltipContent = isVisible ? createPortal(
        <div
            className="game-info-tooltip-portal position-right"
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
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setTooltipPos({
                left: rect.right + 8,
                top: rect.top + rect.height / 2
            });
            setIsVisible(true);
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsVisible(false);
    }, []);

    const tooltipContent = isVisible ? createPortal(
        <div
            className="game-info-tooltip-portal position-right"
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
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <img src={VOID_ICON_URL} alt="Void Mods" draggable={false} />
            {tooltipContent}
        </div>
    );
};

export default GameInfoIcons;
