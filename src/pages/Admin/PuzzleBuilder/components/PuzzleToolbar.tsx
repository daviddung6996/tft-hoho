import React from 'react';
import './PuzzleToolbar.css';
import { sanitizePlayerLevel, sanitizePlayerXp } from '../../../../features/puzzle/playerLevel';

interface PuzzleToolbarProps {
    level: number;
    gold: number;
    hp: number;
    xp: number;
    onChange: (key: 'level' | 'gold' | 'hp' | 'xp', value: number) => void;
    onClearBoard: () => void;
    onClearBrokenUnits?: () => void;
    brokenUnitCount?: number;
}

const PuzzleToolbar: React.FC<PuzzleToolbarProps> = ({
    level,
    gold,
    hp,
    xp,
    onChange,
    onClearBoard,
    onClearBrokenUnits,
    brokenUnitCount = 0,
}) => {
    return (
        <div className="puzzle-toolbar">
            <div className="pt-group left">
                <button className="pt-btn" onClick={onClearBoard}>
                    <span className="pt-icon">x</span>
                    Xoa ban co
                </button>
                {onClearBrokenUnits && brokenUnitCount > 0 && (
                    <button
                        className="pt-btn"
                        onClick={onClearBrokenUnits}
                        style={{ color: '#ff6b6b', borderColor: '#ff6b6b' }}
                        title="Xóa các unit bị lỗi do import JSON"
                    >
                        Xóa {brokenUnitCount} unit lỗi
                    </button>
                )}
                <button className="pt-btn disabled" disabled>Nhap ma</button>
                <button className="pt-btn disabled" disabled>Xuat ma</button>
            </div>

            <div className="pt-group right">
                <div className="pt-input-wrapper">
                    <label>Cap</label>
                    <input
                        type="number"
                        value={level}
                        onChange={(e) => onChange('level', sanitizePlayerLevel(parseInt(e.target.value, 10) || 1))}
                        min={1}
                        max={10}
                    />
                </div>
                <div className="pt-input-wrapper">
                    <label>Vang</label>
                    <input
                        type="number"
                        value={gold}
                        onChange={(e) => onChange('gold', parseInt(e.target.value, 10) || 0)}
                        min={0}
                        max={999}
                    />
                </div>
                <div className="pt-input-wrapper">
                    <label>XP</label>
                    <input
                        type="number"
                        value={xp}
                        onChange={(e) => onChange('xp', sanitizePlayerXp(parseInt(e.target.value, 10) || 0, level))}
                        min={0}
                    />
                </div>
                <div className="pt-input-wrapper">
                    <label>Mau</label>
                    <input
                        type="number"
                        value={hp}
                        onChange={(e) => onChange('hp', parseInt(e.target.value, 10) || 1)}
                        min={1}
                        max={100}
                    />
                </div>
            </div>
        </div>
    );
};

export default PuzzleToolbar;
