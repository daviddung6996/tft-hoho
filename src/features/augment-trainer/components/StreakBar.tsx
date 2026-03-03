import React from 'react';
import './StreakBar.css';

interface StreakBarProps {
    streakHistory: boolean[];  // Array of W/L (true = win, false = loss)
    streakCount: number;       // Positive = win streak, negative = loss streak
}

const ROUND_LABELS = ['1-1', '1-2', '1-3', '1-4', '2-1'];

export const StreakBar: React.FC<StreakBarProps> = ({
    streakHistory,
    streakCount
}) => {
    const isWinStreak = streakCount > 0;
    const isLoseStreak = streakCount < 0;
    const absStreak = Math.abs(streakCount);

    const streakLabel = isWinStreak
        ? `W${absStreak}`
        : isLoseStreak
            ? `L${absStreak}`
            : '—';

    const streakClass = isWinStreak
        ? 'streak-win'
        : isLoseStreak
            ? 'streak-lose'
            : 'streak-neutral';

    return (
        <div className={`streak-bar ${streakClass}`}>
            {/* Hextech Corner Accents */}
            <div className="streak-corner streak-corner-tl" />
            <div className="streak-corner streak-corner-tr" />
            <div className="streak-corner streak-corner-bl" />
            <div className="streak-corner streak-corner-br" />

            <div className="streak-label-container">
                <span className="streak-label-text">Chuỗi</span>
            </div>

            <div className="streak-divider" />

            <div className="streak-segments">
                {streakHistory.map((won, i) => (
                    <div
                        key={i}
                        className={`streak-segment ${won ? 'segment-win' : 'segment-loss'}`}
                    >
                        <span className="segment-label">{ROUND_LABELS[i] || `R${i + 1}`}</span>
                        <span className="segment-result">{won ? 'W' : 'L'}</span>
                    </div>
                ))}
            </div>

            <div className="streak-divider" />

            <div className="streak-summary">
                <span className={`streak-count ${streakClass}`}>{streakLabel}</span>
            </div>
        </div>
    );
};

export default StreakBar;
