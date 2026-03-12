import React, { useState, useEffect } from 'react';
import {
    ProPlayer, ProIqHistoryEntry, ProRegion,
    PRO_REGIONS, IQ_SOURCES, IqSource
} from '../../../features/tft-iq/proIq.types';
import {
    getAllProPlayers, createProPlayer, updateProPlayer,
    deleteProPlayer, updateIqScore, getIqHistory
} from '../../../features/tft-iq/proIqService';
import { getIqTierIcon, getIqTierColor } from '../../../features/tft-iq/proIqCalculator';
import Toast from '../../../components/common/Toast';
import ConfirmModal from '../../../components/common/ConfirmModal';
import './ProIqManager.css';

export const ProIqManager: React.FC = () => {
    const [players, setPlayers] = useState<ProPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [regionFilter, setRegionFilter] = useState<'all' | ProRegion>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [playerToDelete, setPlayerToDelete] = useState<ProPlayer | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // IQ Update Modal
    const [iqUpdatePlayer, setIqUpdatePlayer] = useState<ProPlayer | null>(null);
    const [iqHistory, setIqHistory] = useState<ProIqHistoryEntry[]>([]);
    const [iqNewScore, setIqNewScore] = useState('');
    const [iqReason, setIqReason] = useState('');
    const [iqSource, setIqSource] = useState<IqSource>('manual');

    // Form state
    const [formName, setFormName] = useState('');
    const [formRegion, setFormRegion] = useState<ProRegion>('AMER');
    const [formAvatar, setFormAvatar] = useState('');
    const [formLiquipedia, setFormLiquipedia] = useState('');
    const [formDatatft, setFormDatatft] = useState('');
    const [formIq, setFormIq] = useState('1500');
    const [formRank, setFormRank] = useState('Challenger');
    const [formLp, setFormLp] = useState('0');
    const [formTitles, setFormTitles] = useState('0');
    const [formNotes, setFormNotes] = useState('');

    useEffect(() => { loadPlayers(); }, []);

    const loadPlayers = async () => {
        setLoading(true);
        try {
            const data = await getAllProPlayers();
            setPlayers(data);
        } catch (err: any) {
            setToast({ message: `Lỗi tải Pro players: ${err.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormName('');
        setFormRegion('AMER');
        setFormAvatar('');
        setFormLiquipedia('');
        setFormDatatft('');
        setFormIq('1500');
        setFormRank('Challenger');
        setFormLp('0');
        setFormTitles('0');
        setFormNotes('');
        setIsAdding(false);
        setEditingId(null);
    };

    const startEdit = (p: ProPlayer) => {
        setEditingId(p.id);
        setFormName(p.name);
        setFormRegion(p.region);
        setFormAvatar(p.avatar_url || '');
        setFormLiquipedia(p.liquipedia_url || '');
        setFormDatatft(p.datatft_url || '');
        setFormIq(String(p.current_iq));
        setFormRank(p.current_rank || 'Challenger');
        setFormLp(String(p.current_lp || 0));
        setFormTitles(String(p.tournament_titles || 0));
        setFormNotes(p.notes || '');
        setIsAdding(true);
    };

    const handleSave = async () => {
        if (!formName.trim()) {
            setToast({ message: 'Tên Pro player không được để trống', type: 'error' });
            return;
        }

        try {
            if (editingId) {
                const updated = await updateProPlayer(editingId, {
                    name: formName,
                    region: formRegion,
                    avatar_url: formAvatar || undefined,
                    liquipedia_url: formLiquipedia || undefined,
                    datatft_url: formDatatft || undefined,
                    current_iq: parseInt(formIq) || 1500,
                    current_rank: formRank || undefined,
                    current_lp: parseInt(formLp) || 0,
                    tournament_titles: parseInt(formTitles) || 0,
                    notes: formNotes || undefined,
                });
                setPlayers(prev => prev.map(p => p.id === editingId ? updated : p));
                setToast({ message: `Cập nhật ${formName} thành công`, type: 'success' });
            } else {
                const created = await createProPlayer({
                    name: formName,
                    region: formRegion,
                    avatar_url: formAvatar || undefined,
                    liquipedia_url: formLiquipedia || undefined,
                    datatft_url: formDatatft || undefined,
                    current_iq: parseInt(formIq) || 1500,
                    current_rank: formRank || undefined,
                    current_lp: parseInt(formLp) || 0,
                    tournament_titles: parseInt(formTitles) || 0,
                    notes: formNotes || undefined,
                });
                setPlayers(prev => [created, ...prev]);
                setToast({ message: `Thêm ${formName} thành công`, type: 'success' });
            }
            resetForm();
        } catch (err: any) {
            setToast({ message: `Lỗi: ${err.message}`, type: 'error' });
        }
    };

    const handleDeleteRequest = (p: ProPlayer) => {
        setPlayerToDelete(p);
    };

    const confirmDelete = async () => {
        if (!playerToDelete) return;

        setIsDeleting(true);
        try {
            await deleteProPlayer(playerToDelete.id);
            setPlayers(prev => prev.filter(x => x.id !== playerToDelete.id));
            setToast({ message: `Đã đưa ${playerToDelete.name} vào thùng rác`, type: 'success' });
        } catch (err: any) {
            setToast({ message: `Lỗi: ${err.message}`, type: 'error' });
        } finally {
            setIsDeleting(false);
            setPlayerToDelete(null);
        }
    };

    // IQ Update Modal
    const openIqUpdate = async (p: ProPlayer) => {
        setIqUpdatePlayer(p);
        setIqNewScore(String(p.current_iq));
        setIqReason('');
        setIqSource('manual');
        try {
            const history = await getIqHistory(p.id);
            setIqHistory(history);
        } catch {
            setIqHistory([]);
        }
    };

    const handleIqUpdate = async () => {
        if (!iqUpdatePlayer || !iqReason.trim()) {
            setToast({ message: 'Vui lòng nhập lý do cập nhật', type: 'error' });
            return;
        }

        try {
            const { player } = await updateIqScore(iqUpdatePlayer.id, {
                new_iq: parseInt(iqNewScore) || iqUpdatePlayer.current_iq,
                reason: iqReason,
                source: iqSource,
            });
            setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
            setToast({ message: `IQ ${iqUpdatePlayer.name}: ${iqUpdatePlayer.current_iq} → ${player.current_iq}`, type: 'success' });
            setIqUpdatePlayer(null);
        } catch (err: any) {
            setToast({ message: `Lỗi: ${err.message}`, type: 'error' });
        }
    };

    // Filtered data
    const filtered = players.filter(p => {
        if (!p.is_active) return false;
        if (regionFilter !== 'all' && p.region !== regionFilter) return false;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (p.name ?? '').toLowerCase().includes(term) || (p.region ?? '').toLowerCase().includes(term);
        }
        return true;
    });

    // Stats
    const activePlayers = players.filter(p => p.is_active);
    const avgIq = activePlayers.length > 0
        ? Math.round(activePlayers.reduce((sum, p) => sum + p.current_iq, 0) / activePlayers.length)
        : 0;
    const goatCount = activePlayers.filter(p => p.iq_tier === 'GOAT').length;
    const eliteCount = activePlayers.filter(p => p.iq_tier === 'Elite').length;

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    if (loading) return <div className="proiq-loading">Đang tải Pro players...</div>;

    return (
        <div className="proiq-manager">
            {/* Stats */}
            <div className="proiq-stats">
                <span className="proiq-stat highlight">{activePlayers.length} Pro Players</span>
                <span className="proiq-stat">Avg IQ: {avgIq}</span>
                {goatCount > 0 && <span className="proiq-stat goat">🏆 {goatCount} GOAT</span>}
                {eliteCount > 0 && <span className="proiq-stat elite">👑 {eliteCount} Elite</span>}
            </div>

            {/* Toolbar */}
            <div className="proiq-toolbar">
                <div className="proiq-toolbar-left">
                    <input
                        type="text"
                        className="hex-input proiq-search"
                        placeholder="Tìm Pro player..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="proiq-filters">
                        <button
                            className={`proiq-filter-btn ${regionFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setRegionFilter('all')}
                        >All</button>
                        {PRO_REGIONS.map(r => (
                            <button
                                key={r.value}
                                className={`proiq-filter-btn ${regionFilter === r.value ? 'active' : ''}`}
                                onClick={() => setRegionFilter(r.value)}
                            >{r.label}</button>
                        ))}
                    </div>
                </div>
                <div className="proiq-toolbar-right">
                    <button className="hex-button primary" onClick={() => { resetForm(); setIsAdding(true); }}>
                        + Thêm Pro
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="proiq-update-overlay" onClick={resetForm}>
                    <div className="proiq-form" onClick={e => e.stopPropagation()}>
                        <div className="proiq-form-title">{editingId ? 'Sửa Pro Player' : 'Thêm Pro Player mới'}</div>
                        <div className="proiq-form-grid">
                            <div className="proiq-form-field">
                                <label>Tên *</label>
                                <input type="text" className="hex-input" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Wasianiverson" />
                            </div>
                            <div className="proiq-form-field">
                                <label>Khu vực</label>
                                <select className="hex-input" value={formRegion} onChange={e => setFormRegion(e.target.value as ProRegion)}>
                                    {PRO_REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>
                            <div className="proiq-form-field">
                                <label>IQ Score</label>
                                <input type="number" className="hex-input" value={formIq} onChange={e => setFormIq(e.target.value)} />
                            </div>
                            <div className="proiq-form-field">
                                <label>Rank hiện tại</label>
                                <select className="hex-input" value={formRank} onChange={e => setFormRank(e.target.value)}>
                                    <option value="Challenger">Challenger</option>
                                    <option value="Grandmaster">Grandmaster</option>
                                    <option value="Master">Master</option>
                                </select>
                            </div>
                            <div className="proiq-form-field">
                                <label>LP</label>
                                <input type="number" className="hex-input" value={formLp} onChange={e => setFormLp(e.target.value)} />
                            </div>
                            <div className="proiq-form-field">
                                <label>Tournament Titles</label>
                                <input type="number" className="hex-input" value={formTitles} onChange={e => setFormTitles(e.target.value)} />
                            </div>
                            <div className="proiq-form-field full">
                                <label>Link Liquipedia</label>
                                <input type="text" className="hex-input" value={formLiquipedia} onChange={e => setFormLiquipedia(e.target.value)} placeholder="https://liquipedia.net/tft/..." />
                            </div>
                            <div className="proiq-form-field full">
                                <label>Link DataTFT</label>
                                <input type="text" className="hex-input" value={formDatatft} onChange={e => setFormDatatft(e.target.value)} placeholder="https://datatft.com/..." />
                            </div>
                            <div className="proiq-form-field full">
                                <label>Avatar URL</label>
                                <input type="text" className="hex-input" value={formAvatar} onChange={e => setFormAvatar(e.target.value)} placeholder="https://..." />
                            </div>
                            <div className="proiq-form-field full">
                                <label>Ghi chú</label>
                                <input type="text" className="hex-input" value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Thông tin thêm..." />
                            </div>
                        </div>
                        <div className="proiq-form-actions">
                            <button className="hex-button" onClick={resetForm}>Hủy</button>
                            <button className="hex-button primary" onClick={handleSave}>{editingId ? 'Cập nhật' : 'Tạo'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pro Players List */}
            <div className="proiq-list">
                {filtered.length === 0 ? (
                    <div className="proiq-empty">
                        {searchTerm || regionFilter !== 'all'
                            ? 'Không tìm thấy Pro player nào.'
                            : 'Chưa có Pro player nào. Nhấn "Thêm Pro" để bắt đầu!'}
                    </div>
                ) : filtered.map(player => (
                    <div key={player.id} className={`proiq-card ${!player.is_active ? 'inactive' : ''}`}>
                        <div className="proiq-card-main">
                            {player.avatar_url ? (
                                <img src={player.avatar_url} alt={player.name} className="proiq-card-avatar" />
                            ) : (
                                <div className="proiq-card-avatar-placeholder">
                                    {getIqTierIcon(player.iq_tier)}
                                </div>
                            )}
                            <div className="proiq-card-info">
                                <span className="proiq-card-name">{player.name}</span>
                                <div className="proiq-card-meta">
                                    <span className="proiq-card-region">
                                        {PRO_REGIONS.find(r => r.value === player.region)?.label || player.region}
                                    </span>
                                    {player.current_rank && (
                                        <span className="proiq-card-rank">
                                            {player.current_rank} {player.current_lp ? `${player.current_lp} LP` : ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="proiq-card-iq">
                            <span className="proiq-card-score" style={{ color: getIqTierColor(player.iq_tier) }}>
                                {player.current_iq}
                            </span>
                            <span className="proiq-card-tier" style={{ color: getIqTierColor(player.iq_tier), borderColor: getIqTierColor(player.iq_tier) + '40' }}>
                                {getIqTierIcon(player.iq_tier)} {player.iq_tier}
                            </span>
                        </div>

                        <div className="proiq-card-updated">
                            {formatDate(player.updated_at)}
                        </div>

                        <div className="proiq-card-actions">
                            <button className="hex-button small primary" onClick={() => openIqUpdate(player)}>IQ</button>
                            <button className="hex-button small" onClick={() => startEdit(player)}>Sửa</button>
                            <button className="hex-button danger small" onClick={() => handleDeleteRequest(player)}>Xóa</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* IQ Update Modal */}
            {iqUpdatePlayer && (
                <div className="proiq-update-overlay" onClick={() => setIqUpdatePlayer(null)}>
                    <div className="proiq-update-modal" onClick={e => e.stopPropagation()}>
                        <div className="proiq-update-header">
                            <div className="proiq-update-title">
                                Cập nhật IQ — {iqUpdatePlayer.name}
                            </div>
                            <button className="proiq-update-close" onClick={() => setIqUpdatePlayer(null)}>×</button>
                        </div>

                        <div className="proiq-update-body">
                            <div className="proiq-update-current">
                                <span className="proiq-update-current-label">IQ hiện tại:</span>
                                <span className="proiq-update-current-value">{iqUpdatePlayer.current_iq}</span>
                                <span style={{ color: getIqTierColor(iqUpdatePlayer.iq_tier), fontSize: '0.9rem' }}>
                                    {getIqTierIcon(iqUpdatePlayer.iq_tier)} {iqUpdatePlayer.iq_tier}
                                </span>
                            </div>

                            <div className="proiq-update-fields">
                                <div className="proiq-update-field">
                                    <label>IQ mới</label>
                                    <input
                                        type="number"
                                        value={iqNewScore}
                                        onChange={e => setIqNewScore(e.target.value)}
                                    />
                                    {(() => {
                                        const diff = (parseInt(iqNewScore) || 0) - iqUpdatePlayer.current_iq;
                                        return (
                                            <div className={`proiq-update-change ${diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral'}`}>
                                                {diff > 0 ? `+${diff}` : diff === 0 ? '±0' : diff}
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div className="proiq-update-field">
                                    <label>Lý do *</label>
                                    <input
                                        type="text"
                                        value={iqReason}
                                        onChange={e => setIqReason(e.target.value)}
                                        placeholder="VD: Won AMER Regional Finals"
                                    />
                                </div>
                                <div className="proiq-update-field">
                                    <label>Nguồn</label>
                                    <select value={iqSource} onChange={e => setIqSource(e.target.value as IqSource)}>
                                        {IQ_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* History */}
                            {iqHistory.length > 0 && (
                                <div className="proiq-history-section">
                                    <label>Lịch sử ({iqHistory.length})</label>
                                    <div className="proiq-history">
                                        {iqHistory.slice(0, 10).map(h => (
                                            <div key={h.id} className="proiq-history-entry">
                                                <span className="proiq-history-reason">{h.change_reason}</span>
                                                <span className={`proiq-history-change ${h.change_amount > 0 ? 'positive' : h.change_amount < 0 ? 'negative' : ''}`}>
                                                    {h.change_amount > 0 ? `+${h.change_amount}` : h.change_amount}
                                                </span>
                                                <span className="proiq-history-date">{formatDate(h.recorded_at)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="proiq-update-footer">
                            <button className="proiq-update-btn" onClick={() => setIqUpdatePlayer(null)}>Huỷ</button>
                            <button className="proiq-update-btn primary" onClick={handleIqUpdate}>Cập nhật IQ</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={playerToDelete !== null}
                title="Đưa vào thùng rác"
                message="Bạn có chắc là muốn xóa Pro Player này? Có thể khôi phục trong thùng rác."
                itemName={playerToDelete?.name}
                confirmLabel="Xóa"
                isLoading={isDeleting}
                onClose={() => setPlayerToDelete(null)}
                onConfirm={confirmDelete}
            />

            {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
        </div>
    );
};
