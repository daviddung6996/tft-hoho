import React, { useState } from 'react';
import { VideoLibraryItem } from '../videoLibrary.types';
import { TierIcon } from '../../../components/common/TierIcon';
import './VideoCard.css';

interface VideoCardProps {
    item: VideoLibraryItem;
    onClick: (item: VideoLibraryItem) => void;
}

export const VideoCard = React.memo<VideoCardProps>(({ item, onClick }) => {
    const [imgLoaded, setImgLoaded] = useState(false);

    const tierClass = item.puzzleTier && item.puzzleTier !== 'free'
        ? `tier-${item.puzzleTier}-card`
        : '';

    return (
        <div
            className={`video-card ${item.isUnlocked ? 'unlocked' : 'locked'} ${tierClass}`}
            onClick={item.isUnlocked ? () => onClick(item) : undefined}
        >
            {/* Thumbnail */}
            <div className="video-card-thumbnail">
                {item.videoThumbnailUrl ? (
                    <img
                        src={item.videoThumbnailUrl}
                        alt={item.videoTitle}
                        loading="lazy"
                        decoding="async"
                        onLoad={() => setImgLoaded(true)}
                        style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.25s ease' }}
                    />
                ) : (
                    <div className="video-card-placeholder">📺</div>
                )}

                {/* Lock overlay */}
                {!item.isUnlocked && (
                    <div className="video-card-lock-overlay">
                        <span className="video-card-lock-icon">🔒</span>
                        <span className="video-card-lock-text">Giải puzzle để mở</span>
                    </div>
                )}

                {/* Play button for unlocked */}
                {item.isUnlocked && (
                    <div className="video-card-play-overlay">
                        <span className="video-card-play-icon">▶</span>
                    </div>
                )}

                {/* Tier badge */}
                {item.puzzleTier && item.puzzleTier !== 'free' && (
                    <div className={`video-card-tier tier-${item.puzzleTier}`}>
                        <TierIcon tier={item.puzzleTier} size={12} />
                        <span>{item.puzzleTier === 'advanced' ? 'Advanced' : 'Rare'}</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="video-card-info">
                <h4 className="video-card-title">{item.videoTitle}</h4>
                {item.proPlayer && (
                    <span className="video-card-meta">{item.proPlayer} {item.stage ? `• ${item.stage}` : ''}</span>
                )}
                {item.isUnlocked && item.userResult && (
                    <span className={`video-card-result ${item.userResult}`}>
                        {item.userResult === 'correct' ? '✓ Đúng' : '✗ Sai'}
                        {item.iqDelta !== undefined && ` (${item.iqDelta > 0 ? '+' : ''}${item.iqDelta} IQ)`}
                    </span>
                )}
            </div>
        </div>
    );
});
