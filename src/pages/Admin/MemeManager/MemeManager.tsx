import React, { useState, useEffect } from 'react';
import { MemeItem, MemeCategory } from '../../../features/puzzle/feedback/meme.types';
import { fetchAllMemes, createMeme, updateMeme, deleteMeme } from '../../../features/puzzle/feedback/memeService';
import Toast from '../../../components/common/Toast';
import ConfirmModal from '../../../components/common/ConfirmModal';
import './MemeManager.css';

export const MemeManager: React.FC = () => {
    const [memes, setMemes] = useState<MemeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | MemeCategory>('all');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [memeToDelete, setMemeToDelete] = useState<MemeItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Form state
    const [formText, setFormText] = useState('');
    const [formEmoji, setFormEmoji] = useState('');
    const [formCategory, setFormCategory] = useState<MemeCategory>('correct');
    const [formInsight, setFormInsight] = useState('');
    const [formImageUrl, setFormImageUrl] = useState('');

    useEffect(() => { loadMemes(); }, []);

    const loadMemes = async () => {
        setLoading(true);
        try {
            const data = await fetchAllMemes();
            setMemes(data);
        } catch (err: any) {
            setToast({ message: `Lỗi tải memes: ${err.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormText('');
        setFormEmoji('');
        setFormCategory('correct');
        setFormInsight('');
        setFormImageUrl('');
        setIsAdding(false);
        setEditingId(null);
    };

    const startEdit = (meme: MemeItem) => {
        setEditingId(meme.id);
        setFormText(meme.text);
        setFormEmoji(meme.emoji);
        setFormCategory(meme.category);
        setFormInsight(meme.insight || '');
        setFormImageUrl(meme.imageUrl || '');
        setIsAdding(true);
    };

    const handleSave = async () => {
        if (!formText.trim()) {
            setToast({ message: 'Text meme không được để trống', type: 'error' });
            return;
        }

        try {
            if (editingId) {
                const updated = await updateMeme(editingId, {
                    text: formText,
                    emoji: formEmoji,
                    category: formCategory,
                    insight: formInsight || undefined,
                    imageUrl: formImageUrl || undefined,
                });
                setMemes(prev => prev.map(m => m.id === editingId ? updated : m));
                setToast({ message: 'Cập nhật meme thành công', type: 'success' });
            } else {
                const created = await createMeme({
                    text: formText,
                    emoji: formEmoji,
                    category: formCategory,
                    insight: formInsight || undefined,
                    imageUrl: formImageUrl || undefined,
                });
                setMemes(prev => [created, ...prev]);
                setToast({ message: 'Tạo meme mới thành công', type: 'success' });
            }
            resetForm();
        } catch (err: any) {
            setToast({ message: `Lỗi: ${err.message}`, type: 'error' });
        }
    };

    const handleToggleActive = async (meme: MemeItem) => {
        try {
            const updated = await updateMeme(meme.id, { isActive: !meme.isActive });
            setMemes(prev => prev.map(m => m.id === meme.id ? updated : m));
        } catch (err: any) {
            setToast({ message: `Lỗi: ${err.message}`, type: 'error' });
        }
    };

    const handleDeleteRequest = (meme: MemeItem) => {
        setMemeToDelete(meme);
    };

    const confirmDelete = async () => {
        if (!memeToDelete) return;

        setIsDeleting(true);
        try {
            await deleteMeme(memeToDelete.id);
            setMemes(prev => prev.map(m => m.id === memeToDelete.id ? { ...m, isActive: false } : m));
            setToast({ message: 'Đã đưa meme vào thùng rác', type: 'success' });
        } catch (err: any) {
            setToast({ message: `Lỗi: ${err.message}`, type: 'error' });
        } finally {
            setIsDeleting(false);
            setMemeToDelete(null);
        }
    };

    const filtered = filter === 'all' ? memes : memes.filter(m => m.category === filter);
    const correctCount = memes.filter(m => m.category === 'correct' && m.isActive).length;
    const incorrectCount = memes.filter(m => m.category === 'incorrect' && m.isActive).length;

    if (loading) return <div className="meme-loading">Đang tải memes...</div>;

    return (
        <div className="meme-manager">
            {/* Stats */}
            <div className="meme-stats">
                <span className="meme-stat correct">{correctCount} Chính xác</span>
                <span className="meme-stat incorrect">{incorrectCount} Sai</span>
                <span className="meme-stat total">{memes.length} tổng</span>
            </div>

            {/* Toolbar */}
            <div className="meme-toolbar">
                <div className="meme-filters">
                    <button className={`meme-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tất cả</button>
                    <button className={`meme-filter-btn ${filter === 'correct' ? 'active' : ''}`} onClick={() => setFilter('correct')}>Chính xác</button>
                    <button className={`meme-filter-btn ${filter === 'incorrect' ? 'active' : ''}`} onClick={() => setFilter('incorrect')}>Sai</button>
                </div>
                <button className="hex-button primary" onClick={() => { resetForm(); setIsAdding(true); }}>
                    + Thêm Meme
                </button>
            </div>

            {/* Add/Edit Form */}
            {isAdding && (
                <div className="meme-form">
                    <div className="meme-form-title">{editingId ? 'Sửa Meme' : 'Thêm Meme mới'}</div>
                    <div className="meme-form-grid">
                        <div className="meme-form-field">
                            <label>Emoji</label>
                            <input type="text" className="hex-input" value={formEmoji} onChange={e => setFormEmoji(e.target.value)} placeholder="Nhập emoji..." />
                        </div>
                        <div className="meme-form-field">
                            <label>Phân loại</label>
                            <select className="hex-input" value={formCategory} onChange={e => setFormCategory(e.target.value as MemeCategory)}>
                                <option value="correct">Chính xác</option>
                                <option value="incorrect">Sai</option>
                            </select>
                        </div>
                        <div className="meme-form-field full">
                            <label>Nội dung Meme *</label>
                            <input type="text" className="hex-input" value={formText} onChange={e => setFormText(e.target.value)} placeholder="Nội dung hài hước..." />
                        </div>
                        <div className="meme-form-field full">
                            <label>Insight (giải thích)</label>
                            <input type="text" className="hex-input" value={formInsight} onChange={e => setFormInsight(e.target.value)} placeholder="Tại sao lại như vậy?..." />
                        </div>
                        <div className="meme-form-field full">
                            <label>Link ảnh/GIF (không bắt buộc)</label>
                            <input type="text" className="hex-input" value={formImageUrl} onChange={e => setFormImageUrl(e.target.value)} placeholder="https://..." />
                        </div>
                    </div>

                    {/* Preview */}
                    {formText && (
                        <div className={`meme-preview ${formCategory === 'correct' ? 'meme-correct' : 'meme-incorrect'}`}>
                            <span className="meme-preview-label">Xem trước:</span>
                            {formImageUrl && <img src={formImageUrl} alt="preview" className="meme-preview-img" />}
                            <span className="meme-preview-emoji">{formEmoji}</span>
                            <span className="meme-preview-text">{formText}</span>
                            {formInsight && <span className="meme-preview-insight">{formInsight}</span>}
                        </div>
                    )}

                    <div className="meme-form-actions">
                        <button className="hex-button" onClick={resetForm}>Hủy</button>
                        <button className="hex-button primary" onClick={handleSave}>{editingId ? 'Cập nhật' : 'Tạo'}</button>
                    </div>
                </div>
            )}

            {/* Meme List */}
            <div className="meme-list">
                {filtered.length === 0 ? (
                    <div className="meme-empty">Chưa có meme nào. Nhấn "Thêm Meme" để bắt đầu!</div>
                ) : filtered.map(meme => (
                    <div key={meme.id} className={`meme-card ${meme.isActive ? '' : 'inactive'} ${meme.category}`}>
                        <div className="meme-card-content">
                            {meme.imageUrl && <img src={meme.imageUrl} alt="" className="meme-card-img" />}
                            <span className="meme-card-emoji">{meme.emoji}</span>
                            <div className="meme-card-info">
                                <span className="meme-card-text">{meme.text}</span>
                                {meme.insight && <span className="meme-card-insight">{meme.insight}</span>}
                            </div>
                            <span className={`meme-card-badge ${meme.category}`}>
                                {meme.category === 'correct' ? '✓' : '✕'}
                            </span>
                        </div>
                        <div className="meme-card-actions">
                            <button className="hex-button small" onClick={() => handleToggleActive(meme)}>
                                {meme.isActive ? 'Tắt' : 'Bật'}
                            </button>
                            <button className="hex-button small" onClick={() => startEdit(meme)}>Sửa</button>
                            <button className="hex-button danger small" onClick={() => handleDeleteRequest(meme)}>Xóa</button>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmModal
                isOpen={memeToDelete !== null}
                title="Đưa vào thùng rác"
                message="Bạn có chắc là muốn xóa Meme này? Có thể khôi phục trong thùng rác."
                itemName={memeToDelete?.text}
                confirmLabel="Xóa"
                isLoading={isDeleting}
                onClose={() => setMemeToDelete(null)}
                onConfirm={confirmDelete}
            />

            {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
        </div>
    );
};
