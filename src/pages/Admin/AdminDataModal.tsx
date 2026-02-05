import React, { useEffect, useState } from 'react';
import '../../components/Sidebar/ItemPanel.css';
import { championService, Champion } from '../../services/championService';
import { traitService } from '../../services/traitService';
import { itemService } from '../../services/itemService';
import { augmentService, Augment } from '../../services/augmentService';
import { puzzleService } from '../../services/puzzleService';
import { seedCompletePuzzles } from '../../utils/seedCompletePuzzles';
import PuzzleBuilder from './PuzzleBuilder/PuzzleBuilder';
import AdminHeader from '../../components/Admin/AdminHeader';
import '../../components/Admin/AdminDataTable.css';

import AdminDeleteModal from './components/AdminDeleteModal';
import AdminEditModal from './components/AdminEditModal';
import Toast from '../../components/common/Toast';

interface AdminDataModalProps {
    onClose: () => void;
    onPuzzleSaved?: () => void | Promise<void>;
}

type Tab = 'champions' | 'traits' | 'items' | 'augments' | 'puzzles';

const AdminDataModal: React.FC<AdminDataModalProps> = ({ onClose, onPuzzleSaved }) => {
    const [activeTab, setActiveTab] = useState<Tab>('champions');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isBuilderMode, setIsBuilderMode] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            setError(err.message || 'Failed to fetch data. check console.');
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
        try {
            if (deletingItem.id === 'BULK_DELETE_FLAG') {
                const ids = Array.from(selectedIds);
                // 1. Optimistic Fade Out
                setFadingIds(new Set(ids));

                // 2. Wait for animation (parallel with API call start if we want, but better to wait a bit)
                await new Promise(resolve => setTimeout(resolve, 500));

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

                // 3. Update Local Data
                setData(prev => prev.filter(item => !selectedIds.has(item.id)));

                setToast({ message: `Successfully deleted ${ids.length} items.`, type: 'success' });
                setSelectedIds(new Set());
                setFadingIds(new Set());
            } else {
                // Single Delete
                setFadingIds(new Set([deletingItem.id]));
                await new Promise(resolve => setTimeout(resolve, 500));

                switch (activeTab) {
                    case 'champions': await championService.delete(deletingItem.id); break;
                    case 'traits': await traitService.delete(deletingItem.id); break;
                    case 'items': await itemService.delete(deletingItem.id); break;
                    case 'augments': await augmentService.delete(deletingItem.id); break;
                    case 'puzzles': await puzzleService.delete(deletingItem.id); break;
                }

                setData(prev => prev.filter(item => item.id !== deletingItem.id));
                setToast({ message: 'Deleted successfully.', type: 'success' });
                setFadingIds(new Set());
            }
            setDeletingItem(null);
            // DO NOT CALL loadData()
        } catch (err: any) {
            console.error('Delete error:', err);
            setToast({ message: `Failed to delete: ${err.message}`, type: 'error' });
            setFadingIds(new Set()); // Reset on error
            loadData(); // Revert to server state on error
        } finally {
            setIsSaving(false);
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
            setToast({ message: 'Changes saved successfully', type: 'success' });
        } catch (err: any) {
            console.error('Edit error:', err);
            setToast({ message: `Failed to update: ${err.message}`, type: 'error' });
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
            name: `${selectedIds.size} selected items`
        });
    };

    // Missing Logic Restoration
    const filteredData = getFilteredAndSortedData();
    const isAllSelected = filteredData.length > 0 && selectedIds.size === filteredData.length;

    const renderTable = () => {
        // ... (loading/error checks)
        if (loading) return <div className="text-muted" style={{ textAlign: 'center', padding: '2cqw' }}>Loading data...</div>;
        if (error) return (
            <div className="text-rose" style={{ textAlign: 'center', padding: '2cqw' }}>
                <p>Error: {error}</p>
            </div>
        );
        if (filteredData.length === 0) return <div className="text-muted" style={{ textAlign: 'center', padding: '2cqw' }}>No records found matching "{searchTerm}".</div>;

        return (
            <div className="admin-table-container" style={{ overflowY: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '5%', textAlign: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={toggleSelectAll}
                                    style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                                />
                            </th>
                            <th style={{ width: '15%' }}>ID</th>
                            <th>Name / Title</th>
                            {activeTab === 'champions' && <th style={{ width: '10%' }}>Cost</th>}
                            {activeTab === 'augments' && <th style={{ width: '15%' }}>Rarity</th>}
                            {activeTab === 'puzzles' && <th>Pro Player</th>}
                            {activeTab === 'puzzles' && <th>Stage</th>}
                            <th style={{ width: '20%', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item) => {
                            const isFading = fadingIds.has(item.id);
                            return (
                                <tr
                                    key={item.id}
                                    className={`${selectedIds.has(item.id) ? 'selected-row' : ''} ${isFading ? 'fading-row' : ''}`}
                                    style={selectedIds.has(item.id) ? { backgroundColor: 'rgba(200, 170, 110, 0.1)' } : {}}
                                >
                                    <td style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(item.id)}
                                            onChange={() => toggleSelect(item.id)}
                                            style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
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
                                                {item.name || item.title || item.proPlayer || 'Unnamed'}
                                            </span>
                                        </div>
                                    </td>
                                    {activeTab === 'champions' && (
                                        <td>
                                            <span className={`cell-pill rarity-${(item as Champion).cost}`}>
                                                Cost {(item as Champion).cost}
                                            </span>
                                        </td>
                                    )}
                                    {activeTab === 'augments' && (
                                        <td>
                                            <span className="cell-pill" style={{ textTransform: 'capitalize' }}>
                                                {(item as Augment).rarity}
                                            </span>
                                        </td>
                                    )}
                                    {activeTab === 'puzzles' && <td>{item.proPlayer}</td>}
                                    {activeTab === 'puzzles' && <td>{item.stage}</td>}
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                            <button
                                                className="hex-button small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(item);
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="hex-button danger small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(item);
                                                }}
                                            >
                                                Delete
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
            backgroundColor: 'var(--color-surface-overlay)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
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
                        onSaveSuccess={async () => {
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
                            title="Operations Deck"
                            tabs={[
                                { key: 'champions', label: 'champions' },
                                { key: 'traits', label: 'traits' },
                                { key: 'items', label: 'items' },
                                { key: 'augments', label: 'augments' },
                                { key: 'puzzles', label: 'puzzles' }
                            ]}
                            activeTab={activeTab}
                            onTabChange={(key) => setActiveTab(key as Tab)}
                            onClose={onClose}
                        />

                        <div className="admin-body" style={{ padding: '2cqw', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div key={activeTab} className="admin-content-transition" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1cqw', gap: '1cqw', flexShrink: 0 }}>

                                    <input
                                        type="text"
                                        className="hex-input"
                                        placeholder={`Filter ${activeTab}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '40%' }} /* Adjust width as needed */
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
                                                {isSaving ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
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
                                                            setToast({ message: '✓ Seeded 10 complete puzzles successfully!', type: 'success' });
                                                        } catch (err: any) {
                                                            setToast({ message: `Failed to seed: ${err.message}`, type: 'error' });
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }}
                                                    className="hex-button primary"
                                                >
                                                    🌱 Seed 10 Complete Puzzles
                                                </button>
                                                <button
                                                    onClick={() => setIsBuilderMode(true)}
                                                    className="hex-button primary"
                                                >
                                                    + Create New Puzzle
                                                </button>
                                            </>
                                        )}
                                        {activeTab !== 'puzzles' && (
                                            <button
                                                className="hex-button"
                                                onClick={() => alert('Feature coming soon')}
                                            >
                                                + Add New {activeTab}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {renderTable()}
                            </div>
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
                type={activeTab}
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
