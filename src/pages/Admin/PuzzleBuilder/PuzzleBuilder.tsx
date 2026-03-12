import React, { useState } from 'react';
import AdminHeader from '../../../components/Admin/AdminHeader';
import './PuzzleBuilder.css';
import AugmentChoiceBuilder from './components/AugmentChoiceBuilder';
import { transformToData, transformToVisual } from '../../../utils/hexMapping';
import { usePuzzleBuilderState } from './hooks/usePuzzleBuilderState';
import MetaTab from './tabs/MetaTab';
import BoardTab from './tabs/BoardTab';
import Toast from '../../../components/common/Toast';

import { PuzzleScenario } from '../../../data/puzzleScenarios';
import { sanitizePlayerLevel, sanitizePlayerXp } from '../../../features/puzzle/playerLevel';

interface PuzzleBuilderProps {
    onClose: () => void;
    onSaveSuccess: (puzzleId: string, shareUrl: string) => void;
    initialPuzzle?: PuzzleScenario;
}

type ViewMode = 'meta' | 'player' | 'opponent' | 'augments';

const PuzzleBuilder: React.FC<PuzzleBuilderProps> = ({ onClose, onSaveSuccess, initialPuzzle }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('meta');
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const {
        puzzle,
        champions,
        dbAugments,
        dbItems,
        loading,
        selectedOpponentIndex,
        setSelectedOpponentIndex,
        updatePuzzle,
        overwritePuzzle,
        updateOpponent,
        handleSave,
        toast,
        showToast,
        clearToast
    } = usePuzzleBuilderState(onSaveSuccess, initialPuzzle);

    // Helpers
    const updateState = (mode: 'player' | 'opponent', key: 'level' | 'gold' | 'hp' | 'xp', value: number) => {
        if (mode === 'player') {
            const currentState = puzzle.playerState ?? { level: 3, gold: 0, hp: 100, xp: 0 };
            const nextLevel = key === 'level' ? sanitizePlayerLevel(value, puzzle.stage) : currentState.level;
            const nextXp = key === 'xp'
                ? sanitizePlayerXp(value, currentState.level, puzzle.stage)
                : sanitizePlayerXp(currentState.xp, nextLevel, puzzle.stage);
            updatePuzzle({
                playerState: {
                    ...currentState,
                    [key]: value,
                    level: nextLevel,
                    xp: nextXp
                }
            });
        } else {
            const currentOppState = puzzle.opponents?.[selectedOpponentIndex]?.state || { level: 1, gold: 0, hp: 100, xp: 0 };
            const nextLevel = key === 'level' ? sanitizePlayerLevel(value, puzzle.stage) : currentOppState.level;
            const nextXp = key === 'xp'
                ? sanitizePlayerXp(value, currentOppState.level, puzzle.stage)
                : sanitizePlayerXp(currentOppState.xp, nextLevel, puzzle.stage);
            updateOpponent(selectedOpponentIndex, {
                state: {
                    ...currentOppState,
                    [key]: value,
                    level: nextLevel,
                    xp: nextXp
                }
            });
        }
    };

    const handleClearBoard = (mode: 'player' | 'opponent') => {
        if (mode === 'player') {
            updatePuzzle({ playerBoard: [], playerBench: [] });
        } else {
            updateOpponent(selectedOpponentIndex, { board: [], bench: [] });
        }
    };

    if (loading) return <div className="loading-text">Đang tải...</div>;

    return (
        <div className="puzzle-builder-container">
            <AdminHeader
                title="Trình tạo Puzzles"
                tabs={[
                    { key: 'meta', label: 'Thông tin' },
                    { key: 'player', label: 'Người chơi' },
                    { key: 'opponent', label: 'Đối thủ' },
                    { key: 'augments', label: 'Augments' }
                ]}
                activeTab={viewMode}
                onTabChange={(key) => setViewMode(key as ViewMode)}
                actions={
                    <>
                        <button onClick={() => setShowCancelConfirm(true)} className="pb-btn">Huỷ</button>
                        <button onClick={handleSave} className="pb-btn primary">Lưu Puzzles</button>
                    </>
                }
            />

            <div className="pb-content">
                {viewMode === 'meta' && (
                    <MetaTab
                        puzzle={puzzle}
                        updatePuzzle={updatePuzzle}
                        overwritePuzzle={overwritePuzzle}
                        showToast={showToast}
                        champions={champions}
                        dbAugments={dbAugments}
                        dbItems={dbItems}
                    />
                )}

                {viewMode === 'player' && (
                    <BoardTab
                        mode="player"
                        level={puzzle.playerState?.level || 3}
                        gold={puzzle.playerState?.gold || 0}
                        hp={puzzle.playerState?.hp || 100}
                        xp={puzzle.playerState?.xp || 0}
                        champions={champions}
                        units={[
                            ...(puzzle.playerBoard || []),
                            ...(puzzle.playerBench || [])
                        ]}
                        onUnitsChange={(units) => updatePuzzle({
                            playerBoard: units.filter(u => u.row !== undefined && u.row >= 0 && u.col !== undefined),
                            playerBench: units.filter(u => u.benchIndex !== undefined)
                        })}
                        onStateChange={(k, v) => updateState('player', k, v)}
                        onClearBoard={() => handleClearBoard('player')}
                        onLevelCapHit={() => showToast(`Board da full theo cap ${puzzle.playerState?.level || 3}.`, 'info')}
                        augments={(puzzle.augments || []).filter(a => a !== null) as any[]}
                        onAugmentsChange={(newAugments) => updatePuzzle({ augments: newAugments })}
                        items={puzzle.startingItems || []}
                        onItemsChange={(newItems) => updatePuzzle({ startingItems: newItems })}
                        ioniaPathId={puzzle.ioniaPathId}
                        voidModIds={puzzle.voidModIds}
                        onIoniaPathChange={(pathId) => updatePuzzle({ ioniaPathId: pathId })}
                        onVoidModsChange={(modIds) => updatePuzzle({ voidModIds: modIds })}
                    />
                )}

                {viewMode === 'opponent' && (
                    <BoardTab
                        mode="opponent"
                        level={puzzle.opponents?.[selectedOpponentIndex]?.state?.level || 1}
                        gold={puzzle.opponents?.[selectedOpponentIndex]?.state?.gold || 0}
                        hp={puzzle.opponents?.[selectedOpponentIndex]?.state?.hp || 100}
                        xp={puzzle.opponents?.[selectedOpponentIndex]?.state?.xp || 0}
                        champions={champions}
                        // Data (Inverted) -> Visual (Normal)
                        units={[
                            ...(puzzle.opponents?.[selectedOpponentIndex]?.board || []).map(u => transformToVisual(u, true)),
                            ...(puzzle.opponents?.[selectedOpponentIndex]?.bench || [])
                        ]}
                        onUnitsChange={(units) => {
                            // Visual (Normal) -> Data (Inverted)
                            const board = units.filter(u => u.row !== undefined && u.row >= 0).map(u => transformToData(u, true));
                            const bench = units.filter(u => u.benchIndex !== undefined);
                            updateOpponent(selectedOpponentIndex, { board, bench });
                        }}
                        onStateChange={(k, v) => updateState('opponent', k, v)}
                        onClearBoard={() => handleClearBoard('opponent')}
                        onLevelCapHit={() => showToast(`Cap ${puzzle.opponents?.[selectedOpponentIndex]?.state?.level || 1}: khong the them tuong len board.`, 'info')}
                        augments={(puzzle.opponents?.[selectedOpponentIndex]?.augments || []).filter(a => a !== null) as any[]}
                        onAugmentsChange={(newAugments) => updateOpponent(selectedOpponentIndex, { augments: newAugments })}
                        selectedOpponentIndex={selectedOpponentIndex}
                        onOpponentSelect={setSelectedOpponentIndex}
                        items={puzzle.opponents?.[selectedOpponentIndex]?.startingItems || []}
                        onItemsChange={(newItems) => updateOpponent(selectedOpponentIndex, { startingItems: newItems })}
                    />
                )}

                {viewMode === 'augments' && (
                    <div className="pb-builder-view admin-content-transition" key="augments" style={{ padding: '2cqw', color: '#fff' }}>
                        <h3>Lựa chọn Augments</h3>
                        <p>Cấu hình lựa chọn Augments, Roll lại và lựa chọn cuối cùng.</p>
                        <AugmentChoiceBuilder
                            initialAugments={puzzle.augments || []}
                            rerollAugments={puzzle.rerollAugments || []}
                            secondRerollAugments={puzzle.secondRerollAugments || []}
                            hasExtraReroll={puzzle.hasExtraReroll}
                            proRerollIndices={puzzle.proRerollIndices || []}
                            proSecondRerollIndices={puzzle.proSecondRerollIndices || []}
                            proPickIndex={puzzle.proPickIndex ?? -1}
                            onUpdate={(initial, reroll, secondReroll, hasExtra, proReroll, proSecondReroll, proPick) => updatePuzzle({
                                augments: initial,
                                rerollAugments: reroll,
                                secondRerollAugments: secondReroll,
                                hasExtraReroll: hasExtra,
                                proRerollIndices: proReroll,
                                proSecondRerollIndices: proSecondReroll,
                                proPickIndex: proPick
                            })}
                        />


                    </div>
                )}
            </div>

            {/* Cancel Confirm Modal */}
            {showCancelConfirm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'radial-gradient(ellipse at 50% 30%, rgba(200, 170, 110, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(21, 58, 62, 0.25) 0%, transparent 50%), rgba(0, 0, 0, 0.78)',
                    display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 2000,
                    backdropFilter: 'blur(8px)',
                    animation: 'hex-overlay-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                }} onClick={() => setShowCancelConfirm(false)}>
                    <div className="hex-panel" style={{
                        width: '400px', padding: 0, display: 'flex', flexDirection: 'column',
                        border: '1px solid #c8aa6e',
                        background: 'linear-gradient(180deg, #153a3e 0%, #051c1e 100%)',
                        boxShadow: '0 0 20px rgba(200, 170, 110, 0.25)',
                        borderRadius: '4px', overflow: 'hidden'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{
                            padding: '1.5rem', borderBottom: '1px solid rgba(200, 170, 110, 0.3)',
                            textAlign: 'center'
                        }}>
                            <h3 style={{
                                color: '#c8aa6e', margin: 0, fontFamily: 'Spectral, serif',
                                textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.25rem'
                            }}>Xác nhận huỷ</h3>
                        </div>
                        <div style={{ padding: '2rem 1.5rem' }}>
                            <p style={{
                                color: '#F0F6FC', textAlign: 'center', lineHeight: 1.6,
                                margin: 0, fontFamily: 'Inter, sans-serif'
                            }}>
                                Bạn có chắc muốn huỷ?
                                <span style={{ fontSize: '0.9em', color: '#94A3B8', display: 'block', marginTop: '0.5rem' }}>
                                    Mọi thay đổi chưa lưu sẽ bị mất.
                                </span>
                            </p>
                        </div>
                        <div style={{
                            padding: '1.5rem', borderTop: '1px solid rgba(200, 170, 110, 0.3)',
                            display: 'flex', gap: '1rem', justifyContent: 'center',
                            background: 'rgba(0, 0, 0, 0.2)'
                        }}>
                            <button onClick={() => setShowCancelConfirm(false)} style={{
                                flex: 1, background: 'transparent', border: '1px solid #c8aa6e',
                                color: '#c8aa6e', padding: '0.6rem 1rem', cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif', textTransform: 'uppercase',
                                fontSize: '0.9rem', borderRadius: '2px', transition: 'all 0.2s'
                            }}>Tiếp tục</button>
                            <button onClick={onClose} style={{
                                flex: 1, background: 'linear-gradient(180deg, #FF4E50 0%, #C0392B 100%)',
                                border: '1px solid #FF4E50', color: '#FFFFFF',
                                padding: '0.6rem 1rem', cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif', fontWeight: 600,
                                textTransform: 'uppercase', fontSize: '0.9rem', borderRadius: '2px',
                                boxShadow: '0 0 10px rgba(255, 78, 80, 0.4)', transition: 'all 0.2s'
                            }}>Huỷ bỏ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={clearToast}
                    duration={5000}
                />
            )}
        </div>
    );
};

export default PuzzleBuilder;

