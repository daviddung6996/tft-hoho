import React from 'react';
import { ItemPanel } from '../Sidebar/ItemPanel';
import { SynergyPanel } from '../Sidebar/SynergyPanel';
import { ScoutingPanel } from '../Sidebar/ScoutingPanel';
import { GoldDisplay } from '../Arena/GoldDisplay';
import { PlayerData } from '../../data/mockPlayers';
import { Synergy } from '../../data/types';
import { Item } from '../../services/itemService';
import { type LayoutMode, type MobileOverlayMode } from './mobileLayout';
import './GameHUD.css';

export type MobilePanel = 'scout' | 'traits' | 'items' | null;

interface GameHUDProps {
    activePlayerId: string;
    players: PlayerData[];
    onPlayerSelect: (id: string) => void;
    synergies: Synergy[];
    items?: (Item | null)[];
    gold: number;
    layoutMode: LayoutMode;
    mobilePanel: MobilePanel;
    onMobilePanelChange: (panel: MobilePanel) => void;
    mobileOverlayMode: MobileOverlayMode;
}

export const GameHUD: React.FC<GameHUDProps> = ({
    activePlayerId,
    players,
    onPlayerSelect,
    synergies,
    items = [],
    gold,
    layoutMode,
    mobilePanel,
    onMobilePanelChange,
    mobileOverlayMode
}) => {
    const isPhoneLandscape = layoutMode === 'phone-landscape';
    const showMobileItemsControl = isPhoneLandscape && mobileOverlayMode === 'none';

    const handleItemsToggle = () => {
        onMobilePanelChange(mobilePanel === 'items' ? null : 'items');
    };

    if (isPhoneLandscape) {
        return (
            <>
                <SynergyPanel
                    variant="sidebar"
                    className="mobile-traits-rail"
                    synergies={synergies}
                    maxVisible={5}
                />
                <ScoutingPanel
                    variant="sidebar"
                    className="mobile-scouting-rail"
                    activePlayerId={activePlayerId}
                    players={players}
                    onPlayerSelect={onPlayerSelect}
                />
                {showMobileItemsControl && mobilePanel === 'items' && (
                    <div className="mobile-hud-item-sheet">
                        <div className="mobile-hud-sheet__header">
                            <span className="mobile-hud-sheet__title">Items</span>
                            <button
                                type="button"
                                className="mobile-hud-sheet__close"
                                aria-label="Close items panel"
                                onClick={() => onMobilePanelChange(null)}
                            >
                                <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                        <div className="mobile-hud-sheet__body">
                            <ItemPanel variant="sheet" items={items} />
                        </div>
                    </div>
                )}
                {showMobileItemsControl && (
                    <div className="mobile-hud-controls" data-testid="mobile-hud-controls">
                        <div className="mobile-hud-controls__gold">
                            <GoldDisplay gold={gold} variant="mobile-chip" />
                        </div>
                        <button
                            type="button"
                            className={`mobile-hud-item-btn${mobilePanel === 'items' ? ' is-active' : ''}`}
                            onClick={handleItemsToggle}
                        >
                            Items
                        </button>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <ItemPanel variant="sidebar" items={items} />
            <SynergyPanel variant="sidebar" synergies={synergies} />
            <ScoutingPanel
                variant="sidebar"
                activePlayerId={activePlayerId}
                players={players}
                onPlayerSelect={onPlayerSelect}
            />
        </>
    );
};
