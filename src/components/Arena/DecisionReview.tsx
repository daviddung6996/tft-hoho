import React, { useEffect, useRef, useState, Suspense } from 'react';
import { AugmentData } from '../../services/augmentService';
import { AugmentPath, CommunityVotes, StabilizationPlan } from '../../data/puzzleScenarios';
import { PuzzleTier } from '../../features/tcoin/tcoin.types';
import './DecisionReview.css';

import { ReviewCard } from './DecisionReviewComponents/ReviewCard';
import { PuzzleInfo } from './DecisionReviewComponents/PuzzleInfo';
import { ReviewActions } from './DecisionReviewComponents/ReviewActions';
import { MemeFeedback } from '../../features/puzzle/feedback/MemeFeedback';
import { IqScoreSummary } from '../../features/user-iq/components/IqScoreSummary';
import { useAuth } from '../../contexts/AuthContext';
import { calculateUserIqRank } from '../../features/user-iq/userIqCalculator';
import { videoLibraryService } from '../../features/video-library/videoLibrary.service';
import { IntentFeedback } from '../../features/augment-trainer/components/IntentFeedback';
import { PlanFeedback } from '../../features/augment-trainer/components/PlanFeedback';
import { buildYouTubeEmbedUrl } from '../../utils/youtube';

const ShareModal = React.lazy(() =>
    import('../../features/share/components/ShareModal').then(m => ({ default: m.ShareModal }))
);

export interface DecisionReviewProps {
    userChoice: AugmentData;
    userRerollOrder?: number[];
    correctAugmentId: string;
    proSecondRoll?: AugmentData[];
    proFirstRoll?: AugmentData[];
    initialAugments?: AugmentData[];
    rerollAugments?: AugmentData[];
    proRerollIndices?: number[];
    onNextPuzzle: () => void;
    onReplay: () => void;
    puzzleId: string;
    patch?: string;
    date?: string;
    server?: string;
    encounter?: string;
    streamUrl?: string;
    communityVotes?: CommunityVotes;
    iqChangeResult?: { changeAmount: number; newScore: number; newRank: string } | null;
    proPlayerName?: string;
    proFinalPickData?: AugmentData;
    explanation?: string;
    puzzleTier?: PuzzleTier;
    videoUrl?: string;
    videoTitle?: string;
    onViewLibrary?: () => void;
    declaredPath?: AugmentPath;
    proPickPath?: AugmentPath;
    proReasoningIntent?: string;
    declaredPlan?: StabilizationPlan;
    proPlan?: StabilizationPlan;
    planReasoning?: string;
    onSupportClick?: () => void;
}

type ReviewVariant = 'desktop' | 'mobile';
type ReviewMarker = { text: string; type: 'user' | 'pro' };

const UNKNOWN_AUGMENT: AugmentData = {
    title: 'Không rõ',
    id: 'unknown',
    description: 'Thiếu dữ liệu',
    icon: '',
    tier: 1,
};

const INITIAL_OFFER_LABEL = 'Offer ban đầu';
const REROLL_RESULTS_LABEL = 'Kết quả sau roll';

function pushMarker(markers: ReviewMarker[], condition: boolean, text: string, type: ReviewMarker['type']) {
    if (condition) {
        markers.push({ text, type });
    }
}

