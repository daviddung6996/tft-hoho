import { Augment } from './types';

// Sample augments for stage 2-1
// User can customize this data to simulate Pro streams
export const sampleAugments: Augment[] = [
    // Silver tier
    {
        id: 'silver-destiny',
        name: 'Silver Destiny',
        description: 'Gain a random Silver Augment and 2 gold.',
        tier: 'silver',
        icon: '◆'
    },
    {
        id: 'tiny-titans',
        name: 'Tiny Titans',
        description: 'Your Tactician heals 2 after every player combat round.',
        tier: 'silver',
        icon: '♥'
    },
    {
        id: 'lategame-specialist',
        name: 'Lategame Specialist',
        description: 'Gain 3 gold now. Gain +1 gold each round starting at stage 4.',
        tier: 'silver',
        icon: '●'
    },

    // Gold tier
    {
        id: 'eye-for-an-eye',
        name: 'Eye For An Eye',
        description: 'For every 15 ally champions that die, gain a random component (max 3).',
        tier: 'gold',
        icon: '◇'
    },
    {
        id: 'iron-assets',
        name: 'Iron Assets',
        description: 'Gain a component anvil and 4 gold.',
        tier: 'gold',
        icon: '⚒'
    },
    {
        id: 'gold-reserves',
        name: 'Gold Reserves',
        description: 'Gain 15 gold.',
        tier: 'gold',
        icon: '●'
    },
    {
        id: 'combat-training',
        name: 'Combat Training',
        description: 'Your units permanently gain 1 Attack Damage and Ability Power each combat round.',
        tier: 'gold',
        icon: '◈'
    },
    {
        id: 'component-grab-bag',
        name: 'Component Grab Bag',
        description: 'Gain 2 random item components.',
        tier: 'gold',
        icon: '◇'
    },

    // Prismatic tier
    {
        id: 'prismatic-ticket',
        name: 'Prismatic Ticket',
        description: 'Gain a Prismatic item. Your next Shop has a 50% chance to have a champion that holds this item.',
        tier: 'prismatic',
        icon: '◆'
    },
    {
        id: 'living-forge',
        name: 'Living Forge',
        description: 'Gain a random Ornn Artifact after every 10 player combats.',
        tier: 'prismatic',
        icon: '▲'
    },
    {
        id: 'level-up',
        name: 'Level Up!',
        description: 'Gain 8 XP. Whenever you level up, gain 4 gold.',
        tier: 'prismatic',
        icon: '↑'
    }
];

// Function to get random augments for 2-1 selection
// Based on real TFT probabilities: Silver 28%, Gold 62%, Prismatic 10%
export function getRandomAugments(count: number = 3): Augment[] {
    const silverAugments = sampleAugments.filter(a => a.tier === 'silver');
    const goldAugments = sampleAugments.filter(a => a.tier === 'gold');
    const prismaticAugments = sampleAugments.filter(a => a.tier === 'prismatic');

    const result: Augment[] = [];
    const usedIds = new Set<string>();

    for (let i = 0; i < count; i++) {
        const roll = Math.random() * 100;
        let pool: Augment[];

        if (roll < 28) {
            pool = silverAugments;
        } else if (roll < 90) {
            pool = goldAugments;
        } else {
            pool = prismaticAugments;
        }

        // Filter out already selected augments
        const available = pool.filter(a => !usedIds.has(a.id));
        if (available.length > 0) {
            const selected = available[Math.floor(Math.random() * available.length)];
            result.push(selected);
            usedIds.add(selected.id);
        }
    }

    return result;
}
