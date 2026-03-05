import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './HextechTooltip.css';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

// Detect touch device once
const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Safe zone margins (avoid side panels: left ~15%, right ~15%, top ~8%)
// Calculate tooltip position centered near the trigger element
const calculateTooltipPosition = (
    triggerRect: DOMRect,
    preferredPosition: TooltipPosition,
    tooltipWidth: number = 280,
    tooltipHeight: number = 200
) => {
    const gap = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Smart positioning with auto-flip (Unified for Desktop and Touch)
    const spaceTop = triggerRect.top;
    const spaceBottom = vh - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = vw - triggerRect.right;

    let finalPosition = preferredPosition;

    if (preferredPosition === 'top' && spaceTop < tooltipHeight + gap) {
        finalPosition = spaceBottom >= tooltipHeight + gap ? 'bottom' :
            spaceRight >= tooltipWidth + gap ? 'right' : 'left';
    } else if (preferredPosition === 'bottom' && spaceBottom < tooltipHeight + gap) {
        finalPosition = spaceTop >= tooltipHeight + gap ? 'top' :
            spaceRight >= tooltipWidth + gap ? 'right' : 'left';
    } else if (preferredPosition === 'left' && spaceLeft < tooltipWidth + gap) {
        finalPosition = spaceRight >= tooltipWidth + gap ? 'right' :
            spaceTop >= tooltipHeight + gap ? 'top' : 'bottom';
    } else if (preferredPosition === 'right' && spaceRight < tooltipWidth + gap) {
        finalPosition = spaceLeft >= tooltipWidth + gap ? 'left' :
            spaceTop >= tooltipHeight + gap ? 'top' : 'bottom';
    }

    let left = 0;
    let top = 0;

    switch (finalPosition) {
        case 'top':
            left = triggerRect.left + triggerRect.width / 2;
            top = triggerRect.top - gap;
            break;
        case 'bottom':
            left = triggerRect.left + triggerRect.width / 2;
            top = triggerRect.bottom + gap;
            break;
        case 'left':
            left = triggerRect.left - gap;
            top = triggerRect.top + triggerRect.height / 2;
            break;
        case 'right':
            left = triggerRect.right + gap;
            top = triggerRect.top + triggerRect.height / 2;
            break;
    }

    // Clamp to viewport (with safe area allowance on mobile)
    const safeMarginX = isTouchDevice() ? 32 : gap; // Notch protection
    const halfWidth = tooltipWidth / 2;
    if (finalPosition === 'top' || finalPosition === 'bottom') {
        left = Math.max(halfWidth + safeMarginX, Math.min(left, vw - halfWidth - safeMarginX));
    }
    if (finalPosition === 'left' || finalPosition === 'right') {
        // Fix for vertical clamping: Since tooltip is Y-translated by -50%, top represents the center
        const halfHeight = tooltipHeight / 2;
        top = Math.max(halfHeight + gap, Math.min(top, vh - halfHeight - gap));
    }

    return { left, top, position: finalPosition };
};