export const DecisionReview: React.FC<DecisionReviewProps> = ({
    userChoice,
    userRerollOrder = [],
    correctAugmentId,
    proSecondRoll,
    proFirstRoll = [],
    initialAugments = [],
    rerollAugments = [],
    proRerollIndices = [],
    onNextPuzzle,
    onReplay,
    puzzleId,
    patch,
    date,
    server,
    encounter,
    streamUrl,
    communityVotes = {},
    iqChangeResult,
    proPlayerName = 'Tuyển thủ',
    proFinalPickData,
    explanation,
    puzzleTier = 'free',
    videoUrl,
    videoTitle: videoTitleProp,
    onViewLibrary,
    declaredPath,
    proPickPath,
    proReasoningIntent,
    declaredPlan,
    proPlan,
    planReasoning,
    onSupportClick,
}) => {
    const [showShareModal, setShowShareModal] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);
    const [showMobileIqOverlay, setShowMobileIqOverlay] = useState(true);
    const { user } = useAuth();
    const videoUnlockTriggered = useRef(false);
    const shareCopiedTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (isMobile && iqChangeResult) {
            const timer = setTimeout(() => {
                setShowMobileIqOverlay(false);
            }, 3500); // 900ms count-up + 2.5s badge hold + fade
            return () => clearTimeout(timer);
        }
    }, [isMobile, iqChangeResult]);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }

        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const updateMatch = (event?: MediaQueryListEvent) => {
            setIsMobile(event ? event.matches : mediaQuery.matches);
        };

        updateMatch();

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', updateMatch);
            return () => mediaQuery.removeEventListener('change', updateMatch);
        }

        mediaQuery.addListener(updateMatch);
        return () => mediaQuery.removeListener(updateMatch);
    }, []);

    useEffect(() => {
        return () => {
            if (shareCopiedTimeoutRef.current !== null) {
                window.clearTimeout(shareCopiedTimeoutRef.current);
            }
        };
    }, []);

    const proRerolled = !!(proSecondRoll && proSecondRoll.length > 0);
    const proFinalPick = proFinalPickData
        ?? (proRerolled ? proSecondRoll?.find(a => a.id === correctAugmentId) : proFirstRoll.find(a => a.id === correctAugmentId))
        ?? UNKNOWN_AUGMENT;

    const userMatchedPro = userChoice.title === proFinalPick.title;
    const totalVotes = Object.values(communityVotes).reduce((sum, count) => sum + count, 0);
    const canOpenProPick = Boolean(onViewLibrary || streamUrl);

    const getVotePercent = (augmentTitle: string): number => {
        const votes = communityVotes[augmentTitle] || 0;
        return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    };

    const getVoteCount = (augmentTitle: string): number => communityVotes[augmentTitle] || 0;

    const getChangedSlots = (firstRoll: AugmentData[], secondRoll?: AugmentData[]): number[] => {
        if (!secondRoll || secondRoll.length === 0) return [];

        const changed: number[] = [];
        for (let index = 0; index < 3; index += 1) {
            if (firstRoll[index]?.title !== secondRoll[index]?.title) {
                changed.push(index);
            }
        }
        return changed;
    };

    const effectiveProRerollIndices = proRerollIndices.length > 0
        ? proRerollIndices
        : getChangedSlots(proFirstRoll, proSecondRoll);

    const proRolledSlots = effectiveProRerollIndices;

    const getFinalPickDescription = () => {
        if (userMatchedPro) {
            return (
                <>
                    <span className="user-action">Bạn</span> và{' '}
                    <span className="pro-action">{proPlayerName}</span> cùng chọn{' '}
                    <strong>{userChoice.title}</strong>
                </>
            );
        }

        return (
            <>
                <span className="user-action">Bạn</span> chọn <strong>{userChoice.title}</strong> còn{' '}
                <span className="pro-action">{proPlayerName}</span> chọn <strong>{proFinalPick.title}</strong>
            </>
        );
    };

    useEffect(() => {
        if (!videoUrl || videoUnlockTriggered.current || !iqChangeResult) return;

        videoUnlockTriggered.current = true;

        videoLibraryService.unlockVideo({
            puzzleId,
            videoUrl,
            userResult: userMatchedPro ? 'correct' : 'incorrect',
            iqDelta: iqChangeResult.changeAmount,
        });
    }, [videoUrl, puzzleId, userMatchedPro, iqChangeResult]);

    const handleSharePuzzle = async () => {
        if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;

        await navigator.clipboard.writeText(`${window.location.origin}?puzzle=${puzzleId}`);
        setShareCopied(true);

        if (shareCopiedTimeoutRef.current !== null) {
            window.clearTimeout(shareCopiedTimeoutRef.current);
        }

        shareCopiedTimeoutRef.current = window.setTimeout(() => {
            setShareCopied(false);
        }, 2000);
    };

    const handleOpenProPick = () => {
        if (streamUrl) {
            window.open(streamUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        if (onViewLibrary) {
            onViewLibrary();
        }
    };

    const createInitialMarkers = (augment: AugmentData, index: number): ReviewMarker[] => {
        const rerollSequence = userRerollOrder[index] || 0;
        const isUserRolled = rerollSequence > 0;
        const isProRolled = proRolledSlots.includes(index);
        const isUserPick = !isUserRolled && userChoice.title === augment.title;
        const isProPick = !isProRolled && proFinalPick.title === augment.title;
        const markers: ReviewMarker[] = [];

        pushMarker(markers, isUserRolled, `Bạn đã Roll #${rerollSequence}`, 'user');
        pushMarker(markers, !isUserRolled && isUserPick, 'Bạn chọn', 'user');

        if (isProRolled) {
            const proOrder = proRolledSlots.indexOf(index);
            pushMarker(markers, true, `${proPlayerName} đã Roll${proOrder !== -1 ? ` #${proOrder + 1}` : ''}`, 'pro');
        }
        pushMarker(markers, !isProRolled && isProPick, `${proPlayerName} chọn`, 'pro');

        return markers;
    };

    const createRerollMarkers = (augment: AugmentData, index: number): ReviewMarker[] => {
        const userUnlocked = (userRerollOrder[index] || 0) > 0;
        const proUnlocked = proRolledSlots.includes(index);
        const isUserPick = userUnlocked && userChoice.title === augment.title;
        const isProPick = proUnlocked && proFinalPick.title === augment.title;
        const markers: ReviewMarker[] = [];

        pushMarker(markers, isUserPick, 'Bạn chọn', 'user');
        pushMarker(markers, isProPick, `${proPlayerName} chọn`, 'pro');

        return markers;
    };

    const renderInitialAugmentCards = (variant: ReviewVariant) => initialAugments.slice(0, 3).map((augment, index) => {
        if (!augment) return null;

        const rerollSequence = userRerollOrder[index] || 0;
        const isUserRolled = rerollSequence > 0;
        const isProRolled = proRolledSlots.includes(index);
        const isUserPick = !isUserRolled && userChoice.title === augment.title;
        const isProPick = !isProRolled && proFinalPick.title === augment.title;

        return (
            <div
                key={`initial-${index}`}
                className={`augment-cell slot-cell ${(isUserRolled || isProRolled) && !isUserPick && !isProPick ? 'rolled-away' : ''}`}
            >
                <ReviewCard
                    augment={augment}
                    variant={variant}
                    isUserPick={isUserPick}
                    isProPick={isProPick}
                    proPlayerName={proPlayerName}
                    showVotes={true}
                    votePercent={getVotePercent(augment.title)}
                    voteCount={getVoteCount(augment.title)}
                    markers={createInitialMarkers(augment, index)}
                />
            </div>
        );
    });

    const renderRerollAugmentCards = (variant: ReviewVariant) => rerollAugments.slice(0, 3).map((augment, index) => {
        if (!augment) return null;

        const userUnlocked = (userRerollOrder[index] || 0) > 0;
        const proUnlocked = proRolledSlots.includes(index);
        const isUserPick = userUnlocked && userChoice.title === augment.title;
        const isProPick = proUnlocked && proFinalPick.title === augment.title;

        return (
            <div
                key={`reroll-${index}`}
                className={`augment-cell slot-cell ${userUnlocked || proUnlocked ? 'rolled-result' : 'locked-slot'}`}
            >
                <ReviewCard
                    augment={augment}
                    variant={variant}
                    isUserPick={isUserPick}
                    isProPick={isProPick}
                    proPlayerName={proPlayerName}
                    showVotes={true}
                    votePercent={getVotePercent(augment.title)}
                    voteCount={getVoteCount(augment.title)}
                    markers={createRerollMarkers(augment, index)}
                />
            </div>
        );
    });

    const renderDesktopFinalSection = () => (
        <div className="roll-timeline">
            <div className="roll-section final-section">
                <div className="roll-section-header">
                    <span className="section-title">Lựa chọn cuối</span>
                    <span className={`diverge-badge ${userMatchedPro ? 'matched' : 'diverged'}`}>
                        {userMatchedPro ? `Giống với ${proPlayerName}` : `Khác với ${proPlayerName}`}
                    </span>
                </div>
                <p className="final-description">{getFinalPickDescription()}</p>

                <div className="roll-section-content">
                    <div className="roll-augment-list">
                        <div className="roll-augment-group-label roll-augment-group-label--desktop">{INITIAL_OFFER_LABEL}</div>
                        <div className="final-augment-grid-6">
                            {renderInitialAugmentCards('desktop')}
                        </div>
                    </div>
                    {rerollAugments.length > 0 && (
                        <div className="roll-augment-list">
                            <div className="roll-augment-group-label roll-augment-group-label--desktop">{REROLL_RESULTS_LABEL}</div>
                            <div className="final-augment-grid-6">
                                {renderRerollAugmentCards('desktop')}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderMobileFinalSection = () => (
        <div className="roll-section final-section decision-review-mobile-final">
            <div className="decision-review-mobile-final-header">
                <div className="decision-review-mobile-final-copy">
                    <span className="section-title">So sánh lựa chọn</span>
                    <p className="final-description decision-review-mobile-final-description">
                        {getFinalPickDescription()}
                    </p>
                </div>
            </div>

            <div className="decision-review-mobile-card-group decision-review-mobile-card-group--spaced">
                <div className="decision-review-mobile-group-label decision-review-mobile-group-label--muted">{INITIAL_OFFER_LABEL}</div>
                <div className="decision-review-mobile-card-list decision-review-mobile-grid-6">
                    {renderInitialAugmentCards('mobile')}
                </div>
            </div>

            {rerollAugments.length > 0 && (
                <div className="decision-review-mobile-card-group decision-review-mobile-card-group--spaced">
                    <div className="decision-review-mobile-group-label decision-review-mobile-group-label--muted">{REROLL_RESULTS_LABEL}</div>
                    <div className="decision-review-mobile-card-list decision-review-mobile-grid-6">
                        {renderRerollAugmentCards('mobile')}
                    </div>
                </div>
            )}
        </div>
    );

    const renderDesktopExplanation = () => {
        if (!explanation && !videoUrl) return null;

        return (
            <div className={`explanation-section${videoUrl ? ' has-video' : ''}`}>
                {videoUrl ? (
                    <>
                        <div className="explanation-text-col">
                            <div className="explanation-title">GIẢI THÍCH</div>
                            {explanation && <p className="explanation-text">{explanation}</p>}
                        </div>
                        <div className="explanation-video-col">
                            <div className="explanation-video-header">
                                <div className="explanation-title">VIDEO PHÂN TÍCH</div>
                                {onViewLibrary ? (
                                    <button
                                        type="button"
                                        className="explanation-video-note-link"
                                        onClick={onViewLibrary}
                                    >
                                        Bạn có thể xem lại trong Kho Pro Analysis
                                    </button>
                                ) : (
                                    <span className="explanation-video-note-text">
                                        Video lỗi? Xem lại trong Kho Pro Analysis
                                    </span>
                                )}
                            </div>
                            <div className="explanation-video-wrapper">
                                <iframe
                                    src={buildYouTubeEmbedUrl(videoUrl)}
                                    title={videoTitleProp || 'Video giải thích'}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            {videoTitleProp && (
                                <span className="explanation-video-label">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    {videoTitleProp}
                                </span>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="explanation-title">GIẢI THÍCH</div>
                        <p className="explanation-text">{explanation}</p>
                    </>
                )}
            </div>
        );
    };

    const renderMobileExplanation = () => {
        if (!explanation && !videoUrl) return null;

        return (
            <div className="decision-review-mobile-explanation-stack">
                {explanation && (
                    <div className="explanation-section decision-review-mobile-explanation">
                        <div className="explanation-title">GIẢI THÍCH</div>
                        <p className="explanation-text">{explanation}</p>
                    </div>
                )}

                {videoUrl && (
                    <div className="explanation-section decision-review-mobile-video">
                        <div className="decision-review-mobile-video-header">
                            <div className="explanation-title">VIDEO PHÂN TÍCH</div>
                            {onViewLibrary ? (
                                <button
                                    type="button"
                                    className="explanation-video-note-link decision-review-mobile-video-link"
                                    onClick={onViewLibrary}
                                >
                                    Mở Kho Pro Analysis
                                </button>
                            ) : (
                                <span className="explanation-video-note-text">
                                    Video lỗi? Xem lại trong Kho Pro Analysis
                                </span>
                            )}
                        </div>
                        <div className="explanation-video-wrapper">
                            <iframe
                                src={buildYouTubeEmbedUrl(videoUrl)}
                                title={videoTitleProp || 'Video giải thích'}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        {videoTitleProp && (
                            <span className="explanation-video-label">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                {videoTitleProp}
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderDesktopSurface = () => (
        <div className="decision-review-scroll-wrapper">
            <PuzzleInfo
                puzzleId={puzzleId}
                patch={patch}
                date={date}
                server={server}
                encounter={encounter}
                streamUrl={streamUrl}
                onViewLibrary={onViewLibrary}
                userMatchedPro={userMatchedPro}
            />

            <MemeFeedback isCorrect={userMatchedPro} />

            {proPickPath && !proPlan && (
                <IntentFeedback
                    declaredPath={declaredPath}
                    proPickPath={proPickPath}
                    proReasoningIntent={proReasoningIntent}
                />
            )}

            {proPlan && (
                <PlanFeedback
                    declaredPlan={declaredPlan}
                    proPlan={proPlan}
                    planReasoning={planReasoning}
                />
            )}

            {renderDesktopFinalSection()}
            {renderDesktopExplanation()}

            <div className="review-bottom-bar">
                {iqChangeResult ? (
                    <IqScoreSummary
                        newScore={iqChangeResult.newScore}
                        changeAmount={iqChangeResult.changeAmount}
                        newRank={iqChangeResult.newRank}
                    />
                ) : <div />}
                <div className="review-actions">
                    {onSupportClick && (
                        <button
                            className="review-btn support-btn review-btn--support-spaced"
                            onClick={onSupportClick}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.501 5.501 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                            Ủng hộ
                        </button>
                    )}
                    {iqChangeResult && (
                        <button
                            className="review-btn review-btn--flex"
                            onClick={() => setShowShareModal(true)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                                <polyline points="16 6 12 2 8 6" />
                                <line x1="12" y1="2" x2="12" y2="15" />
                            </svg>
                            Flex
                        </button>
                    )}
                    <ReviewActions onReplay={onReplay} onNextPuzzle={onNextPuzzle} />
                </div>
            </div>
        </div>
    );

    const renderMobileSurface = () => (
        <div className="decision-review-mobile-shell">
            {showMobileIqOverlay && iqChangeResult && (
                <div className="decision-review-mobile-iq-overlay">
                    <IqScoreSummary
                        newScore={iqChangeResult.newScore}
                        changeAmount={iqChangeResult.changeAmount}
                        newRank={iqChangeResult.newRank}
                    />
                </div>
            )}

            <div className="decision-review-mobile-header decision-review-mobile-header--compact">
                <div className="decision-review-mobile-utility-actions decision-review-mobile-utility-actions--centered">
                    <div className="decision-review-mobile-action-strip">
                        <button
                            type="button"
                            className="action-btn puzzle-share-btn"
                            onClick={() => { void handleSharePuzzle(); }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            {shareCopied ? 'Đã copy' : 'Chia sẻ'}
                        </button>

                        {canOpenProPick && (
                            <button
                                type="button"
                                className="action-btn stream-btn"
                                onClick={handleOpenProPick}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                                </svg>
                                Pro VOD
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="decision-review-mobile-scroll">
                <MemeFeedback isCorrect={userMatchedPro} />

                {proPickPath && !proPlan && (
                    <IntentFeedback
                        declaredPath={declaredPath}
                        proPickPath={proPickPath}
                        proReasoningIntent={proReasoningIntent}
                    />
                )}

                {proPlan && (
                    <PlanFeedback
                        declaredPlan={declaredPlan}
                        proPlan={proPlan}
                        planReasoning={planReasoning}
                    />
                )}

                {renderMobileFinalSection()}
                {renderMobileExplanation()}
            </div>

            <div className="decision-review-mobile-footer">
                <div className="decision-review-mobile-action-row">
                    <button className="review-btn replay-btn" onClick={onReplay}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 4v6h6" />
                            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                        </svg>
                        Thử Lại
                    </button>

                    {onSupportClick && (
                        <button className="review-btn support-btn" onClick={onSupportClick}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.501 5.501 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                            Ủng Hộ
                        </button>
                    )}

                    <button className="review-btn next-btn review-btn--primary" onClick={onNextPuzzle}>
                        Tiếp Theo
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div >
    );

    return (
        <>
            <div className={`decision-review-overlay${puzzleTier !== 'free' ? ` tier-${puzzleTier}` : ''}`}>
                <div
                    className={`decision-review-container${isMobile ? ' decision-review-container--mobile' : ' decision-review-container--desktop'}${puzzleTier !== 'free' ? ` tier-${puzzleTier}` : ''}`}
                >
                    {isMobile ? renderMobileSurface() : renderDesktopSurface()}
                </div>
            </div>

            {showShareModal && iqChangeResult && (
                <Suspense fallback={null}>
                    <ShareModal
                        data={{
                            username: user?.display_name || 'Summoner',
                            iqScore: iqChangeResult.newScore,
                            iqRank: calculateUserIqRank(iqChangeResult.newScore),
                            recentPuzzle: {
                                rank: 'Thách Đấu',
                                addedIq: iqChangeResult.changeAmount,
                            },
                        }}
                        onClose={() => setShowShareModal(false)}
                    />
                </Suspense>
            )}
        </>
    );
};
