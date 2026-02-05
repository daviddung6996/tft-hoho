import React from 'react';
import { Board, GoldPillarHexes, GoldPillarHexesPlayer } from '../Arena/Board';
import { ArenaEffects } from '../Arena/ArenaEffects';
import { PlayerData } from '../../data/mockPlayers';

interface GameSceneProps {
    myPlayer: PlayerData;
    activePlayer: PlayerData;
    isMirrored: boolean;
}

export const GameScene: React.FC<GameSceneProps> = ({ myPlayer, activePlayer, isMirrored }) => {
    return (
        <>
            {/* Arena Effects - Animated Background Layers */}
            <ArenaEffects />

            {/* Main Arena - Full Screen */}
            <main className="arena-main">
                <Board
                    units={myPlayer.units}
                    benchUnits={myPlayer.bench}
                    isMirrored={isMirrored}
                    opponentUnits={isMirrored ? activePlayer.units : []}
                    opponentBenchUnits={isMirrored ? activePlayer.bench : []}
                    augmentTreeUrl={isMirrored ? activePlayer.augmentTreeUrl : undefined}
                    opponentAugments={isMirrored ? activePlayer.augments : undefined}
                />
            </main>

            {/* Gold Pillars */}
            {isMirrored ? (
                <GoldPillarHexes goldAmount={activePlayer.gold} />
            ) : (
                <GoldPillarHexesPlayer goldAmount={myPlayer.gold} />
            )}
        </>
    );
};
