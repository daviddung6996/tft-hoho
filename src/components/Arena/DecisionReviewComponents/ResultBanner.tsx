import React from 'react';
import '../DecisionReview.css';

interface ResultBannerProps {
    userMatchedPro: boolean;
    proPlayerName: string;
}

export const ResultBanner: React.FC<ResultBannerProps> = ({ userMatchedPro, proPlayerName }) => {
    return (
        <div className={`result-banner ${userMatchedPro ? 'matched' : 'diverged'}`}>
            <div className="result-icon">
                {userMatchedPro ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
            </div>
            <div className="result-content">
                <div className="result-label">
                    {userMatchedPro ? 'Chính xác!' : 'Khác lựa chọn'}
                </div>
                <div className="result-message">
                    {userMatchedPro
                        ? `Bạn đã chọn giống ${proPlayerName}`
                        : `Bạn đã chọn khác với ${proPlayerName}`
                    }
                </div>
            </div>
        </div>
    );
};
