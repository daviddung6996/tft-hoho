import React from 'react';
import { Item } from '../../services/itemService';
import { ItemTooltip } from '../common/HextechTooltip';
import './ItemPanel.css';

interface ItemPanelProps {
    items?: (Item | null)[];
    variant?: 'sidebar' | 'sheet';
}

export const ItemPanel: React.FC<ItemPanelProps> = ({ items = [], variant = 'sidebar' }) => {
    // Filter out null items and calculate empty slots
    const validItems = items.filter((item): item is Item => item !== null);
    const emptySlots = Math.max(0, 10 - validItems.length);

    return (
        <div
            className={`item-panel-container item-panel-container--${variant}`}
            data-testid={`ItemPanel:${variant}`}
        >
            {/* Display puzzle items */}
            {validItems.map((item, index) => (
                <ItemTooltip
                    key={item.id || index}
                    name={item.name}
                    description={item.description || ''}
                    position="right"
                >
                    <div className="item-slot active-slot">
                        {item.icon && (
                            <img
                                src={item.icon}
                                alt={item.name}
                                className="item-icon-image"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        )}
                    </div>
                </ItemTooltip>
            ))}

            {/* Empty slots below */}
            {Array(emptySlots).fill(null).map((_, index) => (
                <div key={`empty-${index}`} className="item-slot empty-slot"></div>
            ))}
        </div>
    );
};

