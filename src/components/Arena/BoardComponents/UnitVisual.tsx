import React from 'react';
import { UnitData, ChampionStats } from '../../../data/types';
import { AssetImage } from '../../../hooks/useAssetUrl';
import { ChampionTooltip } from '../../common/HextechTooltip';
import { useGameData } from '../../../contexts/GameDataContext';

export const UnitVisual: React.FC<{ unit: UnitData }> = ({ unit }) => {
    const { getTraitByNameEn, getItemByNameEn, getChampionByName } = useGameData();

    const championData = getChampionByName(unit.name);

    const getVietnameseTraits = (): string[] => {
        if (!unit.traits) return [];
        return unit.traits.map(traitId => {
            const dbTrait = getTraitByNameEn(traitId);
            return dbTrait?.name || traitId;
        });
    };

    const getVietnameseItems = (): string[] => {
        if (!unit.items) return [];
        return unit.items.map(itemId => {
            const dbItem = getItemByNameEn(itemId);
            return dbItem?.name || itemId;
        });
    };

    return (
        <ChampionTooltip
            name={unit.name}
            cost={unit.cost}
            traits={getVietnameseTraits()}
            items={getVietnameseItems()}
            abilityName={championData?.ability_name}
            abilityDescription={championData?.ability_description}
            abilityVariables={championData?.ability_variables}
            currentStars={unit.stars as 1 | 2 | 3}
            stats={championData?.stats as ChampionStats | undefined}
            position="top"
        >
            <div className="unit-visual-wrapper">
                {unit.stars > 1 && (
                    <div className={`unit-stars stars-${unit.stars}`}>
                        {Array.from({ length: unit.stars }).map((_, i) => (
                            <span key={i} className="star">★</span>
                        ))}
                    </div>
                )}

                <div className={`cost-border cost-${unit.cost}`} />

                <div className={`board-unit cost-${unit.cost}`}>
                    <img src={unit.image} alt={unit.name} className="unit-image" draggable={false} />
                </div>

                {unit.items && unit.items.length > 0 && (
                    <div className="unit-items">
                        {unit.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="unit-item">
                                <AssetImage
                                    type="item"
                                    name={item}
                                    alt={item}
                                    draggable={false}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        borderRadius: '2px'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ChampionTooltip>
    );
};

