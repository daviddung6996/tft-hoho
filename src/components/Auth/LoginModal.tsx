import React, { useState, useEffect } from 'react';
import './LoginModal.css';
import { authenticateUser, saveAuthToken } from '../../data/mockAuth';

interface LoginModalProps {
    onLoginSuccess: (role: 'user' | 'admin', displayName: string) => void;
    onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const user = authenticateUser(username, password);

        if (!user) {
            setError('Invalid username or password');
            return;
        }

        saveAuthToken(user);
        onLoginSuccess(user.role, user.displayName);
    };

    return (
        <div className="login-overlay" onClick={onClose}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                {/* Title Bar */}
                <div className="login-title-bar">
                    <h1 className="login-title">TFT HOHO</h1>
                </div>

                {/* Close Button */}
                {onClose && (
                    <button className="login-close-btn" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                )}

                {/* Content */}
                <div className="login-modal-content">
                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="login-field">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                            />
                        </div>

                        {error && <div className="login-error">{error}</div>}

                        <button type="submit" className="login-submit">
                            Login
                        </button>

                        <div className="login-demo-hint">
                            <p>Demo Credentials:</p>
                            <p><strong>Username:</strong> player1 or admin</p>
                            <p><strong>Password:</strong> demo123 or admin123</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
