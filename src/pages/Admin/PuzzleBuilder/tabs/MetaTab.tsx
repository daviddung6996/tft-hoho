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
                    <h3 className="pb-section-title">Match Information</h3>
                    <div className="pb-field-group" style={{ marginBottom: '1cqw' }}>
                        <label className="pb-label">Puzzle Title (Custom Name)</label>
                        <input
                            className="hex-input"
                            value={puzzle.title || ''}
                            onChange={e => updatePuzzle({ title: e.target.value })}
                            placeholder="e.g., Wasion 2-1 augment choice special"
                        />
                    </div>
                    <div className="pb-field-row">
                        <div className="pb-field-group">
                            <label className="pb-label">Pro Player Name *</label>
                            <input
                                className="hex-input"
                                value={puzzle.proPlayer}
                                onChange={e => updatePuzzle({ proPlayer: e.target.value })}
                                placeholder="e.g., Dishsoap, Soju, Pengu"
                            />
                        </div>
                        <div className="pb-field-group">
                            <label className="pb-label">Rank</label>
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
                            <label className="pb-label">LP / Rank Details</label>
                            <input
                                className="hex-input"
                                value={puzzle.proLpRank || ''}
                                onChange={e => updatePuzzle({ proLpRank: e.target.value })}
                                placeholder="e.g., 1200 LP, Set 16 T1"
                            />
                        </div>
                        <div className="pb-field-group">
                            <label className="pb-label">Stage *</label>
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
                            <label className="pb-label">Patch Version</label>
                            <input
                                className="hex-input"
                                value={puzzle.patch || ''}
                                onChange={e => updatePuzzle({ patch: e.target.value })}
                                placeholder="e.g., 16.3b, 16.4"
                            />
                        </div>
                        <div className="pb-field-group">
                            <label className="pb-label">Date</label>
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
                            <label className="pb-label">Server / Region</label>
                            <input
                                className="hex-input"
                                value={puzzle.server || ''}
                                onChange={e => updatePuzzle({ server: e.target.value })}
                                placeholder="e.g., NA, EUW, KR, VN"
                            />
                        </div>
                        <div className="pb-field-group">
                            <label className="pb-label">Encounter Type</label>
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
                    <h3 className="pb-section-title">VOD Information</h3>
                    <div className="pb-field-group">
                        <label className="pb-label">Stream / VOD URL</label>
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
                            <label className="pb-label">VOD Timestamp</label>
                            <input
                                className="hex-input"
                                value={puzzle.vodTimestamp || ''}
                                onChange={e => updatePuzzle({ vodTimestamp: e.target.value })}
                                placeholder="e.g., 1:23:45 or 12:34"
                            />
                        </div>
                        <div className="pb-field-group">
                            <label className="pb-label">VOD Source</label>
                            <select
                                className="hex-input"
                                value={puzzle.vodSource || 'twitch'}
                                onChange={e => updatePuzzle({ vodSource: e.target.value as 'twitch' | 'youtube' | 'other' })}
                            >
                                <option value="twitch">Twitch</option>
                                <option value="youtube">YouTube</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Pro Player Details */}
                <div className="pb-section">
                    <h3 className="pb-section-title">Pro Player Details</h3>
                    <div className="pb-field-group">
                        <label className="pb-label">Social / Profile Link</label>
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
                    <h3 className="pb-section-title">Game Context</h3>
                    <div className="pb-field-group">
                        <label className="pb-label">Tournament Name</label>
                        <input
                            className="hex-input"
                            value={puzzle.tournamentName || ''}
                            onChange={e => updatePuzzle({ tournamentName: e.target.value })}
                            placeholder="e.g., Tactician's Cup, Regional Finals"
                        />
                    </div>
                    <div className="pb-field-group">
                        <label className="pb-label">Lobby Health (8 players)</label>
                        <input
                            className="hex-input"
                            value={puzzle.lobbyHealth || ''}
                            onChange={e => updatePuzzle({ lobbyHealth: e.target.value })}
                            placeholder="e.g., 100, 95, 90, 85, 80, 75, 70, 65"
                        />
                        <span className="pb-hint">Comma-separated HP values for all 8 players</span>
                    </div>
                    <div className="pb-field-group">
                        <label className="pb-label">Explanation / Analysis</label>
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
