import React, { memo } from 'react';
import type { CoachProfile } from '../coachSelect.types';

interface CoachStatBarsProps {
    coach: CoachProfile;
}

export const CoachStatBars: React.FC<CoachStatBarsProps> = memo(({ coach }) => {
    return (
        <div className="coach-stats">
            {coach.stats.map((stat, index) => (
                <div key={stat.label} className="coach-stat">
                    <div className="coach-stat__row">
                        <span className="coach-stat__label">{stat.label}</span>
                        <span className="coach-stat__value">{stat.value}</span>
                    </div>
                    <div className="coach-stat__bar">
                        <div
                            className="coach-stat__fill"
                            style={{
                                ['--coach-accent' as string]: coach.accentColor,
                                ['--coach-stat-scale' as string]: `${Math.min(Math.max(stat.value, 0), 100) / 100}`,
                                ['--coach-stat-delay' as string]: `${index * 45}ms`,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
});
