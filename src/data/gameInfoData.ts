/**
 * Set 17 match modifiers.
 *
 * Database compatibility:
 * - `featured_path_id` stores the Stargazer Constellation id
 * - `featured_mod_ids` stores the 2 Realm of the Gods ids
 */

const base = import.meta.env.BASE_URL || '/';
const cleanBase = base.endsWith('/') ? base : `${base}/`;

export const STARGAZER_CONSTELLATION_ICON_URL = `${cleanBase}tft-assets/featured-path.svg`;
export const REALM_OF_THE_GODS_ICON_URL = `${cleanBase}tft-assets/featured-modifier.svg`;

export const STARGAZER_CONSTELLATIONS_PER_GAME = 1;
export const REALM_GODS_PER_GAME = 2;

export interface StargazerConstellationBreakpoint {
    level: string;
    effect: string;
}

export interface StargazerConstellation {
    id: string;
    name: string;
    nameVi: string;
    summary: string;
    description: string;
    breakpoints: StargazerConstellationBreakpoint[];
}

export interface RealmGodOfferStage {
    stage: string;
    highlights: string[];
}

export interface RealmGod {
    id: string;
    name: string;
    nameVi: string;
    title: string;
    summary: string;
    boon: string;
    stageOffers: RealmGodOfferStage[];
    icon: string;
}

export const STARGAZER_CONSTELLATIONS: StargazerConstellation[] = [
    {
        id: 'the-serpent',
        name: 'The Serpent',
        nameVi: 'The Serpent',
        summary: 'Empowered hexes grant durability and Stargazers poison for repeat damage.',
        description: 'One constellation appears each game. Stargazer hexes and Lulu adapt to this roll.',
        breakpoints: [
            { level: '3', effect: '15% Durability and poison repeats 30% of damage as magic damage.' },
            { level: '5', effect: '20% Durability and poison repeats 45% of damage as magic damage.' },
            { level: '7', effect: '25% Durability and poison repeats 60% of damage as magic damage.' },
        ],
    },
    {
        id: 'the-huntress',
        name: 'The Huntress',
        nameVi: 'The Huntress',
        summary: 'Empowered hexes grant attack speed and marked kills heal your team.',
        description: 'Marks the highest-health enemies. Stargazers cash in when the marked target dies.',
        breakpoints: [
            { level: '3', effect: '30% Attack Speed and 3 marked enemies.' },
            { level: '5', effect: '45% Attack Speed and 5 marked enemies.' },
            { level: '7', effect: '60% Attack Speed and 7 marked enemies.' },
        ],
    },
    {
        id: 'the-mountain',
        name: 'The Mountain',
        nameVi: 'The Mountain',
        summary: 'Every 5 combats grants a Stargazer emblem and stacks more stats as you climb.',
        description: 'The Mountain snowballs over time and rewards long-horizon Stargazer boards.',
        breakpoints: [
            { level: '3', effect: '+15% Health in empowered hexes.' },
            { level: '4', effect: '+15% AD and AP in empowered hexes.' },
            { level: '5', effect: '+15 Armor and Magic Resist in empowered hexes.' },
            { level: '6', effect: '+15% Attack Speed in empowered hexes.' },
            { level: '7', effect: '+12% Durability in empowered hexes.' },
            { level: '8+', effect: 'All Mountain bonuses increase by 20%.' },
        ],
    },
    {
        id: 'the-altar',
        name: 'The Altar',
        nameVi: 'The Altar',
        summary: 'Deaths fuel an altar that buffs allies in empowered hexes.',
        description: 'Every unit death counts as a sacrifice. At high sacrifice counts, the board spikes hard.',
        breakpoints: [
            { level: '3', effect: 'Empowered hexes grant 10% Health and 15% Attack Speed. After 60 sacrifices, Stargazers gain +25% Health and +40% Attack Speed.' },
        ],
    },
    {
        id: 'the-medallion',
        name: 'The Medallion',
        nameVi: 'The Medallion',
        summary: 'Empowered hexes grant flat damage amp that scales with your 3-star count.',
        description: 'A simple but high-value constellation for capped boards and reroll spikes.',
        breakpoints: [
            { level: '3', effect: '15% Damage Amp, plus 3% more for each 3-star unit on your team.' },
        ],
    },
    {
        id: 'the-fountain',
        name: 'The Fountain',
        nameVi: 'The Fountain',
        summary: 'Empowered hexes grant mana regen and Stargazer casts heal the lowest-health ally.',
        description: 'The Fountain is the sustain/mana line and makes repeated spell casts much safer.',
        breakpoints: [
            { level: '3', effect: '3 mana regen and heal the lowest-health ally for 10% of ability damage dealt.' },
            { level: '5', effect: '5 mana regen and heal the lowest-health ally for 18% of ability damage dealt.' },
        ],
    },
    {
        id: 'the-boar',
        name: 'The Boar',
        nameVi: 'The Boar',
        summary: 'Wins generate gold while empowered hexes stack Health, AD, and AP.',
        description: 'The Boar blends econ and combat tempo, especially for boards that expect to keep winning.',
        breakpoints: [
            { level: '3', effect: '1 gold on win, 10% Health, and 18% AD/AP in empowered hexes.' },
            { level: '4', effect: '2 gold on win, 15% Health, and 25% AD/AP in empowered hexes.' },
            { level: '5', effect: '3 gold on win, 20% Health, and 33% AD/AP in empowered hexes.' },
            { level: '6', effect: '5 gold on win, 25% Health, and 40% AD/AP in empowered hexes.' },
        ],
    },
];

