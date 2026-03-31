import { Champion, Synergy, Player, BoardUnit } from './types';

/**
 * TFT SET 17 "Monsters Attack!" - Sample Champions
 * All champions are from Set 17 only
 */
export const sampleChampions: Champion[] = [
    {
        id: 'aatrox',
        name: 'Aatrox',
        cost: 1,
        traits: ['N.O.V.A.', 'Bastion'],
        stars: 1,
        icon: '▲'
    },
    {
        id: 'briar',
        name: 'Briar',
        cost: 1,
        traits: ['Anima', 'Primordian', 'Rogue'],
        stars: 1,
        icon: '◈'
    },
    {
        id: 'caitlyn',
        name: 'Caitlyn',
        cost: 1,
        traits: ['Enforcer', 'Marksman'],
        stars: 1,
        icon: '◇'
    },
    {
        id: 'kogmaw',
        name: "Kog'Maw",
        cost: 2,
        traits: ['Anima', 'Marksman'],
        stars: 2,
        icon: '◆'
    },
    {
        id: 'ezreal',
        name: 'Ezreal',
        cost: 3,
        traits: ['N.O.V.A.', 'Marksman'],
        stars: 2,
        icon: '◆'
    }
];

/**
 * TFT SET 17 "Monsters Attack!" - Sample Synergies/Traits
 * Origin traits: N.O.V.A., Anima, Enforcer, Primordian, etc.
 * Class traits: Bastion, Marksman, Rogue, etc.
 */
export const sampleSynergies: Synergy[] = [
    {
        id: 'nova',
        name: 'N.O.V.A.',
        breakpoints: [2, 4, 6],
        activeCount: 2,
        icon: '🌟'
    },
    {
        id: 'anima',
        name: 'Anima',
        breakpoints: [2, 4, 6],
        activeCount: 2,
        icon: '🐾'
    },
    {
        id: 'bastion',
        name: 'Bastion',
        breakpoints: [2, 4, 6],
        activeCount: 2,
        icon: '🛡'
    },
    {
        id: 'marksman',
        name: 'Marksman',
        breakpoints: [2, 4],
        activeCount: 2,
        icon: '🎯'
    },
    {
        id: 'enforcer',
        name: 'Enforcer',
        breakpoints: [2, 4, 6],
        activeCount: 2,
        icon: '⚔'
    },
    {
        id: 'primordian',
        name: 'Primordian',
        breakpoints: [2, 4],
        activeCount: 2,
        icon: '◆'
    },
    {
        id: 'rogue',
        name: 'Rogue',
        breakpoints: [2, 4],
        activeCount: 2,
        icon: '🗡'
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
        champion: sampleChampions[0], // Aatrox
        position: { row: 2, col: 3 }
    },
    {
        champion: sampleChampions[2], // Caitlyn
        position: { row: 2, col: 4 }
    },
    {
        champion: sampleChampions[4], // Ezreal
        position: { row: 2, col: 5 }
    }
];