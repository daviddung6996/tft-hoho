import { useState, useEffect } from 'react';
import { PuzzleScenario } from '../../../../data/puzzleScenarios';
import { Champion } from '../../../../data/types';
import { puzzleService } from '../../../../services/puzzleService';
import { championService } from '../../../../services/championService';
import { AugmentData, augmentService } from '../../../../services/augmentService';
import { Item, itemService } from '../../../../services/itemService';

export interface ToastState {
    message: string;
    type: 'success' | 'error' | 'info';
}

const INITIAL_PUZZLE: PuzzleScenario = {
    id: '',
    proPlayer: '',
    rank: 'Challenger',
    stage: '2-1',
    augments: [],
    rerollAugments: [],
    secondRerollAugments: [],
    hasExtraReroll: false,
    proRerollIndices: [],
    proSecondRerollIndices: [],
    proPickIndex: -1,
    proFirstRoll: [],
    proSecondRoll: [],
    proFinalPick: { id: 'temp-initial-aug', title: 'TBD', description: '', icon: '', tier: 1 },
    proPickRound: 0,
    playerBoard: [],
    opponentBoard: [],
    playerBench: [],
    opponentBench: [],
    playerState: { gold: 0, level: 3, hp: 100, xp: 0 },
    opponentState: { gold: 0, level: 3, hp: 100, xp: 0 },
    opponents: [],
    startingItems: []
};


/** Enrich snapshot augments with fresh DB data (Vietnamese names, updated icons) */
function enrichAugments(
    snapshotAugs: (AugmentData | null)[] | undefined,
    dbAugments: AugmentData[]
): (AugmentData | null)[] {
    if (!snapshotAugs || !dbAugments.length) return snapshotAugs || [];
    return snapshotAugs.map(aug => {
        if (!aug) return aug;
        const dbAug = dbAugments.find(db => db.id === aug.id) ||
            dbAugments.find(db => db.title.toLowerCase() === (aug.title || '').toLowerCase());
        if (dbAug) {
            return { ...aug, title: dbAug.title, description: dbAug.description, icon: dbAug.icon || aug.icon, tier: dbAug.tier };
        }
        return aug;
    });
}

