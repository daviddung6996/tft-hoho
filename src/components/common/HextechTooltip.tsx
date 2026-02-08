import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './HextechTooltip.css';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface HextechTooltipProps {
    title: string;
    description?: string;
    meta?: string;
    position?: TooltipPosition;
    children: React.ReactNode;
    className?: string;
}

// Calculate tooltip position with smart auto-flip to prevent clipping
const calculateSmartTooltipPosition = (
    triggerRect: DOMRect,
    preferredPosition: TooltipPosition,
    tooltipWidth: number = 520,
    tooltipHeight: number = 400
) => {
    const gap = 8;
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    // Calculate available space in each direction
    const spaceTop = triggerRect.top;
    const spaceBottom = viewport.height - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = viewport.width - triggerRect.right;

    // Determine best position based on available space
    let finalPosition = preferredPosition;

    // Auto-flip logic
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

    // Clamp to viewport bounds
    const halfWidth = tooltipWidth / 2;
    if (finalPosition === 'top' || finalPosition === 'bottom') {
        left = Math.max(halfWidth + gap, Math.min(left, viewport.width - halfWidth - gap));
    }
    if (finalPosition === 'left' || finalPosition === 'right') {
        top = Math.max(gap, Math.min(top, viewport.height - tooltipHeight - gap));
    }

    return { left, top, position: finalPosition };
};

