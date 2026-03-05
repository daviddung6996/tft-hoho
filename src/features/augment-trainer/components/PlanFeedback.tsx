import React from 'react';
import { StabilizationPlan } from '../../../data/puzzleScenarios';
import './PlanFeedback.css';

interface PlanFeedbackProps {
    declaredPlan?: StabilizationPlan;
    proPlan: StabilizationPlan;
    planReasoning?: string;
}

const PLAN_LABELS: Record<StabilizationPlan, { vi: string; color: string }> = {
    stabilize: { vi: 'Chơi top 4', color: '#22c55e' },
    cap: { vi: 'Chơi top cao', color: '#0ea5e9' },
    patch: { vi: 'Fix item lại cho đẹp', color: '#EAB308' },
    greed: { vi: 'Chơi Loto', color: '#ef4444' }
};

export const PlanFeedback: React.FC<PlanFeedbackProps> = ({
    declaredPlan,
    proPlan,
    planReasoning
}) => {
    const proLabel = PLAN_LABELS[proPlan];

    if (!declaredPlan) {
        return (
            <div className="plan-feedback plan-feedback--info">
                <div className="plan-feedback__title">KẾ HOẠCH CỦA PRO</div>
                <p className="plan-feedback__summary">
                    Pro chọn <strong style={{ color: proLabel.color }}>{proLabel.vi}</strong>.
                </p>
                {planReasoning && (
                    <>
                        <div className="plan-feedback__reasoning-label">
                            TẠI SAO PRO CHỌN {proLabel.vi.toUpperCase()}?
                        </div>
                        <p className="plan-feedback__reasoning-text">{planReasoning}</p>
                    </>
                )}
            </div>
        );
    }

    const isMatch = declaredPlan === proPlan;
    const userLabel = PLAN_LABELS[declaredPlan];

    return (
        <div className={`plan-feedback ${isMatch ? 'plan-feedback--match' : 'plan-feedback--mismatch'}`}>
            <div className="plan-feedback__title">
                {isMatch ? 'ĐÚNG KẾ HOẠCH' : 'LỆCH KẾ HOẠCH'}
            </div>

            <p className="plan-feedback__summary">
                Bạn chọn <strong style={{ color: userLabel.color }}>{userLabel.vi}</strong>{' '}
                {isMatch ? 'và Pro cũng chọn' : 'nhưng Pro chọn'}{' '}
                <strong style={{ color: proLabel.color }}>{proLabel.vi}</strong>.
            </p>

            {planReasoning && (
                <>
                    <div className="plan-feedback__reasoning-label">
                        TẠI SAO PRO CHỌN {proLabel.vi.toUpperCase()}?
                    </div>
                    <p className="plan-feedback__reasoning-text">{planReasoning}</p>
                </>
            )}
        </div>
    );
};

export default PlanFeedback;
