
import React, { useState, useEffect } from 'react';
import './VideoExplanationModal.css';

interface VideoExplanationModalProps {
    initialUrl?: string;
    onSave: (url: string) => void;
    onClose: () => void;
}

/** Extract YouTube video ID from various URL formats */
function extractYouTubeId(url: string): string | null {
    if (!url) return null;
    // Standard watch URL
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return watchMatch[1];
    // Just a video ID (11 chars)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
    return null;
}

export const VideoExplanationModal: React.FC<VideoExplanationModalProps> = ({
    initialUrl = '',
    onSave,
    onClose,
}) => {
    const [url, setUrl] = useState(initialUrl);
    const [videoId, setVideoId] = useState<string | null>(extractYouTubeId(initialUrl));
    const [embedError, setEmbedError] = useState(false);

    useEffect(() => {
        const id = extractYouTubeId(url);
        setVideoId(id);
        setEmbedError(false);
    }, [url]);

    const handleSave = () => {
        onSave(url.trim());
        onClose();
    };

    const handleClear = () => {
        onSave('');
        onClose();
    };

    return (
        <div className="vem-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="vem-panel">
                {/* Header */}
                <div className="vem-header">
                    <div className="vem-header-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <defs>
                                <linearGradient id="yt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#c8aa6e" />
                                    <stop offset="100%" stopColor="#7a5c28" />
                                </linearGradient>
                            </defs>
                            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="url(#yt-grad)" stroke="rgba(200,170,110,0.5)" strokeWidth="0.5" />
                            <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#051c1e" />
                        </svg>
                    </div>
                    <h3 className="vem-title">Giải Thích Bằng Video</h3>
                    <button className="vem-close" onClick={onClose} aria-label="Đóng">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 1l12 12M13 1L1 13" stroke="#c8aa6e" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="vem-body">
                    <div className="vem-field">
                        <label className="vem-label">Link YouTube (Unlisted)</label>
                        <div className="vem-input-row">
                            <input
                                className="vem-input"
                                type="url"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="https://youtu.be/xxxxxxxxxxx"
                                autoFocus
                                spellCheck={false}
                            />
                            {url && (
                                <button
                                    type="button"
                                    className="vem-clear-btn"
                                    onClick={() => setUrl('')}
                                    title="Xoá URL"
                                >
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M1 1l10 10M11 1L1 11" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <p className="vem-hint">
                            Dùng YouTube Unlisted để host video giải thích private. Hỗ trợ: youtu.be/ID, youtube.com/watch?v=ID
                        </p>
                    </div>

                    {/* Preview */}
                    <div className="vem-preview-section">
                        <div className="vem-preview-label">
                            <span>Preview</span>
                            {videoId && <span className="vem-preview-id">ID: {videoId}</span>}
                        </div>

                        {videoId && !embedError ? (
                            <div className="vem-embed-wrapper">
                                <iframe
                                    key={videoId}
                                    className="vem-embed"
                                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                                    title="YouTube video preview"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    onError={() => setEmbedError(true)}
                                />
                            </div>
                        ) : embedError ? (
                            <div className="vem-preview-empty vem-preview-error">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1.5" />
                                    <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                <span>Không load được video. Kiểm tra lại URL hoặc quyền riêng tư.</span>
                            </div>
                        ) : (
                            <div className="vem-preview-empty">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" stroke="rgba(200,170,110,0.3)" strokeWidth="1.5" fill="none" />
                                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="rgba(200,170,110,0.2)" />
                                </svg>
                                <span>Nhập URL để xem preview video</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="vem-footer">
                    {initialUrl && (
                        <button type="button" className="vem-btn vem-btn--danger" onClick={handleClear}>
                            Xoá Video
                        </button>
                    )}
                    <div className="vem-footer-right">
                        <button type="button" className="vem-btn vem-btn--cancel" onClick={onClose}>
                            Huỷ
                        </button>
                        <button
                            type="button"
                            className="vem-btn vem-btn--save"
                            onClick={handleSave}
                            disabled={!!url && !videoId}
                        >
                            Lưu Video
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoExplanationModal;
