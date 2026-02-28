import React from 'react';
import { puzzleService } from '../services/puzzleService';
import { PUZZLE_SCENARIOS } from '../data/puzzleScenarios';
import { useAuth } from '../contexts/AuthContext';
import { useGameData } from '../contexts/GameDataContext';
import { AugmentData } from '../services/augmentService';

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

export const usePuzzleGame = (isAuthenticated: boolean) => {
    const { user } = useAuth();
    const { augments: cachedAugments, isLoading: isGameDataLoading } = useGameData();

    // [NEW] Dynamic Puzzles State
    const [puzzles, setPuzzles] = React.useState<any[]>([]);
    const [isLoadingPuzzles, setIsLoadingPuzzles] = React.useState(true);
    const [completedPuzzleIds, setCompletedPuzzleIds] = React.useState<string[]>([]);

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

    const handleNextPuzzle = () => {
        const currentPuzzle = puzzles[currentPuzzleIndex];
        const unplayedPuzzles = puzzles.filter(p => !completedPuzzleIds.includes(p.id) && p.id !== currentPuzzle?.id);

        // Early return if all puzzles are completed - prevent replay
        if (unplayedPuzzles.length === 0) {
            // Clear URL to show clean state
            const url = new URL(window.location.href);
            url.searchParams.delete('puzzle');
            window.history.pushState({}, '', url);
            return;
        }

        // Select from unplayed puzzles only
        if (unplayedPuzzles.length > 0) {
            const randomPuzzle = unplayedPuzzles[Math.floor(Math.random() * unplayedPuzzles.length)];
            const index = puzzles.findIndex(p => p.id === randomPuzzle.id);
            setCurrentPuzzleIndex(index);
        }

        const url = new URL(window.location.href);
        url.searchParams.delete('puzzle');
        window.history.pushState({}, '', url);
    };

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
        currentPuzzle: puzzles[currentPuzzleIndex],
        isLoadingPuzzles,
        completedPuzzleIds,
        allPuzzlesCompleted,
        handleMarkCompleted,
        handleNextPuzzle,
        refreshPuzzles,
        setCompletedPuzzleIds // Exposed if needed for overrides
    };
};
