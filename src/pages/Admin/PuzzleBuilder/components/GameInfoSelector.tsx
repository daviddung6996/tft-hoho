import React, { useState } from 'react';
import {
    REALM_GODS,
    REALM_GODS_PER_GAME,
    REALM_OF_THE_GODS_ICON_URL,
    RealmGod,
    STARGAZER_CONSTELLATIONS,
    STARGAZER_CONSTELLATION_ICON_URL,
    StargazerConstellation,
} from '../../../../data/gameInfoData';
import './GameInfoSelector.css';

interface GameInfoSelectorProps {
    selectedFeaturedPathId?: string;
    selectedFeaturedModifierIds?: string[];
    onFeaturedPathChange: (pathId: string) => void;
    onFeaturedModifiersChange: (modifierIds: string[]) => void;
}

type ModalType = 'constellation' | 'gods' | null;

const buildRealmGodLabel = (selectedGods: RealmGod[]): string => {
    if (selectedGods.length === 0) {
        return '2 Gods';
    }

    if (selectedGods.length === 1) {
        return selectedGods[0].name;
    }

    return selectedGods.map(god => god.name).join(' + ');
};

const buildConstellationDescription = (constellation: StargazerConstellation): string =>
    `${constellation.summary} Breakpoints: ${constellation.breakpoints.map(point => point.level).join(' / ')}.`;

const buildRealmGodDescription = (god: RealmGod): string =>
    `${god.title}. ${god.summary} 4-7 boon: ${god.boon}`;

const GameInfoSelector: React.FC<GameInfoSelectorProps> = ({
    selectedFeaturedPathId,
    selectedFeaturedModifierIds = [],
    onFeaturedPathChange,
    onFeaturedModifiersChange,
}) => {
    const [modalType, setModalType] = useState<ModalType>(null);

    const selectedRealmGodIds = selectedFeaturedModifierIds
        .filter(id => REALM_GODS.some(god => god.id === id))
        .slice(0, REALM_GODS_PER_GAME);
    const selectedConstellation = STARGAZER_CONSTELLATIONS.find(
        constellation => constellation.id === selectedFeaturedPathId,
    );
    const selectedGods = selectedRealmGodIds
        .map(id => REALM_GODS.find(god => god.id === id))
        .filter((god): god is RealmGod => Boolean(god));

    const handleConstellationSelect = (constellation: StargazerConstellation) => {
        onFeaturedPathChange(constellation.id);
        setModalType(null);
    };

    const handleRealmGodToggle = (god: RealmGod) => {
        const isSelected = selectedRealmGodIds.includes(god.id);
        let nextGodIds: string[];

        if (isSelected) {
            nextGodIds = selectedRealmGodIds.filter(id => id !== god.id);
        } else if (selectedRealmGodIds.length >= REALM_GODS_PER_GAME) {
            nextGodIds = [...selectedRealmGodIds.slice(1), god.id];
        } else {
            nextGodIds = [...selectedRealmGodIds, god.id];
        }

        onFeaturedModifiersChange(nextGodIds);
    };

    return (
        <div className="gis-container">
            <div className="gis-buttons-row">
                <div className="gis-slot" onClick={() => setModalType('constellation')}>
                    {selectedConstellation ? (
                        <>
                            <img
                                src={STARGAZER_CONSTELLATION_ICON_URL}
                                alt="Stargazer constellation"
                                className="gis-slot-icon"
                            />
                            <span className="gis-slot-label">{selectedConstellation.name}</span>
                            <button
                                type="button"
                                className="gis-slot-clear"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onFeaturedPathChange('');
                                }}
                            >
                                x
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="gis-slot-plus">+</span>
                            <span className="gis-slot-hint">Constellation</span>
                        </>
                    )}
                </div>

                <div className="gis-slot" onClick={() => setModalType('gods')}>
                    {selectedGods.length > 0 ? (
                        <>
                            <img
                                src={REALM_OF_THE_GODS_ICON_URL}
                                alt="Realm of the Gods"
                                className="gis-slot-icon"
                            />
                            <span className="gis-slot-label">{buildRealmGodLabel(selectedGods)}</span>
                            <button
                                type="button"
                                className="gis-slot-clear"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onFeaturedModifiersChange([]);
                                }}
                            >
                                x
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="gis-slot-plus">+</span>
                            <span className="gis-slot-hint">2 Gods</span>
                        </>
                    )}
                </div>
            </div>

            {modalType === 'constellation' && (
                <div className="gis-modal-overlay" onClick={() => setModalType(null)}>
                    <div className="gis-modal" onClick={event => event.stopPropagation()}>
                        <div className="gis-modal-header">
                            <img
                                src={STARGAZER_CONSTELLATION_ICON_URL}
                                alt="Stargazer constellation"
                                className="gis-modal-icon"
                            />
                            <span className="gis-modal-title">Choose the Stargazer Constellation</span>
                            <button type="button" className="gis-modal-close" onClick={() => setModalType(null)}>
                                x
                            </button>
                        </div>
                        <div className="gis-modal-content">
                            {STARGAZER_CONSTELLATIONS.map(constellation => (
                                <div
                                    key={constellation.id}
                                    className={`gis-option ${selectedFeaturedPathId === constellation.id ? 'selected' : ''}`}
                                    onClick={() => handleConstellationSelect(constellation)}
                                >
                                    <div className="gis-option-name">{constellation.name}</div>
                                    <div className="gis-option-desc">{buildConstellationDescription(constellation)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {modalType === 'gods' && (
                <div className="gis-modal-overlay" onClick={() => setModalType(null)}>
                    <div className="gis-modal" onClick={event => event.stopPropagation()}>
                        <div className="gis-modal-header">
                            <img
                                src={REALM_OF_THE_GODS_ICON_URL}
                                alt="Realm of the Gods"
                                className="gis-modal-icon"
                            />
                            <span className="gis-modal-title">
                                Choose Realm Gods ({selectedRealmGodIds.length}/{REALM_GODS_PER_GAME})
                            </span>
                            <button type="button" className="gis-modal-close" onClick={() => setModalType(null)}>
                                x
                            </button>
                        </div>
                        <div className="gis-modal-content">
                            {REALM_GODS.map(god => {
                                const isSelected = selectedRealmGodIds.includes(god.id);
                                const index = selectedRealmGodIds.indexOf(god.id);

                                return (
                                    <div
                                        key={god.id}
                                        className={`gis-option gis-mod-option ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleRealmGodToggle(god)}
                                    >
                                        {isSelected && <div className="gis-mod-badge">{index + 1}</div>}
                                        <img src={god.icon} alt={god.name} className="gis-mod-icon" />
                                        <div className="gis-option-info">
                                            <div className="gis-option-name">{god.name}</div>
                                            <div className="gis-option-desc">{buildRealmGodDescription(god)}</div>
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
