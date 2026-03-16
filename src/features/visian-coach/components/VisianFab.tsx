import React from 'react';
import './VisianFab.css';

interface VisianFabProps {
    isOpen: boolean;
    onClick: () => void;
}

export const VisianFab: React.FC<VisianFabProps> = ({ isOpen, onClick }) => {
    return (
        <button
            className={`visian-fab${isOpen ? ' visian-fab--active' : ''}`}
            onClick={onClick}
            aria-label={isOpen ? 'Đóng Visian' : 'Hỏi Visian'}
        >
            <svg
                className="visian-fab__icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {isOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                ) : (
                    <>
                        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="11.5" r="1" fill="currentColor" />
                        <circle cx="8" cy="11.5" r="1" fill="currentColor" />
                        <circle cx="16" cy="11.5" r="1" fill="currentColor" />
                    </>
                )}
            </svg>
            {!isOpen && <span className="visian-fab__label">Hỏi Visian</span>}
        </button>
    );
};
