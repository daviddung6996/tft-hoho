
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useArenaPreloader } from './hooks/useArenaPreloader';
import { usePuzzleGame } from './hooks/usePuzzleGame';
import { useGameFlow } from './hooks/useGameFlow';
import { usePuzzleToPlayers } from './hooks/usePuzzleToPlayers';
import { useMobileAutoFullscreen } from './hooks/useMobileAutoFullscreen';
import { GameScene } from './components/Game/GameScene';
import { GameHUD, type MobilePanel } from './components/Game/GameHUD';
import { getLayoutMode, getMobileOverlayMode, type LayoutMode } from './components/Game/mobileLayout';

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
import { RightClickEffect } from './components/common/RightClickEffect';
import { SupportModal } from './components/Settings/SupportModal';
import { MONETIZATION_ENABLED, MONETIZATION_MODE, MONETIZATION_PACKAGING } from './config/monetization';
import { BetaStatusBanner } from './features/monetization/components/BetaStatusBanner';
import { CoachFab } from './features/coach-select/components/CoachFab';
import { CoachSelectOverlay } from './features/coach-select/components/CoachSelectOverlay';
import { playCoachCompletionChime } from './features/coach-select/coachCompletionChime';
import { useCoachSelect } from './features/coach-select/hooks/useCoachSelect';
import { deriveCoachCompLabel } from './features/coach-select/coachSelect.utils';
import type {
    CoachContextAugmentOption,
    CoachDecisionType,
    CoachGameContext,
} from './features/coach-select/coachSelect.types';

import './App.css';

const COACH_PATH_OPTIONS = [
    { id: 'econ', title: 'Kinh tế', subtitle: 'Vàng, XP, lượt roll' },
    { id: 'item', title: 'Trang bị', subtitle: 'Mảnh đồ, đồ lớn, đồ Ornn' },
    { id: 'combat', title: 'Đánh nhau', subtitle: 'Lõi combat, team-wide buff' },
    { id: 'emblem', title: 'Ấn', subtitle: 'Ấn tộc hệ, Xẻng/Chảo, Giáp chess' },
];

