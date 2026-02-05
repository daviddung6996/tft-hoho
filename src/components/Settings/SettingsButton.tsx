import React, { useState, useEffect, useRef } from 'react';
import './SettingsButton.css';

interface MenuButtonProps {
    onLoginClick: () => void;
    onArenaClick?: () => void;
    onFullscreenClick?: () => void;
    isAuthenticated: boolean;
    displayName?: string;
    onLogout?: () => void;
    onAdminClick?: () => void;
    isAdmin?: boolean;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
    onLoginClick,
    onArenaClick,

    isAuthenticated,
    displayName,
    onLogout,
    onAdminClick,
    isAdmin
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
                        <div className="menu-user-info">
                            <span className="menu-username">{displayName}</span>
                        </div>
                    )}

                    {!isAuthenticated ? (
                        <button className="menu-item" onClick={() => { onLoginClick(); setIsOpen(false); }}>
                            <span className="menu-icon">→</span> Login
                        </button>
                    ) : (
                        <button className="menu-item" onClick={() => { onLogout?.(); setIsOpen(false); }}>
                            <span className="menu-icon">←</span> Logout
                        </button>
                    )}

                    <button className="menu-item" onClick={() => { onArenaClick?.(); setIsOpen(false); }}>
                        <span className="menu-icon">⬡</span> Select Arena
                    </button>

                    <button className="menu-item" onClick={handleFullscreen}>
                        <span className="menu-icon">⛶</span> Fullscreen
                    </button>

                    {/* Admin Toggle - Only show if user is admin role (passed via isAdmin) */}
                    {isAdmin && (
                        <button className="menu-item" onClick={() => { onAdminClick?.(); setIsOpen(false); }}>
                            <span className="menu-icon">⚡</span> Admin Mode
                        </button>
                    )}

                    <div className="menu-divider"></div>

                    <button className="menu-item" onClick={() => setIsOpen(false)}>
                        <span className="menu-icon">⚙</span> Settings
                    </button>
                </div>
            )}
        </div>
    );
};

// Keep old export for compatibility
export const SettingsButton = MenuButton;
