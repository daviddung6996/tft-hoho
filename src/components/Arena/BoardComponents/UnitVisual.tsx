import React from 'react';
import { UnitData } from '../../../data/types';
import { AssetImage } from '../../../hooks/useAssetUrl';

export const UnitVisual: React.FC<{ unit: UnitData }> = ({ unit }) => (
    <>
        {/* Stars indicator - outside clip-path */}
        {unit.stars > 1 && (
            <div className={`unit-stars stars-${unit.stars}`}>
                {Array.from({ length: unit.stars }).map((_, i) => (
                    <span key={i} className="star">★</span>
                ))}
            </div>
        )}

        {/* Unit hex with clip-path */}
        <div className={`board-unit cost-${unit.cost}`}>
            <img src={unit.image} alt={unit.name} className="unit-image" draggable={false} />
        </div>


        {/* Items indicator - bottom of unit */}
        {unit.items && unit.items.length > 0 && (
            <div className="unit-items">
                {unit.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="unit-item">
                        <AssetImage
                            type="item"
                            name={item}
                            alt={item}
                            draggable={false}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                borderRadius: '2px'
                            }}
                        />
                    </div>
                ))}
            </div>
        )}
    </>
);
