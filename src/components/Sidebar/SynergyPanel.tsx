import React from 'react';
import { Synergy } from '../../data/types';
import { AssetImage } from '../../hooks/useAssetUrl';
import { TraitTooltip } from '../common/HextechTooltip';
import { useGameData } from '../../contexts/GameDataContext';
import './SynergyPanel.css';

interface SynergyPanelProps {
    synergies: Synergy[];
}

export const SynergyPanel: React.FC<SynergyPanelProps & { style?: React.CSSProperties; className?: string }> = ({
    synergies,
    style,
    className
}) => {
    const { getTraitByNameEn } = useGameData();

    // Helper to find the active breakpoint index
    const getActiveBreakpointIndex = (synergy: Synergy): number => {
        const { activeCount, breakpoints } = synergy;
        let activeIndex = -1;
        for (let i = 0; i < breakpoints.length; i++) {
            if (activeCount >= breakpoints[i]) {
                activeIndex = i;
            }
        }
        return activeIndex;
    };

    // Helper to get the current/next breakpoint to display
    const getDisplayBreakpoint = (synergy: Synergy): number => {
        const { activeCount, breakpoints } = synergy;
        // Find the next breakpoint we're working towards
        for (let i = 0; i < breakpoints.length; i++) {
            if (activeCount < breakpoints[i]) {
                return breakpoints[i]; // Return next breakpoint
            }
        }
        // If we've hit all breakpoints, show the last one
        return breakpoints[breakpoints.length - 1] || activeCount;
    };

    // Helper for tier class based on style from API
    // API style mapping:
    // 1: Bronze (1st tier activated)
    // 3: Silver (2nd tier)
    // 4: Gold (Unique traits, always gold when active)
    // 5: Gold (3rd tier)
    // 6: Prismatic (max tier)
    const getTierClass = (synergy: Synergy) => {
        const { styles } = synergy;
        const activeIndex = getActiveBreakpointIndex(synergy);

        // Not activated (below first breakpoint) = inactive
        if (activeIndex === -1) return 'tier-inactive';

        // Use Set 16 Style data if available
        if (styles && styles.length > activeIndex) {
            const style = styles[activeIndex];
            if (style === 1) return 'tier-bronze';
            if (style === 2) return 'tier-bronze'; // Safety fallback
            if (style === 3) return 'tier-silver';
            if (style === 4) return 'tier-gold'; // Unique traits
            if (style === 5) return 'tier-gold';
            if (style === 6) return 'tier-prismatic';
        }

        // Fallback based on index position
        if (activeIndex === 0) return 'tier-bronze';
        if (activeIndex === 1) return 'tier-silver';
        if (activeIndex === 2) return 'tier-gold';
        if (activeIndex >= 3) return 'tier-prismatic';

        return 'tier-inactive';
    };

    // Get description from DB data
    const getTraitDescription = (synergy: Synergy): string => {
        // First check if synergy already has description
        if (synergy.description) return synergy.description;
        // Try to get from GameDataContext
        const dbTrait = getTraitByNameEn(synergy.id);
        return dbTrait?.description || '';
    };

    // Get icon URL from DB data (prioritize DB over CDN)
    const getTraitIcon = (synergy: Synergy): string | undefined => {
        const dbTrait = getTraitByNameEn(synergy.id);
        return dbTrait?.icon;
    };

    return (
        <div className={`synergy-floating-container ${className || ''}`} style={style}>
            {synergies.map(synergy => {
                const tierClass = getTierClass(synergy);
                const displayBreakpoint = getDisplayBreakpoint(synergy);
                const description = getTraitDescription(synergy);
                const dbIcon = getTraitIcon(synergy);

                return (
                    <TraitTooltip
                        key={synergy.id}
                        name={synergy.name}
                        description={description}
                        activeCount={synergy.activeCount}
                        breakpoints={synergy.breakpoints}
                        position="right"
                    >
                        <div className={`synergy-floating-row ${tierClass}`}>
                            {/* Hexagon Left */}
                            <div className="synergy-hex-wrapper">
                                <div className="synergy-hex-shape">
                                    {dbIcon ? (
                                        <img
                                            src={dbIcon}
                                            alt={synergy.name}
                                            className="synergy-icon-image"
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <AssetImage
                                            type="trait"
                                            name={synergy.id}
                                            alt={synergy.name}
                                            className="synergy-icon-image"
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Label Bar Right */}
                            <div className="synergy-label-bar">
                                <div className="trait-name">{synergy.name}</div>
                                <div className="trait-numbers">
                                    <span className="active-num">{synergy.activeCount}</span>
                                    <span className="separator"> / </span>
                                    <span className="next-num">{displayBreakpoint}</span>
                                </div>
                            </div>
                        </div>
                    </TraitTooltip>
                );
            })}
        </div>
    );
};

