import React from 'react';
import { getXpToNextLevel } from '../../features/puzzle/playerLevel';
import './PlayerLevelDisplay.css';

interface PlayerLevelDisplayProps {
    level: number;
    xp: number;
}

export const PlayerLevelDisplay: React.FC<PlayerLevelDisplayProps> = ({ level, xp }) => {
    const xpToNextLevel = getXpToNextLevel(level);
    const progressPercent = xpToNextLevel > 0 ? Math.min(100, (xp / xpToNextLevel) * 100) : 100;

    return (
        <div className="player-level-display" data-testid="PlayerLevelDisplay">
            <div className="player-level-display__topline">
                <span className="player-level-display__label">LV</span>
                <span className="player-level-display__value">{level}</span>
            </div>
            <div className="player-level-display__xp-value">
                {xp}/{xpToNextLevel}
            </div>
            <div className="player-level-display__xp-label">XP</div>
            <div className="player-level-display__bar" aria-hidden="true">
                <div
                    className="player-level-display__bar-fill"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
};

