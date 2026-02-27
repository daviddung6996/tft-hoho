import React, { useEffect, useState } from 'react';
import './IqChangeAnimation.css';

interface IqChangeAnimationProps {
    changeAmount: number;
    onComplete?: () => void;
}

export const IqChangeAnimation: React.FC<IqChangeAnimationProps> = ({ changeAmount, onComplete }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger animation
        setVisible(true);

        const timer = setTimeout(() => {
            setVisible(false);
            if (onComplete) onComplete();
        }, 3000); // 3 seconds total display

        return () => clearTimeout(timer);
    }, [changeAmount, onComplete]);

    if (!visible || changeAmount === 0) return null;

    const isPositive = changeAmount > 0;
    const sign = isPositive ? '+' : '';
    const displayClass = isPositive ? 'iq-positive' : 'iq-negative';

    return (
        <div className={`iq-change-animation-container ${displayClass}`}>
            <div className="iq-change-text">
                <span className="iq-label">TFT IQ</span>
                <span className="iq-value">{sign}{changeAmount}</span>
            </div>
        </div>
    );
};
