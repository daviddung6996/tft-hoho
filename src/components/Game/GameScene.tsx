import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Board, GoldPillarHexes, GoldPillarHexesPlayer } from '../Arena/Board';
import { ArenaEffects } from '../Arena/ArenaEffects';
import { PlayerData } from '../../data/mockPlayers';
import { UnitData } from '../../data/types';
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

    // Local state for interactive unit positioning (drag-drop)
    const [localUnits, setLocalUnits] = useState<UnitData[]>(myPlayer.units);
    const [localBench, setLocalBench] = useState<UnitData[]>(myPlayer.bench);

    // Reset local state when puzzle changes (myPlayer reference changes)
    useEffect(() => {
        setLocalUnits(myPlayer.units);
        setLocalBench(myPlayer.bench);
    }, [myPlayer.units, myPlayer.bench]);

    // Handle drag-drop unit changes
    const handleUnitsChange = useCallback((updatedUnits: UnitData[]) => {
        const boardUnits = updatedUnits.filter(u => u.row !== undefined && u.row >= 0 && u.col !== undefined);
        const benchUnits = updatedUnits.filter(u => u.benchIndex !== undefined);
        setLocalUnits(boardUnits);
        setLocalBench(benchUnits);
    }, []);

    return (
        <>
            {/* Arena Effects - Animated Background Layers */}
            <ArenaEffects />

            {/* Main Arena - Full Screen */}
            <main className="arena-main">
                <Board
                    units={isMirrored ? myPlayer.units : localUnits}
                    benchUnits={isMirrored ? myPlayer.bench : localBench}
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
                    onUnitsChange={!isMirrored ? handleUnitsChange : undefined}
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
