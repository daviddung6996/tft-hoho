import React, { useState, useEffect } from 'react';
import { championService } from '../../../services/championService';
import { traitService } from '../../../services/traitService';
import { itemService } from '../../../services/itemService';
import { augmentService } from '../../../services/augmentService';
import { puzzleService } from '../../../services/puzzleService';
import { getDeletedProPlayers } from '../../../features/tft-iq/proIqService';
import { getDeletedMemes } from '../../../features/puzzle/feedback/memeService';
import ConfirmModal from '../../../components/common/ConfirmModal';
import '../../../components/Admin/AdminDataTable.css';

// Type for deleted items
export interface DeletedItem {
    id: string;
    type: 'champions' | 'traits' | 'items' | 'augments' | 'puzzles' | 'pro_players' | 'memes';
    data: any;
    deleted_at: string;
}

interface TrashViewProps {
    onRestore: (items: DeletedItem[]) => void;
    onPermanentDelete: (items: DeletedItem[]) => Promise<void>;
    isActive?: boolean;
}

type ConfirmAction = 'delete' | 'empty' | null;

export const TrashView: React.FC<TrashViewProps> = ({ onRestore, onPermanentDelete, isActive }) => {
    const [trashItems, setTrashItems] = useState<DeletedItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [filterType, setFilterType] = useState<'all' | 'champions' | 'traits' | 'items' | 'augments' | 'puzzles' | 'pro_players' | 'memes'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isActive !== false) {
            loadTrash();
        }
    }, [filterType, isActive]);

    const loadTrash = async () => {
        setLoading(true);
        try {
            // Load ALL tables in PARALLEL using allSettled so one failing table doesn't break everything
            const results = await Promise.allSettled([
                filterType === 'all' || filterType === 'champions'
                    ? championService.getDeleted() : Promise.resolve([]),
                filterType === 'all' || filterType === 'traits'
                    ? traitService.getDeleted() : Promise.resolve([]),
                filterType === 'all' || filterType === 'items'
                    ? itemService.getDeleted() : Promise.resolve([]),
                filterType === 'all' || filterType === 'augments'
                    ? augmentService.getDeleted() : Promise.resolve([]),
                filterType === 'all' || filterType === 'puzzles'
                    ? puzzleService.getDeleted() : Promise.resolve([]),
                filterType === 'all' || filterType === 'pro_players'
                    ? getDeletedProPlayers() : Promise.resolve([]),
                filterType === 'all' || filterType === 'memes'
                    ? getDeletedMemes() : Promise.resolve([])
            ]);

            const [
                championsRes,
                traitsRes,
                itemsRes,
                augmentsRes,
                puzzlesRes,
                proPlayersRes,
                memesRes
            ] = results;

            // Log failures for debugging
            results.forEach((res, idx) => {
                if (res.status === 'rejected') {
                    console.error(`Trash load failed for index ${idx}:`, res.reason);
                }
            });

            const champions = championsRes.status === 'fulfilled' ? championsRes.value : [];
            const traits = traitsRes.status === 'fulfilled' ? traitsRes.value : [];
            const items = itemsRes.status === 'fulfilled' ? itemsRes.value : [];
            const augments = augmentsRes.status === 'fulfilled' ? augmentsRes.value : [];
            const puzzles = puzzlesRes.status === 'fulfilled' ? puzzlesRes.value : [];
            const proPlayers = proPlayersRes.status === 'fulfilled' ? proPlayersRes.value : [];
            const memes = memesRes.status === 'fulfilled' ? memesRes.value : [];

            const allItems: DeletedItem[] = [
                ...champions.map(c => ({
                    id: c.id,
                    type: 'champions' as const,
                    data: c,
                    deleted_at: (c as any).deleted_at
                })),
                ...traits.map(t => ({
                    id: t.id,
                    type: 'traits' as const,
                    data: t,
                    deleted_at: (t as any).deleted_at
                })),
                ...items.map(i => ({
                    id: i.id,
                    type: 'items' as const,
                    data: i,
                    deleted_at: (i as any).deleted_at
                })),
                ...augments.map(a => ({
                    id: a.id,
                    type: 'augments' as const,
                    data: a,
                    deleted_at: (a as any).deleted_at
                })),
                ...puzzles.map(p => ({
                    id: p.id,
                    type: 'puzzles' as const,
                    data: p,
                    deleted_at: (p as any).deleted_at
                })),
                ...proPlayers.map(pr => ({
                    id: pr.id,
                    type: 'pro_players' as const,
                    data: pr,
                    deleted_at: (pr as any).updated_at || new Date().toISOString()
                })),
                ...memes.map(m => ({
                    id: m.id,
                    type: 'memes' as const,
                    data: m,
                    deleted_at: (m as any).created_at || new Date().toISOString()
                }))
            ];

            // Sort by deleted_at descending
            allItems.sort((a, b) =>
                new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
            );

            setTrashItems(allItems);
            setSelectedIds(new Set());
        } catch (err) {
            console.error('Error loading trash:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === trashItems.length && trashItems.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(trashItems.map(item => item.id)));
        }
    };

    const handleRestore = async () => {
        if (selectedIds.size === 0) return;

        const itemsToRestore = trashItems.filter(item => selectedIds.has(item.id));
        await onRestore(itemsToRestore);
        loadTrash();
    };

    // Open confirm modal for permanent delete
    const requestPermanentDelete = () => {
        if (selectedIds.size === 0) return;
        setConfirmAction('delete');
    };

    // Open confirm modal for empty trash
    const requestEmptyTrash = () => {
        if (trashItems.length === 0) return;
        setConfirmAction('empty');
    };

    // Execute confirmed action
    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            if (confirmAction === 'delete') {
                const itemsToDelete = trashItems.filter(item => selectedIds.has(item.id));
                await onPermanentDelete(itemsToDelete);
            } else if (confirmAction === 'empty') {
                await onPermanentDelete(trashItems);
            }
            loadTrash();
        } finally {
            setIsProcessing(false);
            setConfirmAction(null);
        }
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredTrashItems = trashItems.filter(item => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const data = item.data;
        const nameMatch = data.name?.toLowerCase().includes(searchLower) || data.title?.toLowerCase().includes(searchLower) || data.text?.toLowerCase().includes(searchLower);
        const idMatch = data.id?.toLowerCase().includes(searchLower);
        return nameMatch || idMatch;
    });

    const isAllSelected = filteredTrashItems.length > 0 && selectedIds.size === filteredTrashItems.length;

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#94A3B8',
                gap: '1cqw'
            }}>
                <div style={{ fontSize: '1cqw' }}>Đang tải thùng rác...</div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Action Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.8cqw 1cqw',
                borderBottom: '0.1cqw solid rgba(200, 170, 110, 0.2)',
                flexShrink: 0,
                gap: '2cqw'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1cqw', flex: 1 }}>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="hex-input"
                    >
                        <option value="all">Tất cả</option>
                        <option value="champions">Tướng</option>
                        <option value="traits">Tộc/Hệ</option>
                        <option value="items">Trang bị</option>
                        <option value="augments">Augments</option>
                        <option value="puzzles">Puzzles</option>
                        <option value="pro_players">Pro Player</option>
                        <option value="memes">Meme</option>
                    </select>
                    <input
                        type="text"
                        className="hex-input"
                        placeholder="Tìm kiếm theo ID hoặc tên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ minWidth: '15cqw' }}
                    />
                    <span style={{ color: '#94A3B8', fontSize: '0.9cqw', whiteSpace: 'nowrap' }}>
                        {filteredTrashItems.length} mục trong thùng rác
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '0.8cqw', flexShrink: 0 }}>
                    {selectedIds.size > 0 && (
                        <>
                            <button
                                className="hex-button primary small"
                                onClick={handleRestore}
                            >
                                Khôi phục ({selectedIds.size})
                            </button>
                            <button
                                className="hex-button danger small"
                                onClick={requestPermanentDelete}
                            >
                                Xóa vĩnh viễn ({selectedIds.size})
                            </button>
                        </>
                    )}
                    <button
                        className="hex-button danger small"
                        onClick={requestEmptyTrash}
                        disabled={trashItems.length === 0}
                    >
                        Làm trống thùng rác
                    </button>
                </div>
            </div>

            {/* Trash Table or Empty State */}
            <div className="admin-table-container" style={{ flex: 1, overflowY: 'auto' }}>
                {filteredTrashItems.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#94A3B8',
                        gap: '1cqw',
                        paddingTop: '5cqw'
                    }}>
                        <div style={{ fontSize: '3cqw', opacity: 0.5 }}>🗑️</div>
                        <div style={{ fontSize: '1cqw' }}>Thùng rác trống</div>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '3%', textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                        style={{ cursor: 'pointer', width: '1.2cqw', height: '1.2cqw' }}
                                    />
                                </th>
                                <th style={{ width: '12%' }}>Loại</th>
                                <th style={{ width: '20%' }}>Tên</th>
                                <th style={{ width: '15%' }}>ID</th>
                                <th style={{ width: '12%' }}>Ngày xóa</th>
                                <th style={{ width: '38%' }}>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTrashItems.map((item) => {
                                const isSelected = selectedIds.has(item.id);
                                const data = item.data;

                                return (
                                    <tr
                                        key={item.id}
                                        className={isSelected ? 'selected-row' : ''}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelect(item.id)}
                                                style={{ cursor: 'pointer', width: '1.2cqw', height: '1.2cqw' }}
                                            />
                                        </td>
                                        <td>
                                            <span style={{
                                                background: 'rgba(200, 170, 110, 0.15)',
                                                border: '0.05cqw solid #c8aa6e',
                                                color: '#c8aa6e',
                                                padding: '0.2cqw 0.6cqw',
                                                borderRadius: '0.3cqw',
                                                fontSize: '0.7cqw',
                                                textTransform: 'capitalize'
                                            }}>
                                                {item.type === 'champions' ? 'Tướng' :
                                                    item.type === 'traits' ? 'Tộc/Hệ' :
                                                        item.type === 'items' ? 'Trang bị' :
                                                            item.type === 'augments' ? 'Augment' :
                                                                item.type === 'pro_players' ? 'Pro Player' :
                                                                    item.type === 'memes' ? 'Meme' : 'Puzzle'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500, color: '#F0E6D2' }}>
                                                {data.name || data.title || data.text || 'Không tên'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="id-cell">
                                                <span title={data.id}>{data.id}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.8cqw', color: '#94A3B8' }}>
                                                {formatDate(item.deleted_at)}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.75cqw', color: '#94A3B8', fontStyle: 'italic' }}>
                                                {item.type === 'champions' && `Cost: ${data.cost || 'N/A'}`}
                                                {item.type === 'traits' && `Active: ${data.breakpoints?.join(', ') || 'N/A'}`}
                                                {item.type === 'items' && `Combined: ${data.combined || 'N/A'}`}
                                                {item.type === 'augments' && `Tier: ${data.tier || 'N/A'}`}
                                                {item.type === 'puzzles' && `Stage: ${data.stage || 'N/A'}`}
                                                {item.type === 'pro_players' && `Region: ${data.region || 'N/A'}`}
                                                {item.type === 'memes' && `Category: ${data.category || 'N/A'}`}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmAction !== null}
                title={confirmAction === 'empty' ? 'Làm trống thùng rác' : 'Xóa vĩnh viễn'}
                message={confirmAction === 'empty'
                    ? `Xóa vĩnh viễn tất cả ${trashItems.length} mục trong thùng rác?`
                    : `Xóa vĩnh viễn ${selectedIds.size} mục đã chọn?`
                }
                confirmLabel="Xóa vĩnh viễn"
                cancelLabel="Huỷ"
                isLoading={isProcessing}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleConfirm}
            />
        </div>
    );
};
