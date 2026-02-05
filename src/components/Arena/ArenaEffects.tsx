import React from 'react';
import './ArenaEffects.css';

/**
 * ArenaEffects Component
 * 
 * Renders a simple static background for the TFT arena.
 * No animations to prevent flickering.
 */

export const ArenaEffects: React.FC = () => {
    return (
        <div className="arena-effects-container">
            <div className="static-background" />
        </div>
    );
};