export const HextechTooltip: React.FC<HextechTooltipProps> = ({
    title,
    description,
    meta,
    position = 'top',
    children,
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });
    const [actualPosition, setActualPosition] = useState<TooltipPosition>(position);
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const result = calculateSmartTooltipPosition(rect, position, 320, 200);
            setTooltipPos({ left: result.left, top: result.top });
            setActualPosition(result.position);
            setIsVisible(true);
        }
    }, [position]);

    const handleMouseLeave = useCallback(() => {
        setIsVisible(false);
    }, []);

    const tooltipContent = isVisible ? createPortal(
        <div
            className={`hextech-tooltip-portal position-${actualPosition}`}
            style={{
                left: tooltipPos.left,
                top: tooltipPos.top,
            }}
        >
            <div className="hextech-tooltip-title">{title}</div>
            {description && (
                <div className="hextech-tooltip-description">{description}</div>
            )}
            {meta && (
                <div className="hextech-tooltip-meta">{meta}</div>
            )}
        </div>,
        document.body
    ) : null;

    return (
        <div
            ref={triggerRef}
            className={`hextech-tooltip-wrapper ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {tooltipContent}
        </div>
    );
};

// Specialized tooltip for Champions
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

// Ability variable with values per star level
interface AbilityVariable {
    name: string;
    value: number[];
}

// Helper to get human-readable variable name
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

// Helper to get scaling type icon URL
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
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });
    const [actualPosition, setActualPosition] = useState<TooltipPosition>(position);
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const result = calculateSmartTooltipPosition(rect, position);
            setTooltipPos({ left: result.left, top: result.top });
            setActualPosition(result.position);
            setIsVisible(true);
        }
    }, [position]);

    const handleMouseLeave = useCallback(() => {
        setIsVisible(false);
    }, []);

    const tooltipContent = isVisible ? createPortal(
        <div
            className={`hextech-tooltip-portal champion-tooltip position-${actualPosition}`}
            style={{
                left: tooltipPos.left,
                top: tooltipPos.top,
            }}
        >
            <div className="hextech-tooltip-title">
                {name}
                <span className={`hextech-tooltip-cost-${cost}`} style={{ marginLeft: '8px' }}>
                    ${cost}
                </span>
            </div>
            {traits.length > 0 && (
                <div className="hextech-tooltip-traits">
                    {traits.map((trait, i) => (
                        <span key={i} className="hextech-tooltip-trait-tag">{trait}</span>
                    ))}
                </div>
            )}

            {/* 2-Column Layout: Ability Left | Stats Right */}
            {(abilityName || stats) && (
                <div className="hextech-tooltip-content-grid">
                    {/* Left Column: Ability */}
                    {abilityName && (
                        <div className="hextech-tooltip-ability">
                            {/* Ability Name + Mana on same line */}
                            <div className="hextech-tooltip-ability-header">
                                <div className="hextech-tooltip-ability-name">{abilityName}</div>
                                {stats && (
                                    <div className="hextech-tooltip-mana">
                                        <img
                                            src="https://cdn.tft.tools/general/mana.png"
                                            alt="Mana"
                                            className="stat-icon"
                                        />
                                        <span>{stats.mana.min}/{stats.mana.max}</span>
                                    </div>
                                )}
                            </div>
                            {abilityDescription && (
                                <div className="hextech-tooltip-ability-desc">{abilityDescription}</div>
                            )}

                            {/* Ability Scaling Values */}
                            {abilityVariables && abilityVariables.length > 0 && (
                                <div className="ability-scaling-section">
                                    {abilityVariables
                                        .filter(v => {
                                            // Only show variables with meaningful scaling (different values per star)
                                            const starValues = [v.value[1], v.value[2], v.value[3]];
                                            return starValues.some(val => val !== 0 && val !== starValues[0]);
                                        })
                                        .slice(0, 4) // Limit to 4 most important variables
                                        .map((variable, idx) => {
                                            // Skip line 297 starValues - it's unused
                                            const currentValue = variable.value[currentStars] || variable.value[1];
                                            const displayValues = [
                                                variable.value[1],
                                                variable.value[2],
                                                variable.value[3]
                                            ].map(v => Math.round(v * 100) / 100);

                                            return (
                                                <div key={idx} className="ability-scaling-row">
                                                    <span className="scaling-name">
                                                        {getVariableDisplayName(variable.name)}:
                                                    </span>
                                                    <span className="scaling-current">
                                                        {Math.round(currentValue * 100) / 100}
                                                    </span>
                                                    <img
                                                        src={getScalingIconUrl(variable.name)}
                                                        alt="scaling"
                                                        className="scaling-icon"
                                                    />
                                                    <span className="scaling-values">
                                                        [{displayValues.join('/')}]
                                                    </span>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            )}
                        </div>
                    )}

                    {/* Right Column: Stats */}
                    {stats && (
                        <div className="hextech-tooltip-stats">
                            <div className="stat-item">
                                <img
                                    src="https://cdn.tft.tools/general/hp.png"
                                    alt="HP"
                                    className="stat-icon"
                                />
                                <span className="stat-values">{stats.hp[0]}/{stats.hp[1]}/{stats.hp[2]}</span>
                            </div>
                            <div className="stat-item">
                                <img
                                    src="https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsattackdamageicon.png"
                                    alt="AD"
                                    className="stat-icon"
                                />
                                <span className="stat-values">{stats.ad[0]}/{stats.ad[1]}/{stats.ad[2]}</span>
                            </div>
                            <div className="stat-item">
                                <img
                                    src="https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsarmoricon.png"
                                    alt="AR"
                                    className="stat-icon"
                                />
                                <span className="stat-values">{stats.armor}</span>
                                <img
                                    src="https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsmagicresicon.png"
                                    alt="MR"
                                    className="stat-icon"
                                    style={{ marginLeft: '8px' }}
                                />
                                <span className="stat-values">{stats.mr}</span>
                            </div>
                            <div className="stat-item">
                                <img
                                    src="https://raw.communitydragon.org/latest/game/assets/perks/statmods/statmodsattackspeedicon.png"
                                    alt="AS"
                                    className="stat-icon"
                                />
                                <span className="stat-values">{stats.as.toFixed(2)}</span>
                            </div>
                            <div className="stat-item">
                                <img
                                    src="https://cdn.tft.tools/general/range.png"
                                    alt="Range"
                                    className="stat-icon"
                                />
                                <span className="stat-values">{stats.range}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {items.length > 0 && (
                <div className="hextech-tooltip-meta">
                    Trang bị: {items.join(', ')}
                </div>
            )}
        </div>,
        document.body
    ) : null;

    return (
        <div
            ref={triggerRef}
            className="hextech-tooltip-wrapper"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {tooltipContent}
        </div>
    );
};

// Specialized tooltip for Traits
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
    return (
        <div className="hextech-tooltip-wrapper">
            {children}
            <div className={`hextech-tooltip position-${position}`}>
                <div className="hextech-tooltip-title">{name}</div>
                {description && (
                    <div className="hextech-tooltip-description">{description}</div>
                )}
            </div>
        </div>
    );
};

// Specialized tooltip for Items
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
    return (
        <div className="hextech-tooltip-wrapper">
            {children}
            <div className={`hextech-tooltip position-${position}`}>
                <div className="hextech-tooltip-title">{name}</div>
                {description && (
                    <div className="hextech-tooltip-description">{description}</div>
                )}
            </div>
        </div>
    );
};

// Specialized tooltip for Augments
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
    return (
        <div className="hextech-tooltip-wrapper">
            {children}
            <div className={`hextech-tooltip position-${position}`}>
                <div className="hextech-tooltip-title">{title}</div>
                <div className="hextech-tooltip-description">{description}</div>
            </div>
        </div>
    );
};
