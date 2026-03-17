import React, { useState, useEffect, useRef } from 'react';
import './SettingsButton.css';
import { useAuth } from '../../contexts/AuthContext';
import { getUserIqStats } from '../../features/user-iq/userIq.service';
import { UserIqStats, USER_IQ_RANKS } from '../../features/user-iq/userIq.types';
import { getUserIqRankColor } from '../../features/user-iq/userIqCalculator';
import { IqRankIcon } from '../../features/user-iq/components/IqRankIcon';
import { SupportModal } from './SupportModal';
import { useTCoin } from '../../features/tcoin/hooks/useTCoin';
import { TCoinIcon } from '../../features/tcoin/components/TCoinIcon';
import { useVideoLibrary } from '../../features/video-library/hooks/useVideoLibrary';
import Toast from '../common/Toast';
import { getLayoutMode } from '../Game/mobileLayout';
import {
    canUseFullscreen,
    exitDocumentFullscreenSafe,
    isFullscreenActive,
    requestDocumentFullscreenSafe
} from '../../utils/fullscreen';
import type { MonetizationMode } from '../../features/monetization/monetization.types';

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
    onLibraryClick?: () => void;
    isAdmin?: boolean;
    monetizationMode?: MonetizationMode;
    isProEntitled?: boolean;
    onUpgradeClick?: () => void;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
    onArenaClick,
    isAuthenticated,
    displayName,
    onAdminClick,
    onProfileClick,
    onLoginClick,
    onLibraryClick,
    isAdmin,
    monetizationMode,
    isProEntitled,
    onUpgradeClick,
}) => {
    const { signOut, isGuest, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(() => isFullscreenActive());
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [layoutMode, setLayoutMode] = useState(getLayoutMode());
    const menuRef = useRef<HTMLDivElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
    const dragStart = useRef<{ y: number; time: number } | null>(null);

    const isMobile = layoutMode === 'phone-landscape';
    const isFullscreenAvailable = canUseFullscreen();

    const userId = user?.id;

    const [iqStats, setIqStats] = useState<UserIqStats | null>(null);

    useEffect(() => {
        if (isAuthenticated && !isGuest && userId) {
            getUserIqStats(userId).then(setIqStats).catch(console.error);
        }
    }, [isAuthenticated, isGuest, userId]);

    useEffect(() => {
        const handleResize = () => setLayoutMode(getLayoutMode());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { balance: tcoinBalance } = useTCoin();
    const { unlockedCount, totalCount } = useVideoLibrary();

    const [showLogoutToast, setShowLogoutToast] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut();
            setIsOpen(false);
            setShowLogoutToast(true);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Track fullscreen state changes
    useEffect(() => {
        const onFullscreenChange = () => setIsFullscreen(isFullscreenActive());
        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange as EventListener);
        return () => {
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', onFullscreenChange as EventListener);
        };
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
            document.body.classList.add('mobile-menu-open');
        } else {
            document.body.classList.remove('mobile-menu-open');
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.classList.remove('mobile-menu-open');
        };
    }, [isOpen]);

    const handleTouchStart = (e: React.TouchEvent) => {
        const sheet = sheetRef.current;
        if (!sheet || sheet.scrollTop > 0) return;
        dragStart.current = { y: e.touches[0].clientY, time: Date.now() };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!dragStart.current || !sheetRef.current) return;
        const dy = e.touches[0].clientY - dragStart.current.y;
        if (dy > 0) {
            sheetRef.current.style.transform = `translateY(${dy}px)`;
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!dragStart.current || !sheetRef.current) return;
        const dy = e.changedTouches[0].clientY - dragStart.current.y;
        const dt = Date.now() - dragStart.current.time;
        const velocity = dy / dt;

        if (dy > sheetRef.current.offsetHeight * 0.3 || velocity > 0.5) {
            setIsOpen(false);
            sheetRef.current.style.transform = '';
        } else {
            sheetRef.current.style.transform = '';
        }
        dragStart.current = null;
    };

    const handleFullscreen = () => {
        void (async () => {
            if (isFullscreenActive()) {
                await exitDocumentFullscreenSafe();
                return;
            }

            await requestDocumentFullscreenSafe();
        })();
    };

    return (
        <>
            <div className="menu-container" ref={menuRef}>
                <button
                    className="fullscreen-button"
                    onClick={handleFullscreen}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                >
                    {isFullscreen ? (
                        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 9L4 4M9 9H5M9 9V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M15 9L20 4M15 9H19M15 9V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 15L4 20M9 15H5M9 15V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M15 15L20 20M15 15H19M15 15V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : (
                        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4L9 9M4 4H8M4 4V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 4L15 9M20 4H16M20 4V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 20L9 15M4 20H8M4 20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 20L15 15M20 20H16M20 20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>
                <button
                    className="settings-button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Menu"
                >
                    <span className="settings-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </button>

                {isOpen && (
                    isMobile ? (
                        <>
                            <div className="mobile-sheet-backdrop" onClick={() => setIsOpen(false)} />
                            <div className="mobile-sheet" ref={sheetRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                                <div className="mobile-sheet-handle">
                                    <div className="mobile-sheet-handle-bar" />
                                </div>
                                {/* Hero Section */}
                                <div className="mobile-sheet-hero" onClick={() => { onProfileClick?.(); setIsOpen(false); }}>
                                    <div className="mobile-sheet-avatar">{displayName ? displayName.charAt(0).toUpperCase() : '?'}</div>
                                    <div className="mobile-sheet-hero-info">
                                        <div className="mobile-sheet-name">{displayName || 'Khách'}</div>
                                        <div className="mobile-sheet-subtitle">{isGuest ? 'Đăng nhập →' : 'View Profile →'}</div>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div className="mobile-sheet-stats">
                                    <div className="mobile-sheet-stat-card">
                                        <span className="mobile-sheet-stat-label">TFT IQ</span>
                                        <div className="mobile-sheet-stat-value-row">
                                            <IqRankIcon rank={iqStats?.iq_rank || 'Iron'} />
                                            <span className="mobile-sheet-stat-value">{iqStats ? iqStats.iq_score : 0}</span>
                                        </div>
                                        <span className="mobile-sheet-stat-rank" style={{ color: getUserIqRankColor(iqStats?.iq_rank || 'Iron') }}>
                                            {iqStats ? (iqStats.iq_score === 0 ? 'UNRANKED' : iqStats.iq_rank) : 'UNRANKED'}
                                        </span>
                                        <div className="mobile-sheet-progress">
                                            <div className="mobile-sheet-progress-fill" style={{ width: `${getRankProgress(iqStats?.iq_score || 0)}%`, backgroundColor: getUserIqRankColor(iqStats?.iq_rank || 'Iron') }} />
                                        </div>
                                        <span className="mobile-sheet-stat-next">
                                            {getRankProgress(iqStats?.iq_score || 0) < 100
                                                ? `${getNextRankThreshold(iqStats?.iq_score || 0) - (iqStats?.iq_score || 0)} IQ → ${getNextRankName(iqStats?.iq_score || 0)}`
                                                : 'Max Rank'}
                                        </span>
                                    </div>
                                    <div className="mobile-sheet-stat-card">
                                        <span className="mobile-sheet-stat-label">T-Coin</span>
                                        <div className="mobile-sheet-stat-value-row">
                                            <TCoinIcon size={20} />
                                            <span className="mobile-sheet-stat-value">{tcoinBalance.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mobile-sheet-divider" />
                                <div className="mobile-sheet-nav-group">
                                    <button className="mobile-sheet-nav-item" onClick={() => { onArenaClick?.(); setIsOpen(false); }}>
                                        <span className="mobile-sheet-nav-icon">◈</span>
                                        <span>Chọn Đấu Trường</span>
                                        <span className="mobile-sheet-nav-chevron">›</span>
                                    </button>
                                    <button className="mobile-sheet-nav-item" onClick={() => { onLibraryClick?.(); setIsOpen(false); }}>
                                        <span className="mobile-sheet-nav-icon">
                                            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="2" y="3" width="20" height="18" rx="3" stroke="#c8aa6e" strokeWidth="1.5" fill="rgba(200,170,110,0.1)" />
                                                <path d="M10 8.5L16 12L10 15.5V8.5Z" fill="#c8aa6e" />
                                                <line x1="2" y1="7" x2="22" y2="7" stroke="#c8aa6e" strokeWidth="1" opacity="0.4" />
                                                <circle cx="5" cy="5" r="0.8" fill="#c8aa6e" opacity="0.6" />
                                                <circle cx="8" cy="5" r="0.8" fill="#c8aa6e" opacity="0.6" />
                                            </svg>
                                        </span>
                                        <span>Kho Pro Analysis</span>
                                        {totalCount > 0 && <span className="mobile-sheet-badge">{unlockedCount}/{totalCount}</span>}
                                    </button>
                                    <button className="mobile-sheet-nav-item" onClick={() => { setShowSupportModal(true); setIsOpen(false); }}>
                                        <span className="mobile-sheet-nav-icon">☕</span>
                                        <span>Ủng hộ dự án</span>
                                    </button>
                                </div>

                                <div className="mobile-sheet-divider" />
                                <div className="mobile-sheet-nav-group">
                                    {isAdmin && (
                                        <button className="mobile-sheet-nav-item" onClick={() => { onAdminClick?.(); setIsOpen(false); }}>
                                            <span className="mobile-sheet-nav-icon">⬡</span>
                                            <span>Quản trị</span>
                                            <span className="mobile-sheet-nav-chevron">›</span>
                                        </button>
                                    )}
                                    {isFullscreenAvailable && (
                                        <button className="mobile-sheet-nav-item" onClick={handleFullscreen}>
                                            <span className="mobile-sheet-nav-icon">
                                                {isFullscreen ? (
                                                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M9 9L4 4M9 9H5M9 9V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M15 9L20 4M15 9H19M15 9V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M9 15L4 20M9 15H5M9 15V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M15 15L20 20M15 15H19M15 15V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                ) : (
                                                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M4 4L9 9M4 4H8M4 4V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M20 4L15 9M20 4H16M20 4V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M4 20L9 15M4 20H8M4 20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M20 20L15 15M20 20H16M20 20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </span>
                                            <span>{isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}</span>
                                        </button>
                                    )}
                                    <button className="mobile-sheet-nav-item mobile-sheet-nav-item--danger" onClick={() => { isGuest ? onLoginClick?.() : handleLogout(); setIsOpen(false); }}>
                                        <span className="mobile-sheet-nav-icon">↪</span>
                                        <span>{isGuest ? 'Đăng nhập' : 'Đăng xuất'}</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="menu-backdrop" onClick={() => setIsOpen(false)} />
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

                                            {/* Stats container */}
                                            <div className="menu-stats-container">
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

                                {/* Video Library */}
                                <button className="menu-item" onClick={() => { onLibraryClick?.(); setIsOpen(false); }}>
                                    <span className="menu-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="2" y="3" width="20" height="18" rx="3" stroke="#c8aa6e" strokeWidth="1.5" fill="rgba(200,170,110,0.1)" />
                                            <path d="M10 8.5L16 12L10 15.5V8.5Z" fill="#c8aa6e" />
                                            <line x1="2" y1="7" x2="22" y2="7" stroke="#c8aa6e" strokeWidth="1" opacity="0.4" />
                                            <circle cx="5" cy="5" r="0.8" fill="#c8aa6e" opacity="0.6" />
                                            <circle cx="8" cy="5" r="0.8" fill="#c8aa6e" opacity="0.6" />
                                        </svg>
                                    </span> Kho Pro Analysis
                                    {totalCount > 0 && (
                                        <span className="menu-library-count">({unlockedCount}/{totalCount})</span>
                                    )}
                                </button>



                                {/* Monetization packaging */}
                                {monetizationMode === 'beta' && (
                                    <div className="menu-item menu-item--info">
                                        <span className="menu-icon">⏳</span> Beta — Free &amp; Pro coming
                                    </div>
                                )}
                                {monetizationMode === 'free-pro' && !isProEntitled && onUpgradeClick && (
                                    <button className="menu-item menu-item--upgrade" onClick={() => { onUpgradeClick(); setIsOpen(false); }}>
                                        <span className="menu-icon">⭐</span> Upgrade to Pro
                                    </button>
                                )}

                                {/* Support / Donate */}
                                <button className="menu-item menu-item--support" onClick={() => { setShowSupportModal(true); setIsOpen(false); }}>
                                    <span className="menu-icon" style={{ color: '#c8aa6e' }}>☕</span> Ủng hộ dự án
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
                        </>
                    )
                )}

            </div>

            <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />

            {showLogoutToast && (
                <Toast
                    message="Đăng xuất thành công"
                    type="success"
                    onClose={() => setShowLogoutToast(false)}
                />
            )}
        </>
    );
};

