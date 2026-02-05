import React, { useState, useEffect } from 'react';
import { usePuzzleGame } from './hooks/usePuzzleGame';
import { useGameFlow } from './hooks/useGameFlow';
import { usePuzzleToPlayers } from './hooks/usePuzzleToPlayers';
import { GameScene } from './components/Game/GameScene';
import { GameHUD } from './components/Game/GameHUD';
import { fetchAllAugments, AugmentData } from './services/augmentService';

// Components
import { AugmentButton } from './components/Arena/AugmentButton';
import { AugmentModal } from './components/Arena/AugmentModal';
import { DecisionReview } from './components/Arena/DecisionReview';
import { MenuButton } from './components/Settings/SettingsButton';
import { ArenaSelectorModal } from './components/Settings/ArenaSelectorModal';
import { LoginModal } from './components/Auth/LoginModal';
import AdminDataModal from './pages/Admin/AdminDataModal';

// Data
import { ARENA_SKINS } from './data/arenas';
import { getAuthToken, clearAuthToken } from './data/mockAuth';

import './App.css';

const App: React.FC = () => {
    // --- 1. Authentication ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
    const [displayName, setDisplayName] = useState<string>('');
    const [showLoginModal, setShowLoginModal] = useState(true);

    useEffect(() => {
        const authToken = getAuthToken();
        if (authToken) {
            setIsAuthenticated(true);
            setUserRole(authToken.role);
            setDisplayName(authToken.displayName);
            setShowLoginModal(false);
        }
    }, []);

    const handleLoginSuccess = (role: 'user' | 'admin', name: string) => {
        setIsAuthenticated(true);
        setUserRole(role);
        setDisplayName(name);
        setShowLoginModal(false);
    };

    const handleLogout = () => {
        clearAuthToken();
        setIsAuthenticated(false);
        setUserRole(null);
        setDisplayName('');
        setShowLoginModal(true);
    };

    // --- 2. Puzzle Data & Game Flow ---
    const {
        puzzles,
        currentPuzzle,
        isLoadingPuzzles,
        handleMarkCompleted,
        handleNextPuzzle: handleNext,
        refreshPuzzles
    } = usePuzzleGame(isAuthenticated);

    // Fetch all augments for reroll pool
    const [allAugments, setAllAugments] = useState<AugmentData[]>([]);
    useEffect(() => {
        const loadAugments = async () => {
            const augments = await fetchAllAugments();
            setAllAugments(augments);
        };
        loadAugments();
    }, []);

    const {
        puzzlePhase,
        selectedAugment,
        communityVotes,
        currentAugments,
        rerollOrder,
        handleAugmentReroll,
        handleAugmentSelect,
        handleReplay,
        resetFlow
    } = useGameFlow(currentPuzzle);

    // --- 3. UI State ---
    const [isAugmentOpen, setIsAugmentOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [scoutedPlayerId, setScoutedPlayerId] = useState<string>('1');

    // Wrapper for next puzzle to also reset flow
    const handleNextPuzzle = () => {
        if (currentPuzzle) {
            handleMarkCompleted(currentPuzzle.id);
        }
        handleNext();
        resetFlow();
    };

    // Transform puzzle data to player data
    const {
        myPlayer,
        allPlayers,
        synergies,
        items
    } = usePuzzleToPlayers(currentPuzzle);

    // Scouting Logic
    const activePlayer = allPlayers.find(p => p.id === scoutedPlayerId) || myPlayer;
    const isMirrored = scoutedPlayerId !== '1';
    const playerArena = ARENA_SKINS.find(a => a.id === activePlayer.arenaId) || ARENA_SKINS[0];
    const arenaSkinUrl = playerArena.backgroundUrl || playerArena.iconUrl;

    if (isLoadingPuzzles && !currentPuzzle) {
        return (
            <div className="layout-wrapper">
                <div className="app-loading-screen">
                    Loading Scenario...
                </div>
            </div>
        );
    }

    if (!currentPuzzle) {
        return (
            <div className="layout-wrapper">
                <div className="app-loading-screen">
                    Scenario Not Found or No Data.
                </div>
            </div>
        );
    }

    return (
        <div className="layout-wrapper">
            <div className="app-container" style={{ backgroundImage: `url(${arenaSkinUrl})` }}>

                <GameScene
                    myPlayer={myPlayer}
                    activePlayer={activePlayer}
                    isMirrored={isMirrored}
                />

                <GameHUD
                    stage={currentPuzzle?.stage || '2-1'}
                    activePlayerId={scoutedPlayerId}
                    players={allPlayers}
                    onPlayerSelect={setScoutedPlayerId}
                    synergies={synergies}
                    items={activePlayer.items || items || []} // Prefer active player items, fallback to global items
                />

                {/* --- Modals & Overlays --- */}

                <MenuButton
                    onLoginClick={() => setShowLoginModal(true)}
                    onArenaClick={() => setIsSettingsOpen(true)}
                    isAuthenticated={isAuthenticated}
                    displayName={displayName}
                    onLogout={handleLogout}
                    onAdminClick={() => setShowAdminModal(true)}
                    isAdmin={true || userRole === 'admin'}
                />

                <ArenaSelectorModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    onSelectArena={() => { }}
                    currentArena={playerArena}
                />

                {/* Augment Logic */}
                {isAugmentOpen && puzzlePhase === 'selecting' && (
                    <AugmentModal
                        currentAugments={currentAugments}
                        rerollOrder={rerollOrder}
                        onReroll={handleAugmentReroll}
                        onSelect={handleAugmentSelect}
                    />
                )}

                {isAugmentOpen && puzzlePhase === 'reviewing' && selectedAugment && (
                    <DecisionReview
                        userRerollOrder={rerollOrder}
                        userChoice={selectedAugment}
                        proPlayerName={currentPuzzle.proPlayer}
                        proSecondRoll={currentPuzzle.proSecondRoll}
                        proFirstRoll={currentPuzzle.proFirstRoll}
                        proRerollIndices={currentPuzzle.proRerollIndices || currentPuzzle.meta_data?.proRerollIndices || []}
                        proSecondRerollIndices={currentPuzzle.proSecondRerollIndices || currentPuzzle.meta_data?.proSecondRerollIndices || []}
                        proPickIndex={currentPuzzle.proPickIndex}
                        initialAugments={currentPuzzle.augments?.filter((a: any) => a !== null) || []}
                        rerollAugments={currentPuzzle.rerollAugments?.filter((a: any) => a !== null) || []}
                        correctAugmentId={currentPuzzle.proFinalPick?.id || ''}
                        communityVotes={communityVotes}
                        explanation={currentPuzzle.explanation}
                        onReplay={handleReplay}
                        onNextPuzzle={handleNextPuzzle}
                        puzzleId={currentPuzzle.id}
                        streamUrl={currentPuzzle.streamUrl}
                        date={currentPuzzle.date}
                        server={currentPuzzle.server}
                        encounter={currentPuzzle.encounter}
                        patch={currentPuzzle.patch}
                    />
                )}

                {puzzlePhase !== 'reviewing' && (
                    <AugmentButton
                        isActive={isAugmentOpen}
                        onClick={() => setIsAugmentOpen(!isAugmentOpen)}
                    />
                )}

                {showLoginModal && (
                    <LoginModal
                        onLoginSuccess={handleLoginSuccess}
                        onClose={() => setShowLoginModal(false)}
                    />
                )}

                {showAdminModal && (
                    <AdminDataModal
                        onClose={() => setShowAdminModal(false)}
                        onPuzzleSaved={refreshPuzzles}
                    />
                )}
            </div>
        </div>
    );
};

export default App;
