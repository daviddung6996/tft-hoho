import React from 'react';
import { VIDEO_MILESTONES } from '../constants/milestones';
import './LibraryProgress.css';

interface LibraryProgressProps {
    unlockedCount: number;
    totalCount: number;
    isProSupporter: boolean;
    onSupportClick?: () => void;
}

export const LibraryProgress: React.FC<LibraryProgressProps> = ({
    unlockedCount,
    totalCount,
    isProSupporter,
    onSupportClick,
}) => {
    const maxMilestone = VIDEO_MILESTONES[VIDEO_MILESTONES.length - 1].threshold;
    const displayTotal = Math.max(totalCount, maxMilestone);
    const progressPercent = displayTotal > 0 ? Math.min(100, (unlockedCount / displayTotal) * 100) : 0;

    return (
        <div className="library-progress">
            <div className="library-progress-header">
                <span className="library-progress-label">
                    <span className="library-progress-count">{unlockedCount}</span>
                    <span className="library-progress-separator">/</span>
                    <span className="library-progress-total">{totalCount}</span>
                    <span className="library-progress-text"> video đã mở khóa</span>
                </span>
                {!isProSupporter && unlockedCount < totalCount && onSupportClick && (
                    <button className="library-progress-upsell" onClick={onSupportClick}>
                        Pro Supporter: Mở toàn bộ →
                    </button>
                )}
            </div>

            <div className="library-progress-bar-track">
                <div
                    className="library-progress-bar-fill"
                    style={{ width: `${progressPercent}%` }}
                />
                {/* Milestone markers */}
                {VIDEO_MILESTONES.map(m => {
                    const markerPercent = (m.threshold / displayTotal) * 100;
                    const reached = unlockedCount >= m.threshold;
                    return (
                        <div
                            key={m.threshold}
                            className={`library-progress-milestone ${reached ? 'reached' : ''}`}
                            style={{ left: `${markerPercent}%` }}
                            title={`${m.threshold} video — +${m.reward} T-Coin: "${m.message}"`}
                        >
                            <span className="milestone-dot" />
                            <span className="milestone-label">{m.threshold}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
