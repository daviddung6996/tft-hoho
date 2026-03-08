import React from 'react';
import PuzzleToolbar from '../components/PuzzleToolbar';
import PlayerTeamBuilder from '../components/PlayerTeamBuilder';
import { Champion, UnitData } from '../../../../data/types';
import { AugmentData } from '../../../../services/augmentService';
import { Item } from '../../../../services/itemService';
import { traitService, Trait } from '../../../../services/traitService'; // Import traitService
import { calculateSynergies } from '../../../../utils/synergyUtils'; // Import utility



interface BoardTabProps {
    mode: 'player' | 'opponent';
    level: number;
    gold: number;
    hp: number;
    xp: number;
    champions: Champion[];
    units: UnitData[];
    onUnitsChange: (units: UnitData[]) => void;
    onStateChange: (key: 'level' | 'gold' | 'hp' | 'xp', value: number) => void;
    onClearBoard: () => void;
    augments: AugmentData[];
    onAugmentsChange: (augments: AugmentData[]) => void;
    items: (Item | null)[];
    onItemsChange: (items: (Item | null)[]) => void;

    // Opponent specific
    selectedOpponentIndex?: number;
    onOpponentSelect?: (index: number) => void;

    // Game Info (player only)
    ioniaPathId?: string;
    voidModIds?: string[];
    onIoniaPathChange?: (pathId: string) => void;
    onVoidModsChange?: (modIds: string[]) => void;
    onLevelCapHit?: () => void;
}

const BoardTab: React.FC<BoardTabProps> = ({
    mode,
    level,
    gold,
    hp,
    xp,
    champions,
    units,
    onUnitsChange,
    onStateChange,
    onClearBoard,
    augments,
    onAugmentsChange,
    selectedOpponentIndex,
    onOpponentSelect,
    items,
    onItemsChange,
    ioniaPathId,
    voidModIds,
    onIoniaPathChange,
    onVoidModsChange,
    onLevelCapHit
}) => {
    // State for all traits (fetched from DB)
    const [allTraits, setAllTraits] = React.useState<Trait[]>([]);

    // Fetch traits on mount
    React.useEffect(() => {
        const fetchTraits = async () => {
            try {
                const traits = await traitService.getAll();
                setAllTraits(traits);
            } catch (error) {
                console.error('Failed to fetch traits:', error);
            }
        };
        fetchTraits();
    }, []);

    // Calculate active synergies
    const activeSynergies = React.useMemo(() => {
        return calculateSynergies(units, champions, allTraits);
    }, [units, champions, allTraits]);

    return (
        <div className="pb-builder-view admin-content-transition" key={mode}>
            <PuzzleToolbar
                level={level}
                gold={gold}
                hp={hp}
                xp={xp}
                onChange={onStateChange}
                onClearBoard={onClearBoard}
            />

            {/* Opponent Selector */}
            {mode === 'opponent' && onOpponentSelect && (
                <div className="pb-opp-selector" style={{ display: 'flex', gap: '8px', padding: '10px', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    {Array.from({ length: 7 }).map((_, idx) => (
                        <button
                            key={idx}
                            className={`pb-opp-btn ${selectedOpponentIndex === idx ? 'active' : ''}`}
                            onClick={() => onOpponentSelect(idx)}
                            style={{
                                padding: '8px 16px',
                                background: selectedOpponentIndex === idx ? 'linear-gradient(180deg, #1A4F55 0%, #0C2B2E 100%)' : 'rgba(0,0,0,0.5)',
                                border: selectedOpponentIndex === idx ? '1px solid #00A3FF' : '1px solid #c8aa6e',
                                color: selectedOpponentIndex === idx ? '#fff' : '#c8aa6e',
                                cursor: 'pointer',
                                fontFamily: 'Spectral'
                            }}
                        >
                            ĐT {idx + 1}
                        </button>
                    ))}
                </div>
            )}



            <PlayerTeamBuilder
                champions={champions}
                units={units}
                level={level}
                onUnitsChange={onUnitsChange}
                augments={augments}
                onAugmentsChange={onAugmentsChange}
                items={items}
                onItemsChange={onItemsChange}
                synergies={activeSynergies}
                onLevelCapHit={onLevelCapHit}
                ioniaPathId={ioniaPathId}
                voidModIds={voidModIds}
                onIoniaPathChange={onIoniaPathChange}
                onVoidModsChange={onVoidModsChange}
            />


        </div>
    );
};

export default BoardTab;
