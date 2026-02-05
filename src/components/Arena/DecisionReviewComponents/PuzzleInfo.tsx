import React from 'react';
import '../DecisionReview.css';

interface PuzzleInfoProps {
    puzzleId: string;
    patch?: string;
    date?: string;
    server?: string;
    encounter?: string;
    streamUrl?: string;
    userMatchedPro: boolean;
}

export const PuzzleInfo: React.FC<PuzzleInfoProps> = ({
    puzzleId,
    patch,
    date,
    server,
    encounter,
    streamUrl,
    userMatchedPro
}) => {
    return (
        <div className="puzzle-context">
            <div className="context-row">
                {patch && <span className="context-item"><strong>PATCH</strong> {patch}</span>}
                {date && <span className="context-item"><strong>DATE</strong> {date}</span>}
                {server && <span className="context-item"><strong>SERVER</strong> {server}</span>}
                {encounter && <span className="context-item"><strong>ENCOUNTER</strong> {encounter}</span>}
            </div>
            <div className="puzzle-actions">
                {/* Completion Status Badge */}
                <div className={`completion-badge ${userMatchedPro ? 'matched' : 'diverged'}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {userMatchedPro ? (
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        )}
                    </svg>
                    {userMatchedPro ? 'Đã hoàn thành' : 'Đã hoàn thành'}
                </div>

                {/* Share Button */}
                <button
                    className="action-btn share-btn"
                    onClick={() => {
                        const shareUrl = `${window.location.origin}?puzzle=${puzzleId}`;
                        navigator.clipboard.writeText(shareUrl);
                    }}
                    title="Chia sẻ puzzle này"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Chia sẻ
                </button>

                {/* Stream Button */}
                {streamUrl && (
                    <button
                        className="action-btn stream-btn"
                        onClick={() => window.open(streamUrl, '_blank')}
                        title="Xem stream gốc của pro player"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                        </svg>
                        Xem Pro chọn lõi thực tế
                    </button>
                )}
            </div>
        </div>
    );
};
