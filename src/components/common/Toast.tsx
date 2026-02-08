import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
    actionLabel?: string;
    onAction?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000, actionLabel, onAction }) => {
    useEffect(() => {
        // Don't auto-close if there's an action button
        if (actionLabel && onAction) return;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose, actionLabel, onAction]);

    const toastElement = (
        <div className={`hextech-toast ${type}`}>
            <span className="toast-icon">
                {type === 'success' && '✓'}
                {type === 'error' && '⚠'}
                {type === 'info' && 'ℹ'}
            </span>
            <span className="toast-message">{message}</span>
            {actionLabel && onAction && (
                <button
                    className="toast-action-btn"
                    onClick={() => {
                        onAction();
                        onClose();
                    }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );

    // Use Portal to render outside of parent containers with overflow:hidden
    return createPortal(toastElement, document.body);
};

export default Toast;
