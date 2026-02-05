import React, { useState } from 'react';
import './HexPuzzle.css';

interface HexPuzzleProps {
    onSolved: () => void;
    onFailed: () => void;
}

// Hex colors for visual distinction
const HEX_COLORS = ['#00A3FF', '#C89B3C', '#FF4E50', '#00F0FF'];
const SOLUTION = [0, 2, 1, 3]; // Correct order

export const HexPuzzle: React.FC<HexPuzzleProps> = ({ onSolved, onFailed }) => {
    const [hexOrder, setHexOrder] = useState<number[]>([0, 1, 2, 3]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (targetIndex: number) => {
        if (draggedIndex === null) return;

        const newOrder = [...hexOrder];
        const draggedValue = newOrder[draggedIndex];
        newOrder[draggedIndex] = newOrder[targetIndex];
        newOrder[targetIndex] = draggedValue;

        setHexOrder(newOrder);
        setDraggedIndex(null);
    };

    const checkSolution = () => {
        setIsChecking(true);

        setTimeout(() => {
            const isCorrect = hexOrder.every((val, idx) => val === SOLUTION[idx]);

            if (isCorrect) {
                onSolved();
            } else {
                onFailed();
                // Reset after a delay
                setTimeout(() => {
                    setHexOrder([0, 1, 2, 3]);
                    setIsChecking(false);
                }, 1000);
            }
        }, 500);
    };

    return (
        <div className="hex-puzzle">
            <p className="hex-puzzle-instruction">
                Arrange the hexagons in the correct order to unlock admin access
            </p>

            <div className="hex-puzzle-grid">
                {hexOrder.map((hexValue, index) => (
                    <div
                        key={index}
                        className={`hex-puzzle-slot ${isChecking ? 'checking' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                    >
                        <div
                            className="hex-puzzle-piece"
                            draggable={!isChecking}
                            onDragStart={() => handleDragStart(index)}
                            style={{
                                backgroundColor: HEX_COLORS[hexValue],
                                cursor: isChecking ? 'not-allowed' : 'grab'
                            }}
                        >
                            {hexValue + 1}
                        </div>
                    </div>
                ))}
            </div>

            <button
                className="hex-puzzle-check-btn"
                onClick={checkSolution}
                disabled={isChecking}
            >
                {isChecking ? 'Checking...' : 'Verify Solution'}
            </button>
        </div>
    );
};
