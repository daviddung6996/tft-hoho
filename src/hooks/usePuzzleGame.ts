import React from 'react';
import { puzzleService } from '../services/puzzleService';
import { PUZZLE_SCENARIOS } from '../data/puzzleScenarios';
import { useAuth } from '../contexts/AuthContext';
import { useGameData } from '../contexts/GameDataContext';
import { AugmentData } from '../services/augmentService';
import { PuzzleAccessResult } from '../features/tcoin/tcoin.types';
import { useTCoin } from '../features/tcoin/hooks/useTCoin';
import { useProSupporter } from '../features/pro-supporter/hooks/useProSupporter';

// Enrich a single augment with Vietnamese data from DB
function enrichAugment(aug: AugmentData | null, dbAugments: AugmentData[]): AugmentData | null {
    if (!aug) return null;
    const dbAug = dbAugments.find(db => db.id === aug.id) ||
        dbAugments.find(db => db.title.toLowerCase() === aug.title.toLowerCase());
    if (dbAug) {
        return { ...aug, title: dbAug.title, description: dbAug.description, icon: dbAug.icon || aug.icon };
    }
    return aug;
}

// Enrich all augment arrays in a puzzle with Vietnamese data
function enrichPuzzleAugments(puzzle: any, dbAugments: AugmentData[]): any {
    if (!dbAugments.length) return puzzle;

    const enrichArray = (arr: any[] | null | undefined) =>
        arr ? arr.map((a: any) => enrichAugment(a, dbAugments)) : arr;

    return {
        ...puzzle,
        augments: enrichArray(puzzle.augments),
        rerollAugments: enrichArray(puzzle.rerollAugments),
        secondRerollAugments: enrichArray(puzzle.secondRerollAugments),
        proFirstRoll: enrichArray(puzzle.proFirstRoll),
        proSecondRoll: enrichArray(puzzle.proSecondRoll),
        proFinalPick: enrichAugment(puzzle.proFinalPick, dbAugments),
        opponents: puzzle.opponents?.map((opp: any) => ({
            ...opp,
            augments: enrichArray(opp.augments)
        }))
    };
}

export type LockMessageVariant = 'default' | 'premium_education' | 'rare_elite';

