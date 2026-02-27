import React, { useState, useEffect, useRef } from 'react';
import './SettingsButton.css';
import { useAuth } from '../../contexts/AuthContext';
import { getUserIqStats } from '../../features/user-iq/userIq.service';
import { UserIqStats, USER_IQ_RANKS } from '../../features/user-iq/userIq.types';
import { getUserIqRankColor } from '../../features/user-iq/userIqCalculator';
import { IqRankIcon } from '../../features/user-iq/components/IqRankIcon';

const getNextRankThreshold = (score: number) => {
    const sortedRanks = [...USER_IQ_RANKS].sort((a, b) => a.min - b.min);
    for (const rank of sortedRanks) {
        if (rank.min > score) {
            return rank.min;
        }
    }
    return sortedRanks[sortedRanks.length - 1].min;
};

const getNextRankName = (score: number) => {
    const sortedRanks = [...USER_IQ_RANKS].sort((a, b) => a.min - b.min);
    for (const rank of sortedRanks) {
        if (rank.min > score) {
            return rank.rank;
        }
    }
    return sortedRanks[sortedRanks.length - 1].rank;
};

const getRankProgress = (score: number) => {
    const sortedRanks = [...USER_IQ_RANKS].sort((a, b) => a.min - b.min);
    let currentRankMin = 0;
    let nextRankMin = sortedRanks[1].min;

    for (let i = 0; i < sortedRanks.length; i++) {
        if (score >= sortedRanks[i].min) {
            currentRankMin = sortedRanks[i].min;
            nextRankMin = sortedRanks[i + 1] ? sortedRanks[i + 1].min : currentRankMin;
        } else {
            break;
        }
    }

    if (currentRankMin === nextRankMin) return 100;
    return Math.min(100, Math.max(0, ((score - currentRankMin) / (nextRankMin - currentRankMin)) * 100));
};

interface MenuButtonProps {
    onArenaClick?: () => void;
    isAuthenticated: boolean;
    displayName?: string;
    onLogout?: () => void;
    onAdminClick?: () => void;
    onProfileClick?: () => void;
    onLoginClick?: () => void;
    isAdmin?: boolean;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
    onArenaClick,
    isAuthenticated,
    displayName,
    onAdminClick,
    onProfileClick,
    onLoginClick,
    isAdmin
}) => {
    const { signOut, isGuest, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
    const [iqStats, setIqStats] = useState<UserIqStats | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fetch IQ Stats
    useEffect(() => {
        if (isAuthenticated && !isGuest && user?.id) {
            getUserIqStats(user.id).then(setIqStats).catch(console.error);
        }
    }, [isAuthenticated, isGuest, user?.id]);

    const handleLogout = async () => {
        try {
            await signOut();
            setIsOpen(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Track fullscreen state changes
    useEffect(() => {
        const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        setIsOpen(false);
    };

    return (
        <div className="menu-container" ref={menuRef}>
            <button
                className="settings-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menu"
            >
                <span className="settings-icon">≡</span>
            </button>

            {isOpen && (
                <div className="menu-dropdown">
                    {/* User Profile Section */}
                    {isAuthenticated && displayName && (
                        isGuest ? (
                            <div className="menu-user-info">
                                <span className="menu-username">{displayName}</span>
                            </div>
                        ) : (
                            <div className="menu-profile-card">
                                {/* Profile Header: Avatar & Name */}
                                <div className="menu-profile-header" onClick={() => { onProfileClick?.(); setIsOpen(false); }}>
                                    <div className="menu-avatar">
                                        <div className="menu-avatar-inner">{displayName.charAt(0).toUpperCase()}</div>
                                    </div>
                                    <div className="menu-name-section">
                                        <div className="menu-username">{displayName}</div>
                                        <div className="menu-view-profile">View Profile <span className="menu-arrow">→</span></div>
                                    </div>
                                </div>

                                <div className="menu-stats-divider"></div>

                                {/* Two-column stats row */}
                                <div className="menu-stats-row">
                                    {/* IQ Panel */}
                                    <div className="menu-stat-panel">
                                        <div className="menu-stat-panel-header">
                                            <span className="menu-stat-label">TFT IQ</span>
                                        </div>
                                        <div className="menu-iq-display">
                                            <div className="menu-iq-icon" style={{ color: getUserIqRankColor(iqStats?.iq_rank || 'Iron') }}>
                                                <IqRankIcon rank={iqStats?.iq_rank || 'Iron'} />
                                            </div>
                                            <div className="menu-iq-info">
                                                <div className="menu-iq-score">{iqStats ? iqStats.iq_score : 0}</div>
                                                <div className="menu-iq-rank" style={{ color: getUserIqRankColor(iqStats?.iq_rank || 'Iron') }}>
                                                    {iqStats ? (iqStats.iq_score === 0 ? 'UNRANKED' : iqStats.iq_rank) : 'UNRANKED'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="menu-progress-bar">
                                            <div
                                                className="menu-progress-fill"
                                                style={{
                                                    width: `${getRankProgress(iqStats?.iq_score || 0)}%`,
                                                    '--rank-color': getUserIqRankColor(iqStats?.iq_rank || 'Iron')
                                                } as React.CSSProperties}
                                            />
                                        </div>
                                        <div className="menu-iq-next">
                                            {getRankProgress(iqStats?.iq_score || 0) < 100
                                                ? `${getNextRankThreshold(iqStats?.iq_score || 0) - (iqStats?.iq_score || 0)} IQ → ${getNextRankName(iqStats?.iq_score || 0)}`
                                                : 'Max Rank'
                                            }
                                        </div>
                                    </div>

                                    {/* T-Coin Panel */}
                                    <div className="menu-stat-panel">
                                        <div className="menu-stat-panel-header">
                                            <span className="menu-stat-label">T-Coin</span>
                                            <button className="menu-add-coin-btn" title="Nạp T-Coin">+</button>
                                        </div>
                                        <div className="menu-coin-display">
                                            <span className="menu-coin-value">1,500</span>
                                            <span className="menu-coin-currency">TC</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {/* Admin Panel */}
                    {isAdmin && (
                        <button className="menu-item" onClick={() => { onAdminClick?.(); setIsOpen(false); }}>
                            <span className="menu-icon">⬡</span> Quản trị
                        </button>
                    )}

                    {/* Arena Selector */}
                    <button className="menu-item" onClick={() => { onArenaClick?.(); setIsOpen(false); }}>
                        <span className="menu-icon">◈</span> Chọn Đấu Trường
                    </button>

                    {/* Fullscreen Toggle */}
                    <button className="menu-item" onClick={handleFullscreen}>
                        <span className="menu-icon">▭</span> {isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                    </button>

                    <div className="menu-divider"></div>

                    {/* Login for guests / Logout for authenticated */}
                    {isGuest ? (
                        <button className="menu-item" onClick={() => { onLoginClick?.(); setIsOpen(false); }}>
                            <span className="menu-icon">→</span> Đăng nhập
                        </button>
                    ) : isAuthenticated ? (
                        <button className="menu-item" onClick={handleLogout}>
                            Đăng xuất
                        </button>
                    ) : null}
                </div>
            )}
        </div>
    );
};

