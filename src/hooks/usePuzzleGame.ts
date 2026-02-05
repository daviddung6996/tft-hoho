import React from 'react';
import { puzzleService } from '../services/puzzleService';
import { PUZZLE_SCENARIOS } from '../data/puzzleScenarios';
import { getAuthToken } from '../data/mockAuth';

export const usePuzzleGame = (isAuthenticated: boolean) => {
    // [NEW] Dynamic Puzzles State
    const [puzzles, setPuzzles] = React.useState<any[]>([]);
    const [isLoadingPuzzles, setIsLoadingPuzzles] = React.useState(true);
    const [completedPuzzleIds, setCompletedPuzzleIds] = React.useState<string[]>([]);

    // URL Handling: Check for puzzle ID in URL on initial load and handle async loading
    const pendingPuzzleIdRef = React.useRef(new URLSearchParams(window.location.search).get('puzzle'));

    // Initialize index based on URL if possible (for static puzzles)
    const [currentPuzzleIndex, setCurrentPuzzleIndex] = React.useState(0);
    const [customScenario, setCustomScenario] = React.useState<any | null>(null);

    // Fetch puzzles on mount
    React.useEffect(() => {
        if (new URLSearchParams(window.location.search).get('seed') === 'true') {
            import('../utils/seedTestPuzzles').then(m => m.seedTestPuzzles());
        }

        const fetchPuzzles = async () => {
            setIsLoadingPuzzles(true);
            try {
                const dbPuzzles = await puzzleService.getAll();
                setPuzzles(dbPuzzles && dbPuzzles.length > 0 ? dbPuzzles : PUZZLE_SCENARIOS);
            } catch (err) {
                console.error("Failed to load puzzles:", err);
                setPuzzles(PUZZLE_SCENARIOS);
            } finally {
                setIsLoadingPuzzles(false);
            }
        };
        fetchPuzzles();
    }, []);

    // Fetch User History
    const fetchUserHistory = React.useCallback(async () => {
        const token = getAuthToken();
        if (token && token.username) {
            const ids = await puzzleService.getCompletedPuzzles(token.username);
            setCompletedPuzzleIds(ids);
        } else {
            setCompletedPuzzleIds([]);
        }
    }, [isAuthenticated]);

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
                    console.log(`[Deep Link] Loading puzzle from URL: ${pendingId}`);
                    setCurrentPuzzleIndex(index);
                    pendingPuzzleIdRef.current = null;
                    return; // ✅ STOP HERE, don't run random selection
                } else if (!isLoadingPuzzles) {
                    console.warn(`[Deep Link] Puzzle ID ${pendingId} not found.`);
                    // Clear pending ID and fallback to random selection below
                    pendingPuzzleIdRef.current = null;
                }
            }

            // Priority 2: Random Selection - Only if NEVER had pending ID from start
            // Skip if we already have a valid currentPuzzleIndex
            if (currentPuzzleIndex >= 0 && currentPuzzleIndex < puzzles.length) {
                console.log(`[Skip Random] Already have valid puzzle at index ${currentPuzzleIndex}`);
                return; // Already have a puzzle, don't randomize
            }

            // This runs on initial mount when no puzzle is set
            console.log('[Random Selection] Selecting random puzzle...');
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

    const handleMarkCompleted = async (puzzleId: string) => {
        if (isAuthenticated) {
            const token = getAuthToken();
            if (token && token.username) {
                try {
                    await puzzleService.markPuzzleCompleted(token.username, puzzleId);
                    setCompletedPuzzleIds(prev => [...prev, puzzleId]);
                } catch (e) {
                    console.error("Failed to mark puzzle completed:", e);
                }
            }
        }
    };

    const handleNextPuzzle = () => {
        const currentPuzzle = puzzles[currentPuzzleIndex];
        const unplayedPuzzles = puzzles.filter(p => !completedPuzzleIds.includes(p.id) && p.id !== currentPuzzle?.id);
        const pool = unplayedPuzzles.length > 0 ? unplayedPuzzles : puzzles;

        if (pool.length > 0) {
            const randomPuzzle = pool[Math.floor(Math.random() * pool.length)];
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
            setPuzzles(dbPuzzles && dbPuzzles.length > 0 ? dbPuzzles : PUZZLE_SCENARIOS);
        } catch (err) {
            console.error("Failed to refresh puzzles:", err);
        } finally {
            setIsLoadingPuzzles(false);
        }
    }, []);

    return {
        puzzles,
        currentPuzzle: puzzles[currentPuzzleIndex],
        isLoadingPuzzles,
        completedPuzzleIds,
        handleMarkCompleted,
        handleNextPuzzle,
        refreshPuzzles,
        setCompletedPuzzleIds // Exposed if needed for overrides
    };
};
