import React, { useState, useEffect, useRef, Suspense } from 'react';
import { AugmentData } from '../../services/augmentService';
import { AugmentPath, StabilizationPlan, CommunityVotes } from '../../data/puzzleScenarios';
import { PuzzleTier } from '../../features/tcoin/tcoin.types';
import { TierIcon } from '../common/TierIcon';
import './DecisionReview.css';

import { ReviewCard } from './DecisionReviewComponents/ReviewCard';
import { PuzzleInfo } from './DecisionReviewComponents/PuzzleInfo';
import { ReviewActions } from './DecisionReviewComponents/ReviewActions';
import { MemeFeedback } from '../../features/puzzle/feedback/MemeFeedback';
import { IqScoreSummary } from '../../features/user-iq/components/IqScoreSummary';
// Lazy-load ShareModal (heavy: remotion, @remotion/player, html-to-image)
const ShareModal = React.lazy(() =>
    import('../../features/share/components/ShareModal').then(m => ({ default: m.ShareModal }))
);
import { useAuth } from '../../contexts/AuthContext';
import { calculateUserIqRank } from '../../features/user-iq/userIqCalculator';
import { videoLibraryService } from '../../features/video-library/videoLibrary.service';
import { IntentFeedback } from '../../features/augment-trainer/components/IntentFeedback';
import { PlanFeedback } from '../../features/augment-trainer/components/PlanFeedback';
import { buildYouTubeEmbedUrl } from '../../utils/youtube';


