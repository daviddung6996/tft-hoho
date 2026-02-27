import React, { useEffect, useRef, useState } from 'react';
import { UserIqRank } from '../userIq.types';
import { getUserIqRankColor } from '../userIqCalculator';
import { IqRankIcon } from './IqRankIcon';
import './IqScoreSummary.css';

interface IqScoreSummaryProps {
    newScore: number;
    changeAmount: number;
    newRank: string;
}

export const IqScoreSummary: React.FC<IqScoreSummaryProps> = ({
    newScore,
    changeAmount,
    newRank,
}) => {
    const rankColor = getUserIqRankColor(newRank as UserIqRank);
    const isPositive = changeAmount > 0;
    const sign = isPositive ? '+' : '';

    // Count-up: start from old score → new score
    const startScore = newScore - changeAmount;
    const [displayScore, setDisplayScore] = useState(startScore);
    const rafRef = useRef<number | null>(null);

    // Badge lifecycle: hidden → visible → fading (then hidden via CSS collapse)
    const [badgeState, setBadgeState] = useState<'hidden' | 'visible' | 'fading'>('hidden');

    useEffect(() => {
        const duration = 900;
        const start = performance.now();
        const from = startScore;
        const to = newScore;

        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(Math.round(from + (to - from) * eased));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                // Count-up done → show badge
                if (changeAmount !== 0) {
                    setBadgeState('visible');
                    // Hold 2.5s then fade + collapse
                    setTimeout(() => setBadgeState('fading'), 2500);
                }
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [newScore, startScore, changeAmount]);

    return (
        <div
            className="iq-score-summary"
            style={{ '--rank-color': rankColor } as React.CSSProperties}
        >
            {/* Rank icon */}
            <span className="iq-rank-icon">
                <IqRankIcon rank={newRank as UserIqRank} />
            </span>

            {/* Score — always visible */}
            <div className="iq-score-block">
                <span className="iq-score-number">{displayScore}</span>
                <span className="iq-score-unit">IQ</span>
            </div>

            {/* Change badge — fades + collapses so no leftover space */}
            {changeAmount !== 0 && (
                <span className={`iq-change-badge ${isPositive ? 'positive' : 'negative'} ${badgeState}`}>
                    {sign}{changeAmount}
                </span>
            )}
        </div>
    );
};
