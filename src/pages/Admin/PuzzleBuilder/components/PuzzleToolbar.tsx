import React from 'react';
import './PuzzleToolbar.css';

interface PuzzleToolbarProps {
    level: number;
    gold: number;
    hp: number;
    onChange: (key: 'level' | 'gold' | 'hp', value: number) => void;
    onClearBoard: () => void;
}

const PuzzleToolbar: React.FC<PuzzleToolbarProps> = ({
    level,
    gold,
    hp,
    onChange,
    onClearBoard
}) => {
    return (
        <div className="puzzle-toolbar">
            {/* Left Actions Group */}
            <div className="pt-group left">
                <button className="pt-btn" onClick={onClearBoard}>
                    <span className="pt-icon">×</span>
                    Clear Board
                </button>
                {/* Placeholder for future actions to match the 'busy' look of the inspiration */}
                <button className="pt-btn disabled" disabled>Import Code</button>
                <button className="pt-btn disabled" disabled>Export Code</button>
            </div>

            {/* Right Inputs Group */}
            <div className="pt-group right">
                <div className="pt-input-wrapper">
                    <label>Level</label>
                    <input
                        type="number"
                        value={level}
                        onChange={(e) => onChange('level', parseInt(e.target.value) || 1)}
                        min={1}
                        max={11}
                    />
                </div>
                <div className="pt-input-wrapper">
                    <label>Gold</label>
                    <input
                        type="number"
                        value={gold}
                        onChange={(e) => onChange('gold', parseInt(e.target.value) || 0)}
                        min={0}
                        max={999}
                    />
                </div>
                <div className="pt-input-wrapper">
                    <label>Health</label>
                    <input
                        type="number"
                        value={hp}
                        onChange={(e) => onChange('hp', parseInt(e.target.value) || 1)}
                        min={1}
                        max={100}
                    />
                </div>
            </div>
        </div>
    );
};

export default PuzzleToolbar;