export interface DecisionReviewProps {
    userChoice: AugmentData;
    userRerollOrder?: number[];
    correctAugmentId: string;
    proSecondRoll?: AugmentData[];
    proFirstRoll?: AugmentData[];
    // All 6 augments from puzzle config
    initialAugments?: AugmentData[];
    rerollAugments?: AugmentData[];
    // Track which slots were rolled
    proRerollIndices?: number[]; // [0,1,2] = rolled all 3 slots
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
    // V2: Intent declaration data
    declaredPath?: AugmentPath;
    proPickPath?: AugmentPath;
    proReasoningIntent?: string;
    // V3: Plan declaration data (4-2)
    declaredPlan?: StabilizationPlan;
    proPlan?: StabilizationPlan;
    planReasoning?: string;
    onSupportClick?: () => void;
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
    // V2: Intent data
    declaredPath,
    proPickPath,
    proReasoningIntent,
    // V3: Plan data (4-2)
    declaredPlan,
    proPlan,
    planReasoning,
    onSupportClick,
}) => {

    const [showShareModal, setShowShareModal] = useState(false);
    const { user } = useAuth();
    const videoUnlockTriggered = useRef(false);

    const proRerolled = !!(proSecondRoll && proSecondRoll.length > 0);

    const UNKNOWN_AUGMENT: AugmentData = { title: 'Không rõ', id: 'unknown', description: 'Thiếu dữ liệu', icon: '', tier: 1 };
    const proFinalPick = proFinalPickData
        ?? (proRerolled ? proSecondRoll!.find(a => a.id === correctAugmentId) : proFirstRoll.find(a => a.id === correctAugmentId))
        ?? UNKNOWN_AUGMENT;

    const userMatchedPro = userChoice.title === proFinalPick.title;

    // --- HELPER: VOTE ---
    const totalVotes = Object.values(communityVotes).reduce((sum, count) => sum + count, 0);
    const getVotePercent = (augmentTitle: string): number => {
        const votes = communityVotes[augmentTitle] || 0;
        return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    };
    const getVoteCount = (augmentTitle: string): number => communityVotes[augmentTitle] || 0;

    // --- DETECT WHICH SLOTS CHANGED ---
    const getChangedSlots = (firstRoll: AugmentData[], secondRoll?: AugmentData[]): number[] => {
        if (!secondRoll || secondRoll.length === 0) return [];
        const changed: number[] = [];
        for (let i = 0; i < 3; i++) {
            if (firstRoll[i]?.title !== secondRoll[i]?.title) {
                changed.push(i);
            }
        }
        return changed;
    };

    // Override: Use proRerollIndices directly to preserve order (e.g. [2, 0, 1])
    // Only fall back to specific overrides or diffs if data is missing.
    const effectiveProRerollIndices = (proRerollIndices && proRerollIndices.length > 0)
        ? proRerollIndices
        : getChangedSlots(proFirstRoll, proSecondRoll);

    const proRolledSlots = effectiveProRerollIndices;

    // Final pick text
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

    // Video unlock effect — trigger once after iqChangeResult resolves so iqDelta is recorded correctly.
    // Guard ref prevents re-running if other deps change after the first successful call.
    useEffect(() => {
        if (!videoUrl || videoUnlockTriggered.current) return;
        if (!iqChangeResult) return; // wait for IQ update to complete before recording iqDelta

        videoUnlockTriggered.current = true;

        videoLibraryService.unlockVideo({
            puzzleId,
            videoUrl,
            userResult: userMatchedPro ? 'correct' : 'incorrect',
            iqDelta: iqChangeResult.changeAmount,
        });
    }, [videoUrl, puzzleId, userMatchedPro, iqChangeResult]);

    return (
        <>
            <div className={`decision-review-overlay${puzzleTier && puzzleTier !== 'free' ? ` tier-${puzzleTier}` : ''}`}>
                <div className={`decision-review-container${puzzleTier && puzzleTier !== 'free' ? ` tier-${puzzleTier}` : ''}`}>

                    {/* --- CLOSE BUTTON --- */}
                    <button className="review-close-btn" onClick={onNextPuzzle} aria-label="Đóng">
                        <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
                            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>

                    {/* --- TIER BADGE --- */}
                    {puzzleTier && puzzleTier !== 'free' && (
                        <div className="review-tier-badge">
                            <TierIcon tier={puzzleTier} size={16} />
                            <span className={`review-tier-label tier-${puzzleTier}`}>
                                {puzzleTier === 'advanced' ? 'Tình huống nâng cao' : 'Tình huống hiếm'}
                            </span>
                        </div>
                    )}

                    {/* --- HEADER --- */}
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

                    {/* --- MEME FEEDBACK --- */}
                    <MemeFeedback isCorrect={userMatchedPro} />

                    {/* --- V2: INTENT FEEDBACK (3-2 only — skip if 4-2 plan exists) --- */}
                    {proPickPath && !proPlan && (
                        <IntentFeedback
                            declaredPath={declaredPath}
                            proPickPath={proPickPath}
                            proReasoningIntent={proReasoningIntent}
                        />
                    )}

                    {/* --- V3: PLAN FEEDBACK (4-2) --- */}
                    {proPlan && (
                        <PlanFeedback
                            declaredPlan={declaredPlan}
                            proPlan={proPlan}
                            planReasoning={planReasoning}
                        />
                    )}

                    {/* --- TIMELINE REMOVED - DIRECT TO FINAL PICK --- */}
                    <div className="roll-timeline">
                        {/* ========== FINAL PICK - All 6 Augments ========== */}
                        <div className="roll-section final-section">
                            <div className="roll-section-header">
                                <span className="section-title">Lựa chọn cuối</span>
                                <span className={`diverge-badge ${userMatchedPro ? 'matched' : 'diverged'}`}>
                                    {userMatchedPro ? 'Giống với ' + proPlayerName : 'Khác với ' + proPlayerName}
                                </span>
                            </div>
                            <p className="final-description">{getFinalPickDescription()}</p>

                            {/* All 6 augments in 2 rows of 3 */}
                            <div className="final-augment-grid-6">
                                {/* Initial 3 augments */}
                                {initialAugments.slice(0, 3).map((aug, idx) => {
                                    if (!aug) return null;

                                    const rerollSeq = userRerollOrder ? userRerollOrder[idx] : 0;
                                    const isUserRolled = rerollSeq > 0;

                                    // Check if Pro rolled this specific slot.
                                    // proRolledSlots contains INDICES of slots the pro rolled.
                                    const isProRolled = proRolledSlots.includes(idx);

                                    // User picked this IF it wasn't rerolled AND titles match
                                    const isUserPick = !isUserRolled && userChoice.title === aug.title;
                                    // Pro picked this IF it wasn't rerolled AND titles match
                                    const isProPick = !isProRolled && proFinalPick.title === aug.title;

                                    // Build markers array
                                    const markers: { text: string; type: 'user' | 'pro' }[] = [];

                                    // USER MARKERS
                                    if (isUserRolled) {
                                        markers.push({ text: `Bạn đã Roll #${rerollSeq}`, type: 'user' });
                                    } else if (isUserPick) {
                                        markers.push({ text: 'Bạn chọn', type: 'user' });
                                    }

                                    // PRO MARKERS
                                    if (isProRolled) {
                                        const proOrder = proRolledSlots.indexOf(idx);
                                        markers.push({ text: `${proPlayerName} đã Roll${proOrder !== -1 ? ` #${proOrder + 1}` : ''}`, type: 'pro' });
                                    } else if (isProPick) {
                                        markers.push({ text: `${proPlayerName} chọn`, type: 'pro' });
                                    }

                                    return (
                                        <div key={`fp-${idx}`} className={`augment-cell slot-cell ${(isUserRolled || isProRolled) && !isUserPick && !isProPick ? 'rolled-away' : ''}`}>
                                            <ReviewCard
                                                augment={aug}
                                                isUserPick={isUserPick}
                                                isProPick={isProPick}
                                                proPlayerName={proPlayerName}
                                                showVotes={true}
                                                votePercent={getVotePercent(aug.title)}
                                                voteCount={getVoteCount(aug.title)}
                                                markers={markers}
                                            />
                                        </div>
                                    );
                                })}

                                {/* Reroll 3 augments */}
                                {rerollAugments.slice(0, 3).map((aug, idx) => {
                                    if (!aug) return null;

                                    // Can only interact with reroll slot if corresponding initial slot was rerolled
                                    const userUnlocked = (userRerollOrder ? userRerollOrder[idx] : 0) > 0;
                                    const proUnlocked = proRolledSlots.includes(idx);

                                    // Picking logic: Must be unlocked and match title
                                    const isUserPick = userUnlocked && userChoice.title === aug.title;
                                    const isProPick = proUnlocked && proFinalPick.title === aug.title;

                                    // Build markers array - Only show if Picked or available
                                    const markers: { text: string; type: 'user' | 'pro' }[] = [];
                                    if (isUserPick) {
                                        markers.push({ text: 'Bạn chọn', type: 'user' });
                                    }
                                    if (isProPick) {
                                        markers.push({ text: `${proPlayerName} chọn`, type: 'pro' });
                                    }

                                    return (
                                        <div key={`fp-r-${idx}`} className={`augment-cell slot-cell ${userUnlocked || proUnlocked ? 'rolled-result' : 'locked-slot'}`}>
                                            <ReviewCard
                                                augment={aug}
                                                isUserPick={isUserPick}
                                                isProPick={isProPick}
                                                proPlayerName={proPlayerName}
                                                showVotes={true}
                                                votePercent={getVotePercent(aug.title)}
                                                voteCount={getVoteCount(aug.title)}
                                                markers={markers}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* --- EXPLANATION SECTION --- */}
                    {(explanation || videoUrl) && (
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
                    )}

                    {/* --- BOTTOM BAR: IQ Score + Actions --- */}
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
                                    className="review-btn support-btn"
                                    onClick={onSupportClick}
                                    style={{ marginRight: '8px' }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.501 5.501 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                    </svg>
                                    Ủng hộ
                                </button>
                            )}
                            {iqChangeResult && (
                                <button
                                    className="review-btn"
                                    onClick={() => setShowShareModal(true)}
                                    style={{ color: '#c8aa6e' }}
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

            </div>

            {/* Share Flex Modal — rendered outside decision-review-overlay to escape its stacking context */}
            {showShareModal && iqChangeResult && (
                <Suspense fallback={null}>
                    <ShareModal
                        data={{
                            username: user?.display_name || 'Summoner',
                            iqScore: iqChangeResult.newScore,
                            iqRank: calculateUserIqRank(iqChangeResult.newScore),
                            recentPuzzle: {
                                rank: 'Thách Đấu',
                                addedIq: iqChangeResult.changeAmount
                            }
                        }}
                        onClose={() => setShowShareModal(false)}
                    />
                </Suspense>
            )}
        </>
    );
};
