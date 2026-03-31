import React, { useState } from 'react';
import { PuzzleScenario, AugmentPath, PuzzleDifficulty, StabilizationPlan } from '../../../../data/puzzleScenarios';
import { Champion } from '../../../../data/types';
import { AugmentData } from '../../../../services/augmentService';
import { Item } from '../../../../services/itemService';
import { TierSelect } from '../../../../components/common/TierSelect';
import { VideoSelect } from '../../../../components/common/VideoSelect';
import { VideoExplanationModal } from '../../../../components/common/VideoExplanationModal';
import JsonImportModal from '../components/JsonImportModal';
import './MetaTab.css';

interface MetaTabProps {
    puzzle: PuzzleScenario;
    updatePuzzle: (updates: Partial<PuzzleScenario>) => void;
    overwritePuzzle: (newPuzzle: PuzzleScenario) => void;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    champions: Champion[];
    dbAugments: AugmentData[];
    dbItems: Item[];
}

const MetaTab: React.FC<MetaTabProps> = ({
    puzzle, updatePuzzle, overwritePuzzle, showToast, champions, dbAugments, dbItems
}) => {
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [showJsonImport, setShowJsonImport] = useState(false);

    const handleVideoSelectChange = (hasVideo: boolean) => {
        if (hasVideo) {
            setShowVideoModal(true);
        } else {
            updatePuzzle({ explanationVideoUrl: '' });
        }
    };

    return (
        <>
            <div className="pb-builder-view admin-content-transition" key="meta">
                <div className="pb-meta-container">
                    {/* Match Information */}
                    <div className="pb-section">
                        <div className="pb-section-header">
                            <h3 className="pb-section-title">Thông tin trận đấu</h3>
                            <button
                                type="button"
                                className="json-import-trigger-btn"
                                onClick={() => setShowJsonImport(true)}
                                title="Import Puzzle từ JSON"
                            >
                                📋 Import JSON
                            </button>
                        </div>
                        <div className="pb-field-group" style={{ marginBottom: '1cqw' }}>
                            <label className="pb-label">Tiêu đề Puzzles</label>
                            <input
                                className="hex-input"
                                value={puzzle.title || ''}
                                onChange={e => updatePuzzle({ title: e.target.value })}
                                placeholder="e.g., Wasion 2-1 augment choice special"
                            />
                        </div>
                        <div className="pb-field-row">
                            <div className="pb-field-group">
                                <label className="pb-label">Độ hiếm tình huống</label>
                                <TierSelect
                                    value={puzzle.tier || 'free'}
                                    onChange={tier => updatePuzzle({ tier })}
                                />
                            </div>
                            <div className="pb-field-group">
                                <label className="pb-label">Giải Thích Video</label>
                                <VideoSelect
                                    hasVideo={!!puzzle.explanationVideoUrl}
                                    videoUrl={puzzle.explanationVideoUrl}
                                    onChange={handleVideoSelectChange}
                                />
                                {puzzle.explanationVideoUrl && (
                                    <button
                                        type="button"
                                        className="vem-edit-link"
                                        onClick={() => setShowVideoModal(true)}
                                    >
                                        ✏ Sửa link video
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="pb-field-row">
                            <div className="pb-field-group">
                                <label className="pb-label">Tên tuyển thủ *</label>
                                <input
                                    className="hex-input"
                                    value={puzzle.proPlayer}
                                    onChange={e => updatePuzzle({ proPlayer: e.target.value })}
                                    placeholder="e.g., Dishsoap, Soju, Pengu"
                                />
                            </div>
                            <div className="pb-field-group">
                                <label className="pb-label">Hạng</label>
                                <input
                                    className="hex-input"
                                    value={puzzle.rank}
                                    onChange={e => updatePuzzle({ rank: e.target.value })}
                                    placeholder="e.g., Challenger, Grandmaster"
                                />
                            </div>
                        </div>
                        <div className="pb-field-row">
                            <div className="pb-field-group">
                                <label className="pb-label">LP / Chi tiết hạng</label>
                                <input
                                    className="hex-input"
                                    value={puzzle.proLpRank || ''}
                                    onChange={e => updatePuzzle({ proLpRank: e.target.value })}
                                    placeholder="e.g., 1200 LP, Set 17 T1"
                                />
                            </div>
                            <div className="pb-field-group">
                                <label className="pb-label">Giai đoạn *</label>
                                <select
                                    className="hex-input"
                                    value={puzzle.stage || '2-1'}
                                    onChange={e => updatePuzzle({ stage: e.target.value })}
                                >
                                    <option value="2-1">2-1 — Chọn lõi 1</option>
                                    <option value="3-2">3-2 — Chọn lõi 2</option>
                                    <option value="4-2">4-2 — Chọn lõi 3</option>
                                </select>
                            </div>
                        </div>
                        <div className="pb-field-row">
                            <div className="pb-field-group">
                                <label className="pb-label">Phiên bản</label>
                                <input
                                    className="hex-input"
                                    value={puzzle.patch || ''}
                                    onChange={e => updatePuzzle({ patch: e.target.value })}
                                    placeholder="e.g., 16.3b, 16.4"
                                />
                            </div>
                            <div className="pb-field-group">
                                <label className="pb-label">Ngày</label>
                                <input
                                    type="date"
                                    className="hex-input"
                                    value={puzzle.date || ''}
                                    onChange={e => updatePuzzle({ date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="pb-field-row">
                            <div className="pb-field-group">
                                <label className="pb-label">Máy chủ / Khu vực</label>
                                <input
                                    className="hex-input"
                                    value={puzzle.server || ''}
                                    onChange={e => updatePuzzle({ server: e.target.value })}
                                    placeholder="e.g., NA, EUW, KR, VN"
                                />
                            </div>
                            <div className="pb-field-group">
                                <label className="pb-label">Loại sự kiện</label>
                                <input
                                    className="hex-input"
                                    value={puzzle.encounter || ''}
                                    onChange={e => updatePuzzle({ encounter: e.target.value })}
                                    placeholder="e.g., Component Anvils, Krugs, Gold Opener"
                                />
                            </div>
                        </div>
                    </div>

                    {/* VOD Information */}
                    <div className="pb-section">
                        <h3 className="pb-section-title">Thông tin VOD</h3>
                        <div className="pb-field-group">
                            <label className="pb-label">Link Stream / VOD</label>
                            <input
                                type="url"
                                className="hex-input"
                                value={puzzle.streamUrl || ''}
                                onChange={e => updatePuzzle({ streamUrl: e.target.value })}
                                placeholder="https://twitch.tv/videos/..."
                            />
                        </div>
                        <div className="pb-field-row">
                            <div className="pb-field-group">
                                <label className="pb-label">Mốc thời gian VOD</label>
                                <input
                                    className="hex-input"
                                    value={puzzle.vodTimestamp || ''}
                                    onChange={e => updatePuzzle({ vodTimestamp: e.target.value })}
                                    placeholder="e.g., 1:23:45 or 12:34"
                                />
                            </div>
                            <div className="pb-field-group">
                                <label className="pb-label">Nguồn VOD</label>
                                <select
                                    className="hex-input"
                                    value={puzzle.vodSource || 'twitch'}
                                    onChange={e => updatePuzzle({ vodSource: e.target.value as 'twitch' | 'youtube' | 'other' })}
                                >
                                    <option value="twitch">Twitch</option>
                                    <option value="youtube">YouTube</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pro Player Details */}
                    <div className="pb-section">
                        <h3 className="pb-section-title">Thông tin tuyển thủ</h3>
                        <div className="pb-field-group">
                            <label className="pb-label">Link mạng xã hội</label>
                            <input
                                type="url"
                                className="hex-input"
                                value={puzzle.proSocialLink || ''}
                                onChange={e => updatePuzzle({ proSocialLink: e.target.value })}
                                placeholder="https://twitch.tv/dishsoap or https://twitter.com/..."
                            />
                        </div>
                    </div>

                    {/* Game Context */}
                    <div className="pb-section">
                        <h3 className="pb-section-title">Bối cảnh trận đấu</h3>
                        <div className="pb-field-group">
                            <label className="pb-label">Tên giải đấu</label>
                            <input
                                className="hex-input"
                                value={puzzle.tournamentName || ''}
                                onChange={e => updatePuzzle({ tournamentName: e.target.value })}
                                placeholder="e.g., Tactician's Cup, Regional Finals"
                            />
                        </div>
                        <div className="pb-field-group">
                            <label className="pb-label">Máu lobby (8 người chơi)</label>
                            <input
                                className="hex-input"
                                value={puzzle.lobbyHealth || ''}
                                onChange={e => updatePuzzle({ lobbyHealth: e.target.value })}
                                placeholder="e.g., 100, 95, 90, 85, 80, 75, 70, 65"
                            />
                            <span className="pb-hint">Giá trị HP cách nhau bằng dấu phẩy cho 8 người chơi</span>
                        </div>
                        <div className="pb-field-group">
                            <label className="pb-label">Giải thích / Phân tích</label>
                            <textarea
                                className="hex-input hex-textarea"
                                value={puzzle.explanation || ''}
                                onChange={e => updatePuzzle({ explanation: e.target.value })}
                                placeholder="Explain the pro's decision and why it was optimal..."
                            />
                        </div>
                    </div>

                    {/* V2: Augment Trainer Fields (3-2) */}
                    {puzzle.stage === '3-2' && (
                        <div className="pb-section">
                            <h3 className="pb-section-title" style={{ color: '#c8aa6e' }}>
                                V2 — Augment Trainer (3-2)
                            </h3>

                            {/* Streak History Builder */}
                            <div className="pb-field-group">
                                <label className="pb-label">Streak History (5 rounds trước 3-2)</label>
                                <div style={{ display: 'flex', gap: '0.5cqw', marginTop: '0.3cqw' }}>
                                    {[0, 1, 2, 3, 4].map(i => {
                                        const history = puzzle.streakHistory || [true, true, true, true, true];
                                        const isWin = history[i] ?? true;
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                className="hex-input"
                                                style={{
                                                    width: '3.5cqw',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    background: isWin ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                                    border: `1px solid ${isWin ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
                                                    color: isWin ? '#22c55e' : '#ef4444',
                                                    fontWeight: 700,
                                                    padding: '0.4cqw'
                                                }}
                                                onClick={() => {
                                                    const newHistory = [...(puzzle.streakHistory || [true, true, true, true, true])];
                                                    newHistory[i] = !newHistory[i];
                                                    updatePuzzle({
                                                        streakHistory: newHistory
                                                    });
                                                }}
                                            >
                                                {isWin ? 'W' : 'L'}
                                            </button>
                                        );
                                    })}
                                    <span className="pb-hint" style={{ alignSelf: 'center', marginLeft: '0.5cqw' }}>
                                        Streak: {puzzle.streakCount ?? 0}
                                    </span>
                                </div>
                            </div>

                            <div className="pb-field-group">
                                <label className="pb-label">Streak Count (nhập tay)</label>
                                <input
                                    type="number"
                                    className="hex-input"
                                    value={puzzle.streakCount ?? 0}
                                    onChange={e => {
                                        const parsed = Number.parseInt(e.target.value, 10);
                                        const streakCount = Number.isNaN(parsed) ? 0 : parsed;
                                        updatePuzzle({
                                            streakCount
                                        });
                                    }}
                                />
                                <span className="pb-hint">
                                    Dương = chuỗi thắng, âm = chuỗi thua.
                                </span>
                            </div>

                            {/* Pro Pick Path */}
                            <div className="pb-field-group">
                                <label className="pb-label">Pro Pick Path (Intent) *</label>
                                <div style={{ display: 'flex', gap: '0.8cqw', marginTop: '0.3cqw' }}>
                                    {(['econ', 'item', 'combat', 'emblem'] as AugmentPath[]).map(path => (
                                        <label key={path} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.3cqw',
                                            cursor: 'pointer',
                                            color: puzzle.proPickPath === path ? '#c8aa6e' : '#94A3B8'
                                        }}>
                                            <input
                                                type="radio"
                                                name="proPickPath"
                                                value={path}
                                                checked={puzzle.proPickPath === path}
                                                onChange={() => updatePuzzle({ proPickPath: path })}
                                            />
                                            {path === 'econ' ? '💰 Econ' :
                                                path === 'item' ? '⚔️ Item' :
                                                    path === 'combat' ? '🔥 Combat' : '🏅 Emblem'}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div className="pb-field-group">
                                <label className="pb-label">Độ khó</label>
                                <select
                                    className="hex-input"
                                    value={puzzle.difficulty || 'straightforward'}
                                    onChange={e => updatePuzzle({ difficulty: e.target.value as PuzzleDifficulty })}
                                >
                                    <option value="straightforward">Đơn giản (Straightforward)</option>
                                    <option value="close_call">Sát nút (Close Call)</option>
                                    <option value="counter_intuitive">Ngược dòng (Counter-Intuitive)</option>
                                </select>
                            </div>

                            {/* Pro Reasoning Intent */}
                            <div className="pb-field-group">
                                <label className="pb-label">Giải thích Intent của Pro</label>
                                <textarea
                                    className="hex-input hex-textarea"
                                    value={puzzle.proReasoningIntent || ''}
                                    onChange={e => updatePuzzle({ proReasoningIntent: e.target.value })}
                                    placeholder="2-3 câu: Tại sao Pro chọn path này? Ví dụ: 'Win streak 4, board mạnh, không cần econ. Cần item để complete build...'"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    {/* V3: Augment Trainer Fields (4-2) */}
                    {puzzle.stage === '4-2' && (
                        <div className="pb-section">
                            <h3 className="pb-section-title" style={{ color: '#22c55e' }}>
                                V3 — Augment Trainer (4-2)
                            </h3>

                            {/* Streak History Builder */}
                            <div className="pb-field-group">
                                <label className="pb-label">Streak History (5 rounds trước 4-2)</label>
                                <div style={{ display: 'flex', gap: '0.5cqw', marginTop: '0.3cqw' }}>
                                    {[0, 1, 2, 3, 4].map(i => {
                                        const history = puzzle.streakHistory || [true, true, true, true, true];
                                        const isWin = history[i] ?? true;
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                className="hex-input"
                                                style={{
                                                    width: '3.5cqw',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    background: isWin ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                                    border: `1px solid ${isWin ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
                                                    color: isWin ? '#22c55e' : '#ef4444',
                                                    fontWeight: 700,
                                                    padding: '0.4cqw'
                                                }}
                                                onClick={() => {
                                                    const newHistory = [...(puzzle.streakHistory || [true, true, true, true, true])];
                                                    newHistory[i] = !newHistory[i];
                                                    updatePuzzle({
                                                        streakHistory: newHistory
                                                    });
                                                }}
                                            >
                                                {isWin ? 'W' : 'L'}
                                            </button>
                                        );
                                    })}
                                    <span className="pb-hint" style={{ alignSelf: 'center', marginLeft: '0.5cqw' }}>
                                        Streak: {puzzle.streakCount ?? 0}
                                    </span>
                                </div>
                            </div>

                            <div className="pb-field-group">
                                <label className="pb-label">Streak Count (nhập tay)</label>
                                <input
                                    type="number"
                                    className="hex-input"
                                    value={puzzle.streakCount ?? 0}
                                    onChange={e => {
                                        const parsed = Number.parseInt(e.target.value, 10);
                                        const streakCount = Number.isNaN(parsed) ? 0 : parsed;
                                        updatePuzzle({
                                            streakCount
                                        });
                                    }}
                                />
                                <span className="pb-hint">
                                    Dương = chuỗi thắng, âm = chuỗi thua.
                                </span>
                            </div>

                            {/* Pro Plan */}
                            <div className="pb-field-group">
                                <label className="pb-label">Pro Stabilization Plan *</label>
                                <div style={{ display: 'flex', gap: '0.8cqw', marginTop: '0.3cqw' }}>
                                    {(['stabilize', 'cap', 'patch', 'greed'] as StabilizationPlan[]).map(plan => (
                                        <label key={plan} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.3cqw',
                                            cursor: 'pointer',
                                            color: puzzle.proPlan === plan ? '#c8aa6e' : '#94A3B8'
                                        }}>
                                            <input
                                                type="radio"
                                                name="proPlan"
                                                value={plan}
                                                checked={puzzle.proPlan === plan}
                                                onChange={() => updatePuzzle({ proPlan: plan })}
                                            />
                                            {plan === 'stabilize' ? '🛡️ Stabilize' :
                                                plan === 'cap' ? '⬆️ Cap' :
                                                    plan === 'patch' ? '🔧 Patch' : '💰 Greed'}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Plan Reasoning */}
                            <div className="pb-field-group">
                                <label className="pb-label">Giải thích Plan của Pro</label>
                                <textarea
                                    className="hex-input hex-textarea"
                                    value={puzzle.planReasoning || ''}
                                    onChange={e => updatePuzzle({ planReasoning: e.target.value })}
                                    placeholder="2-3 câu: Tại sao Pro chọn plan này? Ví dụ: 'HP 35, board trung bình, cần stabilize ngay. Combat augment giúp survive đến 5-1...'"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Video explanation modal — opens when user selects "Có video" or clicks "Sửa link" */}
            {showVideoModal && (
                <VideoExplanationModal
                    initialUrl={puzzle.explanationVideoUrl || ''}
                    onSave={url => updatePuzzle({ explanationVideoUrl: url })}
                    onClose={() => setShowVideoModal(false)}
                />
            )}

            {showJsonImport && (
                <JsonImportModal
                    onImport={overwritePuzzle}
                    onClose={() => setShowJsonImport(false)}
                    showToast={showToast}
                    champions={champions}
                    dbAugments={dbAugments}
                    dbItems={dbItems}
                />
            )}
        </>
    );
};

export default MetaTab;
