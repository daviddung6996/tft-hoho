import React from 'react';
import { generateCommunityVotes, CommunityVotes } from '../data/puzzleScenarios';
import { AugmentData } from '../services/augmentService';

export type PuzzlePhase = 'selecting' | 'reviewing';

export const useGameFlow = (currentPuzzle: any) => {
    const [puzzlePhase, setPuzzlePhase] = React.useState<PuzzlePhase>('selecting');
    const [selectedAugment, setSelectedAugment] = React.useState<AugmentData | null>(null);
    const [communityVotes, setCommunityVotes] = React.useState<CommunityVotes>({});

    // User's journey tracking
    const [userFirstRoll, setUserFirstRoll] = React.useState<AugmentData[]>([]);
    const [userSecondRoll, setUserSecondRoll] = React.useState<AugmentData[] | null>(null);
    const [userPickRound, setUserPickRound] = React.useState<0 | 1>(0);
    const [hasRerolled, setHasRerolled] = React.useState(false);

    // Current augments state
    const [currentAugments, setCurrentAugments] = React.useState<AugmentData[]>([]);
    // Track the ORDER of rerolls: [0, 0, 0] -> if index 1 is rolled first -> [0, 1, 0]
    const [rerollOrder, setRerollOrder] = React.useState<number[]>([0, 0, 0]);
    const [rollSequence, setRollSequence] = React.useState<number>(1);

    // Initialize on puzzle change
    React.useEffect(() => {
        if (!currentPuzzle) return;

        // CRITICAL: Filter nulls and limit to exactly 3 augments
        const validAugments = (currentPuzzle.augments || []).filter((a: AugmentData | null): a is AugmentData => a !== null);
        const threeAugments = validAugments.slice(0, 3);
        setCurrentAugments(threeAugments);
        setUserFirstRoll([...threeAugments]);
        setUserSecondRoll(null);
        setHasRerolled(false);
        setUserPickRound(0); // 0 = First Roll, 1 = Second Roll
        setRerollOrder([0, 0, 0]);
        setRollSequence(1);
        setCommunityVotes(generateCommunityVotes(threeAugments));
        setPuzzlePhase('selecting');
        setSelectedAugment(null);
    }, [currentPuzzle]);

    const handleAugmentReroll = (indexToReplace: number) => {
        if (rerollOrder[indexToReplace] > 0) return; // Already rerolled
        if (!currentPuzzle) return;

        // Use predefined rerollAugments from puzzle (deterministic, not random)
        const rerollAugments = currentPuzzle.rerollAugments || [];
        const newAugment = rerollAugments[indexToReplace];

        if (!newAugment) {
            console.warn(`No reroll augment defined for index ${indexToReplace}`);
            return;
        }

        const newAugmentsList = [...currentAugments];
        newAugmentsList[indexToReplace] = newAugment;
        setCurrentAugments(newAugmentsList);

        // Update reroll order
        const newOrder = [...rerollOrder];
        newOrder[indexToReplace] = rollSequence; // Mark this slot with the current sequence number (1, 2, or 3)
        setRerollOrder(newOrder);
        setRollSequence(prev => prev + 1);

        // Track as second roll (user rerolled)
        if (!hasRerolled) {
            setUserSecondRoll([...newAugmentsList]);
            setHasRerolled(true);
        } else {
            // Update second roll with latest augments
            setUserSecondRoll([...newAugmentsList]);
        }
    };

    const handleAugmentSelect = async (augment: AugmentData) => {
        setSelectedAugment(augment);
        setUserPickRound(hasRerolled ? 1 : 0);
        setPuzzlePhase('reviewing');

        if (currentPuzzle) {
            // removed onComplete call
        }
    };

    const handleReplay = () => {
        if (!currentPuzzle) return;
        setPuzzlePhase('selecting');
        setSelectedAugment(null);
        // CRITICAL: Filter nulls and limit to exactly 3 augments
        const validAugments = (currentPuzzle.augments || []).filter((a: AugmentData | null): a is AugmentData => a !== null);
        const threeAugments = validAugments.slice(0, 3);
        setCurrentAugments(threeAugments);
        setUserFirstRoll([...threeAugments]);
        setUserSecondRoll(null);
        setHasRerolled(false);
        setUserPickRound(0);
        setRerollOrder([0, 0, 0]);
        setRollSequence(1);
    };

    const resetFlow = () => {
        setPuzzlePhase('selecting');
        setSelectedAugment(null);
    }

    return {
        puzzlePhase,
        selectedAugment,
        communityVotes,
        userFirstRoll,
        userSecondRoll,
        userPickRound,
        currentAugments,
        rerollOrder,
        handleAugmentReroll,
        handleAugmentSelect,
        handleReplay,
        resetFlow
    };
};
