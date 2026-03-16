import React, { memo } from 'react';
import type { CoachProfile } from '../coachSelect.types';

interface CoachResponseCardProps {
    coach: CoachProfile;
    isLoading: boolean;
    answer?: string | null;
    reasoning?: string;
    pick?: string | null;
    isReasoningStreaming?: boolean;
    error: string | null;
    onBackToSelect: () => void;
    onObserveBoard?: () => void;
}

const BackToBoardIcon: React.FC = () => (
    <svg
        className="coach-response-card__observe-icon-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <path
            d="M10 6L4 12l6 6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M4 12h12a4 4 0 0 1 0 8h-2"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const CoachLoadingDots: React.FC = () => (
    <svg
        className="coach-response-card__thinking-loader"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        aria-hidden="true"
    >
        <circle cx="4" cy="12" r="3" fill="currentColor">
            <animate
                id="coachLoaderDotA"
                attributeName="cy"
                begin="0;coachLoaderDotC.end+0.25s"
                calcMode="spline"
                dur="0.6s"
                keySplines=".33,.66,.66,1;.33,0,.66,.33"
                values="12;6;12"
            />
        </circle>
        <circle cx="12" cy="12" r="3" fill="currentColor">
            <animate
                attributeName="cy"
                begin="coachLoaderDotA.begin+0.1s"
                calcMode="spline"
                dur="0.6s"
                keySplines=".33,.66,.66,1;.33,0,.66,.33"
                values="12;6;12"
            />
        </circle>
        <circle cx="20" cy="12" r="3" fill="currentColor">
            <animate
                id="coachLoaderDotC"
                attributeName="cy"
                begin="coachLoaderDotA.begin+0.2s"
                calcMode="spline"
                dur="0.6s"
                keySplines=".33,.66,.66,1;.33,0,.66,.33"
                values="12;6;12"
            />
        </circle>
    </svg>
);

export const CoachResponseCard: React.FC<CoachResponseCardProps> = memo(({
    coach,
    isLoading,
    answer,
    reasoning,
    error,
    onBackToSelect,
    onObserveBoard,
}) => {
    const resolvedAnswer = (answer ?? reasoning ?? '').trim();

    if (isLoading) {
        return (
            <section className="coach-response-card coach-response-card--loading" style={{ ['--coach-accent' as string]: coach.accentColor }}>
                <div className="coach-response-card__loading-hero" aria-live="polite">
                    <div className="coach-response-card__loading-dots">
                        <CoachLoadingDots />
                    </div>

                    <h3 className="coach-response-card__loading-title">
                        {coach.displayName} đang đọc thế trận...
                    </h3>

                    <p className="coach-response-card__loading-note">
                        Giữ nguyên phân tích ở đây, bạn có thể quay ra board để quan sát trong lúc chờ.
                    </p>
                </div>

                {onObserveBoard && (
                    <button
                        type="button"
                        className="coach-response-card__observe-btn"
                        onClick={onObserveBoard}
                    >
                        <span className="coach-response-card__observe-icon" aria-hidden="true">
                            <BackToBoardIcon />
                        </span>
                        <span className="coach-response-card__observe-copy">
                            <span className="coach-response-card__observe-label">Ra ngoài xem lại board</span>
                            <span className="coach-response-card__observe-note">
                                Coach vẫn đang phân tích, bạn có thể quan sát board trong lúc đợi.
                            </span>
                        </span>
                    </button>
                )}
            </section>
        );
    }

    const eyebrow = error ? 'Trạng Thái' : 'Phân Tích';
    const title = error
        ? `${coach.displayName} đang bận train`
        : `${coach.displayName} đã đọc xong spot này`;

    return (
        <section className="coach-response-card" style={{ ['--coach-accent' as string]: coach.accentColor }}>
            <div className="coach-response-card__header">
                <div className="coach-response-card__summary">
                    <p className="coach-response-card__eyebrow">{eyebrow}</p>
                    <h3 className="coach-response-card__title">{title}</h3>
                </div>

                <button
                    type="button"
                    className="coach-response-card__reset"
                    onClick={onBackToSelect}
                >
                    Ẩn phân tích
                </button>
            </div>

            <div className={`coach-response-card__body${error ? ' is-error' : ''}`}>
                {error ? (
                    <div className="coach-response-card__section">
                        <p className="coach-response-card__section-label">Trạng thái</p>
                        <p className="coach-response-card__error-copy">{error}</p>
                    </div>
                ) : (
                    <div className="coach-response-card__section">
                        <p className="coach-response-card__reasoning-copy">
                            {resolvedAnswer || 'Coach chưa để lại phân tích.'}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
});
