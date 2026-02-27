
import React, { useState, useEffect } from 'react';
import { usePuzzleGame } from './hooks/usePuzzleGame';
import { useGameFlow } from './hooks/useGameFlow';
import { usePuzzleToPlayers } from './hooks/usePuzzleToPlayers';
import { GameScene } from './components/Game/GameScene';
import { GameHUD } from './components/Game/GameHUD';

// Components
import { AugmentButton } from './components/Arena/AugmentButton';
import { AugmentModal } from './components/Arena/AugmentModal';
import { DecisionReview } from './components/Arena/DecisionReview';
import { MenuButton } from './components/Settings/SettingsButton';
import { ArenaSelectorModal } from './components/Settings/ArenaSelectorModal';
import { LoginModal } from './components/Auth/LoginModal';
import AdminDataModal from './pages/Admin/AdminDataModal';
import { UserProfileModal } from './components/Settings/UserProfileModal';

// Data
import { ARENA_SKINS } from './data/arenas';
import { useAuth } from './contexts/AuthContext';

import './App.css';

const App: React.FC = () => {
    // --- 1. Authentication ---
    const { user, isAuthenticated, isAdmin, isGuest, isLoading: isAuthLoading } = useAuth();

    // Modal visibility: Show for unauthenticated users, hide when logged in or guest mode is active
    const [showLoginModal, setShowLoginModal] = useState(false);

    // useEffect to control modal visibility based on auth state
    useEffect(() => {
        // Wait for auth to finish loading
        if (isAuthLoading) return;

        // ONLY hide modal if user is LOGGED IN (has real user object)
        // Guests should ALWAYS see modal on every page load
        if (!user) {
            setShowLoginModal(true);
        } else {
            setShowLoginModal(false);
        }
    }, [isAuthLoading, user]);

    // Close modal handler
    const handleCloseLoginModal = () => {
        setShowLoginModal(false);
    };

    // --- 2. Puzzle Data & Game Flow ---
    const {
        // puzzles, // Unused
        currentPuzzle,
        isLoadingPuzzles,
        handleMarkCompleted,
        handleNextPuzzle: handleNext,
        refreshPuzzles
    } = usePuzzleGame(isAuthenticated);

    const {
        puzzlePhase,
        selectedAugment,
        communityVotes,
        iqChangeResult,
        currentAugments,
        rerollOrder,
        handleAugmentReroll,
        handleAugmentSelect,
        handleReplay,
        resetFlow
    } = useGameFlow(currentPuzzle, user?.id);

    // --- 3. UI State ---
    const [isAugmentOpen, setIsAugmentOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [scoutedPlayerId, setScoutedPlayerId] = useState<string>('1');
    const [myArenaId, setMyArenaId] = useState<string | null>(null);

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

    // Apply user-selected arena to myPlayer
    const myPlayerWithArena = myArenaId
        ? { ...myPlayer, arenaId: myArenaId }
        : myPlayer;
    const allPlayersWithArena = allPlayers.map(p =>
        p.isMe && myArenaId ? { ...p, arenaId: myArenaId } : p
    );

    // Scouting Logic
    const activePlayer = allPlayersWithArena.find(p => p.id === scoutedPlayerId) || myPlayerWithArena;
    const isMirrored = scoutedPlayerId !== '1';
    const playerArena = ARENA_SKINS.find(a => a.id === activePlayer.arenaId) || ARENA_SKINS[0];
    const arenaSkinUrl = playerArena.backgroundUrl || playerArena.iconUrl;

    // Keyboard shortcuts: Q (scout next), R (scout prev), Space (return home)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            const opponents = allPlayers.filter(p => !p.isMe);
            if (opponents.length === 0) return;

            if (e.key === 'q' || e.key === 'Q') {
                e.preventDefault();
                setScoutedPlayerId(prev => {
                    const currentIdx = opponents.findIndex(p => p.id === prev);
                    if (currentIdx === -1) return opponents[0].id;
                    const nextIdx = (currentIdx + 1) % opponents.length;
                    return opponents[nextIdx].id;
                });
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                setScoutedPlayerId(prev => {
                    const currentIdx = opponents.findIndex(p => p.id === prev);
                    if (currentIdx === -1) return opponents[opponents.length - 1].id;
                    const prevIdx = (currentIdx - 1 + opponents.length) % opponents.length;
                    return opponents[prevIdx].id;
                });
            } else if (e.key === ' ') {
                e.preventDefault();
                setScoutedPlayerId('1');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [allPlayers]);

    if (!currentPuzzle) {
        return (
            <div className="layout-wrapper">
                <div className="app-loading-screen">
                    {isLoadingPuzzles ? 'Đang tải...' : 'Không tìm thấy kịch bản.'}
                </div>
            </div>
        );
    }

    return (
        <div className="layout-wrapper">
            <div className="app-container" style={{ backgroundImage: `url(${arenaSkinUrl})` }}>

                <GameScene
                    myPlayer={myPlayerWithArena}
                    activePlayer={activePlayer}
                    isMirrored={isMirrored}
                />

                <GameHUD
                    stage={currentPuzzle?.stage || '2-1'}
                    activePlayerId={scoutedPlayerId}
                    players={allPlayersWithArena}
                    onPlayerSelect={setScoutedPlayerId}
                    synergies={synergies}
                    items={activePlayer.items || items || []} // Prefer active player items, fallback to global items
                />

                {/* --- Modals & Overlays --- */}

                <MenuButton
                    onArenaClick={() => setIsSettingsOpen(true)}
                    isAuthenticated={isAuthenticated}
                    displayName={isGuest ? 'Khách' : (user?.display_name || user?.email || 'Guest')}
                    onLogout={() => { }}
                    onAdminClick={() => setShowAdminModal(true)}
                    onProfileClick={() => setShowProfileModal(true)}
                    onLoginClick={() => setShowLoginModal(true)}
                    isAdmin={isAdmin}
                />

                <ArenaSelectorModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    onSelectArena={(arena) => setMyArenaId(arena.id)}
                    currentArena={ARENA_SKINS.find(a => a.id === (myArenaId || myPlayer.arenaId)) || ARENA_SKINS[0]}
                />

                {/* Augment Logic */}
                {!isMirrored && isAugmentOpen && puzzlePhase === 'selecting' && (
                    <AugmentModal
                        currentAugments={currentAugments}
                        rerollOrder={rerollOrder}
                        onReroll={handleAugmentReroll}
                        onSelect={handleAugmentSelect}
                    />
                )}

                {!isMirrored && isAugmentOpen && puzzlePhase === 'reviewing' && selectedAugment && (
                    <DecisionReview
                        userRerollOrder={rerollOrder}
                        userChoice={selectedAugment}
                        proPlayerName={currentPuzzle.proPlayer}
                        proSecondRoll={currentPuzzle.proSecondRoll}
                        proFirstRoll={currentPuzzle.proFirstRoll}
                        proRerollIndices={currentPuzzle.proRerollIndices || currentPuzzle.meta_data?.proRerollIndices || []}
                        // Removed unused props: proSecondRerollIndices, proPickIndex
                        initialAugments={currentPuzzle.augments?.filter((a: any) => a !== null) || []}
                        rerollAugments={currentPuzzle.rerollAugments?.filter((a: any) => a !== null) || []}
                        correctAugmentId={currentPuzzle.proFinalPick?.id || ''}
                        communityVotes={communityVotes}
                        iqChangeResult={iqChangeResult}
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
                        variant={isMirrored ? 'return' : 'default'}
                        onClick={isMirrored
                            ? () => { setScoutedPlayerId('1'); setIsAugmentOpen(true); }
                            : () => setIsAugmentOpen(!isAugmentOpen)
                        }
                    />
                )}

                {showLoginModal && (
                    <LoginModal onClose={handleCloseLoginModal} />
                )}

                {showAdminModal && (
                    <AdminDataModal
                        onClose={() => setShowAdminModal(false)}
                        onPuzzleSaved={refreshPuzzles}
                    />
                )}

                {showProfileModal && (
                    <UserProfileModal
                        isOpen={showProfileModal}
                        onClose={() => setShowProfileModal(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default App;