// Shared hook for tooltip touch/mouse behavior
function useTooltipInteraction(
    position: TooltipPosition,
    tooltipWidth: number,
    tooltipHeight: number
) {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });
    const [actualPosition, setActualPosition] = useState<TooltipPosition>(position);
    const triggerRef = useRef<HTMLDivElement>(null);
    const isTouchedRef = useRef(false);

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const result = calculateTooltipPosition(rect, position, tooltipWidth, tooltipHeight);
        setTooltipPos({ left: result.left, top: result.top });
        setActualPosition(result.position);
    }, [position, tooltipWidth, tooltipHeight]);

    // On touch: mark as touched so mouseEnter is skipped
    const handleTouchStart = useCallback((_e: React.TouchEvent) => {
        isTouchedRef.current = true;
    }, []);

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!isTouchedRef.current) return; // Desktop click → ignore, mouse events handle it
        e.stopPropagation();
        e.preventDefault();
        updatePosition();
        setIsVisible(prev => !prev);
    }, [updatePosition]);

    const handleMouseEnter = useCallback(() => {
        if (isTouchedRef.current) return; // Skip on touch device
        updatePosition();
        setIsVisible(true);
    }, [updatePosition]);

    const handleMouseLeave = useCallback(() => {
        if (isTouchedRef.current) return; // Skip on touch device
        setIsVisible(false);
    }, []);

    // Dismiss on outside tap/click
    useEffect(() => {
        if (!isVisible) return;
        const dismiss = (e: Event) => {
            const target = e.target as Node;
            if (triggerRef.current?.contains(target)) return;
            setIsVisible(false);
        };
        // Use setTimeout to avoid the current tap from immediately dismissing
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

    const wrapperProps = {
        ref: triggerRef,
        onTouchStart: handleTouchStart,
        onClick: handleClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
    };

    return { isVisible, tooltipPos, actualPosition, wrapperProps };
}

// ==========================================================================
// HextechTooltip (generic)
// ==========================================================================

interface HextechTooltipProps {
    title: string;
    description?: string;
    meta?: string;
    position?: TooltipPosition;
    children: React.ReactNode;
    className?: string;
}

export const HextechTooltip: React.FC<HextechTooltipProps> = ({
    title,
    description,
    meta,
    position = 'top',
    children,
    className = ''
}) => {
    const { isVisible, tooltipPos, actualPosition, wrapperProps } =
        useTooltipInteraction(position, 280, 150);

    const tooltipContent = isVisible ? createPortal(
        <div
            className={`hextech-tooltip-portal position-${actualPosition}`}
            style={{ left: tooltipPos.left, top: tooltipPos.top }}
        >
            <div className="hextech-tooltip-title">{title}</div>
            {description && <div className="hextech-tooltip-description">{description}</div>}
            {meta && <div className="hextech-tooltip-meta">{meta}</div>}
        </div>,
        document.body
    ) : null;

    return (
        <div {...wrapperProps} className={`hextech-tooltip-wrapper ${className}`}>
            {children}
            {tooltipContent}
        </div>
    );
};

// ==========================================================================
// ChampionTooltip
// ==========================================================================

interface ChampionStats {
    hp: [number, number, number];
    ad: [number, number, number];
    as: number;
    armor: number;
    mr: number;
    mana: { min: number; max: number };
    range: number;
    dps: [number, number, number];
}

interface AbilityVariable {
    name: string;
    value: number[];
}

const getVariableDisplayName = (name: string): string => {
    const nameMap: Record<string, string> = {
        'Shield': 'Lá Chắn',
        'Damage': 'Sát Thương',
        'MRDamageRatio': 'Sát Thương (MR)',
        'ADDamageRatio': 'Sát Thương (AD)',
        'APDamageRatio': 'Sát Thương (AP)',
        'HealAmount': 'Hồi Máu',
        'Duration': 'Thời Gian',
        'AttackSpeed': 'Tốc Đánh',
        'BonusAD': 'Công Vật Lý',
        'BonusAP': 'Công Phép',
        'Armor': 'Giáp',
        'MagicResist': 'Kháng Phép',
        'PercentMaxHP': 'Max HP %',
        'StunDuration': 'Choáng',
    };
    return nameMap[name] || name;
};

const getScalingIconUrl = (name: string): string => {
    if (name.includes('AD') || name.includes('Attack')) return 'https://ap.tft.tools/img/general/ad.png?w=14';
    if (name.includes('AP') || name.includes('Magic') || name.includes('Damage')) return 'https://ap.tft.tools/img/general/ap.png?w=14';
    if (name.includes('MR')) return 'https://ap.tft.tools/img/general/mr.png?w=14';
    if (name.includes('Shield') || name.includes('Heal')) return 'https://ap.tft.tools/img/general/hp.png?w=14';
    if (name.includes('Armor')) return 'https://ap.tft.tools/img/general/armor.png?w=14';
    return 'https://ap.tft.tools/img/general/ap.png?w=14';
};

interface ChampionTooltipProps {
    name: string;
    cost: number;
    traits: string[];
    items?: string[];
    abilityName?: string;
    abilityDescription?: string;
    abilityVariables?: AbilityVariable[];
    currentStars?: 1 | 2 | 3;
    stats?: ChampionStats;
    position?: TooltipPosition;
    children: React.ReactNode;
}

export const ChampionTooltip: React.FC<ChampionTooltipProps> = ({
    name,
    cost,
    traits,
    items = [],
    abilityName,
    abilityDescription,
    abilityVariables = [],
    currentStars = 1,
    stats,
    position = 'top',
    children
}) => {
    const touch = isTouchDevice();
    const { isVisible, tooltipPos, actualPosition, wrapperProps } =
        useTooltipInteraction(position, touch ? 220 : 360, touch ? 120 : 300);

    // Mobile: compact content — name, traits, key stats inline, items
    const mobileContent = (
        <>
            <div className="hextech-tooltip-title">
                {name}
                <span className={`hextech-tooltip-cost-${cost}`} style={{ marginLeft: '6px' }}>${cost}</span>
            </div>
            {traits.length > 0 && (
                <div className="hextech-tooltip-traits">
                    {traits.map((trait, i) => (
                        <span key={i} className="hextech-tooltip-trait-tag">{trait}</span>
                    ))}
                </div>
            )}
            {stats && (
                <div className="champion-tooltip-compact-stats">
                    <span><img src="https://cdn.tft.tools/general/hp.png" alt="HP" className="compact-stat-icon" />{stats.hp[currentStars - 1]}</span>
                    <span><img src="https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsattackdamageicon.png" alt="AD" className="compact-stat-icon" />{stats.ad[currentStars - 1]}</span>
                    <span><img src="https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsarmoricon.png" alt="AR" className="compact-stat-icon" />{stats.armor}<img src="https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsmagicresicon.png" alt="MR" className="compact-stat-icon" style={{ marginLeft: '4px' }} />{stats.mr}</span>
                    <span><img src="https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsattackspeedicon.png" alt="AS" className="compact-stat-icon" />{stats.as.toFixed(2)}</span>
                </div>
            )}
            {items.length > 0 && (
                <div className="hextech-tooltip-meta">
                    Trang bị: {items.join(', ')}
                </div>
            )}
        </>
    );

    // Desktop: full content with ability, scaling, and detailed stats
    const desktopContent = (
        <>
            <div className="hextech-tooltip-title">
                {name}
                <span className={`hextech-tooltip-cost-${cost}`} style={{ marginLeft: '8px' }}>${cost}</span>
            </div>
            {traits.length > 0 && (
                <div className="hextech-tooltip-traits">
                    {traits.map((trait, i) => (
                        <span key={i} className="hextech-tooltip-trait-tag">{trait}</span>
                    ))}
                </div>
            )}
            {(abilityName || stats) && (
                <div className="hextech-tooltip-content-grid">
                    {abilityName && (
                        <div className="hextech-tooltip-ability">
                            <div className="hextech-tooltip-ability-header">
                                <div className="hextech-tooltip-ability-name">{abilityName}</div>
                                {stats && (
                                    <div className="hextech-tooltip-mana">
                                        <img src="https://cdn.tft.tools/general/mana.png" alt="Mana" className="stat-icon" />
                                        <span>{stats.mana.min}/{stats.mana.max}</span>
                                    </div>
                                )}
                            </div>
                            {abilityDescription && (
                                <div className="hextech-tooltip-ability-desc">{abilityDescription}</div>
                            )}
                            {abilityVariables && abilityVariables.length > 0 && (
                                <div className="ability-scaling-section">
                                    {abilityVariables
                                        .filter(v => {
                                            const starValues = [v.value[1], v.value[2], v.value[3]];
                                            return starValues.some(val => val !== 0 && val !== starValues[0]);
                                        })
                                        .slice(0, 4)
                                        .map((variable, idx) => {
                                            const currentValue = variable.value[currentStars] || variable.value[1];
                                            const displayValues = [
                                                variable.value[1], variable.value[2], variable.value[3]
                                            ].map(v => Math.round(v * 100) / 100);
                                            return (
                                                <div key={idx} className="ability-scaling-row">
                                                    <span className="scaling-name">{getVariableDisplayName(variable.name)}:</span>
                                                    <span className="scaling-current">{Math.round(currentValue * 100) / 100}</span>
                                                    <img src={getScalingIconUrl(variable.name)} alt="scaling" className="scaling-icon" />
                                                    <span className="scaling-values">[{displayValues.join('/')}]</span>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            )}
                        </div>
                    )}
                    {stats && (
                        <div className="hextech-tooltip-stats">
                            <div className="stat-item">
                                <img src="https://cdn.tft.tools/general/hp.png" alt="HP" className="stat-icon" />
                                <span className="stat-values">{stats.hp[0]}/{stats.hp[1]}/{stats.hp[2]}</span>
                            </div>
                            <div className="stat-item">
                                <img src="https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsattackdamageicon.png" alt="AD" className="stat-icon" />
                                <span className="stat-values">{stats.ad[0]}/{stats.ad[1]}/{stats.ad[2]}</span>
                            </div>
                            <div className="stat-item">
                                <img src="https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsarmoricon.png" alt="AR" className="stat-icon" />
                                <span className="stat-values">{stats.armor}</span>
                                <img src="https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsmagicresicon.png" alt="MR" className="stat-icon" style={{ marginLeft: '8px' }} />
                                <span className="stat-values">{stats.mr}</span>
                            </div>
                            <div className="stat-item">
                                <img src="https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsattackspeedicon.png" alt="AS" className="stat-icon" />
                                <span className="stat-values">{stats.as.toFixed(2)}</span>
                            </div>
                            <div className="stat-item">
                                <img src="https://cdn.tft.tools/general/range.png" alt="Range" className="stat-icon" />
                                <span className="stat-values">{stats.range}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {items.length > 0 && (
                <div className="hextech-tooltip-meta">Trang bị: {items.join(', ')}</div>
            )}
        </>
    );

    const tooltipContent = isVisible ? createPortal(
        <div
            className={`hextech-tooltip-portal champion-tooltip ${touch ? 'champion-tooltip-compact' : ''} position-${actualPosition}`}
            style={{ left: tooltipPos.left, top: tooltipPos.top }}
        >
            {touch ? mobileContent : desktopContent}
        </div>,
        document.body
    ) : null;

    return (
        <div {...wrapperProps} className="hextech-tooltip-wrapper">
            {children}
            {tooltipContent}
        </div>
    );
};

// ==========================================================================
// TraitTooltip
// ==========================================================================

interface TraitTooltipProps {
    name: string;
    description: string;
    activeCount?: number;
    breakpoints?: number[];
    position?: TooltipPosition;
    children: React.ReactNode;
}

export const TraitTooltip: React.FC<TraitTooltipProps> = ({
    name,
    description,
    position = 'right',
    children
}) => {
    const { isVisible, tooltipPos, actualPosition, wrapperProps } =
        useTooltipInteraction(position, 280, 150);

    const tooltipContent = isVisible ? createPortal(
        <div
            className={`hextech-tooltip-portal position-${actualPosition}`}
            style={{ left: tooltipPos.left, top: tooltipPos.top }}
        >
            <div className="hextech-tooltip-title">{name}</div>
            {description && <div className="hextech-tooltip-description">{description}</div>}
        </div>,
        document.body
    ) : null;

    return (
        <div {...wrapperProps} className="hextech-tooltip-wrapper">
            {children}
            {tooltipContent}
        </div>
    );
};

// ==========================================================================
// ItemTooltip
// ==========================================================================

interface ItemTooltipProps {
    name: string;
    description: string;
    position?: TooltipPosition;
    children: React.ReactNode;
}

export const ItemTooltip: React.FC<ItemTooltipProps> = ({
    name,
    description,
    position = 'left',
    children
}) => {
    const { isVisible, tooltipPos, actualPosition, wrapperProps } =
        useTooltipInteraction(position, 280, 150);

    const tooltipContent = isVisible ? createPortal(
        <div
            className={`hextech-tooltip-portal position-${actualPosition}`}
            style={{ left: tooltipPos.left, top: tooltipPos.top }}
        >
            <div className="hextech-tooltip-title">{name}</div>
            {description && <div className="hextech-tooltip-description">{description}</div>}
        </div>,
        document.body
    ) : null;

    return (
        <div {...wrapperProps} className="hextech-tooltip-wrapper">
            {children}
            {tooltipContent}
        </div>
    );
};

// ==========================================================================
// AugmentTooltip
// ==========================================================================

interface AugmentTooltipProps {
    title: string;
    description: string;
    tier: 1 | 2 | 3;
    position?: TooltipPosition;
    children: React.ReactNode;
}

export const AugmentTooltip: React.FC<AugmentTooltipProps> = ({
    title,
    description,
    position = 'bottom',
    children
}) => {
    const { isVisible, tooltipPos, actualPosition, wrapperProps } =
        useTooltipInteraction(position, 280, 150);

    const tooltipContent = isVisible ? createPortal(
        <div
            className={`hextech-tooltip-portal position-${actualPosition}`}
            style={{ left: tooltipPos.left, top: tooltipPos.top }}
        >
            <div className="hextech-tooltip-title">{title}</div>
            <div className="hextech-tooltip-description">{description}</div>
        </div>,
        document.body
    ) : null;

    return (
        <div {...wrapperProps} className="hextech-tooltip-wrapper">
            {children}
            {tooltipContent}
        </div>
    );
};
