import React, { useEffect, useState } from 'react';
import '../../components/Sidebar/ItemPanel.css';
import { championService, Champion } from '../../services/championService';
import { traitService } from '../../services/traitService';
import { itemService } from '../../services/itemService';
import { augmentService } from '../../services/augmentService';
import { puzzleService } from '../../services/puzzleService';
import { seedCompletePuzzles } from '../../utils/seedCompletePuzzles';
import PuzzleBuilder from './PuzzleBuilder/PuzzleBuilder';
import AdminHeader from '../../components/Admin/AdminHeader';
import '../../components/Admin/AdminDataTable.css';

import AdminDeleteModal from './components/AdminDeleteModal';
import AdminEditModal from './components/AdminEditModal';
import Toast from '../../components/common/Toast';
import { TrashView, DeletedItem } from './components/TrashView';
import { useAuth } from '../../contexts/AuthContext';
import { UserManagement } from './UserManagement/UserManagement';
import { MemeManager } from './MemeManager/MemeManager';
import { ProIqManager } from './ProIqManager/ProIqManager';

interface AdminDataModalProps {
    onClose: () => void;
    onPuzzleSaved?: () => void | Promise<void>;
}

type Tab = 'champions' | 'traits' | 'items' | 'augments' | 'puzzles' | 'users' | 'memes' | 'proiq' | 'trash';

