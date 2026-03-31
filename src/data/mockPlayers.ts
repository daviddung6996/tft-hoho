import { UnitData } from './types';
import { AugmentData } from '../services/augmentService';
import { Item } from '../services/itemService';
import { getChampionIconUrl } from '../utils/assetUrlBuilder';

// Tactician Images
import penguImg from '../assets/tacticians/pengu.webp';
import chonccImg from '../assets/tacticians/choncc.webp';
import ahriImg from '../assets/tacticians/ahri.webp';
import norraImg from '../assets/tacticians/norra.webp';
import bunbunImg from '../assets/tacticians/bunbun.webp';
import fenroarImg from '../assets/tacticians/fenroar.webp';
import spriteImg from '../assets/tacticians/sprite.webp';
import molediverImg from '../assets/tacticians/molediver.webp';
import augmentTreeImg from '../assets/augment-tree/augment-tree.webp';

export interface PlayerData {
    id: string;
    name: string;
    avatar: string;
    hp: number;
    gold: number; // Gold amount for interest display (10 gold = 1 pillar coin)
    level: number;
    xp: number;
    status: 'active' | 'eliminated';
    isMe: boolean;
    inCombat?: boolean;
    isGhost?: boolean;
    units: UnitData[];
    bench: UnitData[];
    augments?: AugmentData[]; // [NEW] Active augments for this player
    items?: (Item | null)[]; // [NEW] Starting/Bench items for this player
    arenaId: string; // Per-player arena background
    augmentTreeUrl?: string; // [NEW] Dynamic Augment Tree Asset
}

/**
 * TFT SET 17 Champions Only
 * Updated to include only champions available in Set 17
 */
