import React, { useEffect, useMemo, useState } from 'react';
import { VideoLibraryItem } from '../videoLibrary.types';
import { TierIcon } from '../../../components/common/TierIcon';
import './VideoCard.css';
import { extractYouTubeVideoId } from '../../../utils/youtube';

interface VideoCardProps {
    item: VideoLibraryItem;
    onClick: (item: VideoLibraryItem) => void;
}

function getThumbnailCandidates(videoThumbnailUrl: string, videoUrl: string): string[] {
    const candidates: string[] = [];
    const explicitThumbnail = videoThumbnailUrl.trim();

    if (explicitThumbnail) {
        candidates.push(explicitThumbnail);
    }

    const videoId = extractYouTubeVideoId(videoUrl);
    if (videoId) {
        candidates.push(
            `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        );
    }

    return [...new Set(candidates)];
}

export const VideoCard = React.memo<VideoCardProps>(({ item, onClick }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [thumbnailIndex, setThumbnailIndex] = useState(0);

    const tierClass = item.puzzleTier && item.puzzleTier !== 'free'
        ? `tier-${item.puzzleTier}-card`
        : '';

    const thumbnailCandidates = useMemo(
        () => getThumbnailCandidates(item.videoThumbnailUrl, item.videoUrl),
        [item.videoThumbnailUrl, item.videoUrl],
    );

    const currentThumbnail = thumbnailCandidates[thumbnailIndex];

    useEffect(() => {
        setImgLoaded(false);
        setThumbnailIndex(0);
    }, [thumbnailCandidates]);

    const handleThumbnailError = () => {
        if (thumbnailIndex < thumbnailCandidates.length - 1) {
            setThumbnailIndex(prev => prev + 1);
            setImgLoaded(false);
            return;
        }
        setThumbnailIndex(thumbnailCandidates.length);
    };

    return (
        <div
            className={`video-card ${item.isUnlocked ? 'unlocked' : 'locked'} ${tierClass}`}
            onClick={item.isUnlocked ? () => onClick(item) : undefined}
        >
            <div className="video-card-thumbnail">
                {currentThumbnail ? (
                    <img
                        key={currentThumbnail}
                        src={currentThumbnail}
                        alt={item.videoTitle}
                        loading="lazy"
                        decoding="async"
                        onLoad={() => setImgLoaded(true)}
                        onError={handleThumbnailError}
                        style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.25s ease' }}
                    />
                ) : (
                    <div className="video-card-placeholder">📺</div>
                )}

                {!item.isUnlocked && (
                    <div className="video-card-lock-overlay">
                        <span className="video-card-lock-icon">🔒</span>
                        <span className="video-card-lock-text">Giải tình huống để mở</span>
                    </div>
                )}

                {item.isUnlocked && (
                    <div className="video-card-play-overlay">
                        <span className="video-card-play-icon">▶</span>
                    </div>
                )}

                {item.puzzleTier && item.puzzleTier !== 'free' && (
                    <div className={`video-card-tier tier-${item.puzzleTier}`}>
                        <TierIcon tier={item.puzzleTier} size={12} />
                        <span>{item.puzzleTier === 'advanced' ? 'Nâng cao' : 'Hiếm'}</span>
                    </div>
                )}
            </div>

            <div className="video-card-info">
                <h4 className="video-card-title">{item.videoTitle}</h4>
                {item.proPlayer && (
                    <span className="video-card-meta">{item.proPlayer} {item.stage ? `• ${item.stage}` : ''}</span>
                )}
                {item.isUnlocked && item.userResult && (
                    <span className={`video-card-result ${item.userResult}`}>
                        {item.userResult === 'correct' ? '✓ Đúng' : '✗ Bạn đã trả lời sai câu này.'}
                        {item.iqDelta !== undefined && ` (${item.iqDelta > 0 ? '+' : ''}${item.iqDelta} IQ)`}
                    </span>
                )}
            </div>
        </div>
    );
});
