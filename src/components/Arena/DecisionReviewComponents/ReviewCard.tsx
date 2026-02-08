import React from 'react';
import { AugmentData } from '../../../services/augmentService';
import '../DecisionReview.css';

interface ReviewMarker {
    text: string;
    type: 'user' | 'pro';
}

interface ReviewCardProps {
    augment: AugmentData;
    isUserPick?: boolean;
    isProPick?: boolean;
    showVotes?: boolean;
    votePercent?: number;
    voteCount?: number;
    proPlayerName: string;
    markers?: ReviewMarker[];
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
    augment,
    isUserPick,
    isProPick,
    showVotes,
    votePercent = 0,
    voteCount = 0,
    markers = []
}) => {
    let cardClass = 'roll-augment-card';
    if (isUserPick) cardClass += ' user-pick';
    if (isProPick) cardClass += ' pro-pick';

    return (
        <div className={cardClass}>
            <div className="augment-preview">
                <img
                    src={augment.icon}
                    alt={augment.title}
                    className="augment-mini-icon"
                />
                <div className="augment-info-col">
                    <span className="augment-mini-title">{augment.title}</span>

                    {/* Markers Section - Only render when there are markers */}
                    {markers.length > 0 && (
                        <div className="pick-markers" style={{ marginTop: '0.4cqw' }}>
                            {markers.map((marker, idx) => (
                                <React.Fragment key={idx}>
                                    {idx > 0 && <span className="marker-separator"> • </span>}
                                    <span className="marker-text" style={{
                                        color: marker.type === 'user' ? '#c8aa6e' : '#00A3FF',
                                        fontSize: '0.65cqw',
                                        fontWeight: 700,
                                        textTransform: 'uppercase'
                                    }}>
                                        {marker.text}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {showVotes && voteCount > 0 && (
                        <div className="vote-section">
                            <span className="vote-stats" style={{ marginRight: 'auto', fontSize: '0.8cqw', fontWeight: 600, color: '#e2e8f0' }}>
                                {votePercent}% <span style={{ fontSize: '0.6cqw', color: '#94a3b8', fontWeight: 400 }}>{voteCount} votes</span>
                            </span>
                            <div className="vote-bar-container" style={{ width: '40%' }}>
                                <div
                                    className="vote-bar-fill"
                                    style={{
                                        width: `${votePercent}%`,
                                        background: isUserPick && isProPick ? 'linear-gradient(90deg, #c8aa6e, #d4b876)' : undefined
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
