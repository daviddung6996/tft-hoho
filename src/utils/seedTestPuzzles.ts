import { puzzleService } from '../services/puzzleService';
import { PuzzleScenario } from '../data/puzzleScenarios';

export const seedTestPuzzles = async () => {
    console.log("Seeding test puzzles...");

    // Puzzle 1: Verification of A1 Mapping
    const puzzle1: PuzzleScenario = {
        id: 'test-puzzle-verify-001',
        proPlayer: 'DevTester',
        rank: 'Challenger',
        stage: '4-2',
        augments: [
            { id: 'test-1', title: "Test Augment 1", description: "Desc 1", icon: "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/augments/hexcore/tft13_augment_crownguarded_gold.tft_set13.png", tier: 2, rarity: 'gold' },
            { id: 'test-2', title: "Test Augment 2", description: "Desc 2", icon: "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/augments/hexcore/tft13_augment_sniper_focus_gold.tft_set13.png", tier: 2, rarity: 'gold' },
            { id: 'test-3', title: "Test Augment 3", description: "Desc 3", icon: "https://raw.communitydragon.org/latest/game/assets/maps/tft/icons/augments/hexcore/tft13_augment_shred_split.tft_set13.png", tier: 2, rarity: 'gold' }
        ],
        rerollAugments: [],
        secondRerollAugments: [],
        hasExtraReroll: false,
        proRerollIndices: [],
        proSecondRerollIndices: [],
        proPickIndex: -1,
        proFirstRoll: [],
        proSecondRoll: [],
        proFinalPick: { id: 'temp', title: 'TBD', description: '', icon: '', rarity: 'silver', tier: 1 } as any,
        proPickRound: 0,

        playerBoard: [],
        playerBench: [],
        opponentBoard: [], // Legacy field, kept empty
        opponentBench: [],

        playerState: { hp: 100, xp: 0, gold: 50, level: 8 },
        opponentState: { hp: 80, xp: 0, gold: 20, level: 8 },

        opponents: [
            {
                id: 'opp-1',
                name: 'HexMapper',
                state: { hp: 100, gold: 50, level: 8, xp: 0 },
                board: [
                    {
                        id: 'TFT13_Jinx',
                        name: 'Jinx',
                        cost: 4,
                        stars: 2,
                        items: [],
                        row: 0, // A1 (Top-Left in Builder) -> Should be Bottom-Right in Gameplay
                        col: 0,
                        image: 'https://raw.communitydragon.org/latest/game/assets/characters/tft13_jinx/hud/tft13_jinx_square.tft_set13.png'
                    },
                    {
                        id: 'TFT13_Vi',
                        name: 'Vi',
                        cost: 4,
                        stars: 2,
                        items: [],
                        row: 3, // D7 (Bottom-Right in Builder) -> Should be Top-Left in Gameplay
                        col: 6,
                        image: 'https://raw.communitydragon.org/latest/game/assets/characters/tft13_vi/hud/tft13_vi_square.tft_set13.png'
                    }
                ],
                bench: []
            }
        ],

        // Metadata
        streamUrl: '',
        date: '2024-05-20',
        server: 'NA',
        encounter: 'None',
        patch: '14.9',
        explanation: 'Test puzzle for A1 mapping verification. Jinx (A1) should be Bottom-Right. Vi (D7) should be Top-Left.'
    };

    try {
        await puzzleService.save(puzzle1);
        console.log("Successfully seeded puzzle: " + puzzle1.id);
        alert("Seeding Complete! Puzzle ID: " + puzzle1.id);
    } catch (e) {
        console.error("Seeding failed", e);
        alert("Seeding Failed: " + e);
    }
};
