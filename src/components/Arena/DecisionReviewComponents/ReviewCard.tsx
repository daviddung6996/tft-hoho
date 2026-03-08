import React from 'react';
import { AugmentData } from '../../../services/augmentService';
import '../DecisionReview.css';

interface ReviewMarker {
    text: string;
    type: 'user' | 'pro';
}

interface ReviewCardProps {
    augment: AugmentData;
    variant?: 'desktop' | 'mobile';
    isUserPick?: boolean;
    isProPick?: boolean;
    proPlayerName?: string;
    showVotes?: boolean;
    votePercent?: number;
    voteCount?: number;
    markers?: ReviewMarker[];
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
    augment,
    variant = 'desktop',
    isUserPick,
    isProPick,
    showVotes,
    votePercent = 0,
    voteCount = 0,
    markers = []
}) => {
    const cardClasses = [
        'roll-augment-card',
        `review-card--${variant}`,
        isUserPick && 'user-pick',
        isProPick && 'pro-pick',
    ].filter(Boolean).join(' ');

    return (
        <div className={cardClasses}>
            <div className="augment-preview">
                <img
                    src={augment.icon}
                    alt={augment.title}
                    className="augment-mini-icon"
                />
                <div className="augment-info-col">
                    <span className="augment-mini-title">{augment.title}</span>

                    {markers.length > 0 && (
                        <div className={`pick-markers pick-markers--${variant}`}>
                            {markers.map((marker, idx) => (
                                <React.Fragment key={idx}>
                                    {idx > 0 && <span className="marker-separator"> • </span>}
                                    <span className={`marker-text ${marker.type}-marker-text`}>
                                        {marker.text}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {showVotes && voteCount > 0 && (
                        <div className={`vote-section vote-section--${variant}`}>
                            <span className="vote-stats">
                                {votePercent}% <span className="vote-count">{voteCount} votes</span>
                            </span>
                            <div className="vote-bar-container">
                                <div
                                    className={`vote-bar-fill${isUserPick && isProPick ? ' both-pick-bar' : ''}`}
                                    style={{ width: `${votePercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
