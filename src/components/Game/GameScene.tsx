import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Board, GoldPillarHexes, GoldPillarHexesPlayer } from '../Arena/Board';
import { ArenaEffects } from '../Arena/ArenaEffects';
import { PlayerLevelDisplay } from '../Arena/PlayerLevelDisplay';
import { PlayerData } from '../../data/mockPlayers';
import { UnitData } from '../../data/types';
import {
    FeaturedModifier,
    FeaturedPath,
    REALM_GODS_PER_GAME,
    getRandomFeaturedModifiers,
    getRandomFeaturedPath,
} from '../../data/gameInfoData';
import Toast from '../common/Toast';

interface GameSceneProps {
    myPlayer: PlayerData;
    activePlayer: PlayerData;
    isMirrored: boolean;
    streakCount?: number;
    isInteractionLocked?: boolean;
    featuredPath?: FeaturedPath;
    featuredModifiers?: FeaturedModifier[];
}

export const GameScene: React.FC<GameSceneProps> = ({
    myPlayer,
    activePlayer,
    isMirrored,
    streakCount,
    isInteractionLocked = false,
    featuredPath,
    featuredModifiers = [],
}) => {
    // Use puzzle-authored Set 17 match info when present, otherwise roll a fresh game state.
    const gameInfo = useMemo(() => ({
        featuredPath: featuredPath ?? getRandomFeaturedPath(),
        featuredModifiers: (() => {
            const selectedGods = featuredModifiers.slice(0, REALM_GODS_PER_GAME);

            if (selectedGods.length >= REALM_GODS_PER_GAME) {
                return selectedGods;
            }

            const fallbackGods = getRandomFeaturedModifiers(
                REALM_GODS_PER_GAME - selectedGods.length,
                selectedGods.map(god => god.id),
            );

            return [...selectedGods, ...fallbackGods];
        })(),
    }), [featuredModifiers, featuredPath]);

    // Local state for interactive unit positioning (drag-drop)
    const [localUnits, setLocalUnits] = useState<UnitData[]>(myPlayer.units);
    const [localBench, setLocalBench] = useState<UnitData[]>(myPlayer.bench);
    const [showLevelCapToast, setShowLevelCapToast] = useState(false);

    // Reset local state when puzzle changes (myPlayer reference changes)
    useEffect(() => {
        setLocalUnits(myPlayer.units);
        setLocalBench(myPlayer.bench);
        setShowLevelCapToast(false);
    }, [myPlayer.units, myPlayer.bench]);

    // Handle drag-drop unit changes
    const handleUnitsChange = useCallback((updatedUnits: UnitData[]) => {
        const boardUnits = updatedUnits.filter(u => u.row !== undefined && u.row >= 0 && u.col !== undefined);
        const benchUnits = updatedUnits.filter(u => u.benchIndex !== undefined);
        setLocalUnits(boardUnits);
        setLocalBench(benchUnits);
    }, []);

    const handleLevelCapHit = useCallback(() => {
        setShowLevelCapToast(current => current ? current : true);
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
                    featuredPath={gameInfo.featuredPath}
                    featuredModifiers={gameInfo.featuredModifiers}
                    streakCount={streakCount}
                    onUnitsChange={!isMirrored ? handleUnitsChange : undefined}
                    playerLevel={!isMirrored ? myPlayer.level : undefined}
                    onLevelCapHit={!isMirrored ? handleLevelCapHit : undefined}
                    isInteractionLocked={isInteractionLocked}
                />
            </main>

            {/* Gold Pillars */}
            {isMirrored ? (
                <GoldPillarHexes goldAmount={activePlayer.gold} />
            ) : (
                <>
                    <GoldPillarHexesPlayer goldAmount={myPlayer.gold} />
                    <PlayerLevelDisplay level={myPlayer.level} xp={myPlayer.xp} />
                    {showLevelCapToast && (
                        <Toast
                            message={`Board da full theo cap ${myPlayer.level}.`}
                            type="info"
                            duration={1600}
                            onClose={() => setShowLevelCapToast(false)}
                        />
                    )}
                </>
            )}
        </>
    );
};
