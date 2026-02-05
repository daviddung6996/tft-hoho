import React from 'react';
import { AugmentData } from '../../services/augmentService';
import { CommunityVotes } from '../../data/puzzleScenarios';
import './DecisionReview.css';

import { ReviewCard } from './DecisionReviewComponents/ReviewCard';
import { PuzzleInfo } from './DecisionReviewComponents/PuzzleInfo';
import { ReviewActions } from './DecisionReviewComponents/ReviewActions';

export interface DecisionReviewProps {
    userChoice: AugmentData;
    userRerollOrder?: number[];
    correctAugmentId: string;
    proSecondRoll?: AugmentData[];
    proFirstRoll?: AugmentData[];
    // All 6 augments from puzzle config
    initialAugments?: AugmentData[];
    rerollAugments?: AugmentData[];
    // Track which slots were rolled
    proRerollIndices?: number[]; // [0,1,2] = rolled all 3 slots
    proSecondRerollIndices?: number[]; // For Teemo second reroll
    proPickIndex?: number;
    onNextPuzzle: () => void;
    onReplay: () => void;
    puzzleId: string;
    patch?: string;
    date?: string;
    server?: string;
    encounter?: string;
    streamUrl?: string;
    communityVotes?: CommunityVotes;
    proPlayerName?: string;
    explanation?: string;
}

