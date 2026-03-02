import React, { useState } from 'react';
import { useVideoLibrary } from '../hooks/useVideoLibrary';
import { VideoLibraryItem, LibraryFilter } from '../videoLibrary.types';
import { VideoCard } from './VideoCard';
import { VideoPlayerModal } from './VideoPlayerModal';
import { LibraryProgress } from './LibraryProgress';
import './VideoLibraryPage.css';

interface VideoLibraryPageProps {
    onBack: () => void;
}

const FILTER_OPTIONS: { key: LibraryFilter; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'unlocked', label: 'Đã mở' },
    { key: 'locked', label: 'Chưa mở' },
];

export const VideoLibraryPage: React.FC<VideoLibraryPageProps> = ({ onBack }) => {
    const {
        filteredLibrary,
        isLoading,
        filter,
        setFilter,
        unlockedCount,
        totalCount,
        isProSupporter,
    } = useVideoLibrary();

    const [selectedVideo, setSelectedVideo] = useState<VideoLibraryItem | null>(null);

    const handleSupportClick = () => {
        const supportBtn = document.querySelector('.menu-item--support') as HTMLButtonElement;
        if (supportBtn) supportBtn.click();
    };

    return (
        <div className="video-library-page">
            {/* Hero Section — Header + Progress */}
            <div className="video-library-hero">
                {/* Corner Accent Frames */}
                <div className="corner-accent corner-tl" />
                <div className="corner-accent corner-tr" />

                <div className="video-library-header">
                    <button className="video-library-back" onClick={onBack}>
                        <span>←</span>
                    </button>
                    <div className="video-library-title-section">
                        <span className="video-library-badge">PRO SUPPORTER</span>
                        <h1 className="video-library-title">Kho Pro Analysis</h1>
                        <span className="video-library-subtitle">
                            Video giải thích chuyên sâu từ tftiseasy
                        </span>
                    </div>
                </div>

                {/* Progress */}
                <LibraryProgress
                    unlockedCount={unlockedCount}
                    totalCount={totalCount}
                    isProSupporter={isProSupporter}
                    onSupportClick={handleSupportClick}
                />
            </div>

            {/* Content Section — Filters + Grid */}
            <div className="video-library-content">
                {/* Filters */}
                <div className="video-library-filters">
                    {FILTER_OPTIONS.map(opt => (
                        <button
                            key={opt.key}
                            className={`video-library-filter-btn ${filter === opt.key ? 'active' : ''}`}
                            onClick={() => setFilter(opt.key)}
                        >
                            {opt.label}
                            {opt.key === 'unlocked' && ` (${unlockedCount})`}
                            {opt.key === 'locked' && ` (${totalCount - unlockedCount})`}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="video-library-loading">Đang tải...</div>
                ) : filteredLibrary.length === 0 ? (
                    <div className="video-library-empty">
                        {filter === 'unlocked'
                            ? 'Chưa mở khóa video nào. Giải puzzle để bắt đầu!'
                            : filter === 'locked'
                                ? 'Tất cả video đã được mở khóa! 🎉'
                                : 'Chưa có video nào.'}
                    </div>
                ) : (
                    <div className="video-library-grid">
                        {filteredLibrary.map(item => (
                            <VideoCard
                                key={item.puzzleId}
                                item={item}
                                onClick={setSelectedVideo}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Video Player Modal */}
            {selectedVideo && (
                <VideoPlayerModal
                    videoUrl={selectedVideo.videoUrl}
                    videoTitle={selectedVideo.videoTitle}
                    proPlayer={selectedVideo.proPlayer}
                    userResult={selectedVideo.userResult}
                    iqDelta={selectedVideo.iqDelta}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </div>
    );
};
