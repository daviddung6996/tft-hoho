import React from 'react';
import { Champion } from '../../../../data/types';
import { AssetImage } from '../../../../hooks/useAssetUrl';

interface ChampionPoolProps {
    champions: Champion[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    costFilter: number | null;
    onCostFilterChange: (cost: number | null) => void;
    onDragStart: (champion: Champion) => void;
    onDragEnd: () => void;
    onSelect?: (champion: Champion) => void;
}

const ChampionPool: React.FC<ChampionPoolProps> = ({
    champions,
    searchQuery,
    onSearchChange,
    costFilter,
    onCostFilterChange,
    onDragStart,
    onDragEnd,
    onSelect
}) => {
    // Filter champions
    const filteredChampions = champions.filter(champ => {
        const matchesSearch = champ.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCost = costFilter === null || champ.cost === costFilter;
        return matchesSearch && matchesCost;
    });

    // Group by cost
    const groupedByCost: Record<number, Champion[]> = {};
    filteredChampions.forEach(champ => {
        const cost = champ.cost || 1;
        if (!groupedByCost[cost]) groupedByCost[cost] = [];
        groupedByCost[cost].push(champ);
    });

    // Sort groups and champions within
    const sortedCosts = Object.keys(groupedByCost).map(Number).sort((a, b) => a - b);

    return (
        <div className="ptb-left-panel">
            {/* Search */}
            <div className="cp-search-header">
                <input
                    type="text"
                    className="cp-search-input"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Cost Filters */}
            <div className="cp-cost-filters">
                {sortedCosts.map(cost => (
                    <button
                        key={cost}
                        className={`cp-cost-btn cost-${cost} ${costFilter === cost ? 'active' : ''}`}
                        onClick={() => onCostFilterChange(cost === costFilter ? null : cost)}
                    >
                        ${cost}
                    </button>
                ))}
            </div>

            {/* Champion Grid - Grouped by Cost */}
            <div className="cp-grid-scroll">
                {sortedCosts.map(cost => (
                    <div key={cost} className={`cp-cost-group cost-${cost}`}>
                        <div className="cp-cost-group-grid">
                            {groupedByCost[cost].sort((a, b) => a.name.localeCompare(b.name)).map(champ => (
                                <div
                                    key={champ.id}
                                    className={`cp-champ-tile cost-${champ.cost || 1}`}
                                    draggable
                                    onDragStart={() => onDragStart(champ)}
                                    onDragEnd={onDragEnd}
                                    onClick={() => onSelect && onSelect(champ)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <AssetImage
                                        type="champion"
                                        name={champ.name}
                                        alt={champ.name}
                                        className="cp-champ-img"
                                    />
                                    <span className="cp-champ-name">{champ.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChampionPool;
