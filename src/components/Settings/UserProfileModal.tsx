import React, { useState, useEffect, useCallback } from 'react';
import {
    LineChart,
    Line,
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
import './UserProfileModal.css';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/* Inline SVG icons — no emoji, no unicode, no AI-generated icons */
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
    const [accuracyTrend, setAccuracyTrend] = useState<AccuracyTrend[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [statsData, stagesData, attemptsData, trendData] = await Promise.all([
                userStatsService.getUserStats(),
                userStatsService.getStageBreakdown(),
                userStatsService.getRecentAttempts(undefined, 10),
                userStatsService.getAccuracyTrend(undefined, 20)
            ]);

            setStats(statsData);
            setStageBreakdown(stagesData);
            setRecentAttempts(attemptsData);
            setAccuracyTrend(trendData);
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
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return 'Vừa xong';
        if (diffHours < 24) return `${diffHours} giờ trước`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const renderDot = useCallback((props: any) => {
        const { cx, cy, payload } = props;
        if (cx == null || cy == null) return <circle r={0} />;
        return (
            <circle
                cx={cx}
                cy={cy}
                r={4}
                fill={payload.isCorrect ? '#10B981' : '#EF4444'}
                stroke="#0a2a2d"
                strokeWidth={2}
            />
        );
    }, []);

    if (!isOpen) return null;

    const statCards = [
        { value: stats?.totalAttempts || 0, label: 'PUZZLES' },
        { value: `${stats?.accuracyPercent || 0}%`, label: 'ACCURACY' },
        { value: stats?.correctCount || 0, label: 'CORRECT' },
        { value: formatTime(stats?.avgTimeMs || 0), label: 'AVG TIME' },
    ];

    return (
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="profile-modal-header">
                    <div className="profile-header-left">
                        <div className="profile-header-accent" />
                        <h2 className="profile-modal-title">
                            {user?.display_name || 'Player'} Stats
                        </h2>
                    </div>
                    <button className="profile-close-btn" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>

                {/* Content */}
                <div className="profile-modal-content">
                    {isLoading ? (
                        <div className="loading-state">
                            <div className="loading-spinner" />
                            <span>Đang tải dữ liệu...</span>
                        </div>
                    ) : stats?.totalAttempts === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-line" />
                            <div className="empty-state-text">
                                Chưa có dữ liệu. Hãy hoàn thành một số puzzle để xem thống kê!
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Stats Summary Cards */}
                            <div className="stats-summary">
                                {statCards.map((card, i) => (
                                    <div className="stat-card" key={i}>
                                        <div className="stat-value">{card.value}</div>
                                        <div className="stat-label">{card.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Charts */}
                            <div className="charts-section">
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
                                                <LineChart data={accuracyTrend} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,170,110,0.08)" />
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
                                                                formatter={(val: number) => `${val}%`}
                                                            />
                                                        }
                                                        cursor={{ stroke: 'rgba(200,170,110,0.15)' }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="rollingAccuracy"
                                                        stroke="#c8aa6e"
                                                        strokeWidth={2}
                                                        dot={renderDot}
                                                        activeDot={{ r: 6, fill: '#c8aa6e', stroke: '#0a2a2d', strokeWidth: 2 }}
                                                    />
                                                </LineChart>
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
                                                    <Bar dataKey="accuracyPercent" radius={[3, 3, 0, 0]} maxBarSize={60}>
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

                            {/* Recent Activity */}
                            <div className="recent-activity">
                                <div className="chart-title">Hoạt động gần đây</div>
                                {recentAttempts.length > 0 ? (
                                    <div className="activity-list">
                                        {recentAttempts.map((attempt) => (
                                            <div
                                                key={attempt.id}
                                                className={`activity-item ${attempt.isCorrect ? 'correct' : 'incorrect'}`}
                                            >
                                                <div className={`activity-icon ${attempt.isCorrect ? 'correct' : 'incorrect'}`}>
                                                    {attempt.isCorrect ? <CheckIcon /> : <CrossIcon />}
                                                </div>
                                                <div className="activity-details">
                                                    <div className="activity-augment">{attempt.userPickName}</div>
                                                    <div className="activity-meta">
                                                        Stage {attempt.puzzleStage} • {attempt.rerollCount} reroll • {formatTime(attempt.timeToDecideMs)}
                                                    </div>
                                                </div>
                                                <div className="activity-time">
                                                    {formatDate(attempt.createdAt)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="chart-placeholder">Chưa có hoạt động</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