const COACH_PLAN_OPTIONS = [
    { id: 'stabilize', title: 'Chơi top 4', subtitle: 'Mạnh liền ngay lập tức' },
    { id: 'cap', title: 'Chơi top cao', subtitle: 'Lấy lõi hướng đánh về sau' },
    { id: 'patch', title: 'Fix item lại cho đẹp', subtitle: 'Lấy mảnh đồ để vá lại bài' },
    { id: 'greed', title: 'Chơi Loto', subtitle: 'Ra gì chơi đó vì chưa chốt bài' },
];

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
        secondRerollOrder,
        rollChargesRemaining,
        hasExtraReroll,
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
    const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => getLayoutMode());
    const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
    const [hasScouted, setHasScouted] = useState(false);

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

    useEffect(() => {
        const syncLayoutMode = () => {
            setLayoutMode(getLayoutMode());
        };

        syncLayoutMode();
        window.addEventListener('resize', syncLayoutMode);
        return () => window.removeEventListener('resize', syncLayoutMode);
    }, []);

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
    const isPhoneLandscape = layoutMode === 'phone-landscape';
    const mobileOverlayMode = getMobileOverlayMode({
        isMirrored,
        isAugmentOpen,
        puzzlePhase,
    });
    const isCoachAvailablePhase = puzzlePhase === 'selecting'
        || puzzlePhase === 'declaring_intent'
        || puzzlePhase === 'declaring_plan';

    const isScoutRequired = !isMirrored && isAugmentOpen && !hasScouted && isCoachAvailablePhase;

    const coachDecisionType: CoachDecisionType = puzzlePhase === 'declaring_intent'
        ? 'path'
        : puzzlePhase === 'declaring_plan'
            ? 'plan'
            : 'augment';
    const currentAugmentTitles: string[] = currentAugments.map((a: any) => a?.title).filter(Boolean);
    const currentAugmentOptions: CoachContextAugmentOption[] = currentAugments
        .filter((augment: any) => Boolean(augment))
        .slice(0, 3)
        .map((augment: any) => ({
            id: augment.id,
            title: augment.title,
            icon: augment.icon,
            tier: augment.tier,
        }));
    const coachGameContext: CoachGameContext | null = currentPuzzle ? {
        stage: currentPuzzle.stage,
        comp: deriveCoachCompLabel(
            synergies,
            myPlayer.units.map((unit: any) => unit?.name).filter(Boolean),
        ),
        gold: myPlayer.gold,
        level: myPlayer.level,
        hp: myPlayer.hp,
        decisionType: coachDecisionType,
        decisionLabel: coachDecisionType === 'path'
            ? 'Huong augment'
            : coachDecisionType === 'plan'
                ? 'Ke hoach'
                : 'Augment',
        currentDecisionOptions: coachDecisionType === 'path'
            ? COACH_PATH_OPTIONS
            : coachDecisionType === 'plan'
                ? COACH_PLAN_OPTIONS
                : currentAugmentOptions,
        currentAugments: coachDecisionType === 'augment' ? currentAugmentTitles : [],
        currentAugmentOptions: coachDecisionType === 'augment' ? currentAugmentOptions : [],
        chosenAugments: (myPlayer.augments || []).map((a: any) => a?.title).filter(Boolean),
        synergies: synergies.map((s: any) => s.name),
        boardChampions: myPlayer.units.map((c: any) => c.name),
        items: items.map((i: any) => i?.name).filter(Boolean),
    } : null;
    const {
        uiState: coachUiState,
        selectedCoach,
        answer: coachAnswer,
        error: coachError,
        completionNoticeToken,
        showCoachOverlay,
        showReturnFab,
        returnFabMode,
        openSelect: openCoachSelect,
        minimizeToBoard,
        reopenOverlay,
        dismissSession,
        selectCoach,
        backToSelect: handleBackToCoachSelect,
        askCoach,
    } = useCoachSelect(coachGameContext, currentPuzzle?.id ?? null);
    const shouldEnableMobileAutoFullscreen = isPhoneLandscape
        && currentView === 'puzzle'
        && !showLoginModal
        && !isSettingsOpen
        && !showAdminModal
        && !showProfileModal
        && !showCompletionModal
        && !showSupportModal
        && !showCoachOverlay;
    const hasBlockingWorkspaceModal = showLoginModal
        || isSettingsOpen
        || showAdminModal
        || showProfileModal
        || showCompletionModal
        || showSupportModal
        || showCoachOverlay;
    // viewport-hud-layer sits above app-container in the root stacking context,
    // so fixed modals rendered inside app-container must explicitly hide this chrome.
    const shouldRenderViewportMenu = currentView === 'puzzle'
        && !hasBlockingWorkspaceModal
        && !isTransitioning
        && puzzlePhase !== 'reviewing'
        && (!isPhoneLandscape || mobileOverlayMode === 'none');
    const shouldRenderMobileAugmentButton = currentView === 'puzzle'
        && isPhoneLandscape
        && puzzlePhase !== 'reviewing'
        && !hasBlockingWorkspaceModal
        && !isTransitioning;

    // Preload all arena images so scouting never shows bare teal background
    useArenaPreloader();
    const requestMobileAutoFullscreen = useMobileAutoFullscreen({ enabled: shouldEnableMobileAutoFullscreen });

    // Keyboard shortcuts: Q (scout next), R (scout prev), Space (return home)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input or if library is shown
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (currentView !== 'puzzle') return;
            if (showCoachOverlay || puzzlePhase === 'reviewing') return;
            if (hasBlockingWorkspaceModal) return;

            const opponents = allPlayers.filter(p => !p.isMe);
            if (opponents.length === 0) return;

            if (e.key === 'q' || e.key === 'Q') {
                e.preventDefault();
                setHasScouted(true);
                setScoutedPlayerId(prev => {
                    const currentIdx = opponents.findIndex(p => p.id === prev);
                    if (currentIdx === -1) return opponents[0].id;
                    const nextIdx = (currentIdx + 1) % opponents.length;
                    return opponents[nextIdx].id;
                });
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                setHasScouted(true);
                setScoutedPlayerId(prev => {
                    const currentIdx = opponents.findIndex(p => p.id === prev);
                    if (currentIdx === -1) return opponents[opponents.length - 1].id;
                    const prevIdx = (currentIdx - 1 + opponents.length) % opponents.length;
                    return opponents[prevIdx].id;
                });
            } else if (e.key === ' ') {
                e.preventDefault();
                setHasScouted(true);
                setScoutedPlayerId('1');
                setIsAugmentOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [allPlayers, currentView, puzzlePhase, showCoachOverlay, hasBlockingWorkspaceModal]);

    useEffect(() => {
        if (mobileOverlayMode !== 'none' || isMirrored) {
            setMobilePanel(null);
        }
    }, [mobileOverlayMode, isMirrored]);

    useEffect(() => {
        setMobilePanel(null);
        setHasScouted(false); // Reset scout requirement
    }, [currentPuzzle?.id]);

    const consumedCoachCompletionToken = React.useRef(0);

    useEffect(() => {
        consumedCoachCompletionToken.current = 0;
    }, [currentPuzzle?.id]);

    useEffect(() => {
        if (currentView !== 'puzzle') {
            setMobilePanel(null);
        }
    }, [currentView]);

    useEffect(() => {
        if (
            currentView !== 'puzzle'
            || !isCoachAvailablePhase
            || !isPuzzlePlayable
        ) {
            dismissSession();
        }
    }, [currentPuzzle?.id, currentView, dismissSession, isCoachAvailablePhase, isPuzzlePlayable]);

    useEffect(() => {
        if (showCoachOverlay) {
            setMobilePanel(null);
        }
    }, [showCoachOverlay]);

    useEffect(() => {
        if (!showReturnFab) {
            return;
        }
    }, [showReturnFab]);

    useEffect(() => {
        if (
            completionNoticeToken <= 0
            || completionNoticeToken === consumedCoachCompletionToken.current
        ) {
            return;
        }

        consumedCoachCompletionToken.current = completionNoticeToken;
        void playCoachCompletionChime();
    }, [completionNoticeToken]);

    const handleAugmentButtonClick = () => {
        requestMobileAutoFullscreen();

        if (isMirrored) {
            setScoutedPlayerId('1');
            setIsAugmentOpen(false);
            setMobilePanel(null);
            setHasScouted(true);
            return;
        }

        setMobilePanel(null);
        setIsAugmentOpen(prev => !prev);
        setHasScouted(true);
    };

    const handleOpenCoachSelect = () => {
        requestMobileAutoFullscreen();
        openCoachSelect();
    };

    const handleCoachObserveBoard = () => {
        setIsAugmentOpen(false);
        setMobilePanel(null);
        setHasScouted(true);
        minimizeToBoard();
    };

    const handleReopenCoachOverlay = () => {
        requestMobileAutoFullscreen();
        reopenOverlay();
    };

    const shouldRenderCoachEntryFab = currentView === 'puzzle'
        && isCoachAvailablePhase
        && isAugmentOpen
        && !isMirrored
        && isPuzzlePlayable
        && !hasBlockingWorkspaceModal
        && !showReturnFab
        && !isTransitioning;
    const shouldRenderCoachReturnFab = currentView === 'puzzle'
        && isCoachAvailablePhase
        && isPuzzlePlayable
        && !hasBlockingWorkspaceModal
        && showReturnFab
        && !isTransitioning;
    const loadingCoachFabLabel = `Coach ${selectedCoach.displayName} đang nhìn nhận thế trận`;

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
            <div
                className="layout-wrapper"
                data-layout-mode={layoutMode}
                style={{ backgroundImage: `url(${arenaSkinUrl})` }}
            >
                <div
                    className="viewport-hud-layer"
                    data-layout-mode={layoutMode}
                    data-mobile-overlay-mode={mobileOverlayMode}
                    data-menu-visible={shouldRenderViewportMenu ? 'true' : 'false'}
                    data-puzzle-phase={puzzlePhase}
                >
                    {currentView === 'puzzle' && (
                        <>
                            {shouldRenderViewportMenu && (
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
                            )}
                            {shouldRenderMobileAugmentButton && (
                                <AugmentButton
                                    isActive={isAugmentOpen}
                                    variant={isMirrored ? 'return' : 'default'}
                                    needsScouting={isScoutRequired}
                                    onClick={handleAugmentButtonClick}
                                    rollChargesRemaining={hasExtraReroll ? rollChargesRemaining : undefined}
                                />
                            )}
                            {shouldRenderCoachEntryFab && (
                                <CoachFab
                                    onClick={handleOpenCoachSelect}
                                />
                            )}
                            {shouldRenderCoachReturnFab && (
                                <CoachFab
                                    onClick={handleReopenCoachOverlay}
                                    variant={returnFabMode === 'ready' ? 'return-ready' : 'return-loading'}
                                    eyebrow={returnFabMode === 'ready' ? 'Đã xong' : 'Coach'}
                                    label={returnFabMode === 'ready' ? 'Xem phân tích' : loadingCoachFabLabel}
                                    isDimmed={returnFabMode !== 'ready'}
                                    isPulsing={returnFabMode === 'ready'}
                                />
                            )}
                        </>
                    )}
                </div>
                <div
                    className="app-container"
                    data-layout-mode={layoutMode}
                    data-mobile-overlay-mode={mobileOverlayMode}
                    style={{
                        backgroundImage: `url(${arenaSkinUrl})`,
                    }}
                >

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
                                isInteractionLocked={hasBlockingWorkspaceModal}
                            />
                            {!isMirrored && (
                                <>
                                    <TopStatusBar
                                        stage={currentPuzzle.stage || ''}
                                        streakHistory={currentPuzzle.streakHistory}
                                        streakCount={currentPuzzle.streakCount}
                                        dimmed={isAugmentOpen}
                                    />
                                    <BetaStatusBanner
                                        mode={MONETIZATION_MODE}
                                        betaEndsAt={MONETIZATION_PACKAGING.betaWindow.endsAt}
                                    />
                                </>
                            )}

                            <GameHUD
                                activePlayerId={scoutedPlayerId}
                                players={scoutingPlayers}
                                onPlayerSelect={(id) => {
                                    requestMobileAutoFullscreen();
                                    setScoutedPlayerId(id);
                                    setHasScouted(true);
                                    if (id !== '1') setIsAugmentOpen(false);
                                }}
                                synergies={synergies}
                                items={items}
                                gold={myPlayer.gold}
                                layoutMode={layoutMode}
                                mobilePanel={mobilePanel}
                                onMobilePanelChange={setMobilePanel}
                                mobileOverlayMode={mobileOverlayMode}
                            />

                            {MONETIZATION_ENABLED && (
                                <>
                                    <TCoinBalance />
                                    <TCoinEarnAnimation />
                                </>
                            )}

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
                                        secondRerollOrder={secondRerollOrder}
                                        hasExtraReroll={hasExtraReroll}
                                        rollChargesRemaining={hasExtraReroll ? rollChargesRemaining : undefined}
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

                            {isScoutRequired && <div className="scout-interaction-blocker" />}

                            {!isMirrored && isAugmentOpen && puzzlePhase === 'reviewing' && selectedAugment && (
                                <DecisionReview
                                    userRerollOrder={rerollOrder}
                                    userChoice={selectedAugment}
                                    puzzleTier={currentPuzzle.tier || 'free'}
                                    proPlayerName={currentPuzzle.proPlayer}
                                    proSecondRoll={currentPuzzle.proSecondRoll}
                                    proFirstRoll={currentPuzzle.proFirstRoll}
                                    proRerollIndices={currentPuzzle.proRerollIndices || currentPuzzle.meta_data?.proRerollIndices || []}
                                    initialAugments={currentPuzzle.augments?.filter((a: any) => a !== null) || []}
                                    rerollAugments={currentPuzzle.rerollAugments?.filter((a: any) => a !== null) || []}
                                    secondRerollAugments={currentPuzzle.secondRerollAugments?.filter((a: any) => a !== null) || []}
                                    proSecondRerollIndices={currentPuzzle.proSecondRerollIndices || []}
                                    secondRerollOrder={secondRerollOrder}
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

                            {puzzlePhase !== 'reviewing' && !isMirrored && !isPhoneLandscape && (
                                <GoldDisplay gold={myPlayer.gold} />
                            )}

                            {puzzlePhase !== 'reviewing' && !isPhoneLandscape && (
                                <>
                                    <AugmentButton
                                        isActive={isAugmentOpen}
                                        variant={isMirrored ? 'return' : 'default'}
                                        needsScouting={isScoutRequired}
                                        onClick={handleAugmentButtonClick}
                                        rollChargesRemaining={hasExtraReroll ? rollChargesRemaining : undefined}
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
                            {currentView === 'puzzle' && showCoachOverlay && (
                                <CoachSelectOverlay
                                    coach={selectedCoach}
                                    currentAugments={currentAugments.filter((augment: any) => Boolean(augment))}
                                    gameContext={coachGameContext}
                                    uiState={coachUiState}
                                    answer={coachAnswer}
                                    error={coachError}
                                    onClose={dismissSession}
                                    onSelectCoach={selectCoach}
                                    onAskCoach={askCoach}
                                    onBackToSelect={handleBackToCoachSelect}
                                    onObserveBoard={handleCoachObserveBoard}
                                />
                            )}

                        </>
                    </div>

                    <div className={`puzzle-transition-overlay${isTransitioning ? ' active' : ''}`} />
                </div>
            </div>

            <PuzzleCompletionModal
                isOpen={showCompletionModal}
                onClose={() => setShowCompletionModal(false)}
            />
            <RightClickEffect />
        </>
    );
};

export default App;
