import React from 'react';
import './PuzzleCompletionModal.css';

interface PuzzleCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PuzzleCompletionModal: React.FC<PuzzleCompletionModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="puzzle-done-overlay" onClick={onClose}>
      <div className="puzzle-done-modal" onClick={(e) => e.stopPropagation()}>
        {/* Corner Accent Frames */}
        <div className="puzzle-done-corner corner-tl" />
        <div className="puzzle-done-corner corner-tr" />
        <div className="puzzle-done-corner corner-bl" />
        <div className="puzzle-done-corner corner-br" />

        {/* Hero Section */}
        <div className="puzzle-done-hero">
          <span className="puzzle-done-badge">HOÀN THÀNH</span>
          <h2 className="puzzle-done-title">Lý thuyết đủ rồi!</h2>
          <div className="puzzle-done-divider">
            <span />
          </div>
        </div>

        {/* Body Section */}
        <div className="puzzle-done-body">
          <p className="puzzle-done-text">Vào game thực hành đi</p>
          <p className="puzzle-done-muted">Quay lại sau khi có thêm puzzle mới nhé!</p>
        </div>

        {/* CTA Section */}
        <div className="puzzle-done-cta-section">
          <button className="puzzle-done-cta" onClick={onClose}>
            <span className="puzzle-done-cta-sweep" />
            <span className="puzzle-done-cta-text">Đóng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
