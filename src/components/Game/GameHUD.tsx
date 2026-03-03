import React from 'react';
import { ItemPanel } from '../Sidebar/ItemPanel';
import { SynergyPanel } from '../Sidebar/SynergyPanel';
import { ScoutingPanel } from '../Sidebar/ScoutingPanel';
import { PlayerData } from '../../data/mockPlayers';
import { Synergy } from '../../data/types';
import { Item } from '../../services/itemService';

interface GameHUDProps {
    activePlayerId: string;
    players: PlayerData[];
    onPlayerSelect: (id: string) => void;
    synergies: Synergy[];
    items?: (Item | null)[];
}

export const GameHUD: React.FC<GameHUDProps> = ({
    activePlayerId,
    players,
    onPlayerSelect,
    synergies,
    items = []
}) => {
    return (
        <>
            {/* Floating UI Panels - Fixed Position */}
            <ItemPanel items={items} />
            <SynergyPanel synergies={synergies} />
            <ScoutingPanel
                activePlayerId={activePlayerId}
                players={players}
                onPlayerSelect={onPlayerSelect}
            />
        </>
    );
};
