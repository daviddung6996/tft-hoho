import React, { useState, useEffect } from 'react';
import { AugmentData, augmentService } from '../../../../services/augmentService';
import './AugmentSelector.css';

interface AugmentSelectorProps {
    selectedAugments: AugmentData[];
    onAugmentsChange: (augments: AugmentData[]) => void;
}

const AugmentSelector: React.FC<AugmentSelectorProps> = ({ selectedAugments, onAugmentsChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [augmentPool, setAugmentPool] = useState<AugmentData[]>([]);
    const [filteredAugments, setFilteredAugments] = useState<AugmentData[]>([]);

    useEffect(() => {
        // Load initial pool
        augmentService.getAll().then(data => {
            setAugmentPool(data);
            setFilteredAugments(data);
        });
    }, []);

    useEffect(() => {
        // Local filtering for speed, or could call augmentService.search(query)
        if (!searchQuery) {
            setFilteredAugments(augmentPool);
        } else {
            const lowerIds = searchQuery.toLowerCase();
            const results = augmentPool.filter(aug =>
                aug.title.toLowerCase().includes(lowerIds) ||
                aug.description.toLowerCase().includes(lowerIds)
            );
            setFilteredAugments(results);
        }
    }, [searchQuery, augmentPool]);

    const handleAddAugment = (augment: AugmentData) => {
        onAugmentsChange([...selectedAugments, augment]);
        setIsModalOpen(false);
        setSearchQuery('');
    };

    const handleRemoveAugment = (index: number) => {
        const newAugments = [...selectedAugments];
        newAugments.splice(index, 1);
        onAugmentsChange(newAugments);
    };

    return (
        <div className="augment-selector-container">
            <div className="selected-augments-list">
                {selectedAugments.map((aug, idx) => (
                    <div key={`${idx}-${aug.title}`} className="selected-augment-item">
                        <img src={aug.icon} alt={aug.title} className="selected-augment-icon" />
                        <div className="selected-augment-info">
                            <span className="selected-augment-title">{aug.title}</span>
                        </div>
                        <button
                            className="augment-modal-close"
                            style={{ fontSize: '1rem', marginLeft: 'auto' }}
                            onClick={(e) => { e.stopPropagation(); handleRemoveAugment(idx); }}
                        >
                            ✕
                        </button>

                        {/* Hover Tooltip */}
                        <div className="selected-augment-desc-tooltip">
                            <h4 style={{ color: '#ecbf69', marginBottom: '0.5rem' }}>{aug.title}</h4>
                            <p style={{ color: '#ccc', fontSize: '0.85rem' }}>{aug.description}</p>
                        </div>
                    </div>
                ))}

                <button className="augment-add-btn" onClick={() => setIsModalOpen(true)}>
                    +
                </button>
            </div>

            {isModalOpen && (
                <div className="augment-selector-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="augment-selector-modal" onClick={e => e.stopPropagation()}>
                        <div className="augment-modal-header">
                            <input
                                type="text"
                                className="augment-search-input"
                                placeholder="Tìm Augments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button className="augment-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        <div className="augment-grid">
                            {filteredAugments.map((aug, idx) => (
                                <div key={idx} className="augment-grid-item" onClick={() => handleAddAugment(aug)}>
                                    <img src={aug.icon} alt={aug.title} className="augment-grid-icon" />
                                    <span className="augment-grid-name">{aug.title}</span>
                                </div>
                            ))}
                            {filteredAugments.length === 0 && (
                                <div style={{ color: '#64748b', gridColumn: '1/-1', textAlign: 'center', marginTop: '2rem' }}>
                                    Không tìm thấy Augments.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AugmentSelector;
