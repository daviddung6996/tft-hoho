/**
 * TrueDamagePanel.tsx - Trait True Damage Panel (A-Side & B-Side)
 * 
 * FONT NOTICE (Theo yêu cầu kỹ thuật & bản quyền):
 * Tiêu đề: "SVN-Beauford" (Riot Beaufort việt hóa, đã cài trên máy và bundled tại /fonts/SVN-Beauford.otf).
 *   Fallback: "Noto Serif Display", "DejaVu Serif", serif
 * Thân bài: "Liberation Sans", "DejaVu Sans", sans-serif
 *
 * ICON NOTICE:
 * Icon chính thức lấy từ tactics.tools / CommunityDragon CDN (Riot asset):
 * https://ap.tft.tools/static/trait-icons/tft10_truedamage_w.svg
 * Kèm SVG vẽ lại làm fallback nội bộ.
 */

import React, { useState } from 'react';
import './TrueDamagePanel.css';

export interface TrueDamagePanelProps {
  /** Mặt hiển thị ban đầu ('A' hoặc 'B'). Mặc định 'A' */
  initialSide?: 'A' | 'B';
  /** Mặt hiển thị bị kiểm soát bởi parent component */
  side?: 'A' | 'B';
  /** Callback khi người dùng nhấn nút Flip */
  onFlip?: (nextSide: 'A' | 'B') => void;
  /** Callback đóng panel (nếu dùng trong modal/overlay) */
  onClose?: () => void;
  /** Dùng SVG fallback thay vì ảnh CDN */
  useSvgFallback?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TrueDamagePanel: React.FC<TrueDamagePanelProps> = ({
  initialSide = 'A',
  side: controlledSide,
  onFlip,
  onClose,
  useSvgFallback = false,
  className = '',
  style,
}) => {
  const [internalSide, setInternalSide] = useState<'A' | 'B'>(initialSide);
  const currentSide = controlledSide !== undefined ? controlledSide : internalSide;

  const handleFlip = () => {
    const next = currentSide === 'A' ? 'B' : 'A';
    if (controlledSide === undefined) {
      setInternalSide(next);
    }
    if (onFlip) {
      onFlip(next);
    }
  };

  const isASide = currentSide === 'A';
  const leadText = isASide ? 'A-Side: Win' : 'B-Side: Lose';
  const tier3Text = isASide
    ? '3) True Damage members deal 18% bonus true damage. Gain 2 Bling on kill + 10 if you win combat.'
    : '3) After losing, gain 15 Bling + 7 per consecutive loss on the B-Side. If you win, lose 50% of your Bling.';
  const tier5Class = isASide ? 'dim' : 'dim bside';
  const tier5Text = isASide
    ? '5) 30% true damage. 4 Bling on kill + 18 if you win combat.'
    : '5) Each round after combat, heal 2 player Health and gain 2 XP.';
  const btnText = isASide ? 'Flip to B-Side' : 'Flip to A-Side';

  return (
    <div
      className={`td-panel-wrapper ${className}`.trim()}
      style={style}
      data-testid={`TrueDamagePanel:${currentSide}`}
    >
      <div className="panel">
        <div className="header">
          <div className="icon-slot">
            {useSvgFallback ? (
              /* SVG vẽ lại — KHÔNG phải icon chính thức của Riot (dùng khi offline/chưa load CDN) */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#F2EDE0"
                viewBox="0 0 144 144"
                aria-label="True Damage Icon (Fallback)"
              >
                <circle cx="72" cy="72" r="10.65" />
                <polygon points="80.44 91.53 72 99.97 63.56 91.53 30.59 124.5 56.29 124.5 72 108.79 87.71 124.5 113.41 124.5 80.44 91.53" />
                <polygon points="63.56 52.47 72 44.03 80.44 52.47 113.41 19.5 87.71 19.5 72 35.21 56.29 19.5 30.59 19.5 63.56 52.47" />
                <polygon points="52.47 80.44 44.03 72 52.47 63.56 19.5 30.59 19.5 56.29 35.21 72 19.5 87.71 19.5 113.41 52.47 80.44" />
                <polygon points="91.53 63.56 99.97 72 91.53 80.44 124.5 113.41 124.5 87.71 108.79 72 124.5 56.29 124.5 30.59 91.53 63.56" />
              </svg>
            ) : (
              /* Icon CDN Riot chính thức qua tactics.tools / CommunityDragon */
              <img
                src="https://ap.tft.tools/static/trait-icons/tft10_truedamage_w.svg"
                alt="True Damage"
                onError={(e) => {
                  // Fallback to local asset if external network CDN is unreachable
                  const target = e.currentTarget;
                  if (!target.dataset.triedLocal) {
                    target.dataset.triedLocal = 'true';
                    target.src = '/tft-assets/traits/tft10_truedamage_w.svg';
                  }
                }}
              />
            )}
          </div>
          <h1>True Damage</h1>
        </div>

        <div className="body">
          <p>
            While on the A-Side, earn Bling for winning player combat. On the B-Side, earn Bling for losing.
          </p>
          <p>
            Every 4 rounds, choose to convert Bling into rewards or Keep Rising.
          </p>
          <p className="lead">{leadText}</p>
          <p>{tier3Text}</p>
          <p className={tier5Class}>{tier5Text}</p>
        </div>

        <div className="btn-wrap">
          <button
            type="button"
            className="btn"
            onClick={handleFlip}
            aria-label={btnText}
          >
            {btnText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrueDamagePanel;
