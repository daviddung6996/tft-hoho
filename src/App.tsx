
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useArenaPreloader } from './hooks/useArenaPreloader';
import { usePuzzleGame } from './hooks/usePuzzleGame';
import { useGameFlow } from './hooks/useGameFlow';
import { usePuzzleToPlayers } from './hooks/usePuzzleToPlayers';
import { GameScene } from './components/Game/GameScene';
import { GameHUD } from './components/Game/GameHUD';

// Components
import { AugmentButton } from './components/Arena/AugmentButton';
import { GoldDisplay } from './components/Arena/GoldDisplay';
import { AugmentModal } from './components/Arena/AugmentModal';
import { DecisionReview } from './components/Arena/DecisionReview';
import { TopStatusBar } from './components/Arena/TopStatusBar';
import { PathSelector } from './features/augment-trainer/components/PathSelector';
import { PlanSelector } from './features/augment-trainer/components/PlanSelector';
import { MenuButton } from './components/Settings/SettingsButton';
import { ArenaSelectorModal } from './components/Settings/ArenaSelectorModal';
import { PuzzleCompletionModal } from './components/Arena/PuzzleCompletionModal';

// Lazy-loaded components (heavy deps: recharts, remotion, admin panel)
const LoginModal = React.lazy(() =>
    import('./components/Auth/LoginModal').then(m => ({ default: m.LoginModal }))
);
const AdminDataModal = React.lazy(() => import('./pages/Admin/AdminDataModal'));
const UserProfileModal = React.lazy(() =>
    import('./components/Settings/UserProfileModal').then(m => ({ default: m.UserProfileModal }))
);
const VideoLibraryPage = React.lazy(() =>
    import('./features/video-library/components/VideoLibraryPage').then(m => ({ default: m.VideoLibraryPage }))
);

// Data
import { ARENA_SKINS } from './data/arenas';
import { useAuth } from './contexts/AuthContext';
import { TCoinBalance } from './features/tcoin/components/TCoinBalance';
import { TCoinEarnAnimation } from './features/tcoin/components/TCoinEarnAnimation';
import { PuzzleLockOverlay } from './features/tcoin/components/PuzzleLockOverlay';
import { LandscapePrompt } from './components/common/LandscapePrompt';
import { SupportModal } from './components/Settings/SupportModal';
import { MONETIZATION_ENABLED } from './config/monetization';

import './App.css';

