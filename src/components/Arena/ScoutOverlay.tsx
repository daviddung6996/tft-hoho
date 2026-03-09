import React from 'react';
import './ScoutOverlay.css';
import { LayoutMode } from '../Game/mobileLayout';

interface ScoutOverlayProps {
    layoutMode?: LayoutMode;
}

export const ScoutOverlay: React.FC<ScoutOverlayProps> = ({ layoutMode }) => {
    return (
        <div className="scout-overlay-container" data-layout-mode={layoutMode}>
            <div className="scout-overlay-content">
                <div className="scout-overlay-icon">👁️</div>
                <h3 className="scout-overlay-title">Khoan đã!</h3>
                <p className="scout-overlay-text">
                    Bạn chưa xem tình huống! Hãy thu gọn bảng này (nút mũi tên bên dưới) để khảo sát board trước khi đưa ra quyết định.
                </p>
            </div>
        </div>
    );
};
