import React from 'react';
import { StabilizationPlan } from '../../../data/puzzleScenarios';
import './PlanSelector.css';
import { ShieldIcon } from '../../../components/common/ShieldIcon';
import { ArrowUpIcon } from '../../../components/common/ArrowUpIcon';
import { WrenchIcon } from '../../../components/common/WrenchIcon';
import { CoinBagIcon } from '../../../components/common/CoinBagIcon';

interface PlanSelectorProps {
    onPlanDeclare: (plan: StabilizationPlan) => void;
    stage?: string;
    disabled?: boolean;
    allPuzzlesCompleted?: boolean;
}

const PLANS: { key: StabilizationPlan; label: string; labelVi: string; icon: React.ReactNode; description: string }[] = [
    {
        key: 'stabilize',
        label: 'Stabilize',
        labelVi: 'Chơi top 4',
        icon: <ShieldIcon />,
        description: 'Làm mọi thứ có thể để mạnh liền, ngay lập tức'
    },
    {
        key: 'cap',
        label: 'Cap Board',
        labelVi: 'Chơi top cao',
        icon: <ArrowUpIcon />,
        description: 'Chơi chậm lại, lấy lõi hướng đánh về sau'
    },
    {
        key: 'patch',
        label: 'Patch',
        labelVi: 'Fix item lại cho đẹp',
        icon: <WrenchIcon />,
        description: 'Đồ xấu phải lấy mảnh đồ để fix lại đồ'
    },
    {
        key: 'greed',
        label: 'Greed',
        labelVi: 'Chơi Loto',
        icon: <CoinBagIcon />,
        description: 'Ra gì chơi đó vì chưa chốt bài'
    }
];

export const PlanSelector: React.FC<PlanSelectorProps> = ({
    onPlanDeclare,
    stage,
    disabled = false,
    allPuzzlesCompleted = false
}) => {
    return (
        <div className="plan-selector-overlay">
            <div className="plan-selector-container">
                <div className="plan-selector-header">
                    {allPuzzlesCompleted && (
                        <div className="plan-selector-replay-text">{'Bạn đang giải lại tình huống cũ'}</div>
                    )}
                    <div className="plan-selector-badge">Nhận diện thế bài</div>
                    <h3 className="plan-selector-title">
                        {stage ? `Ở round ${stage} — kế hoạch của bạn?` : 'Kế hoạch của bạn?'}
                    </h3>
                    <p className="plan-selector-subtitle">
                        Nhìn kỹ <span className="plan-subtitle-highlight">HP</span>,{' '}
                        <span className="plan-subtitle-highlight">board</span>, và{' '}
                        <span className="plan-subtitle-highlight">lobby</span>, rồi chọn kế hoạch
                        phù hợp nhất — <em>trước khi chọn lõi</em>.
                    </p>
                </div>
                <div className="plan-selector-grid">
                    {PLANS.map((plan, i) => (
                        <button
                            key={plan.key}
                            className={`plan-btn plan-btn-${plan.key}`}
                            onClick={() => !disabled && onPlanDeclare(plan.key)}
                            disabled={disabled}
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            <span className="corner-accent corner-tl" />
                            <span className="corner-accent corner-tr" />
                            <span className="corner-accent corner-bl" />
                            <span className="corner-accent corner-br" />
                            <span className="plan-icon">{plan.icon}</span>
                            <span className="plan-label">{plan.labelVi}</span>
                            <span className="plan-label-en">{plan.label}</span>
                            <span className="plan-desc">{plan.description}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlanSelector;
