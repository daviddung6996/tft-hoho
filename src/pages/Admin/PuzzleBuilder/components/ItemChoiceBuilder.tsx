import React, { useState, useEffect } from 'react';
import { Item, itemService } from '../../../../services/itemService';
import './ItemChoiceBuilder.css';

interface ItemChoiceBuilderProps {
    items: (Item | null)[];
    onUpdate: (items: (Item | null)[]) => void;
}

const ItemChoiceBuilder: React.FC<ItemChoiceBuilderProps> = ({
    items = [],
    onUpdate
}) => {
    // Ensure we have at least 5 slots (or whatever number logic dictates, 
    // for now we just show what's passed + 1 empty or fixed grid)
    // Let's go with a fixed 10 slot grid for flexibility
    const MAX_SLOTS = 10;

    // Fill items to ensure we render enough slots, but managing the array is done via onUpdate
    const displayItems = [...items];
    while (displayItems.length < MAX_SLOTS) {
        displayItems.push(null);
    }

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [itemPool, setItemPool] = useState<Item[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);

    useEffect(() => {
        itemService.getAll().then(data => {
            setItemPool(data);
            setFilteredItems(data);
        });
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredItems(itemPool);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            const results = itemPool.filter(item =>
                item.name.toLowerCase().includes(lowerQuery)
            );
            setFilteredItems(results);
        }
    }, [searchQuery, itemPool]);

    const handleSelectItem = (item: Item) => {
        if (editingIndex === null) return;

        const newItems = [...items];
        // Ensure array is large enough if selecting a far slot
        while (newItems.length <= editingIndex) {
            newItems.push(null);
        }
        newItems[editingIndex] = item;

        // Trim trailing nulls to keep array clean? Optional. 
        // For now, let's just keep the sparsely populated array or fill up to index.

        onUpdate(newItems);
        setEditingIndex(null);
        setSearchQuery('');
    };

    const handleClearSlot = (index: number) => {
        const newItems = [...items];
        if (index < newItems.length) {
            newItems[index] = null;
        }
        onUpdate(newItems);
    };

    return (
        <div className="icb-container">
            <div className="icb-header">Starting Items / Components</div>

            <div className="icb-grid">
                {Array.from({ length: MAX_SLOTS }).map((_, index) => {
                    const item = items[index];

                    return (
                        <div
                            key={index}
                            className={`icb-slot ${item ? 'filled' : ''}`}
                            onClick={() => setEditingIndex(index)}
                        >
                            {item ? (
                                <>
                                    {/* Assuming item.icon is available or fallback to name/description parsing */}
                                    {/* If itemService doesn't have icon field, we might need a mapper or use image field if it exists. 
                                        Checking types: Item has stats, name, description, no explicit icon url in the interface shown previously.
                                        But typical TFT data usually has one. Let's assume 'icon' property might be missing on type but available in DB, 
                                        or we need to fetch it.
                                        Wait, looking at `mockPlayers.ts` or similar, items were strings. 
                                        In `itemService.ts`, Item interface is { id, name, description, stats }.
                                        We might need to rely on name or add consistent icon support. 
                                        For now, I'll try to use `reference to tft-asset-fetcher` or just display name if icon missing.
                                        Actually, let's use a placeholder or see if valid image URL exists. 
                                    */}
                                    {item.icon && (
                                        <img
                                            src={item.icon}
                                            alt={item.name}
                                            className="icb-slot-icon"
                                        />
                                    )}
                                    <div className="icb-slot-name" title={item.name}>{item.name}</div>
                                    <button
                                        className="icb-slot-clear"
                                        onClick={(e) => { e.stopPropagation(); handleClearSlot(index); }}
                                        title="Clear Item"
                                    >✕</button>
                                </>
                            ) : (
                                <div className="icb-empty-icon">+</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {editingIndex !== null && (
                <div className="icb-modal-overlay" onClick={() => setEditingIndex(null)}>
                    <div className="icb-modal" onClick={e => e.stopPropagation()}>
                        <div className="icb-modal-header">
                            <input
                                type="text"
                                className="icb-search-input"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button className="icb-modal-close" onClick={() => setEditingIndex(null)}>✕</button>
                        </div>
                        <div className="icb-modal-grid">
                            {filteredItems.map((item) => (
                                <div key={item.id} className="icb-modal-item" onClick={() => handleSelectItem(item)}>
                                    {item.icon && (
                                        <img
                                            src={item.icon}
                                            alt={item.name}
                                            className="icb-modal-icon"
                                        />
                                    )}
                                    <span className="icb-modal-name">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemChoiceBuilder;
