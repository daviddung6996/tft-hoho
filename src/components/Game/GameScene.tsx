import React, { useMemo } from 'react';
import { Board, GoldPillarHexes, GoldPillarHexesPlayer } from '../Arena/Board';
import { ArenaEffects } from '../Arena/ArenaEffects';
import { PlayerData } from '../../data/mockPlayers';
import { getRandomIoniaPath, getRandomVoidMods } from '../../data/gameInfoData';

interface GameSceneProps {
    myPlayer: PlayerData;
    activePlayer: PlayerData;
    isMirrored: boolean;
    streakCount?: number;
}

export const GameScene: React.FC<GameSceneProps> = ({ myPlayer, activePlayer, isMirrored, streakCount }) => {
    // Generate random Ionia Path and Void Mods once per game session
    const gameInfo = useMemo(() => ({
        ioniaPath: getRandomIoniaPath(),
        voidMods: getRandomVoidMods(3)
    }), []);

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
                    playerAugmentTreeUrl={!isMirrored ? myPlayer.augmentTreeUrl : undefined}
                    playerAugments={!isMirrored ? myPlayer.augments : undefined}
                    ioniaPath={gameInfo.ioniaPath}
                    voidMods={gameInfo.voidMods}
                    streakCount={streakCount}
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
