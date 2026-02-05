import React from 'react';
import { AugmentData } from '../../../services/augmentService';
import { ReviewCard } from './ReviewCard';
import '../DecisionReview.css';

interface FinalPickSectionProps {
    userChoice: AugmentData;
    proFinalPick: AugmentData;
    userFinalOptions: AugmentData[];
    proFinalOptions: AugmentData[];
    proPlayerName: string;
    communityVotes: Record<string, number>;
    getVotePercent: (title: string) => number;
    label?: string;
}

export const FinalPickSection: React.FC<FinalPickSectionProps> = ({
    userChoice,
    proFinalPick,
    userFinalOptions,
    proFinalOptions,
    proPlayerName,
    communityVotes,
    getVotePercent,
    label = 'Round 3'
}) => {
    const userMatchedPro = userChoice.title === proFinalPick.title;

    // Per user request: If User matches Pro, we ALWAYS merge into a single row
    // to keep the UI compact and "in one place", even if the unpicked options differed.
    // We prioritize the User's options view in this merged state.
    const shouldMerge = userMatchedPro;

    return (
        <div className="final-pick-section">
            <div className="final-row-container">
                <div className="final-row-label">
                    <span>{label.toUpperCase()}</span>
                    <span className={`roll-status ${userMatchedPro ? 'aligned' : 'diverged'}`}>
                        {userMatchedPro ? `MATCHED ${proPlayerName}` : `DIVERGED FROM ${proPlayerName}`}
                    </span>
                </div>

                <div className="result-message" style={{ marginBottom: '1cqw' }}>
                    <span className="user-highlight">You</span> picked <strong>{userChoice.title}</strong> while <span className="pro-name">{proPlayerName}</span> picked <strong>{proFinalPick.title}</strong>.
                </div>

                {/* Grid for User Options (or Merged Options) */}
                <div className="final-row-grid">
                    {userFinalOptions.map((aug, idx) => {
                        const isUserPick = userChoice.title === aug.title;
                        // If merging, we also mark pro pick here
                        const isProPick = shouldMerge
                            ? (proFinalPick.title === aug.title)
                            : false;

                        return (
                            <ReviewCard
                                key={`final-user-${aug.id}-${idx}`}
                                augment={aug}
                                isUserPick={isUserPick}
                                isProPick={isProPick}
                                proPlayerName={proPlayerName}
                                showVotes={true}
                                votePercent={getVotePercent(aug.title)}
                                voteCount={communityVotes[aug.title] || 0}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Pro Row - Only show if NOT merged */}
            {!shouldMerge && (
                <div className="final-row-container">
                    <div className="final-row-label">
                        {proPlayerName.toUpperCase()}'S FINAL OPTIONS
                    </div>
                    <div className="final-row-grid">
                        {proFinalOptions.map((aug, idx) => {
                            const isProPick = proFinalPick.title === aug.title;
                            // In split view, we don't duplicate User Pick indication on Pro's board

                            return (
                                <ReviewCard
                                    key={`final-pro-${aug.id}-${idx}`}
                                    augment={aug}
                                    isUserPick={false}
                                    isProPick={isProPick}
                                    proPlayerName={proPlayerName}
                                    showVotes={true}
                                    votePercent={getVotePercent(aug.title)}
                                    voteCount={communityVotes[aug.title] || 0}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