export const MOCK_PLAYERS: PlayerData[] = [
    {
        id: '1',
        name: 'Pengu',
        avatar: penguImg,
        hp: 100,
        gold: 50,
        level: 7,
        xp: 0,
        status: 'active',
        isMe: true,
        arenaId: 'summoners_rift',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 'p1', name: 'Aphelios', row: 3, col: 3, cost: 4, stars: 1, image: getChampionIconUrl('Aphelios'), items: ['InfinityEdge', 'GiantSlayer'] },
            { id: 'p2', name: 'Nami', row: 3, col: 1, cost: 3, stars: 2, image: getChampionIconUrl('Nami') },
        ],
        bench: [
            { id: 'pb1', name: 'Aphelios', row: -1, col: 0, cost: 4, stars: 1, image: getChampionIconUrl('Aphelios') },
        ],
        augments: [] // Augments should be loaded from DB
    },
    {
        id: '2',
        name: 'Choncc',
        avatar: chonccImg,
        hp: 100,
        gold: 30,
        level: 6,
        xp: 0,
        status: 'active',
        isMe: false,
        arenaId: 'deep_sea',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 'c1', name: 'Garen', row: 0, col: 3, cost: 4, stars: 1, image: getChampionIconUrl('Garen'), items: ['Redemption'] },
            { id: 'c2', name: 'Thresh', row: 1, col: 2, cost: 2, stars: 1, image: getChampionIconUrl('Thresh') },
            { id: 'c3', name: 'Gragas', row: 1, col: 4, cost: 3, stars: 1, image: getChampionIconUrl('Gragas') },
        ],
        bench: [
            { id: 'cb1', name: 'Illaoi', row: -1, col: 0, cost: 3, stars: 2, image: getChampionIconUrl('Illaoi') },
        ],
        augments: [] // Augments should be loaded from DB
    },
    {
        id: '3',
        name: 'Ahri',
        avatar: ahriImg,
        hp: 100,
        gold: 20,
        level: 5,
        xp: 0,
        status: 'active',
        isMe: false,
        arenaId: 'lotus_pond',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 'a1', name: 'Karma', row: 2, col: 0, cost: 4, stars: 2, image: getChampionIconUrl('Karma'), items: ['RabadonsDeathcap', 'Morellonomicon'] },
            { id: 'a2', name: 'Morgana', row: 2, col: 6, cost: 3, stars: 1, image: getChampionIconUrl('Morgana') },
        ],
        bench: [
            { id: 'ab1', name: 'Syndra', row: -1, col: 1, cost: 2, stars: 1, image: getChampionIconUrl('Syndra') },
        ],
        augments: [] // Augments should be loaded from DB
    },
    {
        id: '4',
        name: 'Norra',
        avatar: norraImg,
        hp: 100,
        gold: 40,
        level: 5,
        xp: 0,
        status: 'active',
        isMe: false,
        arenaId: 'yuumi_library',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 'n1', name: 'Senna', row: 3, col: 3, cost: 2, stars: 1, image: getChampionIconUrl('Senna'), items: ['Redemption'] },
            { id: 'n2', name: 'Seraphine', row: 2, col: 3, cost: 1, stars: 1, image: getChampionIconUrl('Seraphine') },
        ],
        bench: []
    },
    {
        id: '5',
        name: 'Bun Bun',
        avatar: bunbunImg,
        hp: 100,
        gold: 10,
        level: 7,
        xp: 0,
        status: 'active',
        isMe: false,
        arenaId: 'monsters_attack',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 'b1', name: 'Mordekaiser', row: 0, col: 3, cost: 5, stars: 1, image: getChampionIconUrl('Mordekaiser'), items: ['HandOfJustice', 'Bloodthirster', 'TitansResolve'] },
        ],
        bench: [
            { id: 'bb1', name: 'Neeko', row: -1, col: 0, cost: 3, stars: 1, image: getChampionIconUrl('Neeko') },
            { id: 'bb2', name: 'Sett', row: -1, col: 1, cost: 4, stars: 2, image: getChampionIconUrl('Sett') },
        ],
        augments: [] // Augments should be loaded from DB
    },
    {
        id: '6',
        name: 'Fenroar',
        avatar: fenroarImg,
        hp: 100,
        gold: 50,
        level: 6,
        xp: 0,
        status: 'active',
        isMe: false,
        arenaId: 'bilgewater_depths',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 'f1', name: 'Miss Fortune', row: 3, col: 2, cost: 5, stars: 1, image: getChampionIconUrl('Miss Fortune'), items: ['GuinsoosRageblade'] },
            { id: 'f2', name: 'Tahm Kench', row: 3, col: 4, cost: 2, stars: 1, image: getChampionIconUrl('Tahm Kench') },
            { id: 'f3', name: 'Skarner', row: 2, col: 3, cost: 1, stars: 1, image: getChampionIconUrl('Skarner') },
        ],
        bench: []
    },
    {
        id: '7',
        name: 'Sprite',
        avatar: spriteImg,
        hp: 100,
        gold: 25,
        level: 5,
        xp: 0,
        status: 'active',
        isMe: false,
        arenaId: 'cyber_city',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 's1', name: 'Twisted Fate', row: 0, col: 0, cost: 2, stars: 2, image: getChampionIconUrl('Twisted Fate'), items: ['StatikkShiv'] },
            { id: 's2', name: 'Varus', row: 0, col: 6, cost: 3, stars: 1, image: getChampionIconUrl('Varus') },
        ],
        bench: [
            { id: 'sb1', name: 'Lulu', row: -1, col: 4, cost: 2, stars: 1, image: getChampionIconUrl('Lulu') },
        ],
        augments: [] // Augments should be loaded from DB
    },
    {
        id: '8',
        name: 'Molediver',
        avatar: molediverImg,
        hp: 100,
        gold: 35,
        level: 6,
        xp: 0,
        status: 'active',
        isMe: false,
        arenaId: 'water_dragon_village',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 'm1', name: 'Xayah', row: 1, col: 3, cost: 4, stars: 1, image: getChampionIconUrl('Xayah'), items: ['SunfireCape', 'IonicSpark'] },
            { id: 'm2', name: 'Warwick', row: 2, col: 2, cost: 2, stars: 1, image: getChampionIconUrl('Warwick') },
        ],
        bench: [
            { id: 'mb1', name: 'Kindred', row: -1, col: 2, cost: 5, stars: 1, image: getChampionIconUrl('Kindred') },
        ],
        augments: [] // Augments should be loaded from DB
    },
];
