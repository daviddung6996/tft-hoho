import React from 'react';
import './GoldDisplay.css';

interface GoldDisplayProps {
    gold: number;
}

const GoldCoinIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer coin ring */}
        <circle cx="10" cy="10" r="9" fill="#c8aa6e" />
        <circle cx="10" cy="10" r="7.5" fill="#e8c252" />
        {/* Inner detail */}
        <circle cx="10" cy="10" r="5.5" fill="none" stroke="#c8aa6e" strokeWidth="0.8" />
        {/* Center emblem */}
        <circle cx="10" cy="10" r="3" fill="#f0d878" />
        <circle cx="10" cy="10" r="1.5" fill="#c8aa6e" opacity="0.6" />
        {/* Highlight */}
        <ellipse cx="8" cy="7.5" rx="2.5" ry="1.5" fill="white" opacity="0.25" transform="rotate(-15 8 7.5)" />
    </svg>
);

export const GoldDisplay: React.FC<GoldDisplayProps> = ({ gold }) => {
    return (
        <div className="gold-display">
            <GoldCoinIcon />
            <span className="gold-display-amount">{gold}</span>
        </div>
    );
};
