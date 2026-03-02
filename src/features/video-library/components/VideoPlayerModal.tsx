import React from 'react';
import './VideoPlayerModal.css';

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
    // Convert YouTube watch URLs to embed URLs
    const getEmbedUrl = (url: string): string => {
        try {
            const u = new URL(url);
            if (u.hostname.includes('youtube.com') && u.pathname === '/watch') {
                const videoId = u.searchParams.get('v');
                if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            }
            if (u.hostname.includes('youtu.be')) {
                return `https://www.youtube.com/embed${u.pathname}?autoplay=1`;
            }
            // Already an embed URL or other video source
            if (url.includes('/embed/') && !url.includes('autoplay')) {
                return `${url}?autoplay=1`;
            }
        } catch {
            // Not a valid URL, return as-is
        }
        return url;
    };

    return (
        <div className="video-player-overlay" onClick={onClose}>
            <div className="video-player-modal" onClick={e => e.stopPropagation()}>
                {/* Close button */}
                <button className="video-player-close" onClick={onClose}>✕</button>

                {/* Header */}
                <div className="video-player-header">
                    <h3 className="video-player-title">{videoTitle}</h3>
                    <div className="video-player-meta">
                        {proPlayer && <span className="video-player-pro">by {proPlayer}</span>}
                        {userResult && (
                            <span className={`video-player-result ${userResult}`}>
                                {userResult === 'correct' ? '✓ Đúng' : '✗ Sai'}
                                {iqDelta !== undefined && ` (${iqDelta > 0 ? '+' : ''}${iqDelta} IQ)`}
                            </span>
                        )}
                    </div>
                </div>

                {/* Video embed */}
                <div className="video-player-container">
                    <iframe
                        src={getEmbedUrl(videoUrl)}
                        title={videoTitle}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
};
