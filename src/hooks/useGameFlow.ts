import React from 'react';
import { CommunityVotes } from '../data/puzzleScenarios';
import { AugmentData } from '../services/augmentService';
import { userStatsService } from '../services/userStatsService';
import { voteService } from '../services/voteService';
import { updateUserIq } from '../features/user-iq/userIq.service';
import { tcoinService } from '../features/tcoin/tcoin.service';
import { tcoinEvents } from '../features/tcoin/tcoinEvents';

export type PuzzlePhase = 'selecting' | 'reviewing';

export const useGameFlow = (currentPuzzle: any, userId?: string) => {
    const [puzzlePhase, setPuzzlePhase] = React.useState<PuzzlePhase>('selecting');
    const [selectedAugment, setSelectedAugment] = React.useState<AugmentData | null>(null);
    const [communityVotes, setCommunityVotes] = React.useState<CommunityVotes>({});
    const [iqChangeResult, setIqChangeResult] = React.useState<{ changeAmount: number; newScore: number; newRank: string } | null>(null);

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

    // Timing tracking for analytics
    const [startTime, setStartTime] = React.useState<number | null>(null);

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
        setPuzzlePhase('selecting');
        setSelectedAugment(null);
        setIqChangeResult(null);

        // Fetch real community votes from DB
        voteService.getVotes(currentPuzzle.id).then(setCommunityVotes).catch(() => setCommunityVotes({}));

        // Start timing when puzzle loads
        setStartTime(Date.now());
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
            const proPickId = currentPuzzle.proFinalPick?.id || '';
            const proPickTitle = currentPuzzle.proFinalPick?.title || '';
            const isCorrect = augment.id === proPickId || augment.title === proPickTitle;
            const rerollCount = rerollOrder.filter(r => r > 0).length;
            const rerollIndices = rerollOrder
                .map((val, idx) => val > 0 ? idx : -1)
                .filter(idx => idx >= 0);
            const timeToDecideMs = startTime ? Date.now() - startTime : 0;

            if (userId) {
                const timeToDecideSeconds = timeToDecideMs / 1000;
                updateUserIq(userId, currentPuzzle.id, isCorrect, timeToDecideSeconds)
                    .then(result => setIqChangeResult(result))
                    .catch(err => console.error('Failed to update IQ:', err));
            }

            // Record vote for community percentages (works for guests too)
            voteService.recordVote(
                currentPuzzle.id,
                augment.id,
                augment.title || 'Unknown'
            ).then(() => {
                // Refetch votes to show updated percentages
                voteService.getVotes(currentPuzzle.id).then(setCommunityVotes);
            }).catch(err => console.error('Failed to record vote:', err));

            // Record detailed attempt for analytics (authenticated users only)
            if (userId) userStatsService.recordAttempt({
                puzzleId: currentPuzzle.id,
                userPickId: augment.id,
                userPickName: augment.title || 'Unknown',
                isCorrect,
                rerollCount,
                rerollIndices,
                timeToDecideMs,
                puzzleStage: currentPuzzle.stage || '',
                proPickId
            }).catch(err => console.error('Failed to record attempt:', err));

            // T-Coin Earning Logic + Animation Event
            if (userId) {
                const earnTCoin = async () => {
                    try {
                        let reason: string;
                        if (isCorrect) {
                            if (rerollCount === 0 && timeToDecideMs < 10_000) {
                                reason = 'puzzle_correct_fast';
                            } else if (rerollCount === 0) {
                                reason = 'puzzle_correct_no_reroll';
                            } else {
                                reason = 'puzzle_correct';
                            }
                        } else {
                            reason = 'puzzle_incorrect';
                        }

                        const result = await tcoinService.earnCoins(reason as any, currentPuzzle.id);
                        if (result) {
                            // Emit event → triggers flying coin animation + balance pulse
                            tcoinEvents.emit({ amount: result.earned, reason });
                        }
                    } catch (err) {
                        console.error('Failed to earn T-Coin:', err);
                    }
                };
                earnTCoin();
            }
        }
    };

    const handleReplay = () => {
        if (!currentPuzzle) return;
        setPuzzlePhase('selecting');
        setSelectedAugment(null);
        setIqChangeResult(null);
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

        // Reset timing for replay
        setStartTime(Date.now());
    };

    const resetFlow = () => {
        setPuzzlePhase('selecting');
        setSelectedAugment(null);
        setIqChangeResult(null);
    }

    return {
        puzzlePhase,
        selectedAugment,
        communityVotes,
        iqChangeResult,
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