export const usePuzzleGame = (isAuthenticated: boolean) => {
    const { user, isGuest } = useAuth();
    const { augments: cachedAugments, isLoading: isGameDataLoading } = useGameData();
    const { checkAccess, unlockPuzzle, balance } = useTCoin();
    const { isProSupporter } = useProSupporter();

    // [NEW] Dynamic Puzzles State
    const [puzzles, setPuzzles] = React.useState<any[]>([]);
    const [isLoadingPuzzles, setIsLoadingPuzzles] = React.useState(true);
    const [completedPuzzleIds, setCompletedPuzzleIds] = React.useState<string[]>([]);

    // Puzzle access state
    const [currentPuzzleAccess, setCurrentPuzzleAccess] = React.useState<PuzzleAccessResult | null>(null);
    const [isCheckingAccess, setIsCheckingAccess] = React.useState(false);
    const [isUnlocking, setIsUnlocking] = React.useState(false);
    const [lockMessageVariant, setLockMessageVariant] = React.useState<LockMessageVariant>('default');

    // URL Handling: Check for puzzle ID in URL on initial load and handle async loading
    const pendingPuzzleIdRef = React.useRef(new URLSearchParams(window.location.search).get('puzzle'));

    // Initialize index based on URL if possible (for static puzzles)
    const [currentPuzzleIndex, setCurrentPuzzleIndex] = React.useState(0);
    const [customScenario, setCustomScenario] = React.useState<any | null>(null);

    // Fetch puzzles immediately (don't wait for game data)
    React.useEffect(() => {
        if (new URLSearchParams(window.location.search).get('seed') === 'true') {
            import('../utils/seedTestPuzzles').then(m => m.seedTestPuzzles());
        }

        const fetchPuzzles = async () => {
            setIsLoadingPuzzles(true);
            try {
                const dbPuzzles = await puzzleService.getAll();
                const rawPuzzles = dbPuzzles && dbPuzzles.length > 0 ? dbPuzzles : PUZZLE_SCENARIOS;
                setPuzzles(rawPuzzles);
            } catch (err) {
                console.error("Failed to load puzzles:", err);
                setPuzzles(PUZZLE_SCENARIOS);
            } finally {
                setIsLoadingPuzzles(false);
            }
        };
        fetchPuzzles();
    }, []);

    // Enrich augment data reactively when augments become available
    React.useEffect(() => {
        if (!isGameDataLoading && cachedAugments.length > 0 && puzzles.length > 0) {
            setPuzzles(prev => prev.map(p => enrichPuzzleAugments(p, cachedAugments)));
        }
    }, [isGameDataLoading, cachedAugments]);

    // Fetch User History
    const fetchUserHistory = React.useCallback(async () => {
        if (user?.id) {
            const ids = await puzzleService.getCompletedPuzzles(user.id);
            setCompletedPuzzleIds(ids);
        } else {
            setCompletedPuzzleIds([]);
        }
    }, [user?.id]);

    React.useEffect(() => {
        fetchUserHistory();
    }, [fetchUserHistory]);

    // Custom Scenario Loading
    React.useEffect(() => {
        const loadCustomScenario = async () => {
            const params = new URLSearchParams(window.location.search);
            const scenarioCode = params.get('scenario');
            if (scenarioCode) {
                const { decompressPuzzleState } = await import('../utils/urlCompression');
                const decoded = decompressPuzzleState(scenarioCode);
                if (decoded) {
                    if (!decoded.id || decoded.id === '') decoded.id = 'shared-' + Date.now();
                    setCustomScenario(decoded);
                }
            }
        };
        loadCustomScenario();
    }, []);

    // Merge logic: If we have a custom scenario, it takes precedence (prepended)
    React.useEffect(() => {
        if (customScenario) {
            setPuzzles(prev => {
                const filtered = prev.filter(p => p.id !== customScenario.id);
                return [customScenario, ...filtered];
            });
            setCurrentPuzzleIndex(0);
        }
    }, [customScenario]);

    // Effect: Handle Deep Linking or Random Selection
    React.useEffect(() => {
        if (puzzles.length > 0) {
            const pendingId = pendingPuzzleIdRef.current;

            // Priority 1: Deep Linking - If we have a pending puzzle ID from URL
            if (pendingId) {
                const index = puzzles.findIndex(p => p.id === pendingId);
                if (index !== -1) {
                    // Found the puzzle, set it and clear the pending ID
                    
                    setCurrentPuzzleIndex(index);
                    pendingPuzzleIdRef.current = null;
                    return; // ✅ STOP HERE, don't run random selection
                } else if (!isLoadingPuzzles) {
                    
                    // Clear pending ID and fallback to random selection below
                    pendingPuzzleIdRef.current = null;
                }
            }

            // Priority 2: Random Selection - Only if NEVER had pending ID from start
            // Skip if we already have a valid currentPuzzleIndex
            if (currentPuzzleIndex >= 0 && currentPuzzleIndex < puzzles.length) {
                
                return; // Already have a puzzle, don't randomize
            }

            // This runs on initial mount when no puzzle is set
            
            const unplayedPuzzles = puzzles.filter(p => !completedPuzzleIds.includes(p.id));
            const pool = unplayedPuzzles.length > 0 ? unplayedPuzzles : puzzles;

            if (pool.length > 0) {
                const randomPuzzle = pool[Math.floor(Math.random() * pool.length)];
                const index = puzzles.findIndex(p => p.id === randomPuzzle.id);
                setCurrentPuzzleIndex(index);
            }
        }
    }, [puzzles, isLoadingPuzzles, completedPuzzleIds, currentPuzzleIndex]);

    // Effect: Sync URL with Current Puzzle State
    React.useEffect(() => {
        if (pendingPuzzleIdRef.current || isLoadingPuzzles || puzzles.length === 0) return;

        const current = puzzles[currentPuzzleIndex];
        if (current) {
            const url = new URL(window.location.href);
            if (url.searchParams.get('puzzle') !== current.id) {
                url.searchParams.set('puzzle', current.id);
                window.history.pushState({}, '', url);
            }
        }
    }, [currentPuzzleIndex, puzzles, isLoadingPuzzles]);

    // Compute completion state: all puzzles completed (excluding current puzzle)
    const allPuzzlesCompleted = React.useMemo(() => {
        if (puzzles.length === 0) return false;
        const currentPuzzle = puzzles[currentPuzzleIndex];
        const unplayedPuzzles = puzzles.filter(
            p => !completedPuzzleIds.includes(p.id) && p.id !== currentPuzzle?.id
        );
        return unplayedPuzzles.length === 0;
    }, [puzzles, completedPuzzleIds, currentPuzzleIndex]);

    const handleMarkCompleted = async (puzzleId: string) => {
        if (isAuthenticated && user?.id) {
            try {
                await puzzleService.markPuzzleCompleted(user.id, puzzleId);
                setCompletedPuzzleIds(prev => [...prev, puzzleId]);
            } catch (e) {
                console.error("Failed to mark puzzle completed:", e);
            }
        }
    };

    // Access check: runs when currentPuzzle changes
    const currentPuzzle = puzzles[currentPuzzleIndex];
    React.useEffect(() => {
        if (!currentPuzzle) {
            setCurrentPuzzleAccess(null);
            return;
        }
        const tier = currentPuzzle.tier || 'free';
        if (tier === 'free') {
            setCurrentPuzzleAccess({ canPlay: true, reason: 'free', tier });
            return;
        }
        // Pro Supporter bypass — never show lock
        if (isProSupporter) {
            setCurrentPuzzleAccess({ canPlay: true, reason: 'pro_supporter', tier });
            return;
        }
        // Guest + locked tier => requires_login shortcut (no DB call needed)
        if (isGuest || !isAuthenticated) {
            const cost = tier === 'advanced' ? 30 : 100;
            setCurrentPuzzleAccess({ canPlay: false, reason: 'locked', cost, tier });
            return;
        }
        let cancelled = false;
        setIsCheckingAccess(true);
        checkAccess(currentPuzzle.id, tier)
            .then(result => { if (!cancelled) setCurrentPuzzleAccess(result); })
            .catch(() => {
                if (!cancelled) {
                    const cost = tier === 'advanced' ? 30 : 100;
                    setCurrentPuzzleAccess({ canPlay: false, reason: 'locked', cost, tier });
                }
            })
            .finally(() => { if (!cancelled) setIsCheckingAccess(false); });
        return () => { cancelled = true; };
    }, [currentPuzzle?.id, currentPuzzle?.tier, isAuthenticated, isGuest, isProSupporter, checkAccess]);

    const isPuzzlePlayable = currentPuzzleAccess?.canPlay ?? true;
    const requiresLoginForUnlock = !isAuthenticated || isGuest;

    const handleUnlockCurrentPuzzle = React.useCallback(async (): Promise<boolean> => {
        if (!currentPuzzle) return false;
        const tier = currentPuzzle.tier || 'free';
        if (tier === 'free') return true;
        setIsUnlocking(true);
        try {
            const success = await unlockPuzzle(currentPuzzle.id, tier);
            if (success) {
                setCurrentPuzzleAccess({ canPlay: true, reason: 'unlocked', tier });
            }
            return success;
        } catch {
            return false;
        } finally {
            setIsUnlocking(false);
        }
    }, [currentPuzzle?.id, currentPuzzle?.tier, unlockPuzzle]);

    const refreshCurrentPuzzleAccess = React.useCallback(async () => {
        if (!currentPuzzle) return;
        const tier = currentPuzzle.tier || 'free';
        if (tier === 'free') return;
        try {
            const result = await checkAccess(currentPuzzle.id, tier);
            setCurrentPuzzleAccess(result);
        } catch { /* keep existing state */ }
    }, [currentPuzzle?.id, currentPuzzle?.tier, checkAccess]);

    const handleNextPuzzle = () => {
        const cp = puzzles[currentPuzzleIndex];
        const unplayedPuzzles = puzzles.filter(p => !completedPuzzleIds.includes(p.id) && p.id !== cp?.id);

        // Early return if all puzzles are completed - prevent replay
        if (unplayedPuzzles.length === 0) {
            // Clear URL to show clean state
            const url = new URL(window.location.href);
            url.searchParams.delete('puzzle');
            window.history.pushState({}, '', url);
            return;
        }

        // Select from unplayed puzzles only — if locked, stop there (don't skip)
        if (unplayedPuzzles.length > 0) {
            const randomPuzzle = unplayedPuzzles[Math.floor(Math.random() * unplayedPuzzles.length)];
            const index = puzzles.findIndex(p => p.id === randomPuzzle.id);
            setCurrentPuzzleIndex(index);
            // Pre-set lock state so lock overlay renders BEFORE transition fades out
            // Pro Supporter: NEVER pre-set locked — always play through
            if (randomPuzzle.tier && randomPuzzle.tier !== 'free') {
                if (isProSupporter) {
                    setLockMessageVariant('default');
                    setCurrentPuzzleAccess({ canPlay: true, reason: 'pro_supporter', tier: randomPuzzle.tier });
                } else {
                    setLockMessageVariant(randomPuzzle.tier === 'rare' ? 'rare_elite' : 'premium_education');
                    const cost = randomPuzzle.tier === 'advanced' ? 30 : 100;
                    setCurrentPuzzleAccess({ canPlay: false, reason: 'locked', cost, tier: randomPuzzle.tier });
                }
            } else {
                setLockMessageVariant('default');
                setCurrentPuzzleAccess({ canPlay: true, reason: 'free', tier: 'free' });
            }
        }

        const url = new URL(window.location.href);
        url.searchParams.delete('puzzle');
        window.history.pushState({}, '', url);
    };

    // Check if there are free puzzles available to skip to
    const hasFreePuzzlesAvailable = React.useMemo(() => {
        const cp = puzzles[currentPuzzleIndex];
        return puzzles.some(p =>
            !completedPuzzleIds.includes(p.id) &&
            p.id !== cp?.id &&
            (!p.tier || p.tier === 'free')
        );
    }, [puzzles, currentPuzzleIndex, completedPuzzleIds]);

    // Skip to next FREE puzzle (only works when hasFreePuzzlesAvailable is true)
    const handleSkipToFreePuzzle = React.useCallback(() => {
        const cp = puzzles[currentPuzzleIndex];
        const unplayedFreePuzzles = puzzles.filter(p => 
            !completedPuzzleIds.includes(p.id) && 
            p.id !== cp?.id &&
            (!p.tier || p.tier === 'free')
        );

        if (unplayedFreePuzzles.length > 0) {
            const randomPuzzle = unplayedFreePuzzles[Math.floor(Math.random() * unplayedFreePuzzles.length)];
            const index = puzzles.findIndex(p => p.id === randomPuzzle.id);
            setCurrentPuzzleIndex(index);
            setLockMessageVariant('default');
            setCurrentPuzzleAccess({ canPlay: true, reason: 'free', tier: 'free' });

            const url = new URL(window.location.href);
            url.searchParams.delete('puzzle');
            window.history.pushState({}, '', url);
        }
        // If no free puzzles, do nothing — button should be hidden via hasFreePuzzlesAvailable
    }, [puzzles, currentPuzzleIndex, completedPuzzleIds]);

    const refreshPuzzles = React.useCallback(async () => {
        setIsLoadingPuzzles(true);
        try {
            const dbPuzzles = await puzzleService.getAll();
            const rawPuzzles = dbPuzzles && dbPuzzles.length > 0 ? dbPuzzles : PUZZLE_SCENARIOS;
            // Apply enrichment if augments are already loaded
            const enriched = cachedAugments.length > 0
                ? rawPuzzles.map(p => enrichPuzzleAugments(p, cachedAugments))
                : rawPuzzles;
            setPuzzles(enriched);
        } catch (err) {
            console.error("Failed to refresh puzzles:", err);
        } finally {
            setIsLoadingPuzzles(false);
        }
    }, [cachedAugments]);

    return {
        puzzles,
        currentPuzzle,
        isLoadingPuzzles,
        completedPuzzleIds,
        allPuzzlesCompleted,
        handleMarkCompleted,
        handleNextPuzzle,
        handleSkipToFreePuzzle,
        hasFreePuzzlesAvailable,
        refreshPuzzles,
        setCompletedPuzzleIds,
        // Puzzle access / lock state
        currentPuzzleAccess,
        isCheckingAccess,
        isUnlocking,
        isPuzzlePlayable,
        requiresLoginForUnlock,
        lockMessageVariant,
        handleUnlockCurrentPuzzle,
        refreshCurrentPuzzleAccess,
        walletBalance: balance,
    };
};
