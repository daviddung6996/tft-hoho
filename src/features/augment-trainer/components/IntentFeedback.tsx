import React from 'react';
import { AugmentPath } from '../../../data/puzzleScenarios';
import './IntentFeedback.css';

interface IntentFeedbackProps {
    declaredPath?: AugmentPath;
    proPickPath: AugmentPath;
    proReasoningIntent?: string;
}

const PATH_LABELS: Record<AugmentPath, { vi: string; color: string }> = {
    econ: { vi: 'Kinh tế', color: '#EAB308' },
    item: { vi: 'Trang bị', color: '#00D1C1' },
    combat: { vi: 'Đánh nhau', color: '#FF6B35' },
    emblem: { vi: 'Ấn', color: '#c8aa6e' }
};

export const IntentFeedback: React.FC<IntentFeedbackProps> = ({
    declaredPath,
    proPickPath,
    proReasoningIntent
}) => {
    const proLabel = PATH_LABELS[proPickPath];

    if (!declaredPath) {
        return (
            <div className="intent-feedback intent-feedback--info">
                <div className="intent-feedback__title">HƯỚNG CHỌN CỦA PRO</div>
                <p className="intent-feedback__summary">
                    Pro chọn <strong style={{ color: proLabel.color }}>{proLabel.vi}</strong>.
                </p>
                {proReasoningIntent && (
                    <>
                        <div className="intent-feedback__reasoning-label">
                            TẠI SAO PRO CHỌN {proLabel.vi.toUpperCase()}?
                        </div>
                        <p className="intent-feedback__reasoning-text">{proReasoningIntent}</p>
                    </>
                )}
            </div>
        );
    }

    const isMatch = declaredPath === proPickPath;
    const userLabel = PATH_LABELS[declaredPath];

    return (
        <div className={`intent-feedback ${isMatch ? 'intent-feedback--match' : 'intent-feedback--mismatch'}`}>
            <div className="intent-feedback__title">
                {isMatch ? 'ĐÚNG HƯỚNG CHỌN' : 'LỆCH HƯỚNG CHỌN'}
            </div>

            <p className="intent-feedback__summary">
                Bạn chọn <strong style={{ color: userLabel.color }}>{userLabel.vi}</strong>{' '}
                {isMatch ? 'và Pro cũng chọn' : 'nhưng Pro chọn'}{' '}
                <strong style={{ color: proLabel.color }}>{proLabel.vi}</strong>.
            </p>

            {proReasoningIntent && (
                <>
                    <div className="intent-feedback__reasoning-label">
                        TẠI SAO PRO CHỌN {proLabel.vi.toUpperCase()}?
                    </div>
                    <p className="intent-feedback__reasoning-text">{proReasoningIntent}</p>
                </>
            )}
        </div>
    );
};

export default IntentFeedback;
