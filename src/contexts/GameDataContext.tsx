import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { traitService, Trait } from '../services/traitService';
import { itemService, Item } from '../services/itemService';
import { championService, Champion } from '../services/championService';
import { augmentService, AugmentData } from '../services/augmentService';
import { normalizeLookupValue } from '../utils/stringNormalization';
import { readCache, writeCache } from '../utils/gameDataCache';

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

interface GameDataSnapshot {
    traits: Trait[];
    items: Item[];
    champions: Champion[];
    augments: AugmentData[];
}

let sharedGameDataSnapshot: GameDataSnapshot | null = null;
let sharedGameDataPromise: Promise<GameDataSnapshot> | null = null;

async function loadSharedGameData(): Promise<GameDataSnapshot> {
    if (sharedGameDataSnapshot) {
        return sharedGameDataSnapshot;
    }

    if (!sharedGameDataPromise) {
        sharedGameDataPromise = Promise.all([
            traitService.getAll(),
            itemService.getAll(),
            championService.getAll(),
            augmentService.getAll()
        ])
            .then(([traits, items, champions, augments]) => {
                const snapshot = { traits, items, champions, augments };
                sharedGameDataSnapshot = snapshot;
                return snapshot;
            })
            .finally(() => {
                sharedGameDataPromise = null;
            });
    }

    return sharedGameDataPromise;
}

export const GameDataProvider: React.FC<GameDataProviderProps> = ({ children }) => {
    const cachedTraits = readCache<Trait>('traits');
    const cachedItems = readCache<Item>('items');
    const cachedChampions = readCache<Champion>('champions');
    const cachedAugments = readCache<AugmentData>('augments');
    const hasCachedData = !!(cachedTraits && cachedItems && cachedChampions && cachedAugments);

    const [traits, setTraits] = useState<Trait[]>(cachedTraits ?? []);
    const [items, setItems] = useState<Item[]>(cachedItems ?? []);
    const [champions, setChampions] = useState<Champion[]>(cachedChampions ?? []);
    const [augments, setAugments] = useState<AugmentData[]>(cachedAugments ?? []);
    const [isLoading, setIsLoading] = useState(!hasCachedData);

    useEffect(() => {
        let isActive = true;

        const loadData = async () => {
            try {
                const snapshot = await loadSharedGameData();
                if (!isActive) {
                    return;
                }

                setTraits(snapshot.traits);
                setItems(snapshot.items);
                setChampions(snapshot.champions);
                setAugments(snapshot.augments);

                // Update cache for next session
                writeCache('traits', snapshot.traits);
                writeCache('items', snapshot.items);
                writeCache('champions', snapshot.champions);
                writeCache('augments', snapshot.augments);
            } catch (error) {
                console.error('Error loading game data:', error);
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };
        loadData();

        return () => {
            isActive = false;
        };
    }, []);

    // Lookup by Vietnamese name (current display name)
    const getTraitByName = (name: string): Trait | undefined => {
        return traits.find(t => t.name === name || t.name_vi === name);
    };

    // Lookup by English name (from champion.traits array)
    // Handles various ID formats: TFT16_Void, Void, Set16_Void, etc.
    const getTraitByNameEn = (nameEn: string): Trait | undefined => {
        const normalized = normalizeLookupValue(nameEn).replace(/tft\d+_|set\d+_/gi, '');
        return traits.find(t => {
            const tNameEn = normalizeLookupValue(t.name_en).replace(/tft\d+_|set\d+_/gi, '');
            const tId = normalizeLookupValue(t.id).replace(/tft\d+_|set\d+_/gi, '');
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