export const usePuzzleBuilderState = (onSaveSuccess: (puzzleId: string, shareUrl: string) => void, initialPuzzle?: PuzzleScenario) => {
    const [puzzle, setPuzzle] = useState<PuzzleScenario>(() => {
        if (initialPuzzle) {
            return {
                ...INITIAL_PUZZLE,
                ...initialPuzzle,
                // Ensure arrays are initialized if missing in old data
                opponents: initialPuzzle.opponents || [],
                augments: initialPuzzle.augments || [],
                rerollAugments: initialPuzzle.rerollAugments || [],
                secondRerollAugments: initialPuzzle.secondRerollAugments || [],
                hasExtraReroll: initialPuzzle.hasExtraReroll || false,
                proRerollIndices: initialPuzzle.proRerollIndices || [],
                proSecondRerollIndices: initialPuzzle.proSecondRerollIndices || [],
                proPickIndex: initialPuzzle.proPickIndex ?? -1
            };
        }
        return INITIAL_PUZZLE;
    });
    const [champions, setChampions] = useState<Champion[]>([]);
    const [dbAugments, setDbAugments] = useState<AugmentData[]>([]);
    const [dbItems, setDbItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOpponentIndex, setSelectedOpponentIndex] = useState(0);
    const [toast, setToast] = useState<ToastState | null>(null);

    // If initialPuzzle changes (e.g. modal closed/reopened with diff puzzle), reset state
    useEffect(() => {
        if (initialPuzzle) {
            setPuzzle({
                ...INITIAL_PUZZLE,
                ...initialPuzzle,
                opponents: initialPuzzle.opponents || [],
                augments: enrichAugments(initialPuzzle.augments, dbAugments),
                rerollAugments: enrichAugments(initialPuzzle.rerollAugments, dbAugments),
                secondRerollAugments: enrichAugments(initialPuzzle.secondRerollAugments, dbAugments),
                hasExtraReroll: initialPuzzle.hasExtraReroll || false,
                proRerollIndices: initialPuzzle.proRerollIndices || [],
                proSecondRerollIndices: initialPuzzle.proSecondRerollIndices || [],
                proPickIndex: initialPuzzle.proPickIndex ?? -1
            });
        }
    }, [initialPuzzle, dbAugments]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [champData, augData, itemData] = await Promise.all([
                    championService.getAll(),
                    augmentService.getAll(),
                    itemService.getAll()
                ]);
                setChampions(champData || []);
                setDbAugments(augData || []);
                setDbItems(itemData || []);
            } catch (err) {
                console.error('Failed to load data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const updatePuzzle = (updates: Partial<PuzzleScenario>) => {
        setPuzzle(prev => ({ ...prev, ...updates }));
    };

    const overwritePuzzle = (newPuzzle: PuzzleScenario) => {
        // Sanitize: replace null/undefined values with INITIAL_PUZZLE defaults
        // This prevents React controlled→uncontrolled warnings
        const sanitized = { ...INITIAL_PUZZLE } as Record<string, unknown>;
        for (const [key, value] of Object.entries(newPuzzle)) {
            if (value !== null && value !== undefined) {
                sanitized[key] = value;
            }
        }
        // Validate id: must be a valid UUID or clear it (handleSave will generate one)
        const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (sanitized.id && !UUID_RE.test(sanitized.id as string)) {
            sanitized.id = '';
        }
        setPuzzle(sanitized as unknown as PuzzleScenario);
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
    };

    const updateOpponent = (index: number, updates: Partial<any>) => {
        const OPPONENT_NAMES = ['Choncc', 'Ahri', 'Irelia', 'Bun Bun', 'Chihuahua', 'Fuwa', 'Mèo bánh mì'];
        const newOpponents = [...(puzzle.opponents || [])];
        while (newOpponents.length <= index) {
            newOpponents.push({
                id: crypto.randomUUID(),
                name: OPPONENT_NAMES[newOpponents.length] || `Đối thủ ${newOpponents.length + 1}`,
                board: [],
                bench: [],
                state: { gold: 0, level: 3, hp: 100, xp: 0 }
            });
        }

        newOpponents[index] = { ...newOpponents[index], ...updates };
        updatePuzzle({ opponents: newOpponents });
    };

    const handleSave = async () => {
        try {
            const puzzleToSave = { ...puzzle };
            if (!puzzleToSave.id) {
                puzzleToSave.id = crypto.randomUUID();
            }

            // Calculate proFirstRoll (same as user's initial augments)
            puzzleToSave.proFirstRoll = [...(puzzleToSave.augments || [])];

            // Calculate proSecondRoll (apply pro's rerolls to get their second roll)
            const proRerollIndices = puzzleToSave.proRerollIndices || [];
            const rerollAugments = puzzleToSave.rerollAugments || [];
            if (proRerollIndices.length > 0) {
                puzzleToSave.proSecondRoll = puzzleToSave.proFirstRoll.map((aug, idx) =>
                    proRerollIndices.includes(idx) ? rerollAugments[idx] : aug
                );
            } else {
                puzzleToSave.proSecondRoll = [];
            }

            // Calculate proFinalPick based on proPickIndex (0-2: initial, 3-5: reroll, 6-8: secondReroll)
            const proPickIndex = puzzleToSave.proPickIndex ?? -1;
            if (proPickIndex >= 0 && proPickIndex < 3) {
                // Picked from initial
                puzzleToSave.proFinalPick = puzzleToSave.augments?.[proPickIndex] || null;
                puzzleToSave.proPickRound = 0;
            } else if (proPickIndex >= 3 && proPickIndex < 6) {
                // Picked from reroll
                puzzleToSave.proFinalPick = rerollAugments[proPickIndex - 3] || null;
                puzzleToSave.proPickRound = 1;
            } else if (proPickIndex >= 6 && proPickIndex < 9) {
                // Picked from second reroll (Teemo)
                const secondRerollAugments = puzzleToSave.secondRerollAugments || [];
                puzzleToSave.proFinalPick = secondRerollAugments[proPickIndex - 6] || null;
                puzzleToSave.proPickRound = 1; // Still counts as "after reroll"
            } else {
                puzzleToSave.proFinalPick = null;
                puzzleToSave.proPickRound = 0;
            }

            await puzzleService.save(puzzleToSave);
            setPuzzle(prev => ({ ...prev, id: puzzleToSave.id }));

            const shareUrl = `${window.location.origin}?puzzle=${puzzleToSave.id}`;

            // Pass success info to parent - parent will handle the toast
            onSaveSuccess(puzzleToSave.id, shareUrl);
        } catch (e: any) {
            setToast({
                message: `Lỗi khi lưu: ${e.message}`,
                type: 'error'
            });
        }
    };

    const clearToast = () => setToast(null);

    return {
        puzzle,
        champions,
        dbAugments,
        dbItems,
        loading,
        selectedOpponentIndex,
        setSelectedOpponentIndex,
        updatePuzzle,
        overwritePuzzle,
        updateOpponent,
        handleSave,
        toast,
        showToast,
        clearToast
    };
};
