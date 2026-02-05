import React, { useEffect } from 'react';
import './Toast.css';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`hextech-toast ${type}`}>
            <span className="toast-icon">
                {type === 'success' && '✓'}
                {type === 'error' && '⚠'}
                {type === 'info' && 'ℹ'}
            </span>
            <span>{message}</span>
        </div>
    );
};

export default Toast;
