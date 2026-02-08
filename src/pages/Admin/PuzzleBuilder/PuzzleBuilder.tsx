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

interface PuzzleBuilderProps {
    onClose: () => void;
    onSaveSuccess: (puzzleId: string, shareUrl: string) => void;
    initialPuzzle?: PuzzleScenario;
}

type ViewMode = 'meta' | 'player' | 'opponent' | 'augments';

const PuzzleBuilder: React.FC<PuzzleBuilderProps> = ({ onClose, onSaveSuccess, initialPuzzle }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('meta');

    const {
        puzzle,
        champions,
        loading,
        selectedOpponentIndex,
        setSelectedOpponentIndex,
        updatePuzzle,
        updateOpponent,
        handleSave,
        toast,
        clearToast
    } = usePuzzleBuilderState(onSaveSuccess, initialPuzzle);

    // Helpers
    const updateState = (mode: 'player' | 'opponent', key: 'level' | 'gold' | 'hp', value: number) => {
        if (mode === 'player') {
            const currentState = puzzle.playerState ?? { level: 3, gold: 0, hp: 100, xp: 0 };
            updatePuzzle({ playerState: { ...currentState, [key]: value } });
        } else {
            const currentOppState = puzzle.opponents?.[selectedOpponentIndex]?.state || { level: 3, gold: 0, hp: 100, xp: 0 };
            updateOpponent(selectedOpponentIndex, { state: { ...currentOppState, [key]: value } });
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
                        <button onClick={onClose} className="pb-btn">Huỷ</button>
                        <button onClick={handleSave} className="pb-btn primary">Lưu Puzzles</button>
                    </>
                }
            />

            <div className="pb-content">
                {viewMode === 'meta' && (
                    <MetaTab puzzle={puzzle} updatePuzzle={updatePuzzle} />
                )}

                {viewMode === 'player' && (
                    <BoardTab
                        mode="player"
                        level={puzzle.playerState?.level || 3}
                        gold={puzzle.playerState?.gold || 0}
                        hp={puzzle.playerState?.hp || 100}
                        champions={champions}
                        units={puzzle.playerBoard || []}
                        onUnitsChange={(units) => updatePuzzle({ playerBoard: units })}
                        onStateChange={(k, v) => updateState('player', k, v)}
                        onClearBoard={() => handleClearBoard('player')}
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
                        level={puzzle.opponents?.[selectedOpponentIndex]?.state?.level || 3}
                        gold={puzzle.opponents?.[selectedOpponentIndex]?.state?.gold || 0}
                        hp={puzzle.opponents?.[selectedOpponentIndex]?.state?.hp || 100}
                        champions={champions}
                        // Data (Inverted) -> Visual (Normal)
                        units={[
                            ...(puzzle.opponents?.[selectedOpponentIndex]?.board || []).map(u => transformToVisual(u, true)),
                            ...(puzzle.opponents?.[selectedOpponentIndex]?.bench || [])
                        ]}
                        onUnitsChange={(units) => {
                            // Visual (Normal) -> Data (Inverted)
                            const board = units.filter(u => u.row !== undefined).map(u => transformToData(u, true));
                            const bench = units.filter(u => u.benchIndex !== undefined);
                            updateOpponent(selectedOpponentIndex, { board, bench });
                        }}
                        onStateChange={(k, v) => updateState('opponent', k, v)}
                        onClearBoard={() => handleClearBoard('opponent')}
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

