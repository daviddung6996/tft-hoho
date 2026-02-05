import React from 'react';
import goldIconImg from '../../../assets/golds/gold.png';

export const GoldPillarHexes: React.FC<{ goldAmount: number }> = ({ goldAmount }) => {
    const slots = [0, 1, 2, 3, 4];
    const coinsToShow = Math.min(Math.floor(goldAmount / 10), 5);

    return (
        <div className="gold-pillar-container">
            {slots.map((index) => (
                <div key={index} className="gold-pillar-hex" style={{ opacity: index < coinsToShow ? 1 : 0 }}>
                    <img
                        src={goldIconImg}
                        alt={`Gold ${index + 1}`}
                        className="gold-pillar-icon"
                        draggable={false}
                        style={{ width: '120%', height: '120%', objectFit: 'contain' }}
                    />
                </div>
            ))}
        </div>
    );
};

export const GoldPillarHexesPlayer: React.FC<{ goldAmount: number }> = ({ goldAmount }) => {
    const slots = [0, 1, 2, 3, 4];
    const coinsToShow = Math.min(Math.floor(goldAmount / 10), 5);

    return (
        <div className="gold-pillar-container player-side">
            {slots.map((index) => (
                <div key={index} className="gold-pillar-hex" style={{ opacity: index < coinsToShow ? 1 : 0 }}>
                    <img
                        src={goldIconImg}
                        alt={`Player Gold ${index + 1}`}
                        className="gold-pillar-icon"
                        draggable={false}
                        style={{ width: '120%', height: '120%', objectFit: 'contain' }}
                    />
                </div>
            ))}
        </div>
    );
};
