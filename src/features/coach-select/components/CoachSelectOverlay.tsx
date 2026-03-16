import React, { useEffect, useMemo, useState } from 'react';
import type { AugmentData } from '../../../services/augmentService';
import { COACHES } from '../coachSelect.data';
import { CoachCarousel } from './CoachCarousel';
import { CoachContextBar } from './CoachContextBar';
import { CoachHeroPortrait, type ResolvedCoachHeroMode } from './CoachHeroPortrait';
import { CoachResponseCard } from './CoachResponseCard';
import { CoachStatBars } from './CoachStatBars';
import type { CoachGameContext, CoachId, CoachProfile, CoachUiState } from '../coachSelect.types';
import './CoachSelectOverlay.css';

interface CoachSelectOverlayProps {
    coach: CoachProfile;
    currentAugments: AugmentData[];
    gameContext: CoachGameContext | null;
    uiState: CoachUiState;
    answer?: string | null;
    reasoning?: string;
    pick?: string | null;
    isReasoningStreaming?: boolean;
    error: string | null;
    onClose: () => void;
    onSelectCoach: (coachId: CoachId) => void;
    onAskCoach: () => void;
    onBackToSelect: () => void;
    onObserveBoard?: () => void;
}

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
    </svg>
);

const preloadedCoachAssets = new Set<string>();

function preloadCoachAsset(src?: string) {
    if (!src || preloadedCoachAssets.has(src) || typeof Image === 'undefined') {
        return;
    }

    const image = new Image();
    image.decoding = 'async';
    image.src = src;
    preloadedCoachAssets.add(src);
}

export const CoachSelectOverlay: React.FC<CoachSelectOverlayProps> = ({
    coach,
    gameContext,
    uiState,
    answer,
    reasoning,
    error,
    onClose,
    onSelectCoach,
    onAskCoach,
    onBackToSelect,
    onObserveBoard,
}) => {
    const isLoading = uiState === 'loading';
    const showAnalysis = uiState === 'loading' || uiState === 'response';
    const heroPresentation = coach.heroPresentation ?? { mode: 'art' as const };
    const [resolvedHeroMode, setResolvedHeroMode] = useState<ResolvedCoachHeroMode>(heroPresentation.mode);
    const handleClose = isLoading && onObserveBoard ? onObserveBoard : onClose;

    useEffect(() => {
        COACHES.forEach(profile => {
            preloadCoachAsset(profile.imageSrc);
            preloadCoachAsset(profile.fallbackImageSrc);
            preloadCoachAsset(profile.heroImageSrc);
            preloadCoachAsset(profile.heroFallbackImageSrc);
        });
    }, []);

    useEffect(() => {
        setResolvedHeroMode(heroPresentation.mode);
    }, [coach.id, heroPresentation.mode]);

    const heroStyle = useMemo(() => ({
        ['--coach-hero-scale' as string]: String(heroPresentation.scale ?? 1),
        ['--coach-hero-offset-x' as string]: `${heroPresentation.xOffsetPx ?? 0}px`,
        ['--coach-hero-offset-y' as string]: `${heroPresentation.yOffsetPx ?? 0}px`,
        ['--coach-hero-bottom-overlap' as string]: `${heroPresentation.bottomOverlapPx ?? 0}px`,
        ['--coach-hero-max-width' as string]: `${heroPresentation.maxWidthPx ?? 420}px`,
    }), [
        heroPresentation.bottomOverlapPx,
        heroPresentation.maxWidthPx,
        heroPresentation.scale,
        heroPresentation.xOffsetPx,
        heroPresentation.yOffsetPx,
    ]);

    return (
        <div className="coach-select-overlay" role="dialog" aria-modal="true" aria-label="Coach Select">
            <div className="coach-select-shell" style={{ ['--coach-accent' as string]: coach.accentColor }}>
                <div className="coach-select-shell__frame" />

                <header className="coach-select-header">
                    <div className="coach-select-header__title-block">
                        <span className="coach-select-header__eyebrow">Hextech Command</span>
                        <h2 className="coach-select-header__title">Chọn Coach</h2>
                    </div>

                    <div className="coach-select-header__right">
                        <button
                            type="button"
                            className="coach-select-header__close"
                            onClick={handleClose}
                            aria-label="Dong coach overlay"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </header>

                <CoachContextBar gameContext={gameContext} />

                <div className="coach-select-content">
                    <section className="coach-select-visual">
                        <div className="coach-select-visual__panel">
                            <div className="coach-select-visual__shape coach-select-visual__shape--accent" />
                            <div
                                className={`coach-select-visual__hero coach-select-visual__hero--${resolvedHeroMode}`}
                                style={heroStyle}
                            >
                                <CoachHeroPortrait
                                    coach={coach}
                                    alt={`Chan dung coach ${coach.displayName}`}
                                    testId="coach-hero-image"
                                    onModeResolved={setResolvedHeroMode}
                                />
                            </div>

                            <div className="coach-select-visual__fog" />

                            <div className="coach-select-visual__caption">
                                <span className="coach-select-visual__caption-role">{coach.role}</span>
                                <p className="coach-select-visual__caption-copy">"{coach.tagline}"</p>
                            </div>
                        </div>
                    </section>

                    <section className="coach-select-info">
                        <div className="coach-select-info__hero">
                            <span className="coach-select-info__role-badge">{coach.role}</span>
                            <h3 className="coach-select-info__name">{coach.displayName.toUpperCase()}</h3>
                            <p className="coach-select-info__description">{coach.description}</p>
                        </div>

                        <div className="coach-select-panel">
                            {showAnalysis ? (
                                <CoachResponseCard
                                    coach={coach}
                                    isLoading={isLoading}
                                    answer={answer}
                                    reasoning={reasoning}
                                    error={error}
                                    onBackToSelect={onBackToSelect}
                                    onObserveBoard={onObserveBoard}
                                />
                            ) : (
                                <>
                                    <div className="coach-select-panel__section">
                                        <span className="coach-select-panel__label">Chi so nang luc</span>
                                        <CoachStatBars coach={coach} />
                                    </div>

                                    <div className="coach-ability-card">
                                        <div className="coach-ability-card__key">{coach.ability.key}</div>
                                        <div className="coach-ability-card__body">
                                            <div className="coach-ability-card__name">{coach.ability.name}</div>
                                            <p className="coach-ability-card__desc">{coach.ability.description}</p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="coach-select-panel__cta"
                                        onClick={onAskCoach}
                                        disabled={isLoading}
                                        aria-label={`Hỏi ${coach.displayName}`}
                                    >
                                        <span className="coach-select-panel__cta-copy">
                                            {isLoading ? `Coach ${coach.displayName} đang nhìn nhận thế trận` : `Hỏi ${coach.displayName}`}
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>
                    </section>
                </div>

                <CoachCarousel
                    coaches={COACHES}
                    selectedCoachId={coach.id}
                    onSelect={onSelectCoach}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
};
