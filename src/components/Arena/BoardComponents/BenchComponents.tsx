import React from 'react';
import { UnitData } from '../../../data/types';
import { UnitVisual } from './UnitVisual';

const BENCH_SLOTS = 9;

interface BenchProps {
    units?: UnitData[];
    isMirrored?: boolean;
    config: { WIDTH: number; HEIGHT: number };
}

export const BenchArea: React.FC<BenchProps> = ({ units = [], isMirrored = false, config }) => {
    return (
        <div className={`bench-container ${isMirrored ? 'mirrored' : ''}`}>
            {Array.from({ length: BENCH_SLOTS }).map((_, i) => {
                const unit = units.find(u => u.col === i);
                return (
                    <div
                        key={i}
                        className="bench-slot"
                        style={{
                            width: `${config.WIDTH}cqw`,
                            height: `${config.HEIGHT}cqw`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative'
                        }}
                    >
                        {/* Background Hex - Has Clip Path */}
                        <div
                            className={!isMirrored ? 'hex-cell' : ''}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        />

                        {/* Unit Container - No Clip Path on Wrapper */}
                        {unit && (
                            <div className="bench-unit-wrapper" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 5 }}>
                                <UnitVisual unit={unit} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export const OpponentBenchArea: React.FC<{ units?: UnitData[], config: { WIDTH: number; HEIGHT: number } }> = ({ units = [], config }) => {
    return (
        <div className="opponent-bench-container">
            {Array.from({ length: BENCH_SLOTS }).map((_, i) => {
                const unit = units.find(u => u.col === i);
                return (
                    <div
                        key={i}
                        className="bench-slot"
                        style={{
                            width: `${config.WIDTH}cqw`,
                            height: `${config.HEIGHT}cqw`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative'
                        }}
                    >
                        {/* Background Hex */}
                        <div
                            className="hex-cell"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        />

                        {/* Unit Container */}
                        {unit && (
                            <div className="bench-unit-wrapper" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 5 }}>
                                <UnitVisual unit={unit} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
