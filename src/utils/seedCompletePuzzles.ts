import { puzzleService } from '../services/puzzleService';
import { PuzzleScenario, OpponentData } from '../data/puzzleScenarios';
import { Item } from '../services/itemService';
import { UnitData } from '../data/types';
import { championService, Champion } from '../services/championService';

// Sample items
const ITEMS: Item[] = [
    { id: 'item-1', name: 'BloodThirster', description: 'Lifesteal', stats: { ad: 20 } },
    { id: 'item-2', name: 'InfinityEdge', description: 'Crit', stats: { ad: 35, crit: 35 } },
    { id: 'item-3', name: 'HandOfJustice', description: 'Random', stats: { ad: 15, ap: 15 } },
    { id: 'item-4', name: 'GuinsoosRageblade', description: 'AS stacking', stats: { as: 10, ap: 10 } },
    { id: 'item-5', name: 'GiantSlayer', description: '%HP dmg', stats: { ad: 25, as: 10 } },
    { id: 'item-6', name: 'Deathcap', description: 'AP boost', stats: { ap: 50 } },
    { id: 'item-7', name: 'JeweledGauntlet', description: 'Spell Crit', stats: { ap: 35, crit: 35 } },
    { id: 'item-8', name: 'ArchangelsStaff', description: 'Mana regen', stats: { ap: 20, mana: 15 } },
];

// Augment icon helper  
const augIcon = (name: string) =>
    `https://raw.communitydragon.org/pbe/game/assets/maps/tft/icons/augments/hexcore/${name}.tft_set16.png`;

// Create unit at position (using actual champion data from database)
const unit = (champ: Champion, row: number, col: number, stars = 1, items: string[] = []): UnitData => ({
    id: `${champ.name}-${row}-${col}`,
    name: champ.name,
    cost: champ.cost,
    stars,
    row,
    col,
    items,
    image: champ.avatar || champ.icon || ''
});

// Create random board with N units from champion pool
const randBoard = (champions: Champion[], count: number): UnitData[] => {
    const units: UnitData[] = [];
    const positions: [number, number][] = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) positions.push([r, c]);
    for (let i = 0; i < count && positions.length > 0; i++) {
        const idx = Math.floor(Math.random() * positions.length);
        const [row, col] = positions.splice(idx, 1)[0];
        const champ = champions[i % champions.length];
        units.push(unit(champ, row, col, Math.ceil(Math.random() * 2)));
    }
    return units;
};

// Create opponent
const createOpp = (champions: Champion[], id: number, hp: number): OpponentData => ({
    id: `opp-${id}`,
    name: ['Opp Alpha', 'Opp Beta', 'Opp Gamma', 'Opp Delta', 'Opp Epsilon', 'Opp Zeta', 'Opp Eta'][id - 1] || `Opp ${id}`,
    state: { hp, gold: 30 + id * 5, level: 6 + Math.floor(id / 3), xp: 0 },
    board: randBoard(champions, 4 + id),
    bench: []
});

// Augment templates
const AUG = {
    air: { id: 'air', title: 'Air Axiom', description: 'AS buff', icon: augIcon('airaxiom_i'), rarity: 'silver' as const, tier: 1 as const },
    fire: { id: 'fire', title: 'Fire Axiom', description: 'Burn', icon: augIcon('fireaxiom_i'), rarity: 'silver' as const, tier: 1 as const },
    earth: { id: 'earth', title: 'Earth Axiom', description: 'Tank', icon: augIcon('earthaxiom_i'), rarity: 'gold' as const, tier: 2 as const },
    gold1: { id: 'g1', title: 'Gold Rush', description: '+10g', icon: augIcon('artillerybarrage_i'), rarity: 'gold' as const, tier: 2 as const },
    prism1: { id: 'p1', title: 'Prismatic Power', description: 'OP', icon: augIcon('leapoffaith_i'), rarity: 'prismatic' as const, tier: 3 as const },
};

// Generate 10 complete puzzles using champions from database
const generatePuzzles = async (): Promise<PuzzleScenario[]> => {
    // Fetch all champions from database
    const allChampions = await championService.getAll();

    // Filter out cost 0 champions (Anvil, etc.)
    const validChampions = allChampions.filter(c => c.cost > 0);

    if (validChampions.length === 0) {
        throw new Error('No valid champions found in database! Please seed champions first.');
    }

    const puzzles: PuzzleScenario[] = [];
    const pros = ['Dishsoap', 'Soju', 'Ramblinnn', 'KC Double', 'Milk', 'Frodan', 'Kiyoon', 'BoxBox', 'Bebe', 'Keane'];
    const stages = ['2-1', '2-5', '3-2', '3-5', '4-2', '4-5', '5-1', '5-3', '6-1', '6-3'];

    for (let i = 0; i < 10; i++) {
        const opponents: OpponentData[] = [];
        for (let o = 1; o <= 7; o++) {
            opponents.push(createOpp(validChampions, o, 100 - o * 8));
        }

        // Get 2 random champions for bench
        const benchChamps = [
            validChampions[Math.floor(Math.random() * validChampions.length)],
            validChampions[Math.floor(Math.random() * validChampions.length)]
        ];

        puzzles.push({
            id: crypto.randomUUID(), // Generate valid UUID for database
            title: `Puzzle ${i + 1}: ${pros[i]} Special`,
            proPlayer: pros[i],
            rank: i < 3 ? 'Challenger T1' : i < 6 ? 'Grandmaster' : 'Master',
            stage: stages[i],
            streamUrl: `https://twitch.tv/videos/${1000000 + i}`,
            date: `2026-02-0${(i % 9) + 1}`,
            server: ['NA', 'EUW', 'KR'][i % 3],
            encounter: ['Krugs', 'Wolves', 'Raptors', 'Herald', 'Dragon'][i % 5],
            patch: '16.3b',

            augments: [AUG.air, AUG.fire, AUG.earth],
            rerollAugments: [AUG.gold1, AUG.prism1, AUG.air],
            secondRerollAugments: [],
            hasExtraReroll: false,
            proRerollIndices: [],
            proSecondRerollIndices: [],
            proPickIndex: i % 3,
            proFirstRoll: [AUG.air, AUG.fire, AUG.earth],
            proSecondRoll: [AUG.gold1, AUG.prism1, AUG.air],
            proFinalPick: [AUG.air, AUG.fire, AUG.earth][i % 3],
            proPickRound: 0,
            explanation: `Pro chose ${[AUG.air, AUG.fire, AUG.earth][i % 3].title} for optimal synergy.`,

            playerBoard: randBoard(validChampions, 5 + (i % 4)),
            playerBench: [
                { ...unit(benchChamps[0], -1, 0), benchIndex: 0 },
                { ...unit(benchChamps[1], -1, 1), benchIndex: 1 }
            ],
            playerState: { hp: 100, gold: 30 + i * 5, level: 6 + Math.floor(i / 3), xp: 0 },

            opponents,
            startingItems: ITEMS.slice(0, 3 + (i % 5)),
        });
    }
    return puzzles;
};


export const seedCompletePuzzles = async () => {
    console.log('Seeding 10 complete puzzles...');
    const puzzles = await generatePuzzles();

    for (const puzzle of puzzles) {
        try {
            await puzzleService.save(puzzle);
            console.log(`✓ Seeded: ${puzzle.id}`);
        } catch (e) {
            console.error(`✗ Failed: ${puzzle.id}`, e);
        }
    }

    console.log('Seeding complete!');
};

