import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { PuzzleScenario } from '../../../../data/puzzleScenarios';
import { Champion } from '../../../../data/types';
import { AugmentData } from '../../../../services/augmentService';
import { Item } from '../../../../services/itemService';
import { validatePuzzleWithAI } from '../services/puzzleAiValidator';
import './JsonImportModal.css';

interface JsonImportModalProps {
    onImport: (puzzle: PuzzleScenario) => void;
    onClose: () => void;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    champions: Champion[];
    dbAugments: AugmentData[];
    dbItems: Item[];
}

const JsonImportModal: React.FC<JsonImportModalProps> = ({
    onImport, onClose, showToast, champions, dbAugments, dbItems
}) => {
    const [jsonText, setJsonText] = useState('');
    const [loading, setLoading] = useState(false);

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

        // AI validation step
        setLoading(true);
        showToast('⏳ Đang khớp dữ liệu với database...', 'info');

        try {
            const corrected = await validatePuzzleWithAI(parsed, {
                champions,
                augments: dbAugments,
                items: dbItems,
            });

            onImport(corrected as unknown as PuzzleScenario);
            showToast('Import thành công! Dữ liệu đã được khớp với DB.', 'success');
            onClose();
        } catch (err) {
            console.error('[JsonImport] AI validation failed, importing raw:', err);
            onImport(parsed as unknown as PuzzleScenario);
            showToast('⚠️ AI validation lỗi. Import dữ liệu gốc (chưa khớp DB).', 'error');
            onClose();
        } finally {
            setLoading(false);
        }
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
            </div>
        </div>,
        document.body
    );
};

export default JsonImportModal;
