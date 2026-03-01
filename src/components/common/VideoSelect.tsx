
import React, { useState, useRef, useEffect } from 'react';
import './VideoSelect.css';

interface VideoSelectProps {
    hasVideo: boolean;
    videoUrl?: string;
    onChange: (hasVideo: boolean) => void;
    className?: string;
}

/** Small YouTube icon SVG */
const YoutubeIcon = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
            <linearGradient id="vs-yt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
        </defs>
        <path
            d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"
            fill="url(#vs-yt-grad)"
        />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
);

/** Dash / none icon */
const NoVideoIcon = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11.5" width="18" height="1.5" rx="0.75" fill="rgba(148,163,184,0.5)" />
    </svg>
);

export const VideoSelect: React.FC<VideoSelectProps> = ({
    hasVideo,
    videoUrl,
    onChange,
    className,
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const shortUrl = videoUrl
        ? videoUrl.replace(/https?:\/\/(www\.)?youtube\.com\/watch\?v=/, 'youtu.be/')
            .replace(/https?:\/\/youtu\.be\//, 'youtu.be/')
            .slice(0, 28)
        : null;

    return (
        <div
            ref={ref}
            className={`video-select ${className ?? ''} ${open ? 'video-select--open' : ''}`}
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
        >
            <button
                type="button"
                className={`video-select__trigger ${hasVideo ? 'video-select__trigger--active' : ''}`}
                onClick={() => setOpen(o => !o)}
                aria-label="Video giải thích"
            >
                {hasVideo ? <YoutubeIcon size={14} /> : <NoVideoIcon size={14} />}
                <span className="video-select__label">
                    {hasVideo ? (shortUrl || 'Có video') : 'Không có video'}
                </span>
                <svg className="video-select__chevron" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="#c8aa6e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <ul className="video-select__dropdown" role="listbox">
                    {/* Option: No video */}
                    <li
                        role="option"
                        aria-selected={!hasVideo}
                        className={`video-select__option ${!hasVideo ? 'video-select__option--active' : ''}`}
                        onClick={() => { onChange(false); setOpen(false); }}
                    >
                        <NoVideoIcon size={14} />
                        <span className="video-select__option-label">Không có video</span>
                        {!hasVideo && (
                            <svg className="video-select__check" width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#c8aa6e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </li>
                    {/* Option: Has video */}
                    <li
                        role="option"
                        aria-selected={hasVideo}
                        className={`video-select__option ${hasVideo ? 'video-select__option--active' : ''}`}
                        onClick={() => { onChange(true); setOpen(false); }}
                    >
                        <YoutubeIcon size={14} />
                        <span className="video-select__option-label" style={{ color: '#f87171' }}>Có giải thích video</span>
                        {hasVideo && (
                            <svg className="video-select__check" width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#c8aa6e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </li>
                </ul>
            )}
        </div>
    );
};

export default VideoSelect;
