import { Champion, Synergy, Player, BoardUnit } from './types';

/**
 * TFT SET 16 "Lore & Legends" - Sample Champions
 * All champions are from Set 16 only
 */
export const sampleChampions: Champion[] = [
    {
        id: 'ahri',
        name: 'Ahri',
        cost: 3,
        traits: ['Ionia', 'Arcanist'],
        stars: 2,
        icon: '◇'
    },
    {
        id: 'jhin',
        name: 'Jhin',
        cost: 4,
        traits: ['Ionia', 'Sniper'],
        stars: 2,
        icon: '◆'
    },
    {
        id: 'aatrox',
        name: 'Aatrox',
        cost: 5,
        traits: ['Darkin', 'Slayer'],
        stars: 1,
        icon: '▲'
    },
    {
        id: 'poppy',
        name: 'Poppy',
        cost: 1,
        traits: ['Demacia', 'Warden'],
        stars: 1,
        icon: '◈'
    },
    {
        id: 'nautilus',
        name: 'Nautilus',
        cost: 4,
        traits: ['Bilgewater', 'Warden'],
        stars: 1,
        icon: '◆'
    }
];

/**
 * TFT SET 16 "Lore & Legends" - Sample Synergies/Traits
 * Regional traits: Ionia, Demacia, Freljord, Bilgewater, etc.
 * Class traits: Arcanist, Warden, Slayer, Sniper, etc.
 */
export const sampleSynergies: Synergy[] = [
    {
        id: 'ionia',
        name: 'Ionia',
        breakpoints: [3, 5, 7, 10],
        activeCount: 3,
        icon: '◈'
    },
    {
        id: 'demacia',
        name: 'Demacia',
        breakpoints: [3, 5, 7, 11],
        activeCount: 3,
        icon: '◆'
    },
    {
        id: 'bilgewater',
        name: 'Bilgewater',
        breakpoints: [3, 5, 7, 10],
        activeCount: 3,
        icon: '⚓'
    },
    {
        id: 'freljord',
        name: 'Freljord',
        breakpoints: [3, 5, 7],
        activeCount: 3,
        icon: '❄'
    },
    {
        id: 'arcanist',
        name: 'Arcanist',
        breakpoints: [2, 4, 6],
        activeCount: 2,
        icon: '◇'
    },
    {
        id: 'warden',
        name: 'Warden',
        breakpoints: [2, 4, 6],
        activeCount: 2,
        icon: '🛡'
    },
    {
        id: 'slayer',
        name: 'Slayer',
        breakpoints: [2, 4, 6],
        activeCount: 2,
        icon: '⚔'
    }
];

// Sample players for scouting sidebar
export const samplePlayers: Player[] = [
    { id: 'p1', name: 'Pengu', health: 100, avatar: '🐧' },
    { id: 'p2', name: 'Umbra', health: 100, avatar: '🌙' },
    { id: 'p3', name: 'Fairy', health: 100, avatar: '🧚' },
    { id: 'p4', name: 'Sgcat', health: 100, avatar: '🐱' },
    { id: 'p5', name: 'Bunny', health: 100, avatar: '🐰' },
    { id: 'p6', name: 'Dowsie', health: 100, avatar: '🎀' },
    { id: 'p7', name: 'Hundun', health: 100, avatar: '🐉' },
    { id: 'p8', name: 'Shark', health: 100, avatar: '🦈', isCurrentPlayer: true }
];

// Sample board state - units positioned on hexes
export const sampleBoardUnits: BoardUnit[] = [
    {
        champion: sampleChampions[0], // Ahri
        position: { row: 2, col: 3 }
    },
    {
        champion: sampleChampions[1], // Jhin
        position: { row: 2, col: 4 }
    },
    {
        champion: sampleChampions[3], // Poppy
        position: { row: 2, col: 5 }
    }
];
