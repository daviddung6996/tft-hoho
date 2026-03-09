import React, { useState, useEffect } from 'react';
import { AugmentData, augmentService } from '../../../../services/augmentService';
import './AugmentChoiceBuilder.css';

interface AugmentChoiceBuilderProps {
    initialAugments: (AugmentData | null)[];
    rerollAugments: (AugmentData | null)[];
    secondRerollAugments?: (AugmentData | null)[];
    hasExtraReroll?: boolean;
    proRerollIndices?: number[]; // Indices 0-2 (Initial) that were rerolled
    proSecondRerollIndices?: number[]; // Indices 0-2 (Reroll) that were rerolled
    proPickIndex?: number; // 0-8 flat index of picked augment
    onUpdate: (
        initial: (AugmentData | null)[],
        reroll: (AugmentData | null)[],
        secondReroll: (AugmentData | null)[],
        hasExtra: boolean,
        proRerollIndices: number[],
        proSecondRerollIndices: number[],
        proPickIndex: number
    ) => void;
}

const AugmentChoiceBuilder: React.FC<AugmentChoiceBuilderProps> = ({
    initialAugments,
    rerollAugments,
    secondRerollAugments = [],
    hasExtraReroll = false,
    proRerollIndices = [],
    proSecondRerollIndices = [],
    proPickIndex = -1,
    onUpdate
}) => {
    // Determine which slot is being edited: type and index (0-2)
    const [editingSlot, setEditingSlot] = useState<{ type: 'initial' | 'reroll' | 'secondReroll'; index: number } | null>(null);
    const [augmentPool, setAugmentPool] = useState<AugmentData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredAugments, setFilteredAugments] = useState<AugmentData[]>([]);

    useEffect(() => {
        augmentService.getAll().then(data => {
            setAugmentPool(data);
            setFilteredAugments(data);
        });
    }, []);

    useEffect(() => {
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

    const triggerUpdate = (
        newInitial: (AugmentData | null)[],
        newReroll: (AugmentData | null)[],
        newSecondReroll: (AugmentData | null)[],
        newHasExtra: boolean,
        newProReroll: number[],
        newProSecondReroll: number[],
        newProPick: number
    ) => {
        onUpdate(newInitial, newReroll, newSecondReroll, newHasExtra, newProReroll, newProSecondReroll, newProPick);
    };

    const handleSelectAugment = (augment: AugmentData) => {
        if (!editingSlot) return;

        const newInitial = [...initialAugments];
        const newReroll = [...rerollAugments];
        const newSecondReroll = [...secondRerollAugments];

        if (editingSlot.type === 'initial') {
            newInitial[editingSlot.index] = augment;
        } else if (editingSlot.type === 'reroll') {
            newReroll[editingSlot.index] = augment;
        } else {
            newSecondReroll[editingSlot.index] = augment;
        }

        triggerUpdate(newInitial, newReroll, newSecondReroll, hasExtraReroll, proRerollIndices, proSecondRerollIndices, proPickIndex);
        setEditingSlot(null);
        setSearchQuery('');
    };

    const handleToggleExtraReroll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isEnabled = e.target.checked;
        triggerUpdate(initialAugments, rerollAugments, secondRerollAugments, isEnabled, proRerollIndices, proSecondRerollIndices, proPickIndex);
    };

    const toggleProReroll = (type: 'initial' | 'reroll', index: number) => {
        if (type === 'initial') {
            const newIndices = proRerollIndices.includes(index)
                ? proRerollIndices.filter(i => i !== index)
                : [...proRerollIndices, index];
            triggerUpdate(initialAugments, rerollAugments, secondRerollAugments, hasExtraReroll, newIndices, proSecondRerollIndices, proPickIndex);
        } else {
            const newIndices = proSecondRerollIndices.includes(index)
                ? proSecondRerollIndices.filter(i => i !== index)
                : [...proSecondRerollIndices, index];
            triggerUpdate(initialAugments, rerollAugments, secondRerollAugments, hasExtraReroll, proRerollIndices, newIndices, proPickIndex);
        }
    };

    const setProPick = (flatIndex: number) => {
        // Toggle off if clicking same
        const newPick = proPickIndex === flatIndex ? -1 : flatIndex;
        triggerUpdate(initialAugments, rerollAugments, secondRerollAugments, hasExtraReroll, proRerollIndices, proSecondRerollIndices, newPick);
    };

    const handleClearSlot = (type: 'initial' | 'reroll' | 'secondReroll', index: number) => {
        const newInitial = [...initialAugments];
        const newReroll = [...rerollAugments];
        const newSecondReroll = [...secondRerollAugments];

        if (type === 'initial') {
            newInitial[index] = null;
        } else if (type === 'reroll') {
            newReroll[index] = null;
        } else {
            newSecondReroll[index] = null;
        }

        triggerUpdate(newInitial, newReroll, newSecondReroll, hasExtraReroll, proRerollIndices, proSecondRerollIndices, proPickIndex);
    };

    const renderSlot = (type: 'initial' | 'reroll' | 'secondReroll', index: number) => {
        let augments: (AugmentData | null)[];
        let flatIndex: number;

        if (type === 'initial') {
            augments = initialAugments;
            flatIndex = index;
        } else if (type === 'reroll') {
            augments = rerollAugments;
            flatIndex = index + 3;
        } else {
            augments = secondRerollAugments;
            flatIndex = index + 6;
        }

        const augment = augments[index];
        const isProPicked = proPickIndex === flatIndex;

        // Reroll marker logic
        const canBeRerolled = (type === 'initial') || (type === 'reroll' && hasExtraReroll);
        const rerollOrder = type === 'initial'
            ? proRerollIndices.indexOf(index)
            : (type === 'reroll' ? proSecondRerollIndices.indexOf(index) : -1);
        const isRerolled = rerollOrder !== -1;

        return (
            <div className={`acb-slot-wrapper`}>
                <div
                    className={`acb-slot ${augment ? 'filled' : ''} ${isProPicked ? 'pro-picked' : ''}`}
                    onClick={() => setEditingSlot({ type, index })}
                >
                    {augment ? (
                        <>
                            <img src={augment.icon} alt={augment.title} className="acb-slot-icon" />
                            <div className="acb-slot-name" title={augment.title}>{augment.title}</div>
                            <button
                                className="acb-slot-clear"
                                onClick={(e) => { e.stopPropagation(); handleClearSlot(type, index); }}
                                title="Xoá Augments"
                            >✕</button>
                        </>
                    ) : (
                        <div className="acb-empty-icon">+</div>
                    )}
                </div>

                {/* Pro Action Controls */}
                <div className="acb-slot-actions">
                    {augment && (
                        <>
                            {canBeRerolled && (
                                <button
                                    className={`acb-action-btn reroll ${isRerolled ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); toggleProReroll(type as 'initial' | 'reroll', index); }}
                                    title="Đánh dấu Pro đã Roll"
                                >
                                    R
                                    {isRerolled && <span className="acb-badge">{type === 'reroll' ? proRerollIndices.length + rerollOrder + 1 : rerollOrder + 1}</span>}
                                </button>
                            )}
                            <button
                                className={`acb-action-btn pick ${isProPicked ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setProPick(flatIndex); }}
                                title="Đánh dấu Pro đã chọn"
                            >
                                P
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="acb-container">
            <div className="acb-grid">
                {[0, 1, 2].map(index => (
                    <div key={index} className="acb-column">
                        <div className="acb-slot-group">
                            <div className="acb-slot-label">Lựa chọn ban đầu {index + 1}</div>
                            {renderSlot('initial', index)}
                        </div>

                        <div className="acb-arrow">↓</div>

                        <div className="acb-slot-group">
                            <div className="acb-slot-label">Roll lại {index + 4}</div>
                            {renderSlot('reroll', index)}
                        </div>

                        {hasExtraReroll && (
                            <>
                                <div className="acb-arrow">↓</div>
                                <div className="acb-slot-group">
                                    <div className="acb-slot-label">Teemo Roll lại {index + 7}</div>
                                    {renderSlot('secondReroll', index)}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="acb-controls">
                <label className="acb-toggle-label">
                    <input
                        type="checkbox"
                        className="acb-toggle-input"
                        checked={hasExtraReroll}
                        onChange={handleToggleExtraReroll}
                    />
                    <div className="acb-toggle-slider"></div>
                    <span>Nâng cao: Bật Roll lại thêm (Sự kiện Teemo)</span>
                </label>
            </div>

            {/* Reuse Modal Logic */}
            {editingSlot && (
                <div className="acb-modal-overlay" onClick={() => setEditingSlot(null)}>
                    <div className="acb-modal" onClick={e => e.stopPropagation()}>
                        <div className="acb-modal-header">
                            <input
                                type="text"
                                className="acb-search-input"
                                placeholder="Tìm Augments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button className="acb-modal-close" onClick={() => setEditingSlot(null)}>✕</button>
                        </div>
                        <div className="acb-modal-grid">
                            {filteredAugments.map((aug, idx) => (
                                <div key={idx} className="acb-modal-item" onClick={() => handleSelectAugment(aug)}>
                                    <img src={aug.icon} alt={aug.title} className="acb-modal-icon" />
                                    <span className="acb-modal-name">{aug.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AugmentChoiceBuilder;