export const DecisionReview: React.FC<DecisionReviewProps> = ({
    userChoice,
    userRerollOrder = [],
    correctAugmentId,
    proSecondRoll,
    proFirstRoll = [],
    initialAugments = [],
    rerollAugments = [],
    proRerollIndices = [],
    proSecondRerollIndices = [],
    proPickIndex = -1,
    onNextPuzzle,
    onReplay,
    puzzleId,
    patch,
    date,
    server,
    encounter,
    streamUrl,
    communityVotes = {},
    proPlayerName = 'Pro Player',
    explanation
}) => {

    const proRerolled = !!(proSecondRoll && proSecondRoll.length > 0);

    const proFinalPick = (proRerolled
        ? proSecondRoll!.find(a => a.id === correctAugmentId) || proSecondRoll![0]
        : proFirstRoll.find(a => a.id === correctAugmentId) || proFirstRoll[0]) || {
            title: "Unknown",
            id: "unknown",
            description: "Data missing",
            icon: "",
            rarity: "silver",
            tier: 1
        } as AugmentData;

    const userMatchedPro = userChoice.title === proFinalPick.title;

    // --- HELPER: VOTE ---
    const totalVotes = Object.values(communityVotes).reduce((sum, count) => sum + count, 0);
    const getVotePercent = (augmentTitle: string): number => {
        const votes = communityVotes[augmentTitle] || 0;
        return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    };
    const getVoteCount = (augmentTitle: string): number => communityVotes[augmentTitle] || 0;

    // --- DETECT WHICH SLOTS CHANGED ---
    const getChangedSlots = (firstRoll: AugmentData[], secondRoll?: AugmentData[]): number[] => {
        if (!secondRoll || secondRoll.length === 0) return [];
        const changed: number[] = [];
        for (let i = 0; i < 3; i++) {
            if (firstRoll[i]?.title !== secondRoll[i]?.title) {
                changed.push(i);
            }
        }
        return changed;
    };

    // Override: Use proRerollIndices directly to preserve order (e.g. [2, 0, 1])
    // Only fall back to specific overrides or diffs if data is missing.
    const effectiveProRerollIndices = (proRerollIndices && proRerollIndices.length > 0)
        ? proRerollIndices
        : getChangedSlots(proFirstRoll, proSecondRoll);

    const proRolledSlots = effectiveProRerollIndices;

    // Final pick text
    const getFinalPickDescription = () => {
        if (userMatchedPro) {
            return (
                <>
                    <span className="user-action">You</span> and{' '}
                    <span className="pro-action">{proPlayerName}</span> both picked{' '}
                    <strong>{userChoice.title}</strong>
                </>
            );
        }
        return (
            <>
                <span className="user-action">You</span> picked <strong>{userChoice.title}</strong> while{' '}
                <span className="pro-action">{proPlayerName}</span> picked <strong>{proFinalPick.title}</strong>
            </>
        );
    };

    return (
        <div className="decision-review-overlay">
            <div className="decision-review-container">

                {/* --- HEADER --- */}
                <PuzzleInfo
                    puzzleId={puzzleId}
                    patch={patch}
                    date={date}
                    server={server}
                    encounter={encounter}
                    streamUrl={streamUrl}
                    userMatchedPro={userMatchedPro}
                />

                {/* --- TIMELINE REMOVED - DIRECT TO FINAL PICK --- */}
                <div className="roll-timeline">
                    {/* ========== FINAL PICK - All 6 Augments ========== */}
                    <div className="roll-section final-section">
                        <div className="roll-section-header">
                            <span className="section-title">Final Pick</span>
                            <span className={`diverge-badge ${userMatchedPro ? 'matched' : 'diverged'}`}>
                                {userMatchedPro ? 'Same as ' + proPlayerName : 'Diverged from ' + proPlayerName}
                            </span>
                        </div>
                        <p className="final-description">{getFinalPickDescription()}</p>

                        {/* All 6 augments in 2 rows of 3 */}
                        <div className="final-augment-grid-6">
                            {/* Initial 3 augments */}
                            {initialAugments.slice(0, 3).map((aug, idx) => {
                                if (!aug) return null;

                                const rerollSeq = userRerollOrder ? userRerollOrder[idx] : 0;
                                const isUserRolled = rerollSeq > 0;

                                // Check if Pro rolled this specific slot.
                                // proRolledSlots contains INDICES of slots the pro rolled.
                                const isProRolled = proRolledSlots.includes(idx);

                                // User picked this IF it wasn't rerolled AND titles match
                                const isUserPick = !isUserRolled && userChoice.title === aug.title;
                                // Pro picked this IF it wasn't rerolled AND titles match
                                const isProPick = !isProRolled && proFinalPick.title === aug.title;

                                // Build markers array
                                const markers: { text: string; type: 'user' | 'pro' }[] = [];

                                // USER MARKERS
                                if (isUserRolled) {
                                    markers.push({ text: `You Rolled #${rerollSeq}`, type: 'user' });
                                } else if (isUserPick) {
                                    markers.push({ text: 'Your Pick', type: 'user' });
                                }

                                // PRO MARKERS
                                if (isProRolled) {
                                    const proOrder = proRolledSlots.indexOf(idx);
                                    markers.push({ text: `${proPlayerName} Rolled${proOrder !== -1 ? ` #${proOrder + 1}` : ''}`, type: 'pro' });
                                } else if (isProPick) {
                                    markers.push({ text: `${proPlayerName}'s Pick`, type: 'pro' });
                                }

                                return (
                                    <div key={`fp-${idx}`} className={`augment-cell slot-cell ${(isUserRolled || isProRolled) && !isUserPick && !isProPick ? 'rolled-away' : ''}`}>
                                        <ReviewCard
                                            augment={aug}
                                            isUserPick={isUserPick}
                                            isProPick={isProPick}
                                            proPlayerName={proPlayerName}
                                            showVotes={isUserPick || isProPick}
                                            votePercent={getVotePercent(aug.title)}
                                            voteCount={getVoteCount(aug.title)}
                                            markers={markers}
                                        />
                                    </div>
                                );
                            })}

                            {/* Reroll 3 augments */}
                            {rerollAugments.slice(0, 3).map((aug, idx) => {
                                if (!aug) return null;

                                // Can only interact with reroll slot if corresponding initial slot was rerolled
                                const userUnlocked = (userRerollOrder ? userRerollOrder[idx] : 0) > 0;
                                const proUnlocked = proRolledSlots.includes(idx);

                                // Picking logic: Must be unlocked and match title
                                const isUserPick = userUnlocked && userChoice.title === aug.title;
                                const isProPick = proUnlocked && proFinalPick.title === aug.title;

                                // Build markers array - Only show if Picked or available
                                const markers: { text: string; type: 'user' | 'pro' }[] = [];
                                if (isUserPick) {
                                    markers.push({ text: 'Your Pick', type: 'user' });
                                }
                                if (isProPick) {
                                    markers.push({ text: `${proPlayerName}'s Pick`, type: 'pro' });
                                }

                                return (
                                    <div key={`fp-r-${idx}`} className={`augment-cell slot-cell ${userUnlocked || proUnlocked ? 'rolled-result' : 'locked-slot'}`}>
                                        <ReviewCard
                                            augment={aug}
                                            isUserPick={isUserPick}
                                            isProPick={isProPick}
                                            proPlayerName={proPlayerName}
                                            showVotes={isUserPick || isProPick}
                                            votePercent={getVotePercent(aug.title)}
                                            voteCount={getVoteCount(aug.title)}
                                            markers={markers}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- EXPLANATION SECTION --- */}
                {explanation && (
                    <div className="explanation-section">
                        <div className="explanation-title">EXPLANATION</div>
                        <p className="explanation-text">{explanation}</p>
                    </div>
                )}

                {/* --- ACTIONS --- */}
                <ReviewActions onReplay={onReplay} onNextPuzzle={onNextPuzzle} />
            </div>
        </div>
    );
};
