import React from 'react';
import './AugmentButton.css';

interface AugmentButtonProps {
    isActive: boolean;
    onClick: () => void;
}

export const AugmentButton: React.FC<AugmentButtonProps> = ({ isActive, onClick }) => {
    return (
        <button
            className={`augment-button ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className="augment-button-content">
                {/* Deck/Cards Icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H16C17.1 21 18 20.1 18 19V5C18 3.9 17.1 3 16 3Z"
                        fill="currentColor" fillOpacity="0.8" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M21 5V19C21 20.1 20.1 21 19 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div>
        </button>
    );
};
