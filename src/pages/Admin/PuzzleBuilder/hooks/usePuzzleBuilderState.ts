import { useState, useEffect } from 'react';
import { PuzzleScenario } from '../../../../data/puzzleScenarios';
import { Champion } from '../../../../data/types';
import { puzzleService } from '../../../../services/puzzleService';
import { championService } from '../../../../services/championService';

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
    proFinalPick: { id: 'temp-initial-aug', title: 'TBD', description: '', icon: '', rarity: 'silver' },
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


export const usePuzzleBuilderState = (onSaveSuccess: () => void, initialPuzzle?: PuzzleScenario) => {
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
    const [loading, setLoading] = useState(true);
    const [selectedOpponentIndex, setSelectedOpponentIndex] = useState(0);

    // If initialPuzzle changes (e.g. modal closed/reopened with diff puzzle), reset state
    // Note: In typical usage, this hook is remounted when Builder is shown,
    // but if we keep it mounted, we'd need this.
    useEffect(() => {
        if (initialPuzzle) {
            setPuzzle({
                ...INITIAL_PUZZLE,
                ...initialPuzzle,
                opponents: initialPuzzle.opponents || [],
                augments: initialPuzzle.augments || [],
                rerollAugments: initialPuzzle.rerollAugments || [],
                secondRerollAugments: initialPuzzle.secondRerollAugments || [],
                hasExtraReroll: initialPuzzle.hasExtraReroll || false,
                proRerollIndices: initialPuzzle.proRerollIndices || [],
                proSecondRerollIndices: initialPuzzle.proSecondRerollIndices || [],
                proPickIndex: initialPuzzle.proPickIndex ?? -1
            });
        }
    }, [initialPuzzle]);

    useEffect(() => {
        championService.getAll().then(data => {
            setChampions(data || []);
            setLoading(false);
        });
    }, []);

    const updatePuzzle = (updates: Partial<PuzzleScenario>) => {
        setPuzzle(prev => ({ ...prev, ...updates }));
    };

    const updateOpponent = (index: number, updates: Partial<any>) => {
        const newOpponents = [...(puzzle.opponents || [])];
        while (newOpponents.length <= index) {
            newOpponents.push({
                id: crypto.randomUUID(),
                name: `Opponent ${newOpponents.length + 1}`,
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
            alert(`Puzzle saved successfully!\n\nID: ${puzzleToSave.id}\nShare Link: ${shareUrl}`);

            onSaveSuccess();
        } catch (e: any) {
            alert('Error saving puzzle: ' + e.message);
        }
    };

    return {
        puzzle,
        champions,
        loading,
        selectedOpponentIndex,
        setSelectedOpponentIndex,
        updatePuzzle,
        updateOpponent,
        handleSave
    };
};
