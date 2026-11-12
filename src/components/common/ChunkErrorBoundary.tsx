import { Component, type ErrorInfo, type ReactNode } from 'react';
import { clearChunkReloadGuard, isChunkReloadPending } from '../../utils/chunkRecovery';

interface ChunkErrorBoundaryProps {
    children: ReactNode;
    onDismiss?: () => void;
}

interface ChunkErrorBoundaryState {
    hasError: boolean;
}

export class ChunkErrorBoundary extends Component<
    ChunkErrorBoundaryProps,
    ChunkErrorBoundaryState
> {
    state: ChunkErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ChunkErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ChunkErrorBoundary]', error, info.componentStack);
    }

    private handleReload = () => {
        clearChunkReloadGuard();
        window.location.reload();
    };

    private handleDismiss = () => {
        this.setState({ hasError: false });
        this.props.onDismiss?.();
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }
        if (isChunkReloadPending()) {
            return null;
        }

        return (
            <div
                role="alert"
                style={{
                    position: 'fixed',
                    inset: 0,
                    background:
                        'radial-gradient(ellipse at 50% 30%, rgba(200, 170, 110, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(21, 58, 62, 0.25) 0%, transparent 50%), rgba(0, 0, 0, 0.78)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '24px',
                    zIndex: 9999,
                    backdropFilter: 'blur(8px)',
                    animation: 'hex-overlay-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                <div
                    className="hex-panel"
                    style={{
                        width: 'min(420px, 92vw)',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        border: '1px solid rgba(200, 170, 110, 0.45)',
                        background: '#000000',
                        textAlign: 'center',
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            color: '#E7DED1',
                            fontFamily: 'Spectral, serif',
                            fontSize: '1.2rem',
                            letterSpacing: '0.04em',
                        }}
                    >
                        Phiên bản mới đã được cập nhật
                    </h3>
                    <p
                        style={{
                            margin: 0,
                            color: '#F0F6FC',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.92rem',
                            lineHeight: 1.55,
                        }}
                    >
                        Không thể tải phần giao diện do trang vừa được cập nhật hoặc mất kết nối. Vui lòng tải lại trang.
                    </p>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        <button
                            type="button"
                            className="hex-button primary"
                            onClick={this.handleReload}
                        >
                            Tải lại trang
                        </button>
                        {this.props.onDismiss && (
                            <button
                                type="button"
                                className="hex-button"
                                onClick={this.handleDismiss}
                            >
                                Đóng
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
