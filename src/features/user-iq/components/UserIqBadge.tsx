import React from 'react';
import { UserIqRank } from '../userIq.types';
import { getUserIqRankColor } from '../userIqCalculator';
import { IqRankIcon } from './IqRankIcon';
import './UserIqBadge.css';

interface UserIqBadgeProps {
    iqScore: number;
    iqRank: UserIqRank;
    size?: 'small' | 'large' | 'hero';
}

export const UserIqBadge: React.FC<UserIqBadgeProps> = ({ iqScore, iqRank, size = 'small' }) => {
    const color = getUserIqRankColor(iqRank);
    const isUnranked = iqScore === 0;

    return (
        <div className={`user-iq-badge ${size} ${isUnranked ? 'unranked' : ''}`} style={{ '--rank-color': isUnranked ? '#4B5563' : color } as React.CSSProperties}>
            <div className="badge-icon-wrapper">
                <IqRankIcon rank={isUnranked ? 'Iron' : iqRank} className="badge-icon" />
            </div>
            <div className="badge-info">
                {(size === 'large' || size === 'hero') && <span className="badge-rank">{isUnranked ? 'UNRANKED' : iqRank}</span>}
                <span className="badge-score">{isUnranked ? 'TBD' : `${iqScore} IQ`}</span>
            </div>
        </div>
    );
};
