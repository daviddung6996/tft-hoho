import React from 'react';
import '../DecisionReview.css';

interface ReviewActionsProps {
    onReplay: () => void;
    onNextPuzzle: () => void;
}

export const ReviewActions: React.FC<ReviewActionsProps> = ({ onReplay, onNextPuzzle }) => (
    <>
        <button className="review-btn replay-btn" onClick={onReplay}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6" />
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
            </svg>
            Chơi Lại
        </button>
        <button className="review-btn next-btn" onClick={onNextPuzzle}>
            Tiếp Theo
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
        </button>
    </>
);