const App: React.FC = () => {
    // --- 1. Authentication ---
    const { user, isAuthenticated, isAdmin, isLoading: isAuthLoading } = useAuth();

    // Modal visibility: Show for unauthenticated users, hide when logged in or guest mode is active
    const [showLoginModal, setShowLoginModal] = useState(false);

    // useEffect to control modal visibility based on auth state
    // IMPORTANT: Only show login modal on INITIAL load when no user exists.
    // Do NOT re-show it during token refresh (tab switch) to prevent
    // covering other open modals (e.g., Admin panel).
    const hasInitializedAuth = React.useRef(false);
    useEffect(() => {
        // Wait for auth to finish loading
        if (isAuthLoading) return;

        if (!hasInitializedAuth.current) {
            // First auth resolution: show/hide login based on user
            hasInitializedAuth.current = true;
            if (!user) {
                setShowLoginModal(true);
            } else {
                setShowLoginModal(false);
            }
        } else {
            // Subsequent auth changes (e.g., login success): only HIDE modal, never re-show
            if (user) {
                setShowLoginModal(false);
            }
        }
    }, [isAuthLoading, user]);

    // Close modal handler
    const handleCloseLoginModal = () => {
        setShowLoginModal(false);
    };

    // --- 2. Puzzle Data & Game Flow ---
    const {
        currentPuzzle,
        isLoadingPuzzles,
        allPuzzlesCompleted,
        handleMarkCompleted,
        handleNextPuzzle: handleNext,
        handleSkipToFreePuzzle,
        hasFreePuzzlesAvailable,
        refreshPuzzles,
        currentPuzzleAccess,
        isPuzzlePlayable,
        requiresLoginForUnlock,
        isUnlocking,
        isResolvingNextPuzzle,
        lockMessageVariant,
        handleUnlockCurrentPuzzle,
        walletBalance,
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
        resetFlow,
        // V2: Intent declaration
        isV2Puzzle,
        declaredPath,
        handlePathDeclare,
        // V3: Plan declaration (4-2)
        is42Puzzle,
        declaredPlan,
        handlePlanDeclare
    } = useGameFlow(currentPuzzle, user?.id, { canPlayPuzzle: isPuzzlePlayable });

    // --- 3. UI State ---
    const [isAugmentOpen, setIsAugmentOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [scoutedPlayerId, setScoutedPlayerId] = useState<string>('1');
    const [myArenaId, setMyArenaId] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [currentView, setCurrentView] = useState<'puzzle' | 'library'>('puzzle');

    // Wrapper for next puzzle — fast crossfade transition
    // Phase 1: Fade-in overlay (150ms CSS) → Phase 2: Swap state while fully covered
    // Phase 3: Wait for React render (rAF×2) → Phase 4: Fade-out overlay
    const handleNextPuzzle = useCallback(() => {
        setIsTransitioning(true);
        setTimeout(() => {
            void (async () => {
                if (currentPuzzle) await handleMarkCompleted(currentPuzzle.id);
                const hasNextPuzzle = await handleNext();
                if (hasNextPuzzle) {
                    resetFlow();
                } else {
                    setShowCompletionModal(true);
                }
                setScoutedPlayerId('1');
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setIsTransitioning(false);
                    });
                });
            })();
        }, 160);
    }, [currentPuzzle, handleMarkCompleted, handleNext, resetFlow]);

    // Show completion modal when all puzzles are completed
    useEffect(() => {
        if (allPuzzlesCompleted && !isResolvingNextPuzzle) {
            setShowCompletionModal(true);
        }
    }, [allPuzzlesCompleted, isResolvingNextPuzzle]);

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

    // ScoutingPanel players: sort ALL by HP desc at 3-2/4-2 lobby view
    const scoutingPlayers = (currentPuzzle?.stage === '3-2' || currentPuzzle?.stage === '4-2')
        ? allPlayersWithArena.slice().sort((a, b) => b.hp - a.hp)
        : allPlayersWithArena;

    // Scouting Logic
    const activePlayer = allPlayersWithArena.find(p => p.id === scoutedPlayerId) || myPlayerWithArena;
    const isMirrored = scoutedPlayerId !== '1';
    const playerArena = ARENA_SKINS.find(a => a.id === activePlayer.arenaId) || ARENA_SKINS[0];
    const arenaSkinUrl = playerArena.backgroundUrl || playerArena.iconUrl;

    // Preload all arena images so scouting never shows bare teal background
    useArenaPreloader();

    // Keyboard shortcuts: Q (scout next), R (scout prev), Space (return home)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input or if library is shown
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (currentView !== 'puzzle') return;

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
                setIsAugmentOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [allPlayers, currentView]);

    // Removed routing for TestFlex

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
        <>
            <LandscapePrompt />
            <div className="layout-wrapper" style={{ backgroundImage: `url(${arenaSkinUrl})` }}>
                <div className="app-container" style={{
                    backgroundImage: `url(${arenaSkinUrl})`,
                }}>

                    {/* Video Library View */}
                    {currentView === 'library' && (
                        <Suspense fallback={<div className="app-loading-screen">Đang tải...</div>}>
                            <VideoLibraryPage onBack={() => setCurrentView('puzzle')} />
                        </Suspense>
                    )}

                    {/* Puzzle View — kept mounted (display:none) to preserve DecisionReview state
                    and prevent IqScoreSummary / VideoUnlockToast animations from replaying
                    when the user navigates to the library and comes back. */}
                    <div style={{ display: currentView === 'puzzle' ? 'contents' : 'none' }}>
                        <>
                            <GameScene
                                myPlayer={myPlayerWithArena}
                                activePlayer={activePlayer}
                                isMirrored={isMirrored}
                            />
                            <TopStatusBar
                                stage={currentPuzzle.stage || ''}
                                streakHistory={currentPuzzle.streakHistory}
                                streakCount={currentPuzzle.streakCount}
                                dimmed={isAugmentOpen && !isMirrored}
                            />

                            <GameHUD
                                activePlayerId={scoutedPlayerId}
                                players={scoutingPlayers}
                                onPlayerSelect={(id) => { setScoutedPlayerId(id); if (id !== '1') setIsAugmentOpen(false); }}
                                synergies={synergies}
                                items={items}
                            />

                            {MONETIZATION_ENABLED && (
                                <>
                                    <TCoinBalance />
                                    <TCoinEarnAnimation />
                                </>
                            )}
                            <MenuButton
                                onArenaClick={() => setIsSettingsOpen(true)}
                                isAuthenticated={isAuthenticated}
                                displayName={user?.display_name || user?.email}
                                onAdminClick={isAdmin ? () => setShowAdminModal(true) : undefined}
                                onProfileClick={() => setShowProfileModal(true)}
                                onLoginClick={() => setShowLoginModal(true)}
                                onLibraryClick={() => setCurrentView('library')}
                                isAdmin={isAdmin}
                            />

                            {isSettingsOpen && (
                                <ArenaSelectorModal
                                    isOpen={isSettingsOpen}
                                    onClose={() => setIsSettingsOpen(false)}
                                    onSelectArena={(arena) => { setMyArenaId(arena.id); setIsSettingsOpen(false); }}
                                    currentArena={ARENA_SKINS.find(a => a.id === (myArenaId || myPlayer.arenaId)) || ARENA_SKINS[0]}
                                />
                            )}

                            {/* V2: PathSelector — shown during declaring_intent phase */}
                            {!isMirrored && isAugmentOpen && puzzlePhase === 'declaring_intent' && isV2Puzzle && (
                                isPuzzlePlayable ? (
                                    <PathSelector
                                        onPathDeclare={handlePathDeclare}
                                        stage={currentPuzzle.stage}
                                        allPuzzlesCompleted={allPuzzlesCompleted}
                                    />
                                ) : currentPuzzleAccess && (
                                    <PuzzleLockOverlay
                                        tier={currentPuzzleAccess.tier}
                                        isProSupporter={currentPuzzleAccess.reason === 'pro_supporter'}
                                        canAfford={walletBalance >= (currentPuzzleAccess.cost ?? 0)}
                                        isLoading={isUnlocking}
                                        requiresLogin={requiresLoginForUnlock}
                                        title={
                                            lockMessageVariant === 'rare_elite'
                                                ? 'WOW, bạn gặp tình huống hiếm.'
                                                : lockMessageVariant === 'premium_education'
                                                    ? 'Tin vui! Bạn gặp tình huống chất lượng cao.'
                                                    : undefined
                                        }
                                        subtitle={
                                            lockMessageVariant === 'rare_elite'
                                                ? 'Tình huống này chứa nước đi thần thánh của tuyển thủ. Xem là lên trình!'
                                                : lockMessageVariant === 'premium_education'
                                                    ? 'Tình huống xịn + giải thích kỹ giúp bạn nâng tư duy augment thật sự.'
                                                    : undefined
                                        }
                                        onUnlock={() => {
                                            if (requiresLoginForUnlock) {
                                                setShowLoginModal(true);
                                            } else {
                                                handleUnlockCurrentPuzzle();
                                            }
                                        }}
                                        onProSupporter={() => {
                                            const supportBtn = document.querySelector('.menu-item--support') as HTMLButtonElement;
                                            if (supportBtn) supportBtn.click();
                                        }}
                                        onSkipToFree={hasFreePuzzlesAvailable ? handleSkipToFreePuzzle : undefined}
                                    />
                                )
                            )}

                            {/* V3: PlanSelector — shown during declaring_plan phase (4-2) */}
                            {!isMirrored && isAugmentOpen && puzzlePhase === 'declaring_plan' && is42Puzzle && (
                                isPuzzlePlayable ? (
                                    <PlanSelector
                                        onPlanDeclare={handlePlanDeclare}
                                        stage={currentPuzzle.stage}
                                        allPuzzlesCompleted={allPuzzlesCompleted}
                                    />
                                ) : currentPuzzleAccess && (
                                    <PuzzleLockOverlay
                                        tier={currentPuzzleAccess.tier}
                                        isProSupporter={currentPuzzleAccess.reason === 'pro_supporter'}
                                        canAfford={walletBalance >= (currentPuzzleAccess.cost ?? 0)}
                                        isLoading={isUnlocking}
                                        requiresLogin={requiresLoginForUnlock}
                                        onUnlock={() => {
                                            if (requiresLoginForUnlock) {
                                                setShowLoginModal(true);
                                            } else {
                                                handleUnlockCurrentPuzzle();
                                            }
                                        }}
                                        onProSupporter={() => setShowSupportModal(true)}
                                        onSkipToFree={hasFreePuzzlesAvailable ? handleSkipToFreePuzzle : undefined}
                                    />
                                )
                            )}
                            {/* Augment Logic — Lock Overlay or AugmentModal */}
                            {!isMirrored && isAugmentOpen && puzzlePhase === 'selecting' && (
                                isPuzzlePlayable ? (
                                    <AugmentModal
                                        currentAugments={currentAugments}
                                        rerollOrder={rerollOrder}
                                        onReroll={handleAugmentReroll}
                                        onSelect={handleAugmentSelect}
                                        allPuzzlesCompleted={allPuzzlesCompleted}
                                        puzzleTier={currentPuzzle.tier || 'free'}
                                    />
                                ) : currentPuzzleAccess && (
                                    <PuzzleLockOverlay
                                        tier={currentPuzzleAccess.tier}
                                        isProSupporter={currentPuzzleAccess.reason === 'pro_supporter'}
                                        canAfford={walletBalance >= (currentPuzzleAccess.cost ?? 0)}
                                        isLoading={isUnlocking}
                                        requiresLogin={requiresLoginForUnlock}
                                        title={
                                            lockMessageVariant === 'rare_elite'
                                                ? 'WOW, bạn gặp tình huống hiếm.'
                                                : lockMessageVariant === 'premium_education'
                                                    ? 'Tin vui! Bạn gặp tình huống chất lượng cao.'
                                                    : undefined
                                        }
                                        subtitle={
                                            lockMessageVariant === 'rare_elite'
                                                ? 'Tình huống này chứa nước đi thần thánh của tuyển thủ. Xem là lên trình!'
                                                : lockMessageVariant === 'premium_education'
                                                    ? 'Tình huống xịn + giải thích kỹ giúp bạn nâng tư duy augment thật sự.'
                                                    : undefined
                                        }
                                        onUnlock={() => {
                                            if (requiresLoginForUnlock) {
                                                setShowLoginModal(true);
                                            } else {
                                                handleUnlockCurrentPuzzle();
                                            }
                                        }}
                                        onProSupporter={() => setShowSupportModal(true)}
                                        onSkipToFree={hasFreePuzzlesAvailable ? handleSkipToFreePuzzle : undefined}
                                    />
                                )
                            )}

                            {!isMirrored && isAugmentOpen && puzzlePhase === 'reviewing' && selectedAugment && (
                                <DecisionReview
                                    userRerollOrder={rerollOrder}
                                    userChoice={selectedAugment}
                                    puzzleTier={currentPuzzle.tier || 'free'}
                                    proPlayerName={currentPuzzle.proPlayer}
                                    proSecondRoll={currentPuzzle.proSecondRoll}
                                    proFirstRoll={currentPuzzle.proFirstRoll}
                                    proRerollIndices={currentPuzzle.proRerollIndices || currentPuzzle.meta_data?.proRerollIndices || []}
                                    // Removed unused props: proSecondRerollIndices, proPickIndex
                                    initialAugments={currentPuzzle.augments?.filter((a: any) => a !== null) || []}
                                    rerollAugments={currentPuzzle.rerollAugments?.filter((a: any) => a !== null) || []}
                                    proFinalPickData={currentPuzzle.proFinalPick}
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
                                    videoUrl={currentPuzzle.video_url}
                                    videoTitle={currentPuzzle.video_title}
                                    onViewLibrary={() => setCurrentView('library')}
                                    // V2: Intent data
                                    declaredPath={declaredPath || undefined}
                                    proPickPath={currentPuzzle.proPickPath}
                                    proReasoningIntent={currentPuzzle.proReasoningIntent}
                                    // V3: Plan data (4-2)
                                    declaredPlan={declaredPlan || undefined}
                                    proPlan={currentPuzzle.proPlan}
                                    planReasoning={currentPuzzle.planReasoning}
                                    onSupportClick={() => setShowSupportModal(true)}
                                />
                            )}

                            {puzzlePhase !== 'reviewing' && !isMirrored && (
                                <GoldDisplay gold={myPlayer.gold} />
                            )}

                            {puzzlePhase !== 'reviewing' && (
                                <>
                                    <AugmentButton
                                        isActive={isAugmentOpen}
                                        variant={isMirrored ? 'return' : 'default'}
                                        onClick={isMirrored
                                            ? () => { setScoutedPlayerId('1'); setIsAugmentOpen(false); }
                                            : () => setIsAugmentOpen(!isAugmentOpen)
                                        }
                                    />
                                </>
                            )}

                            {showLoginModal && (
                                <Suspense fallback={null}>
                                    <LoginModal onClose={handleCloseLoginModal} />
                                </Suspense>
                            )}

                            {showAdminModal && (
                                <Suspense fallback={<div className="app-loading-screen">Đang tải Admin...</div>}>
                                    <AdminDataModal
                                        onClose={() => setShowAdminModal(false)}
                                        onPuzzleSaved={refreshPuzzles}
                                    />
                                </Suspense>
                            )}

                            {showProfileModal && (
                                <Suspense fallback={null}>
                                    <UserProfileModal
                                        isOpen={showProfileModal}
                                        onClose={() => setShowProfileModal(false)}
                                    />
                                </Suspense>
                            )}

                            <SupportModal
                                isOpen={showSupportModal}
                                onClose={() => setShowSupportModal(false)}
                            />

                            <PuzzleCompletionModal
                                isOpen={showCompletionModal}
                                onClose={() => setShowCompletionModal(false)}
                            />
                        </>
                    </div>

                    <div className={`puzzle-transition-overlay${isTransitioning ? ' active' : ''}`} />
                </div>
            </div>
        </>
    );
};

export default App;
