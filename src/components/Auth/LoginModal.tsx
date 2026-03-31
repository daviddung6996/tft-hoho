import React, { useState } from 'react';
import './LoginModal.css';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const { signIn, signUp, signInWithGoogle, continueAsGuest } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGuestLogin = () => {
        continueAsGuest();
        onClose();
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            if (mode === 'signin') {
                await signIn(email, password);
            } else {
                await signUp(email, password, displayName || email.split('@')[0]);
                setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
                setEmail('');
                setPassword('');
                setDisplayName('');
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            const errorMessage = err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            if (errorMessage.includes('Invalid login credentials')) {
                setError('Sai email hoặc mật khẩu');
            } else if (errorMessage.includes('Email not confirmed')) {
                setError('Vui lòng xác nhận email trước khi đăng nhập');
            } else if (errorMessage.includes('User already registered')) {
                setError('Email này đã được đăng ký');
            } else if (errorMessage.includes('Password should be at least 6 characters')) {
                setError('Mật khẩu phải có ít nhất 6 ký tự');
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            console.error('Google sign-in error:', err);
            setError(err.message || 'Đăng nhập Google thất bại.');
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setError('');
        setSuccessMessage('');
        setEmail('');
        setPassword('');
        setDisplayName('');
    };

    return (
        <div className="login-overlay">
            <div className="login-landing" onClick={(e) => e.stopPropagation()}>

                {/* === HERO SECTION === */}
                <div className="login-hero">
                    {/* Decorative corner accents */}
                    <div className="hero-corner hero-corner-tl" />
                    <div className="hero-corner hero-corner-tr" />
                    <div className="hero-corner hero-corner-bl" />
                    <div className="hero-corner hero-corner-br" />

                    <div className="hero-badge">SET 17</div>

                    <h1 className="hero-title">
                        <span className="hero-title-sub">Teamfight Tactics</span>
                        TFT HOHO
                    </h1>

                    <p className="hero-tagline">
                        Bạn có đoán được <strong>Pro</strong> chọn gì không?
                    </p>

                    {/* Feature pills */}
                    <div className="hero-features">
                        <span className="feature-text">Học Augment selection từ Pro</span>
                        <span className="feature-dot" />
                        <span className="feature-text">Học Line selection từ Pro</span>
                        <span className="feature-dot" />
                        <span className="feature-text">So sánh cộng đồng</span>
                    </div>
                </div>

                {/* === CTA SECTION === */}
                <div className="login-cta-section">
                    <button
                        type="button"
                        className="login-play-button"
                        onClick={handleGuestLogin}
                        disabled={isLoading}
                    >
                        <span className="play-btn-glow" />
                        <span className="play-btn-text">CHƠI NGAY</span>
                        <span className="play-btn-sub">Miễn phí, không cần tài khoản</span>
                    </button>
                </div>

                {/* === LOGIN OPTIONS === */}
                <div className="login-options">
                    {!showForm ? (
                        <>
                            <div className="login-divider">
                                <span>hoặc đăng nhập để theo dõi tiến trình</span>
                            </div>

                            <div className="login-quick-actions">
                                <button
                                    type="button"
                                    className="login-google"
                                    onClick={handleGoogleSignIn}
                                    disabled={isLoading}
                                >
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Google
                                </button>

                                <button
                                    type="button"
                                    className="login-email-toggle"
                                    onClick={() => setShowForm(true)}
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="M22 4L12 13L2 4" />
                                    </svg>
                                    Email
                                </button>
                            </div>

                            <p className="login-register-hint">
                                Chưa có tài khoản?{' '}
                                <button type="button" onClick={() => { setShowForm(true); setMode('signup'); }}>
                                    Đăng ký ngay
                                </button>
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="login-divider">
                                <span>{mode === 'signin' ? 'Đăng nhập bằng Email' : 'Đăng ký tài khoản'}</span>
                            </div>

                            <form className="login-form" onSubmit={handleSubmit}>
                                {mode === 'signup' && (
                                    <div className="login-field">
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Tên hiển thị"
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}

                                <div className="login-field">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="login-field">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mật khẩu"
                                        required
                                        disabled={isLoading}
                                        minLength={6}
                                    />
                                </div>

                                {error && <div className="login-error">{error}</div>}
                                {successMessage && <div className="login-success">{successMessage}</div>}

                                <button type="submit" className="login-submit" disabled={isLoading}>
                                    {isLoading ? 'Đang xử lý...' : mode === 'signin' ? 'Đăng nhập' : 'Đăng ký'}
                                </button>

                                <div className="login-form-footer">
                                    <button type="button" className="login-back-btn" onClick={() => setShowForm(false)}>
                                        ← Quay lại
                                    </button>
                                    <button type="button" className="login-toggle-btn" onClick={toggleMode} disabled={isLoading}>
                                        {mode === 'signin' ? 'Tạo tài khoản' : 'Đã có tài khoản'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
