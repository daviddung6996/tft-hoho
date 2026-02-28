import React, { useState, useEffect, useCallback } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import {
    userStatsService,
    UserStats,
    StageStats,
    AttemptRecord,
    AccuracyTrend
} from '../../services/userStatsService';
import { useAuth } from '../../contexts/AuthContext';
import { getUserIqStats } from '../../features/user-iq/userIq.service';
import { UserIqStats, USER_IQ_RANKS } from '../../features/user-iq/userIq.types';
import { getUserIqRankColor } from '../../features/user-iq/userIqCalculator';
import { IqRankIcon } from '../../features/user-iq/components/IqRankIcon';

import './UserProfileModal.css';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/* Inline SVG icons */
const CloseIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
        <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const CheckIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CrossIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
        <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const TrendUpIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
        <polyline points="16 7 22 7 22 13"></polyline>
    </svg>
);

const TrendDownIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}>
        <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
        <polyline points="16 17 22 17 22 11"></polyline>
    </svg>
);

/* Custom tooltip to avoid default recharts tooltip overflow/styling issues */
const ChartTooltip = ({ active, payload, label, formatter }: any) => {
    if (!active || !payload || !payload.length) return null;
    const formatted = formatter ? formatter(payload[0].value, payload[0]) : `${payload[0].value}`;
    return (
        <div className="hextech-chart-tooltip">
            <div className="hextech-chart-tooltip-label">{label}</div>
            <div className="hextech-chart-tooltip-value">{formatted}</div>
        </div>
    );
};

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [stageBreakdown, setStageBreakdown] = useState<StageStats[]>([]);
    const [recentAttempts, setRecentAttempts] = useState<AttemptRecord[]>([]);
    const [showAllActivities, setShowAllActivities] = useState(false);
    const [accuracyTrend, setAccuracyTrend] = useState<AccuracyTrend[]>([]);
    const [iqStats, setIqStats] = useState<UserIqStats | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [statsData, stagesData, attemptsData, trendData, iqData] = await Promise.all([
                userStatsService.getUserStats(),
                userStatsService.getStageBreakdown(),
                userStatsService.getRecentAttempts(undefined, 20), // Fetch more for progressive disclosure
                userStatsService.getAccuracyTrend(undefined, 20),
                user?.id ? getUserIqStats(user.id) : Promise.resolve(null)
            ]);

            setStats(statsData);
            setStageBreakdown(stagesData);
            setRecentAttempts(attemptsData);
            setAccuracyTrend(trendData);
            setIqStats(iqData);
        } catch (error) {
            console.error('Failed to load profile data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (ms: number): string => {
        if (ms < 1000) return `${ms}ms`;
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();

        // Guard: clock skew or future timestamps
        if (diffMs < 0) return 'Vừa xong';

        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 2) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 24) return `${diffHours} giờ trước`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} ngày trước`;

        return date.toLocaleDateString('vi-VN');
    };

    const renderDot = useCallback((props: any) => {
        const { cx, cy, payload } = props;
        if (cx == null || cy == null) return null;
        return (
            <circle
                cx={cx}
                cy={cy}
                r={4}
                fill={payload.isCorrect ? '#10B981' : '#EF4444'}
                stroke="#051c1e"
                strokeWidth={1.5}
            />
        );
    }, []);

    if (!isOpen) return null;




    // Calculate simple trend for accuracy
    const getAccuracyTrendInfo = () => {
        if (accuracyTrend.length < 2) return null;
        const latest = accuracyTrend[accuracyTrend.length - 1].rollingAccuracy;
        const previous = accuracyTrend[0].rollingAccuracy;
        const diff = latest - previous;

        if (Math.abs(diff) < 1) return null;

        return {
            isPositive: diff > 0,
            value: Math.abs(diff).toFixed(1)
        };
    };

    const accuracyTrendInfo = getAccuracyTrendInfo();
    const displayActivities = showAllActivities ? recentAttempts : recentAttempts.slice(0, 5);

    return (
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={e => e.stopPropagation()}>
                <button className="profile-close-btn" onClick={onClose}>
                    <CloseIcon />
                </button>

                <div className="profile-modal-content">
                    {isLoading ? (
                        <div className="loading-state profile-section">
                            <div className="loading-spinner" />
                            <span>Đang tải dữ liệu...</span>
                        </div>
                    ) : (
                        <>
                            {/* SECTION 1: HERO IDENTITY */}
                            <div className="hero-section profile-section"
                                style={({
                                    '--rank-color': (iqStats && iqStats.iq_score > 0)
                                        ? getUserIqRankColor(iqStats.iq_rank)
                                        : '#4B5563',
                                    '--hero-atmosphere': (iqStats && iqStats.iq_score > 0)
                                        ? `${getUserIqRankColor(iqStats.iq_rank)}26`
                                        : 'rgba(75, 85, 99, 0.12)',
                                } as React.CSSProperties)}
                            >
                                {/* T-Coin Panel — left side */}
                                <div className="hero-tcoin-panel">
                                    <div className="hero-tcoin-label">T-Coin</div>
                                    <div className="hero-tcoin-value">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M8 12h8M12 8v8" />
                                        </svg>
                                        1,500 <span className="hero-tcoin-unit">TC</span>
                                    </div>
                                    <button className="hero-tcoin-cta" onClick={onClose}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                        </svg>
                                        Cày Puzzle
                                    </button>
                                </div>

                                {/* Badges Panel — right side */}
                                <div className="hero-badges-panel">
                                    <div className="hero-badges-label">Danh hiệu</div>
                                    <div className="hero-badges-grid">
                                        <div className="hero-badge-item" style={{ '--badge-color': '#10B981' } as React.CSSProperties}>
                                            <div className="hero-badge-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                            </div>
                                            <div className="hero-badge-name">First Win</div>
                                        </div>
                                        <div className={`hero-badge-item ${(stats?.correctCount || 0) >= 10 ? '' : 'locked'}`} style={{ '--badge-color': '#c8aa6e' } as React.CSSProperties}>
                                            <div className="hero-badge-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                    <circle cx="12" cy="12" r="4" />
                                                </svg>
                                            </div>
                                            <div className="hero-badge-name">10 Wins</div>
                                        </div>
                                        <div className={`hero-badge-item ${(stats?.totalAttempts || 0) >= 50 ? '' : 'locked'}`} style={{ '--badge-color': '#0EA5E9' } as React.CSSProperties}>
                                            <div className="hero-badge-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M6 9l6 6 6-6" />
                                                    <path d="M6 5l6 6 6-6" />
                                                </svg>
                                            </div>
                                            <div className="hero-badge-name">50 Puzzles</div>
                                        </div>
                                        <div className={`hero-badge-item ${(stats?.accuracyPercent || 0) >= 80 ? '' : 'locked'}`} style={{ '--badge-color': '#EAB308' } as React.CSSProperties}>
                                            <div className="hero-badge-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="8" r="6" />
                                                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                                                </svg>
                                            </div>
                                            <div className="hero-badge-name">80% Acc</div>
                                        </div>
                                    </div>
                                </div>

                                {iqStats && iqStats.iq_score > 0 ? (() => {
                                    const rankColor = getUserIqRankColor(iqStats.iq_rank);

                                    // Progress bar calculation
                                    const reversedRanks = [...USER_IQ_RANKS].reverse();
                                    const currentRankDef = reversedRanks.find(r => iqStats.iq_score >= r.min);
                                    const nextRankDef = reversedRanks.find(r => r.min > iqStats.iq_score);

                                    let progressPct = 100;
                                    let progressLabel = 'Bậc cao nhất';

                                    if (nextRankDef && currentRankDef) {
                                        const range = nextRankDef.min - currentRankDef.min;
                                        const earned = iqStats.iq_score - currentRankDef.min;
                                        progressPct = Math.min(100, Math.round((earned / range) * 100));
                                        progressLabel = `${nextRankDef.min - iqStats.iq_score} IQ tới ${nextRankDef.rank}`;
                                    }

                                    return (
                                        <>
                                            {/* Rank Emblem */}
                                            <div className="hero-rank-emblem" style={{ '--rank-color': rankColor } as React.CSSProperties}>
                                                <div className="hero-rank-icon">
                                                    <IqRankIcon rank={iqStats.iq_rank} />
                                                </div>
                                            </div>

                                            {/* Rank Name */}
                                            <div className="hero-rank-name">
                                                {iqStats.iq_rank.toUpperCase()}
                                            </div>

                                            {/* IQ Score */}
                                            <div className="hero-iq-score">
                                                {iqStats.iq_score.toLocaleString('vi-VN')} IQ
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="hero-progress-wrap">
                                                <div className="hero-progress-track">
                                                    <div
                                                        className="hero-progress-fill"
                                                        style={{
                                                            width: `${progressPct}%`,
                                                            '--rank-color': rankColor,
                                                        } as React.CSSProperties}
                                                    />
                                                </div>
                                                <div className="hero-progress-label">{progressLabel}</div>
                                            </div>

                                            {/* Diamond Divider */}
                                            <div className="hero-diamond-divider">
                                                <span className="hero-diamond-dot">◆</span>
                                            </div>

                                            {/* Player Name */}
                                            <div className="hero-player-name">{user?.display_name || 'Player'}</div>


                                        </>
                                    );
                                })() : (
                                    <>
                                        {/* UNRANKED: muted iron emblem */}
                                        <div className="hero-rank-emblem unranked" style={{ '--rank-color': '#4B5563' } as React.CSSProperties}>
                                            <div className="hero-rank-icon">
                                                <IqRankIcon rank="Iron" />
                                            </div>
                                        </div>

                                        <div className="hero-rank-name unranked">CHƯA XẾP HẠNG</div>

                                        <div className="hero-iq-score unranked">0 IQ</div>

                                        {/* Empty progress bar */}
                                        <div className="hero-progress-wrap">
                                            <div className="hero-progress-track">
                                                <div className="hero-progress-fill" style={{ width: '0%' }} />
                                            </div>
                                            <div className="hero-progress-label">Hoàn thành puzzle để bắt đầu</div>
                                        </div>

                                        {/* Diamond Divider */}
                                        <div className="hero-diamond-divider">
                                            <span className="hero-diamond-dot">◆</span>
                                        </div>

                                        <div className="hero-player-name">{user?.display_name || 'Player'}</div>


                                    </>
                                )}
                            </div>

                            {/* SECTION 2: CORE METRICS */}
                            <div className="metrics-section profile-section">
                                <div className="stat-card">
                                    <div className="stat-value">{stats?.totalAttempts || 0}</div>
                                    <div className="stat-label">PUZZLES</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">
                                        {stats?.accuracyPercent || 0}%
                                        {accuracyTrendInfo && (
                                            <span className={`stat-trend ${accuracyTrendInfo.isPositive ? 'positive' : 'negative'}`}>
                                                {accuracyTrendInfo.isPositive ? <TrendUpIcon /> : <TrendDownIcon />}
                                                {accuracyTrendInfo.value}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="stat-label">ACCURACY</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{stats?.correctCount || 0}</div>
                                    <div className="stat-label">CORRECT</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value" style={{ fontSize: '1.8cqw' }}>{formatTime(stats?.avgTimeMs || 0)}</div>
                                    <div className="stat-label">AVG TIME</div>
                                </div>
                            </div>

                            {stats?.totalAttempts === 0 ? (
                                <div className="empty-state profile-section" style={{ border: '0.06cqw solid rgba(200, 170, 110, 0.15)', borderTop: 'none', background: 'rgba(5, 28, 30, 0.8)' }}>
                                    <div className="empty-state-text">
                                        Hãy hoàn thành một số puzzle để xem biểu đồ và hoạt động!
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* SECTION 3: PERFORMANCE CHARTS */}
                                    <div className="charts-section profile-section">
                                        {/* Accuracy Trend */}
                                        <div className="chart-container">
                                            <div className="chart-header">
                                                <div className="chart-title">Accuracy Trend</div>
                                                <div className="chart-legend">
                                                    <span className="legend-dot legend-correct" />
                                                    <span className="legend-text">Đúng</span>
                                                    <span className="legend-dot legend-incorrect" />
                                                    <span className="legend-text">Sai</span>
                                                </div>
                                            </div>
                                            {accuracyTrend.length > 0 ? (
                                                <div className="chart-wrapper">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={accuracyTrend} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                                                            <defs>
                                                                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#c8aa6e" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#c8aa6e" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,170,110,0.08)" vertical={false} />
                                                            <XAxis
                                                                dataKey="attemptNumber"
                                                                stroke="rgba(200,170,110,0.2)"
                                                                tick={{ fill: '#94A3B8', fontSize: 11 }}
                                                                tickLine={false}
                                                                axisLine={{ stroke: 'rgba(200,170,110,0.15)' }}
                                                            />
                                                            <YAxis
                                                                domain={[0, 100]}
                                                                stroke="rgba(200,170,110,0.2)"
                                                                tick={{ fill: '#94A3B8', fontSize: 11 }}
                                                                tickFormatter={(v) => `${v}%`}
                                                                tickLine={false}
                                                                axisLine={{ stroke: 'rgba(200,170,110,0.15)' }}
                                                            />
                                                            <Tooltip
                                                                content={
                                                                    <ChartTooltip
                                                                        formatter={(val: number) => `${val.toFixed(1)}%`}
                                                                    />
                                                                }
                                                                cursor={{ stroke: 'rgba(200,170,110,0.15)' }}
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="rollingAccuracy"
                                                                stroke="#c8aa6e"
                                                                strokeWidth={3}
                                                                fillOpacity={1}
                                                                fill="url(#colorAccuracy)"
                                                                dot={renderDot}
                                                                activeDot={{ r: 5, fill: '#c8aa6e', stroke: '#051c1e', strokeWidth: 2 }}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            ) : (
                                                <div className="chart-placeholder">Không đủ dữ liệu</div>
                                            )}
                                        </div>

                                        {/* Stage Breakdown */}
                                        <div className="chart-container">
                                            <div className="chart-header">
                                                <div className="chart-title">Accuracy by Stage</div>
                                            </div>
                                            {stageBreakdown.length > 0 ? (
                                                <div className="chart-wrapper">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={stageBreakdown} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,170,110,0.08)" vertical={false} />
                                                            <XAxis
                                                                dataKey="stage"
                                                                stroke="rgba(200,170,110,0.2)"
                                                                tick={{ fill: '#94A3B8', fontSize: 11 }}
                                                                tickLine={false}
                                                                axisLine={{ stroke: 'rgba(200,170,110,0.15)' }}
                                                            />
                                                            <YAxis
                                                                domain={[0, 100]}
                                                                stroke="rgba(200,170,110,0.2)"
                                                                tick={{ fill: '#94A3B8', fontSize: 11 }}
                                                                tickFormatter={(v) => `${v}%`}
                                                                tickLine={false}
                                                                axisLine={{ stroke: 'rgba(200,170,110,0.15)' }}
                                                            />
                                                            <Tooltip
                                                                content={
                                                                    <ChartTooltip
                                                                        formatter={(val: number, entry: any) =>
                                                                            `${val}% (${entry?.payload?.correct ?? 0}/${entry?.payload?.total ?? 0})`
                                                                        }
                                                                    />
                                                                }
                                                                cursor={{ fill: 'rgba(200,170,110,0.05)' }}
                                                            />
                                                            <Bar dataKey="accuracyPercent" radius={[3, 3, 0, 0]} maxBarSize={40}>
                                                                {stageBreakdown.map((entry, index) => (
                                                                    <Cell
                                                                        key={`cell-${index}`}
                                                                        fill={entry.accuracyPercent >= 70 ? '#10B981' :
                                                                            entry.accuracyPercent >= 40 ? '#c8aa6e' : '#EF4444'}
                                                                    />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            ) : (
                                                <div className="chart-placeholder">Không đủ dữ liệu</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* SECTION 4: RECENT ACTIVITY */}
                                    <div className="activity-section profile-section">
                                        <div className="chart-title chart-header">Hoạt động gần đây</div>
                                        {recentAttempts.length > 0 ? (
                                            <div className="activity-list">
                                                {displayActivities.map((attempt) => (
                                                    <div key={attempt.id} className="activity-item">
                                                        <div className="activity-icon-container">
                                                            <div className={`activity-icon ${attempt.isCorrect ? 'correct' : 'incorrect'}`}>
                                                                {attempt.isCorrect ? <CheckIcon /> : <CrossIcon />}
                                                            </div>
                                                        </div>

                                                        <div className="activity-details">
                                                            <div className="activity-augment">{attempt.userPickName}</div>
                                                            <div className="activity-meta">
                                                                Stage {attempt.puzzleStage} • {attempt.rerollCount} reroll • {formatTime(attempt.timeToDecideMs)}
                                                            </div>
                                                        </div>

                                                        <div className="activity-trailing">
                                                            {(attempt.iqChangeAmount !== undefined && attempt.iqChangeAmount !== null) && attempt.iqChangeAmount !== 0 && (
                                                                <div className={`activity-iq-chip ${attempt.iqChangeAmount > 0 ? 'positive' : 'negative'}`}>
                                                                    {attempt.iqChangeAmount > 0 ? '+' : ''}{attempt.iqChangeAmount} IQ
                                                                </div>
                                                            )}
                                                            <div className="activity-time">
                                                                {formatDate(attempt.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {recentAttempts.length > 5 && (
                                                    <button
                                                        className="view-all-btn"
                                                        onClick={() => setShowAllActivities(!showAllActivities)}
                                                    >
                                                        {showAllActivities ? 'Ẩn bớt' : `Xem tất cả ${recentAttempts.length} hoạt động`}
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="chart-placeholder">Chưa có hoạt động</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

        </div>
    );
};

export default UserProfileModal;
