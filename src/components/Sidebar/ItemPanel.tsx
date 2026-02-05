import React from 'react';
import { Item } from '../../services/itemService';
import './ItemPanel.css';

interface ItemPanelProps {
    items?: (Item | null)[];
}

export const ItemPanel: React.FC<ItemPanelProps> = ({ items = [] }) => {
    // Filter out null items and calculate empty slots
    const validItems = items.filter((item): item is Item => item !== null);
    const emptySlots = Math.max(0, 10 - validItems.length);

    return (
        <div className="item-panel-container">
            {/* Display puzzle items */}
            {validItems.map((item, index) => (
                <div key={item.id || index} className="item-slot active-slot">
                    {item.icon && (
                        <img
                            src={item.icon}
                            alt={item.name}
                            className="item-icon-image"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    )}
                </div>
            ))}

            {/* Empty slots below */}
            {Array(emptySlots).fill(null).map((_, index) => (
                <div key={`empty-${index}`} className="item-slot empty-slot"></div>
            ))}
        </div>
    );
};
