import React, { useState } from 'react';
import { IONIA_PATHS, VOID_MODS, IoniaPath, VoidMod } from '../../../../data/gameInfoData';
import { getTraitIconUrl } from '../../../../utils/assetUrlBuilder';
import './GameInfoSelector.css';

interface GameInfoSelectorProps {
    selectedIoniaPathId?: string;
    selectedVoidModIds?: string[];
    onIoniaPathChange: (pathId: string) => void;
    onVoidModsChange: (modIds: string[]) => void;
}

type ModalType = 'ionia' | 'void' | null;

const GameInfoSelector: React.FC<GameInfoSelectorProps> = ({
    selectedIoniaPathId,
    selectedVoidModIds = [],
    onIoniaPathChange,
    onVoidModsChange
}) => {
    const [modalType, setModalType] = useState<ModalType>(null);

    const selectedPath = IONIA_PATHS.find(p => p.id === selectedIoniaPathId);
    const selectedMods = VOID_MODS.filter(m => selectedVoidModIds.includes(m.id));

    const handlePathSelect = (path: IoniaPath) => {
        onIoniaPathChange(path.id);
        setModalType(null);
    };

    const handleModToggle = (mod: VoidMod) => {
        const isSelected = selectedVoidModIds.includes(mod.id);
        let newMods: string[];

        if (isSelected) {
            newMods = selectedVoidModIds.filter(id => id !== mod.id);
        } else {
            if (selectedVoidModIds.length >= 3) {
                newMods = [...selectedVoidModIds.slice(1), mod.id];
            } else {
                newMods = [...selectedVoidModIds, mod.id];
            }
        }

        onVoidModsChange(newMods);
    };

    const handleClearIonia = () => {
        onIoniaPathChange('');
    };

    return (
        <div className="gis-container">
            {/* Compact Row with 2 buttons */}
            <div className="gis-buttons-row">
                {/* Ionia Button */}
                <div className="gis-slot" onClick={() => setModalType('ionia')}>
                    {selectedPath ? (
                        <>
                            <img
                                src={getTraitIconUrl('Ionia')}
                                alt="Ionia"
                                className="gis-slot-icon"
                            />
                            <span className="gis-slot-label">{selectedPath.nameVi}</span>
                            <button
                                className="gis-slot-clear"
                                onClick={(e) => { e.stopPropagation(); handleClearIonia(); }}
                            >
                                ✕
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="gis-slot-plus">+</span>
                            <span className="gis-slot-hint">Ionia</span>
                        </>
                    )}
                </div>

                {/* Void Button */}
                <div className="gis-slot" onClick={() => setModalType('void')}>
                    {selectedMods.length > 0 ? (
                        <>
                            <img
                                src={getTraitIconUrl('Void')}
                                alt="Void"
                                className="gis-slot-icon"
                            />
                            <span className="gis-slot-label">{selectedMods.length} Mods</span>
                            <button
                                className="gis-slot-clear"
                                onClick={(e) => { e.stopPropagation(); onVoidModsChange([]); }}
                            >
                                ✕
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="gis-slot-plus">+</span>
                            <span className="gis-slot-hint">Void</span>
                        </>
                    )}
                </div>
            </div>

            {/* Ionia Modal */}
            {modalType === 'ionia' && (
                <div className="gis-modal-overlay" onClick={() => setModalType(null)}>
                    <div className="gis-modal" onClick={e => e.stopPropagation()}>
                        <div className="gis-modal-header">
                            <img src={getTraitIconUrl('Ionia')} alt="Ionia" className="gis-modal-icon" />
                            <span className="gis-modal-title">Chọn Đường Ionia</span>
                            <button className="gis-modal-close" onClick={() => setModalType(null)}>✕</button>
                        </div>
                        <div className="gis-modal-content">
                            {IONIA_PATHS.map(path => (
                                <div
                                    key={path.id}
                                    className={`gis-option ${selectedIoniaPathId === path.id ? 'selected' : ''}`}
                                    onClick={() => handlePathSelect(path)}
                                >
                                    <div className="gis-option-name">{path.nameVi}</div>
                                    <div className="gis-option-desc">{path.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Void Modal */}
            {modalType === 'void' && (
                <div className="gis-modal-overlay" onClick={() => setModalType(null)}>
                    <div className="gis-modal" onClick={e => e.stopPropagation()}>
                        <div className="gis-modal-header">
                            <img src={getTraitIconUrl('Void')} alt="Void" className="gis-modal-icon" />
                            <span className="gis-modal-title">Chọn Void Mods ({selectedVoidModIds.length}/3)</span>
                            <button className="gis-modal-close" onClick={() => setModalType(null)}>✕</button>
                        </div>
                        <div className="gis-modal-content">
                            {VOID_MODS.map(mod => {
                                const isSelected = selectedVoidModIds.includes(mod.id);
                                const idx = selectedVoidModIds.indexOf(mod.id);

                                return (
                                    <div
                                        key={mod.id}
                                        className={`gis-option gis-mod-option ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleModToggle(mod)}
                                    >
                                        {isSelected && <div className="gis-mod-badge">{idx + 1}</div>}
                                        <img src={mod.icon} alt={mod.nameVi} className="gis-mod-icon" />
                                        <div className="gis-option-info">
                                            <div className="gis-option-name">{mod.nameVi}</div>
                                            <div className="gis-option-desc">{mod.description}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameInfoSelector;
