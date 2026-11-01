import React from 'react';

interface AdminDeleteModalProps {
    isOpen: boolean;
    itemName: string;
    isDeleting?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const AdminDeleteModal: React.FC<AdminDeleteModalProps> = ({ isOpen, itemName, isDeleting, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.78)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(8px)',
            animation: 'hex-overlay-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <div className="hex-panel" style={{
                width: '400px',
                padding: '0', // Reset padding for header/body split
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid var(--tui-border)',
                background: '#000000',
                borderRadius: '0',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid rgb(var(--tui-bone-rgb) / 0.3)',
                    textAlign: 'center'
                }}>
                    <h3 style={{
                        color: 'var(--tui-bone)',
                        margin: 0,
                        fontFamily: 'Spectral, serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '1.25rem'
                    }}>
                        Xác nhận xoá
                    </h3>
                </div>

                <div style={{ padding: '2rem 1.5rem' }}>
                    <p style={{
                        color: 'var(--tui-bone)',
                        textAlign: 'center',
                        lineHeight: '1.6',
                        margin: 0,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        Bạn có chắc muốn xoá <br />
                        <strong style={{
                            color: '#FF4E50', // Warning Red
                            fontSize: '1.1em',
                            display: 'block',
                            margin: '0.5rem 0'
                        }}>{itemName}</strong>
                        <span style={{ fontSize: '0.9em', color: 'var(--tui-text-secondary)', display: 'block' }}>
                            Hành động này không thể hoàn tác.
                        </span>
                    </p>
                </div>

                <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid rgb(var(--tui-bone-rgb) / 0.3)',
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.2)'
                }}>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: '1px solid var(--tui-primary)',
                            color: 'var(--tui-primary)',
                            padding: '0.6rem 1rem',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            textTransform: 'uppercase',
                            fontSize: '0.9rem',
                            borderRadius: '2px',
                            transition: 'all 0.2s'
                        }}
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        style={{
                            flex: 1,
                            background: 'linear-gradient(180deg, #FF4E50 0%, #C0392B 100%)', // Danger Red
                            border: '1px solid #FF4E50',
                            color: '#FFFFFF',
                            padding: '0.6rem 1rem',
                            cursor: isDeleting ? 'wait' : 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            fontSize: '0.9rem',
                            borderRadius: '2px',
                            boxShadow: '0 0 10px rgba(255, 78, 80, 0.4)',
                            transition: 'all 0.2s',
                            opacity: isDeleting ? 0.7 : 1
                        }}
                    >
                        {isDeleting ? 'Đang xoá...' : 'Xoá'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDeleteModal;
