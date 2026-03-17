import React from 'react';
import { ARENA_SKINS, ArenaSkin } from '../../data/arenas';
import './ArenaSelectorModal.css';

interface ArenaSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectArena: (arena: ArenaSkin) => void;
    currentArena: ArenaSkin | null;
}

export const ArenaSelectorModal: React.FC<ArenaSelectorModalProps> = ({
    isOpen,
    onClose,
    onSelectArena,
    currentArena
}) => {
    const preloadedBackgroundsRef = React.useRef(new Set<string>());

    const preloadArenaBackground = React.useCallback((skin: ArenaSkin) => {
        if (!skin.backgroundUrl || preloadedBackgroundsRef.current.has(skin.id)) {
            return;
        }

        preloadedBackgroundsRef.current.add(skin.id);
        const img = new Image();
        img.src = skin.backgroundUrl;
    }, []);

    React.useEffect(() => {
        if (isOpen && currentArena) {
            preloadArenaBackground(currentArena);
        }
    }, [currentArena, isOpen, preloadArenaBackground]);

    if (!isOpen) return null;

    return (
        <div className="arena-modal-overlay" onClick={onClose}>
            <div className="arena-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="arena-modal-header">
                    <h2>Chọn Đấu Trường</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="arena-grid">
                    {ARENA_SKINS.map((skin) => (
                        <div
                            key={skin.id}
                            className={`arena-option ${currentArena?.id === skin.id ? 'selected' : ''}`}
                            onMouseEnter={() => preloadArenaBackground(skin)}
                            onFocus={() => preloadArenaBackground(skin)}
                            onTouchStart={() => preloadArenaBackground(skin)}
                            onClick={() => {
                                preloadArenaBackground(skin);
                                onSelectArena(skin);
                                onClose();
                            }}
                        >
                            <img src={skin.thumbnailUrl} alt={skin.name} loading="lazy" />
                            <div className="arena-name">{skin.name}</div>
                            <div className={`arena-rarity ${skin.rarity.toLowerCase()}`}>{skin.rarity}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
