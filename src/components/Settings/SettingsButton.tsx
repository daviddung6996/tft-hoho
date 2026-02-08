import React, { useState, useEffect, useRef } from 'react';
import './SettingsButton.css';
import { useAuth } from '../../contexts/AuthContext';

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
    const { signOut, isGuest } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
    const menuRef = useRef<HTMLDivElement>(null);

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
                    {isAuthenticated && displayName && (
                        isGuest ? (
                            <div className="menu-user-info">
                                <span className="menu-username">{displayName}</span>
                            </div>
                        ) : (
                            <button
                                className="menu-user-info menu-user-clickable"
                                onClick={() => { onProfileClick?.(); setIsOpen(false); }}
                            >
                                <span className="menu-username">{displayName}</span>
                                <span className="menu-stats-hint">Xem thống kê</span>
                            </button>
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

                    {/* Settings */}
                    <button className="menu-item" onClick={() => setIsOpen(false)}>
                        <span className="menu-icon">⚙</span> Cài đặt
                    </button>

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

