import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { PuzzleScenario } from '../../../../data/puzzleScenarios';
import { Champion } from '../../../../data/types';
import { AugmentData, augmentService } from '../../../../services/augmentService';
import { Item } from '../../../../services/itemService';
import { validatePuzzleWithAI, resolveAugmentsLocally, collectUnresolvedAugmentStrings } from '../services/puzzleAiValidator';
import './JsonImportModal.css';

interface JsonImportModalProps {
    onImport: (puzzle: PuzzleScenario) => void;
    onClose: () => void;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    champions: Champion[];
    dbAugments: AugmentData[];
    dbItems: Item[];
}

interface PendingResolution {
    corrected: Record<string, unknown>;
    unresolvedNames: string[];
}

const JsonImportModal: React.FC<JsonImportModalProps> = ({
    onImport, onClose, showToast, champions, dbAugments, dbItems
}) => {
    const [jsonText, setJsonText] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingResolution, setPendingResolution] = useState<PendingResolution | null>(null);

    const handleImport = async () => {
        const trimmed = jsonText.trim();
        if (!trimmed) {
            showToast('Vui lòng nhập nội dung JSON.', 'error');
            return;
        }

        let parsed: Record<string, unknown>;
        try {
            parsed = JSON.parse(trimmed);
            if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                showToast('JSON không hợp lệ: phải là một object.', 'error');
                return;
            }
        } catch {
            showToast('Lỗi: JSON không hợp lệ. Kiểm tra lại cú pháp.', 'error');
            return;
        }

        setLoading(true);
        showToast('⏳ Đang khớp dữ liệu với database...', 'info');

        try {
            // Step 1: Deterministic local resolution (bilingual: strings → AugmentData objects)
            const locallyResolved = resolveAugmentsLocally(parsed, dbAugments);

            // Step 2: AI validation for fuzzy matching (champions, items, remaining augments)
            const corrected = await validatePuzzleWithAI(locallyResolved, {
                champions,
                augments: dbAugments,
                items: dbItems,
            });

            // Step 3: Detect any augments still unresolved (still plain strings after AI pass)
            const unresolvedNames = collectUnresolvedAugmentStrings(corrected);
            if (unresolvedNames.length > 0) {
                setLoading(false);
                setPendingResolution({ corrected, unresolvedNames });
                return; // Pause — wait for admin to decide
            }

            // All augments resolved — import immediately
            onImport(corrected as unknown as PuzzleScenario);
            showToast('Import thành công! Dữ liệu đã được khớp với DB.', 'success');
            onClose();
        } catch (err) {
            console.error('[JsonImport] AI validation failed, importing locally-resolved:', err);
            const locallyResolved = resolveAugmentsLocally(parsed, dbAugments);
            onImport(locallyResolved as unknown as PuzzleScenario);
            showToast('⚠️ AI validation lỗi. Import dữ liệu gốc (chưa khớp DB).', 'error');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const confirmUpsert = async () => {
        if (!pendingResolution) return;
        setLoading(true);
        try {
            // Insert stubs for unresolved augment names into DB
            await augmentService.upsertStubs(pendingResolution.unresolvedNames);

            // Re-fetch augments with the new stubs, then re-resolve
            const freshAugments = await augmentService.getAll();
            const reresolved = resolveAugmentsLocally(pendingResolution.corrected, freshAugments);

            onImport(reresolved as unknown as PuzzleScenario);
            showToast('Import thành công! Đã thêm stub augments vào DB.', 'success');
            setPendingResolution(null);
            onClose();
        } catch (err) {
            showToast(`Lỗi khi thêm stub: ${(err as Error).message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const skipAndImport = () => {
        if (!pendingResolution) return;
        onImport(pendingResolution.corrected as unknown as PuzzleScenario);
        setPendingResolution(null);
        onClose();
    };

    return ReactDOM.createPortal(
        <div
            className="json-import-overlay"
            onClick={loading ? undefined : onClose}
        >
            <div
                className="json-import-modal"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="json-import-header">
                    <h3 className="json-import-title">📋 Import Puzzle JSON</h3>
                </div>

                {pendingResolution ? (
                    /* Unresolved augments confirmation panel */
                    <div className="json-import-unresolved-panel">
                        <p className="json-import-unresolved-title">
                            ⚠️ {pendingResolution.unresolvedNames.length} augment chưa có trong DB:
                        </p>
                        <ul className="json-import-unresolved-list">
                            {pendingResolution.unresolvedNames.map(name => (
                                <li key={name}>{name}</li>
                            ))}
                        </ul>
                        <p className="json-import-unresolved-hint">
                            Thêm stub vào DB (tên tiếng Anh, tier 1) để import? Có thể chỉnh sửa sau trong Admin Panel.
                        </p>
                        <div className="json-import-footer">
                            <button
                                onClick={skipAndImport}
                                className="json-import-btn cancel"
                                disabled={loading}
                            >
                                Bỏ qua, Import ngay
                            </button>
                            <button
                                onClick={confirmUpsert}
                                className="json-import-btn confirm"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Thêm DB & Import'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Body */}
                        <div className="json-import-body">
                            <label className="pb-label">Dán nội dung JSON vào đây:</label>
                            <textarea
                                className="hex-input hex-textarea json-import-textarea"
                                value={jsonText}
                                onChange={e => setJsonText(e.target.value)}
                                placeholder='{"proPlayer": "Dishsoap", "stage": "2-1", ...}'
                                rows={12}
                                spellCheck={false}
                                autoFocus
                                disabled={loading}
                            />
                            <span className="pb-hint">
                                Paste toàn bộ JSON của Puzzle. AI sẽ tự động khớp champion, augment, item với database.
                            </span>
                        </div>

                        {/* Loading indicator */}
                        {loading && (
                            <div className="json-import-loading">
                                <div className="json-import-spinner" />
                                <span>AI đang phân tích và khớp dữ liệu...</span>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="json-import-footer">
                            <button
                                onClick={onClose}
                                className="json-import-btn cancel"
                                disabled={loading}
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={handleImport}
                                className="json-import-btn confirm"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Import & Match DB'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};

export default JsonImportModal;