export const REALM_GODS: RealmGod[] = [
    {
        id: 'ahri',
        name: 'Ahri',
        nameVi: 'Ahri',
        title: 'God of Opulence',
        summary: 'Pure economy tempo with gold, XP, and reroll-heavy offerings.',
        boon: 'Gain 2 gold, 2 XP, and 2 rerolls each round after 4-7.',
        stageOffers: [
            { stage: 'Stage 2', highlights: ['Gold spikes', 'XP', 'Rerolls'] },
            { stage: 'Stage 3', highlights: ['More gold', 'More rerolls', 'More XP'] },
            { stage: 'Stage 4', highlights: ['12 gold', '8 rerolls', 'Big econ spike'] },
        ],
        icon: REALM_OF_THE_GODS_ICON_URL,
    },
    {
        id: 'aurelion-sol',
        name: 'Aurelion Sol',
        nameVi: 'Aurelion Sol',
        title: 'God of Wonders',
        summary: 'Condition-based rewards that convert board milestones into emblems and huge payouts.',
        boon: 'Choose 1 of 3 trials to prove yourself after 4-7.',
        stageOffers: [
            { stage: 'Stage 2', highlights: ['50 gold trial', '6 non-unique traits trial'] },
            { stage: 'Stage 3', highlights: ['Star-up trial', 'Trait-count trial'] },
            { stage: 'Stage 4', highlights: ['Level 9 trial for 20 gold'] },
        ],
        icon: REALM_OF_THE_GODS_ICON_URL,
    },
    {
        id: 'ekko',
        name: 'Ekko',
        nameVi: 'Ekko',
        title: 'God of Time',
        summary: 'Delayed loot, tempo tricks, and future-value payouts.',
        boon: 'Gain the Anomaly item after 4-7.',
        stageOffers: [
            { stage: 'Stage 2', highlights: ['Scuttle Puddle', 'Delayed spat/artifact/4-cost rewards'] },
            { stage: 'Stage 3', highlights: ['Scuttle Puddle', 'AS implant', 'Delayed 5-costs/anvil'] },
            { stage: 'Stage 4', highlights: ['Artifact', 'Completed anvil', 'Full 5-cost shop'] },
        ],
        icon: REALM_OF_THE_GODS_ICON_URL,
    },
    {
        id: 'evelynn',
        name: 'Evelynn',
        nameVi: 'Evelynn',
        title: 'God of Temptation',
        summary: 'High-risk bargains that trade Tactician health for premium board power.',
        boon: 'Your team gains 10% Durability, but you lose 1 extra health whenever you lose combat.',
        stageOffers: [
            { stage: 'Stage 2', highlights: ['Gold for HP', '2-star 2-cost', 'Lesser dupes'] },
            { stage: 'Stage 3', highlights: ['More gold for HP', 'Random emblem', '2-star 3-cost'] },
            { stage: 'Stage 4', highlights: ['2-star 4-cost', 'Completed item', '18 gold no-shop line'] },
        ],
        icon: REALM_OF_THE_GODS_ICON_URL,
    },
    {
        id: 'kayle',
        name: 'Kayle',
        nameVi: 'Kayle',
        title: 'God of Order',
        summary: 'Consistent item control through component choice and a clean 4-7 Radiant spike.',
        boon: 'Upgrade a random completed item into a Radiant item after 4-7.',
        stageOffers: [
            { stage: 'Stage 2', highlights: ['Random component', 'Glove', 'Bow', 'Tear'] },
            { stage: 'Stage 3', highlights: ['Random component', 'Sword', 'Vest', 'Rod', 'Cloak'] },
            { stage: 'Stage 4', highlights: ['Full basic component menu'] },
        ],
        icon: REALM_OF_THE_GODS_ICON_URL,
    },
    {
        id: 'soraka',
        name: 'Soraka',
        nameVi: 'Soraka',
        title: 'God of Stars',
        summary: 'Health and sustain offerings that stabilize low-HP games.',
        boon: 'Your team gains 2 HP per missing Tactician health, plus +1 current and max health each round after 4-7.',
        stageOffers: [
            { stage: 'Stage 2', highlights: ['8 HP', '12 HP', 'Giant Belt'] },
            { stage: 'Stage 3', highlights: ['HP choices', 'Giant Belt', '350 HP implant'] },
            { stage: 'Stage 4', highlights: ['More HP choices', 'Giant Belt', '350 HP implant'] },
        ],
        icon: REALM_OF_THE_GODS_ICON_URL,
    },
    {
        id: 'thresh',
        name: 'Thresh',
        nameVi: 'Thresh',
        title: 'God of Pacts',
        summary: 'Randomized loot lines that scale upward each stage.',
        boon: 'After each player combat, roll a die and gain rewards based on the result.',
        stageOffers: [
            { stage: 'Stage 2', highlights: ['Random + 2g', 'Random loot EV 7'] },
            { stage: 'Stage 3', highlights: ['Random + 3g', 'Random loot EV 9'] },
            { stage: 'Stage 4', highlights: ['Random + 5g', 'Random loot EV 10'] },
        ],
        icon: REALM_OF_THE_GODS_ICON_URL,
    },
    {
        id: 'varus',
        name: 'Varus',
        nameVi: 'Varus',
        title: 'God of Love',
        summary: 'Copies, shop odds, and star-level scaling for unit-focused lines.',
        boon: 'Your team gains 10 health per total star level in your army and +4% 5-cost odds after 4-7.',
        stageOffers: [
            { stage: 'Stage 2', highlights: ['2/3-cost menu', 'Owned 3-cost', 'Tiny dupes', '3-cost shop'] },
            { stage: 'Stage 3', highlights: ['3/4-cost menu', 'Lesser dupe', '4-cost shop'] },
            { stage: 'Stage 4', highlights: ['4/5-cost menu', 'More dupes', '5-cost odds'] },
        ],
        icon: REALM_OF_THE_GODS_ICON_URL,
    },
    {
        id: 'yasuo',
        name: 'Yasuo',
        nameVi: 'Yasuo',
        title: 'God of the Abyss',
        summary: 'Hex-selection gameplay with elemental combat zones and a stronger 4-7 payoff.',
        boon: 'Yasuo hexes become 50% stronger. If you only have 2 hexes, gain 12 gold after 4-7.',
        stageOffers: [
            { stage: 'Stage 2', highlights: ['Fire', 'Wood', 'Wind', 'Ice', 'Electric', 'Socialite hexes'] },
            { stage: 'Stage 3', highlights: ['Fire', 'Wind', 'Ice', 'Electric', 'Socialite hexes'] },
            { stage: 'Stage 4', highlights: ['Fire', 'Wind', 'Ice', 'Electric', 'Socialite hexes'] },
        ],
        icon: REALM_OF_THE_GODS_ICON_URL,
    },
];