const AdminDataModal: React.FC<AdminDataModalProps> = ({ onClose, onPuzzleSaved }) => {
    const { canAccessAdmin, canManageUsers } = useAuth();

    const [activeTab, setActiveTab] = useState<Tab>('champions');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isBuilderMode, setIsBuilderMode] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Admin Guard: One-time mount check only.
    // Reactive useEffect is intentionally avoided because Supabase token refresh
    // (triggered by browser tab switch) temporarily nullifies canAccessAdmin,
    // causing false-positive closes. The modal is already protected by conditional
    // rendering in App.tsx ({showAdminModal && <AdminDataModal />}).
    const hasCheckedAccess = React.useRef(false);
    useEffect(() => {
        if (hasCheckedAccess.current) return;
        hasCheckedAccess.current = true;
        if (!canAccessAdmin) {
            console.error('Unauthorized access attempt to admin panel');
            onClose();
        }
    }, [canAccessAdmin, onClose]);

    // Modal State
    const [editingItem, setEditingItem] = useState<any>(null);
    const [deletingItem, setDeletingItem] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false); // Separate loading state for modals

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch data when tab changes
    useEffect(() => {
        setSearchTerm(''); // Reset search on tab change
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            let result;
            switch (activeTab) {
                case 'champions':
                    result = await championService.getAll();
                    break;
                case 'traits':
                    result = await traitService.getAll();
                    break;
                case 'items':
                    result = await itemService.getAll();
                    break;
                case 'augments':
                    result = await augmentService.getAll();
                    break;
                case 'puzzles':
                    result = await puzzleService.getAll();
                    break;
            }
            setData(result || []);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Không thể tải dữ liệu. Kiểm tra console.');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredAndSortedData = () => {
        let result = [...data];

        // Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(item => {
                const name = item.name?.toLowerCase() || item.title?.toLowerCase() || '';
                const id = item.id?.toLowerCase() || '';
                // Also search by cost if it is a number
                const cost = (item as any).cost;
                const costMatch = cost !== undefined && String(cost).includes(lowerTerm);

                return name.includes(lowerTerm) || id.includes(lowerTerm) || costMatch;
            });
        }

        // Sort: Cost (asc) -> Name (asc)
        result.sort((a, b) => {
            // Priority 1: Cost (only for champions/units that have cost)
            const costA = (a as any).cost ?? -1;
            const costB = (b as any).cost ?? -1;

            // Only sort by cost if both items have a valid cost (non-negative for our logic usually, but here checking existence)
            // Actually, if we want "sort list by cost", items without cost should probably go last or treat as 0? 
            // Usually only Champions have cost here.
            if (activeTab === 'champions') {
                if (costA !== costB) {
                    return costA - costB;
                }
            }

            // Priority 2: Name AZ
            const nameA = a.name || a.title || a.proPlayer || a.id || '';
            const nameB = b.name || b.title || b.proPlayer || b.id || '';

            return nameA.toString().localeCompare(nameB.toString());
        });

        return result;
    };

    // Optimistic UI State
    const [fadingIds, setFadingIds] = useState<Set<string>>(new Set());

    const confirmDelete = async () => {
        if (!deletingItem) return;

        setIsSaving(true);
        setDeletingItem(null);

        try {
            if (activeTab === 'trash') {
                // Permanent delete from trash
                return; // Handled by TrashView
            }

            if (deletingItem.id === 'BULK_DELETE_FLAG') {
                const ids = Array.from(selectedIds);

                // 1. Fade out animation (reduced to 150ms)
                setFadingIds(new Set(ids));
                await new Promise(resolve => setTimeout(resolve, 150));

                // 2. Soft delete in DB - PARALLEL for speed
                const deletePromises = ids.map(id => {
                    switch (activeTab) {
                        case 'champions': return championService.delete(id);
                        case 'traits': return traitService.delete(id);
                        case 'items': return itemService.delete(id);
                        case 'augments': return augmentService.delete(id);
                        case 'puzzles': return puzzleService.delete(id);
                        default: return Promise.resolve();
                    }
                });
                await Promise.all(deletePromises);

                // 3. Remove from local UI
                setData(prev => prev.filter(item => !selectedIds.has(item.id)));
                setFadingIds(new Set());

                setToast({ message: `Đã chuyển ${ids.length} mục vào thùng rác.`, type: 'success' });
                setSelectedIds(new Set());
            } else {
                // Single Delete
                const itemToDelete = deletingItem;

                setFadingIds(new Set([itemToDelete.id]));
                await new Promise(resolve => setTimeout(resolve, 150));

                // Soft delete in DB (sets deleted_at)
                switch (activeTab) {
                    case 'champions': await championService.delete(itemToDelete.id); break;
                    case 'traits': await traitService.delete(itemToDelete.id); break;
                    case 'items': await itemService.delete(itemToDelete.id); break;
                    case 'augments': await augmentService.delete(itemToDelete.id); break;
                    case 'puzzles': await puzzleService.delete(itemToDelete.id); break;
                }

                setData(prev => prev.filter(item => item.id !== itemToDelete.id));
                setFadingIds(new Set());

                setToast({ message: `Đã chuyển vào thùng rác.`, type: 'success' });
            }
        } catch (err: any) {
            console.error('Delete error:', err);
            setToast({ message: `Xoá thất bại: ${err.message}`, type: 'error' });
            setFadingIds(new Set());
            loadData();
        } finally {
            setIsSaving(false);
        }
    };

    // Restore items from trash (set deleted_at = null)
    const handleRestoreFromTrash = async (deletedItems: DeletedItem[]) => {
        try {
            setLoading(true);

            // Restore in PARALLEL for speed
            const restorePromises = deletedItems.map(item => {
                switch (item.type) {
                    case 'champions': return championService.restore(item.id);
                    case 'traits': return traitService.restore(item.id);
                    case 'items': return itemService.restore(item.id);
                    case 'augments': return augmentService.restore(item.id);
                    case 'puzzles': return puzzleService.restore(item.id);
                    case 'pro_players': return import('../../features/tft-iq/proIqService').then(m => m.restoreProPlayer(item.id));
                    case 'memes': return import('../../features/puzzle/feedback/memeService').then(m => m.restoreMeme(item.id));
                    default: return Promise.resolve();
                }
            });
            await Promise.all(restorePromises);

            setToast({ message: `Đã khôi phục ${deletedItems.length} mục.`, type: 'success' });

            // Reload current tab if it matches restored type
            if (deletedItems.length > 0 && deletedItems[0].type === (activeTab as any)) {
                await loadData();
            }
        } catch (err: any) {
            console.error('Restore error:', err);
            setToast({ message: `Khôi phục thất bại: ${err.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Permanently delete items from database (hard delete)
    const handlePermanentDeleteFromTrash = async (deletedItems: DeletedItem[]) => {
        try {
            setLoading(true);
            const { supabase } = await import('../../lib/supabase');

            // Hard delete in PARALLEL for speed
            const deletePromises = deletedItems.map(item => {
                switch (item.type) {
                    case 'champions': return supabase.from('champions').delete().eq('id', item.id);
                    case 'traits': return supabase.from('traits').delete().eq('id', item.id);
                    case 'items': return supabase.from('items').delete().eq('id', item.id);
                    case 'augments': return supabase.from('augments').delete().eq('id', item.id);
                    case 'puzzles': return supabase.from('puzzles').delete().eq('id', item.id);
                    case 'pro_players': return import('../../features/tft-iq/proIqService').then(m => m.hardDeleteProPlayer(item.id));
                    case 'memes': return import('../../features/puzzle/feedback/memeService').then(m => m.hardDeleteMeme(item.id));
                    default: return Promise.resolve();
                }
            });
            await Promise.all(deletePromises);

            setToast({ message: `Đã xóa vĩnh viễn ${deletedItems.length} mục.`, type: 'success' });
        } catch (err: any) {
            console.error('Permanent delete error:', err);
            setToast({ message: `Xóa vĩnh viễn thất bại: ${err.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const saveEdit = async (updates: any) => {
        if (!editingItem) return;

        try {
            setIsSaving(true);
            const { id, ...cleanUpdates } = updates;

            switch (activeTab) {
                case 'champions': await championService.update(editingItem.id, cleanUpdates); break;
                case 'traits': await traitService.update(editingItem.id, cleanUpdates); break;
                case 'items': await itemService.update(editingItem.id, cleanUpdates); break;
                case 'augments': await augmentService.update(editingItem.id, cleanUpdates); break;
                case 'puzzles': await puzzleService.save({ ...editingItem, ...cleanUpdates }); break;
            }

            // Optimistic Update
            setData(prev => prev.map(item =>
                item.id === editingItem.id ? { ...item, ...cleanUpdates } : item
            ));

            setEditingItem(null);
            setToast({ message: 'Đã lưu thay đổi thành công', type: 'success' });
        } catch (err: any) {
            console.error('Edit error:', err);
            setToast({ message: `Cập nhật thất bại: ${err.message}`, type: 'error' });
            loadData();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (item: any) => {
        // ... (existing logic)
        setDeletingItem(item);
    };

    // Restoring State & Handlers
    // Add state for selected puzzle to edit
    const [selectedPuzzleToEdit, setSelectedPuzzleToEdit] = useState<any>(null);

    const handleEditClick = (item: any) => {
        if (activeTab === 'puzzles') {
            setSelectedPuzzleToEdit(item);
            setIsBuilderMode(true);
            return;
        }
        setEditingItem(item);
    };

    // Bulk Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Toggle single selection
    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    // Toggle select all
    const toggleSelectAll = () => {
        if (selectedIds.size === filteredData.length && filteredData.length > 0) {
            setSelectedIds(new Set());
        } else {
            const allIds = new Set(filteredData.map(item => item.id));
            setSelectedIds(allIds);
        }
    };

    // Bulk Delete
    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        // Open the existing delete modal with a special flag/name
        setDeletingItem({
            id: 'BULK_DELETE_FLAG',
            name: `${selectedIds.size} mục đã chọn`
        });
    };

    // Missing Logic Restoration
    const filteredData = getFilteredAndSortedData();
    const isAllSelected = filteredData.length > 0 && selectedIds.size === filteredData.length;

    const renderTable = () => {
        // ... (loading/error checks)
        if (loading) return <div className="text-muted" style={{ textAlign: 'center', padding: '2cqw' }}>Đang tải dữ liệu...</div>;
        if (error) return (
            <div className="text-rose" style={{ textAlign: 'center', padding: '2cqw' }}>
                <p>Lỗi: {error}</p>
            </div>
        );
        if (filteredData.length === 0) return <div className="text-muted" style={{ textAlign: 'center', padding: '2cqw' }}>Không tìm thấy kết quả cho "{searchTerm}".</div>;

        return (
            <div className="admin-table-container" style={{ overflowY: 'auto' }}>
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
                            <th style={{ width: (activeTab === 'augments' || activeTab === 'traits' || activeTab === 'items') ? '12%' : activeTab === 'champions' ? '10%' : '17%' }}>ID</th>
                            <th style={{ width: (activeTab === 'augments' || activeTab === 'traits' || activeTab === 'items') ? '20%' : activeTab === 'champions' ? '12%' : undefined }}>Tên</th>
                            {(activeTab === 'augments' || activeTab === 'traits' || activeTab === 'items') && <th style={{ width: '52%' }}>Mô tả VN</th>}
                            {activeTab === 'champions' && (
                                <>
                                    <th style={{ width: '8%' }}>Giá</th>
                                    <th style={{ width: '25%' }}>Kỹ Năng</th>
                                    <th style={{ width: '32%' }}>Stats Cơ Bản</th>
                                </>
                            )}
                            <th style={{ width: '10%', textAlign: 'right' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item) => {
                            const isFading = fadingIds.has(item.id);
                            const isSelected = selectedIds.has(item.id);
                            return (
                                <tr
                                    key={item.id}
                                    className={`${isFading ? 'fading-row' : ''} ${isSelected ? 'selected-row' : ''}`}
                                >
                                    <td style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(item.id)}
                                            style={{ cursor: 'pointer', width: '1.2cqw', height: '1.2cqw' }}
                                        />
                                    </td>
                                    <td>
                                        <div className="id-cell">
                                            <span title={item.id}>{item.id}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1cqw' }}>
                                            {activeTab === 'champions' && (item as Champion).avatar && (
                                                <img
                                                    src={(item as Champion).avatar}
                                                    alt={item.name}
                                                    className={`champion-avatar cost-${(item as Champion).cost}`}
                                                    onError={() => {
                                                        // Fallback or retry
                                                    }}
                                                />
                                            )}
                                            {/* Icons for items/traits/augments */}
                                            {(activeTab === 'items' || activeTab === 'traits' || activeTab === 'augments') && (item as any).icon && (
                                                <img
                                                    src={(item as any).icon}
                                                    alt={item.name}
                                                    className="champion-avatar"
                                                    style={{ borderRadius: '4px' }}
                                                />
                                            )}
                                            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center' }}>
                                                {item.name || item.title || item.proPlayer || 'Chưa đặt tên'}
                                            </span>
                                        </div>
                                    </td>
                                    {(activeTab === 'augments' || activeTab === 'traits' || activeTab === 'items') && (
                                        <td>
                                            <span style={{
                                                fontSize: '0.8em',
                                                color: (item as any).description_vi
                                                    ? 'var(--color-text-secondary)'
                                                    : 'var(--color-text-muted, #666)',
                                                fontStyle: (item as any).description_vi ? 'normal' : 'italic',
                                                display: 'block',
                                                wordWrap: 'break-word',
                                                overflowWrap: 'break-word',
                                                whiteSpace: 'normal',
                                                lineHeight: 1.4
                                            }}>
                                                {(item as any).description_vi || 'Chưa có'}
                                            </span>
                                        </td>
                                    )}
                                    {activeTab === 'champions' && (
                                        <>
                                            <td>
                                                <span className={`cell-pill rarity-${(item as Champion).cost}`}>
                                                    $ {(item as Champion).cost}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.75cqw' }}>
                                                    {(item as Champion).ability_name ? (
                                                        <>
                                                            <div style={{ fontWeight: 600, color: '#c8aa6e', marginBottom: '0.3cqw' }}>
                                                                {(item as Champion).ability_name}
                                                            </div>
                                                            <div style={{ color: '#94A3B8', lineHeight: 1.3 }}>
                                                                {(item as Champion).ability_description?.substring(0, 80)}{(item as Champion).ability_description && (item as Champion).ability_description!.length > 80 ? '...' : ''}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span style={{ fontStyle: 'italic', color: '#666' }}>Chưa có</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {(item as Champion).stats ? (
                                                    <div style={{ fontSize: '0.7cqw', lineHeight: 1.4, color: '#a8b4c2' }}>
                                                        <div>HP {(item as Champion).stats!.hp?.join('/') ?? '–'} | AD {(item as Champion).stats!.ad?.join('/') ?? '–'}</div>
                                                        <div>AR {(item as Champion).stats!.armor} | MR {(item as Champion).stats!.mr} | AS: {(item as Champion).stats!.as}</div>
                                                        <div>Mana {(item as Champion).stats!.mana.min}/{(item as Champion).stats!.mana.max} | Range {(item as Champion).stats!.range}</div>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontStyle: 'italic', color: '#666' }}>Chưa có</span>
                                                )}
                                            </td>
                                        </>
                                    )}
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                            <button
                                                className="hex-button small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(item);
                                                }}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className="hex-button danger small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(item);
                                                }}
                                            >
                                                Xoá
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };


    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse at 50% 30%, rgba(200, 170, 110, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(21, 58, 62, 0.25) 0%, transparent 50%), rgba(0, 0, 0, 0.78)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(8px)',
            animation: 'hex-overlay-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <div className="hex-panel" style={{
                width: '90cqw',
                height: '80cqw',
                maxHeight: '95vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {isBuilderMode ? (
                    <PuzzleBuilder
                        initialPuzzle={selectedPuzzleToEdit}
                        onClose={() => {
                            setIsBuilderMode(false);
                            setSelectedPuzzleToEdit(null);
                        }}
                        onSaveSuccess={async (puzzleId: string, _shareUrl: string) => {
                            // FIRST: Show toast immediately
                            console.log('[AdminDataModal] Puzzle saved, showing toast for:', puzzleId);
                            setToast({
                                message: `Lưu thành công! ID: ${puzzleId.slice(0, 8)}...`,
                                type: 'success'
                            });

                            // THEN: Close modal and reload
                            setIsBuilderMode(false);
                            setSelectedPuzzleToEdit(null);
                            await loadData();

                            // Refresh puzzle list in main app
                            if (onPuzzleSaved) {
                                await onPuzzleSaved();
                            }
                        }}
                    />
                ) : (
                    <>
                        <AdminHeader
                            title="Bảng điều khiển"
                            tabs={[
                                { key: 'champions', label: 'tướng' },
                                { key: 'traits', label: 'tộc/hệ' },
                                { key: 'items', label: 'trang bị' },
                                { key: 'augments', label: 'Augments' },
                                { key: 'puzzles', label: 'Puzzles' },
                                { key: 'memes', label: 'Memes' },
                                { key: 'proiq', label: 'Pro IQ' },
                                ...(canManageUsers ? [{ key: 'users', label: 'Users' }] : []),
                                { key: 'trash', label: 'Thùng rác' }
                            ]}
                            activeTab={activeTab}
                            onTabChange={(key) => setActiveTab(key as Tab)}
                            onClose={onClose}
                        />

                        <div className="admin-body" style={{ padding: '2cqw', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {/* Self-managed tabs: always rendered, shown/hidden via CSS to preserve internal state (modals, forms) */}
                            <div style={{ display: activeTab === 'memes' ? 'flex' : 'none', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                <MemeManager />
                            </div>
                            <div style={{ display: activeTab === 'proiq' ? 'flex' : 'none', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                <ProIqManager />
                            </div>
                            {canManageUsers && (
                                <div style={{ display: activeTab === 'users' ? 'flex' : 'none', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                    <UserManagement />
                                </div>
                            )}
                            <div style={{ display: activeTab === 'trash' ? 'flex' : 'none', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                <TrashView
                                    onRestore={handleRestoreFromTrash}
                                    onPermanentDelete={handlePermanentDeleteFromTrash}
                                />
                            </div>

                            {/* Data-table tabs: conditional render is fine (modals managed at parent level) */}
                            {['champions', 'traits', 'items', 'augments', 'puzzles'].includes(activeTab) && (
                                <div className="admin-content-transition" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5cqw', gap: '1cqw', flexShrink: 0 }}>

                                        <input
                                            type="text"
                                            className="hex-input"
                                            placeholder={`Tìm kiếm ${activeTab === 'champions' ? 'tướng' : activeTab === 'traits' ? 'tộc/hệ' : activeTab === 'items' ? 'trang bị' : activeTab === 'augments' ? 'Augments' : 'Puzzles'}...`}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ flex: 1 }}
                                        />

                                        <div style={{ display: 'flex', gap: '1cqw', alignItems: 'center' }}>
                                            {/* BULK DELETE BUTTON */}
                                            {selectedIds.size > 0 && (
                                                <button
                                                    className="hex-button danger"
                                                    onClick={handleBulkDelete}
                                                    style={{ marginRight: '1cqw' }}
                                                    disabled={isSaving}
                                                >
                                                    {isSaving ? 'Đang xoá...' : `Xoá đã chọn (${selectedIds.size})`}
                                                </button>
                                            )}

                                            {activeTab === 'puzzles' && (
                                                <>
                                                    <button
                                                        onClick={async () => {
                                                            setLoading(true);
                                                            try {
                                                                await seedCompletePuzzles();
                                                                await loadData();
                                                                setToast({ message: 'Đã tạo 10 câu đố mẫu thành công!', type: 'success' });
                                                            } catch (err: any) {
                                                                setToast({ message: `Tạo mẫu thất bại: ${err.message}`, type: 'error' });
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        className="hex-button primary"
                                                    >
                                                        Tạo 10 Puzzles mẫu
                                                    </button>
                                                    <button
                                                        onClick={() => setIsBuilderMode(true)}
                                                        className="hex-button primary"
                                                    >
                                                        + Tạo Puzzles mới
                                                    </button>
                                                </>
                                            )}

                                        </div>
                                    </div>

                                    {renderTable()}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <AdminDeleteModal
                isOpen={!!deletingItem}
                itemName={deletingItem?.name || deletingItem?.title || deletingItem?.id || 'Item'}
                isDeleting={isSaving}
                onClose={() => setDeletingItem(null)}
                onConfirm={confirmDelete}
            />

            <AdminEditModal
                item={editingItem}
                type={activeTab === 'trash' || activeTab === 'users' || activeTab === 'memes' || activeTab === 'proiq' ? 'champions' : activeTab}
                isSaving={isSaving}
                onClose={() => setEditingItem(null)}
                onSave={saveEdit}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type as any}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default AdminDataModal;
