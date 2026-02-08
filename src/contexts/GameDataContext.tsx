import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { traitService, Trait } from '../services/traitService';
import { itemService, Item } from '../services/itemService';
import { championService, Champion } from '../services/championService';
import { augmentService, AugmentData } from '../services/augmentService';

interface GameDataContextType {
    traits: Trait[];
    items: Item[];
    champions: Champion[];
    augments: AugmentData[];
    isLoading: boolean;
    getTraitByName: (name: string) => Trait | undefined;
    getTraitByNameEn: (nameEn: string) => Trait | undefined;
    getItemByName: (name: string) => Item | undefined;
    getItemByNameEn: (nameEn: string) => Item | undefined;
    getChampionByName: (name: string) => Champion | undefined;
}

const GameDataContext = createContext<GameDataContextType | null>(null);

interface GameDataProviderProps {
    children: ReactNode;
}

export const GameDataProvider: React.FC<GameDataProviderProps> = ({ children }) => {
    const [traits, setTraits] = useState<Trait[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [champions, setChampions] = useState<Champion[]>([]);
    const [augments, setAugments] = useState<AugmentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [traitsData, itemsData, championsData, augmentsData] = await Promise.all([
                    traitService.getAll(),
                    itemService.getAll(),
                    championService.getAll(),
                    augmentService.getAll()
                ]);
                setTraits(traitsData);
                setItems(itemsData);
                setChampions(championsData);
                setAugments(augmentsData);
            } catch (error) {
                console.error('Error loading game data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Lookup by Vietnamese name (current display name)
    const getTraitByName = (name: string): Trait | undefined => {
        return traits.find(t => t.name === name || t.name_vi === name);
    };

    // Lookup by English name (from champion.traits array)
    // Handles various ID formats: TFT16_Void, Void, Set16_Void, etc.
    const getTraitByNameEn = (nameEn: string): Trait | undefined => {
        const normalized = nameEn.toLowerCase().replace(/tft\d+_|set\d+_/gi, '');
        return traits.find(t => {
            const tNameEn = (t.name_en || '').toLowerCase().replace(/tft\d+_|set\d+_/gi, '');
            const tId = (t.id || '').toLowerCase().replace(/tft\d+_|set\d+_/gi, '');
            return tNameEn === normalized || tId === normalized ||
                t.id === nameEn || t.name_en === nameEn;
        });
    };

    // Lookup by Vietnamese name
    const getItemByName = (name: string): Item | undefined => {
        return items.find(i => i.name === name || i.name_vi === name);
    };

    // Lookup by English name
    const getItemByNameEn = (nameEn: string): Item | undefined => {
        return items.find(i => i.name_en === nameEn || i.id === nameEn);
    };

    // Lookup champion by name (supports Vietnamese and English)
    const getChampionByName = (name: string): Champion | undefined => {
        return champions.find(c => c.name === name || c.id === name);
    };

    return (
        <GameDataContext.Provider value={{
            traits,
            items,
            champions,
            augments,
            isLoading,
            getTraitByName,
            getTraitByNameEn,
            getItemByName,
            getItemByNameEn,
            getChampionByName
        }}>
            {children}
        </GameDataContext.Provider>
    );
};

export const useGameData = (): GameDataContextType => {
    const context = useContext(GameDataContext);
    if (!context) {
        throw new Error('useGameData must be used within a GameDataProvider');
    }
    return context;
};

// Optional hook that doesn't throw if used outside provider
export const useGameDataOptional = (): GameDataContextType | null => {
    return useContext(GameDataContext);
};
