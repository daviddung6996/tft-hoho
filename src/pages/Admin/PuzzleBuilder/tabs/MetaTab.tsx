import React from 'react';
import { PuzzleScenario } from '../../../../data/puzzleScenarios';
import './MetaTab.css';

interface MetaTabProps {
    puzzle: PuzzleScenario;
    updatePuzzle: (updates: Partial<PuzzleScenario>) => void;
}

const MetaTab: React.FC<MetaTabProps> = ({ puzzle, updatePuzzle }) => {
    return (
        <div className="pb-builder-view admin-content-transition" key="meta">
            <div className="pb-meta-container">
                {/* Match Information */}
                <div className="pb-section">
                    <h3 className="pb-section-title">Thông tin trận đấu</h3>
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
                                placeholder="e.g., 1200 LP, Set 16 T1"
                            />
                        </div>
                        <div className="pb-field-group">
                            <label className="pb-label">Giai đoạn *</label>
                            <input
                                className="hex-input"
                                value={puzzle.stage}
                                onChange={e => updatePuzzle({ stage: e.target.value })}
                                placeholder="e.g., 2-1, 3-2, 4-5"
                            />
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
            </div>
        </div>
    );
};

export default MetaTab;
