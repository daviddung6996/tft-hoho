import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameHUD, type MobilePanel } from './GameHUD';
import { PlayerData } from '../../data/mockPlayers';
import { Synergy } from '../../data/types';
import { Item } from '../../services/itemService';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../Sidebar/ItemPanel', () => ({
    ItemPanel: ({ variant = 'sidebar' }: { variant?: 'sidebar' | 'sheet' }) => (
        <div data-testid={`ItemPanel:${variant}`}>ItemPanel:{variant}</div>
    )
}));

vi.mock('../Sidebar/SynergyPanel', () => ({
    SynergyPanel: ({ variant = 'sidebar' }: { variant?: 'sidebar' | 'sheet' }) => (
        <div data-testid={`SynergyPanel:${variant}`}>SynergyPanel:{variant}</div>
    )
}));

vi.mock('../Sidebar/ScoutingPanel', () => ({
    ScoutingPanel: ({
        variant = 'sidebar',
        players,
        onPlayerSelect
    }: {
        variant?: 'sidebar' | 'sheet';
        players: PlayerData[];
        onPlayerSelect: (id: string) => void;
    }) => (
        <div data-testid={`ScoutingPanel:${variant}`}>
            {players.map(player => (
                <button key={player.id} onClick={() => onPlayerSelect(player.id)}>
                    {player.name}
                </button>
            ))}
        </div>
    )
}));

vi.mock('../Arena/GoldDisplay', () => ({
    GoldDisplay: ({ variant = 'floating' }: { variant?: 'floating' | 'mobile-chip' }) => (
        <div data-testid={`GoldDisplay:${variant}`}>GoldDisplay:{variant}</div>
    )
}));

const players: PlayerData[] = [
    {
        id: '1',
        name: 'Me',
        avatar: 'me.png',
        hp: 100,
        gold: 50,
        level: 6,
        xp: 20,
        status: 'active',
        isMe: true,
        units: [],
        bench: [],
        arenaId: 'arena-1'
    },
    {
        id: '2',
        name: 'Enemy',
        avatar: 'enemy.png',
        hp: 88,
        gold: 20,
        level: 6,
        xp: 12,
        status: 'active',
        isMe: false,
        units: [],
        bench: [],
        arenaId: 'arena-2'
    }
];

const synergies: Synergy[] = [
    { id: 'scholar', name: 'Scholar', activeCount: 2, breakpoints: [2, 4], icon: 'scholar.png' }
];

const items: Item[] = [
    { id: 'item-1', name: 'Sword', description: 'AD', stats: {} }
];

const renderHud = (props?: Partial<React.ComponentProps<typeof GameHUD>>) => {
    const Harness = () => {
        const [mobilePanel, setMobilePanel] = useState<MobilePanel>(props?.mobilePanel ?? null);

        return (
            <GameHUD
                activePlayerId="1"
                players={players}
                onPlayerSelect={vi.fn()}
                synergies={synergies}
                items={items}
                gold={50}
                layoutMode="phone-landscape"
                mobilePanel={mobilePanel}
                onMobilePanelChange={setMobilePanel}
                mobileOverlayMode="none"
                {...props}
            />
        );
    };

    return render(<Harness />);
};

describe('GameHUD', () => {
    it('renders mobile side rails plus compact controls in phone-landscape gameplay', () => {
        renderHud();

        expect(screen.getByTestId('mobile-hud-controls')).toBeInTheDocument();
        expect(screen.getByTestId('SynergyPanel:sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('ScoutingPanel:sidebar')).toBeInTheDocument();
        expect(screen.queryByTestId('ItemPanel:sidebar')).not.toBeInTheDocument();
    });

    it('opens and closes the items sheet from the compact mobile button', async () => {
        const user = userEvent.setup();
        renderHud();

        await user.click(screen.getByRole('button', { name: 'Items' }));
        expect(screen.getByTestId('ItemPanel:sheet')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Items' }));
        expect(screen.queryByTestId('ItemPanel:sheet')).not.toBeInTheDocument();
    });

    it('hides dock and sheet when a selector or modal overlay is active', () => {
        const { rerender } = render(
            <GameHUD
                activePlayerId="1"
                players={players}
                onPlayerSelect={vi.fn()}
                synergies={synergies}
                items={items}
                gold={50}
                layoutMode="phone-landscape"
                mobilePanel="items"
                onMobilePanelChange={vi.fn()}
                mobileOverlayMode="selector"
            />
        );

        expect(screen.queryByTestId('mobile-hud-controls')).not.toBeInTheDocument();
        expect(screen.queryByTestId('SynergyPanel:sheet')).not.toBeInTheDocument();

        rerender(
            <GameHUD
                activePlayerId="1"
                players={players}
                onPlayerSelect={vi.fn()}
                synergies={synergies}
                items={items}
                gold={50}
                layoutMode="phone-landscape"
                mobilePanel="items"
                onMobilePanelChange={vi.fn()}
                mobileOverlayMode="modal"
            />
        );

        expect(screen.queryByTestId('mobile-hud-controls')).not.toBeInTheDocument();
        expect(screen.queryByTestId('ItemPanel:sheet')).not.toBeInTheDocument();
    });

    it('keeps desktop sidebars on non-phone layouts', () => {
        render(
            <GameHUD
                activePlayerId="1"
                players={players}
                onPlayerSelect={vi.fn()}
                synergies={synergies}
                items={items}
                gold={50}
                layoutMode="default"
                mobilePanel={null}
                onMobilePanelChange={vi.fn()}
                mobileOverlayMode="none"
            />
        );

        expect(screen.getByTestId('ItemPanel:sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('SynergyPanel:sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('ScoutingPanel:sidebar')).toBeInTheDocument();
    });
});
