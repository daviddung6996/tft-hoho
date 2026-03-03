import React, { useState } from 'react';
import '../DecisionReview.css';

interface PuzzleInfoProps {
    puzzleId: string;
    patch?: string;
    date?: string;
    server?: string;
    encounter?: string;
    streamUrl?: string;
    onViewLibrary?: () => void;
    userMatchedPro: boolean;
}

export const PuzzleInfo: React.FC<PuzzleInfoProps> = ({
    puzzleId,
    patch,
    date,
    server,
    encounter,
    streamUrl,
    onViewLibrary,
    userMatchedPro
}) => {
    const [copied, setCopied] = useState(false);

    const handleSharePuzzle = () => {
        const shareUrl = `${window.location.origin}?puzzle=${puzzleId}`;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const canOpenProPick = Boolean(onViewLibrary || streamUrl);
    const handleOpenProPick = () => {
        if (onViewLibrary) {
            onViewLibrary();
            return;
        }

        if (streamUrl) {
            window.open(streamUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="puzzle-context">
            <div className="context-row">
                {patch && <span className="context-item"><strong>PHIÊN BẢN</strong> {patch}</span>}
                {date && <span className="context-item"><strong>NGÀY</strong> {date}</span>}
                {server && <span className="context-item"><strong>MÁY CHỦ</strong> {server}</span>}
                {encounter && <span className="context-item"><strong>SỰ KIỆN</strong> {encounter}</span>}
            </div>
            <div className="puzzle-actions">
                <div className={`completion-badge ${userMatchedPro ? 'matched' : 'diverged'}`}>
                    {userMatchedPro ? (
                        <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Đã hoàn thành
                        </>
                    ) : (
                        <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 7v5m0 4h.01" strokeLinecap="round" />
                            </svg>
                            Đã hoàn thành
                        </>
                    )}
                </div>

                <button
                    className="action-btn puzzle-share-btn"
                    onClick={handleSharePuzzle}
                    title="Chia sẻ puzzle này"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {copied ? 'Đã sao chép' : 'Chia sẻ câu đố'}
                </button>

                {canOpenProPick && (
                    <button
                        className="action-btn stream-btn"
                        onClick={handleOpenProPick}
                        title="Xem Pro chọn lõi trực tiếp"
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
