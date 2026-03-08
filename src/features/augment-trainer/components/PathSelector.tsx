import React from "react";
import { AugmentPath } from "../../../data/puzzleScenarios";
import "./PathSelector.css";
import { GoldenChestIcon } from "../../../components/common/GoldenChestIcon";
import { SwordsIcon } from "../../../components/common/SwordsIcon";
import { FlameIcon } from "../../../components/common/FlameIcon";
import { MedalIcon } from "../../../components/common/MedalIcon";

interface PathSelectorProps {
  onPathDeclare: (path: AugmentPath) => void;
  stage?: string;
  disabled?: boolean;
  allPuzzlesCompleted?: boolean;
}

const PATHS: {
  key: AugmentPath;
  label: string;
  labelVi: string;
  icon: React.ReactNode;
  description: string;
}[] = [
    {
      key: "econ",
      label: "Econ",
      labelVi: "Kinh tế",
      icon: <GoldenChestIcon />,
      description: "Vàng, XP, lượt roll",
    },
    {
      key: "item",
      label: "Item",
      labelVi: "Trang bị",
      icon: <SwordsIcon />,
      description: "Mảnh đồ, đồ lớn, đồ Orn",
    },
    {
      key: "combat",
      label: "Combat",
      labelVi: "Đánh nhau",
      icon: <FlameIcon />,
      description: "Lõi cho stats, team wide buff",
    },
    {
      key: "emblem",
      label: "Emblem",
      labelVi: "Ấn",
      icon: <MedalIcon />,
      description: "Ấn tộc hệ ngẫu nhiên, Xẻng/Chảo, Giáp chess",
    },
  ];

export const PathSelector: React.FC<PathSelectorProps> = ({
  onPathDeclare,
  stage,
  disabled = false,
  allPuzzlesCompleted = false,
}) => {
  const mobileTitle = stage ? `${stage}: Bạn cần lõi gì?` : "Bạn cần lõi gì?";

  return (
    <div className="path-selector-overlay">
      <div className="path-selector-container">
        <div className="selector-mobile-shell">
          <div className="path-selector-header">
            {allPuzzlesCompleted && (
              <div
                className="selector-mobile-replay-pill"
                data-testid="selector-mobile-replay-pill"
              >
                (Bạn đã giải tình huống này rồi)
              </div>
            )}
            {allPuzzlesCompleted && (
              <div className="path-selector-replay-text">
                Bạn đang giải lại câu đố cũ
              </div>
            )}
            <div className="path-selector-badge">Biết mình phải chọn gì</div>
            <h3 className="path-selector-title">
              {stage
                ? `Tình huống ${stage} - bạn cần Augment gì?`
                : "Bạn cần loại Augment gì?"}
            </h3>
            <h3
              className="selector-mobile-title"
              data-testid="selector-mobile-title"
            >
              {mobileTitle}
            </h3>
            <p className="path-selector-subtitle">
              Quan sát kỹ{" "}
              <span className="path-subtitle-highlight">board nhà mình</span> và{" "}
              <span className="path-subtitle-highlight">board đối thủ</span>,
              rồi chọn loại Augment phù hợp nhất với tình huống hiện tại -{" "}
              <em>trước khi chọn lõi</em>.
            </p>
          </div>

          <div className="path-selector-grid">
            {PATHS.map((path, i) => (
              <button
                key={path.key}
                className={`path-btn path-btn-${path.key}`}
                onClick={() => !disabled && onPathDeclare(path.key)}
                disabled={disabled}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <span className="corner-accent corner-tl" />
                <span className="corner-accent corner-tr" />
                <span className="corner-accent corner-bl" />
                <span className="corner-accent corner-br" />
                <span className="path-icon">{path.icon}</span>
                <span className="path-label">{path.labelVi}</span>
                <span className="path-label-en">{path.label}</span>
                <span className="path-desc">{path.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathSelector;