const pickRandomDistinct = <T extends { id: string }>(
    pool: T[],
    count: number,
    excludeIds: string[] = [],
): T[] => {
    const available = pool.filter(item => !excludeIds.includes(item.id));
    const shuffled = [...available];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        const current = shuffled[index];
        shuffled[index] = shuffled[swapIndex];
        shuffled[swapIndex] = current;
    }

    return shuffled.slice(0, Math.max(0, Math.min(count, shuffled.length)));
};

export const getRandomConstellation = (): StargazerConstellation =>
    STARGAZER_CONSTELLATIONS[Math.floor(Math.random() * STARGAZER_CONSTELLATIONS.length)];

export const getRandomGods = (
    count: number = REALM_GODS_PER_GAME,
    excludeIds: string[] = [],
): RealmGod[] => pickRandomDistinct(REALM_GODS, count, excludeIds);

export const getConstellationById = (id: string): StargazerConstellation | undefined =>
    STARGAZER_CONSTELLATIONS.find(constellation => constellation.id === id);

export const getGodById = (id: string): RealmGod | undefined =>
    REALM_GODS.find(god => god.id === id);

// Backward-compatible aliases used by the current puzzle/runtime contract.
export type FeaturedPath = StargazerConstellation;
export type FeaturedModifier = RealmGod;
export const FEATURED_PATHS = STARGAZER_CONSTELLATIONS;
export const FEATURED_MODIFIERS = REALM_GODS;
export const FEATURED_PATH_ICON_URL = STARGAZER_CONSTELLATION_ICON_URL;
export const FEATURED_MODIFIER_ICON_URL = REALM_OF_THE_GODS_ICON_URL;
export const getRandomFeaturedPath = getRandomConstellation;
export const getRandomFeaturedModifiers = getRandomGods;
export const getFeaturedPathById = getConstellationById;
export const getFeaturedModifierById = getGodById;
