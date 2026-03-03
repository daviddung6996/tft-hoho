import React from 'react';
import './VideoPlayerModal.css';
import { buildYouTubeEmbedUrl } from '../../../utils/youtube';

interface VideoPlayerModalProps {
    videoUrl: string;
    videoTitle: string;
    proPlayer?: string;
    userResult?: 'correct' | 'incorrect';
    iqDelta?: number;
    onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
    videoUrl,
    videoTitle,
    proPlayer,
    userResult,
    iqDelta,
    onClose,
}) => {
    return (
        <div className="video-player-overlay" onClick={onClose}>
            <div className="video-player-modal" onClick={e => e.stopPropagation()}>
                <button className="video-player-close" onClick={onClose}>✕</button>

                <div className="video-player-header">
                    <h3 className="video-player-title">{videoTitle}</h3>
                    <div className="video-player-meta">
                        {proPlayer && <span className="video-player-pro">by {proPlayer}</span>}
                        {userResult && (
                            <span className={`video-player-result ${userResult}`}>
                                {userResult === 'correct' ? '✓ Đúng' : '✗ Bạn đã trả lời sai câu này.'}
                                {iqDelta !== undefined && ` (${iqDelta > 0 ? '+' : ''}${iqDelta} IQ)`}
                            </span>
                        )}
                    </div>
                </div>

                <div className="video-player-container">
                    <iframe
                        src={buildYouTubeEmbedUrl(videoUrl, { autoplay: true })}
                        title={videoTitle}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
};
