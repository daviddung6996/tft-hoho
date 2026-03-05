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
import augmentTreeImg from '../assets/augment-tree/augment-tree.png';

export interface PlayerData {
    id: string;
    name: string;
    avatar: string;
    hp: number;
    gold: number; // Gold amount for interest display (10 gold = 1 pillar coin)
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
 * TFT SET 16 "Lore & Legends" Champions Only
 * Updated to include only champions available in Set 16
 */
export const MOCK_PLAYERS: PlayerData[] = [
    {
        id: '1',
        name: 'Pengu',
        avatar: penguImg,
        hp: 100,
        gold: 50,
        status: 'active',
        isMe: true,
        arenaId: 'summoners_rift',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 'p1', name: 'Jhin', row: 3, col: 3, cost: 4, stars: 1, image: getChampionIconUrl('Jhin'), items: ['InfinityEdge', 'GiantSlayer'] },
            { id: 'p2', name: 'Ahri', row: 3, col: 1, cost: 3, stars: 2, image: getChampionIconUrl('Ahri') },
        ],
        bench: [
            { id: 'pb1', name: 'Jhin', row: -1, col: 0, cost: 4, stars: 1, image: getChampionIconUrl('Jhin') },
        ],
        augments: [] // Augments should be loaded from DB
    },
    {
        id: '2',
        name: 'Choncc',
        avatar: chonccImg,
        hp: 100,
        gold: 30,
        status: 'active',
        isMe: false,
        arenaId: 'deep_sea',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 'c1', name: 'Nautilus', row: 0, col: 3, cost: 4, stars: 1, image: getChampionIconUrl('Nautilus'), items: ['Redemption'] },
            { id: 'c2', name: 'Fizz', row: 1, col: 2, cost: 2, stars: 1, image: getChampionIconUrl('Fizz') },
            { id: 'c3', name: 'Graves', row: 1, col: 4, cost: 3, stars: 1, image: getChampionIconUrl('Graves') },
        ],
        bench: [
            { id: 'cb1', name: 'Illaoi', row: -1, col: 0, cost: 4, stars: 2, image: getChampionIconUrl('Illaoi') },
        ],
        augments: [] // Augments should be loaded from DB
    },
    {
        id: '3',
        name: 'Ahri',
        avatar: ahriImg,
        hp: 100,
        gold: 20,
        status: 'active',
        isMe: false,
        arenaId: 'lotus_pond',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 'a1', name: 'Lux', row: 2, col: 0, cost: 4, stars: 2, image: getChampionIconUrl('Lux'), items: ['RabadonsDeathcap', 'Morellonomicon'] },
            { id: 'a2', name: 'Diana', row: 2, col: 6, cost: 3, stars: 1, image: getChampionIconUrl('Diana') },
        ],
        bench: [
            { id: 'ab1', name: 'Ahri', row: -1, col: 1, cost: 3, stars: 1, image: getChampionIconUrl('Ahri') },
        ],
        augments: [] // Augments should be loaded from DB
    },
    {
        id: '4',
        name: 'Norra',
        avatar: norraImg,
        hp: 100,
        gold: 40,
        status: 'active',
        isMe: false,
        arenaId: 'yuumi_library',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 'n1', name: 'Sona', row: 3, col: 3, cost: 2, stars: 1, image: getChampionIconUrl('Sona'), items: ['Redemption'] },
            { id: 'n2', name: 'Poppy', row: 2, col: 3, cost: 1, stars: 1, image: getChampionIconUrl('Poppy') },
        ],
        bench: []
    },
    {
        id: '5',
        name: 'Bun Bun',
        avatar: bunbunImg,
        hp: 100,
        gold: 10,
        status: 'active',
        isMe: false,
        arenaId: 'monsters_attack',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 'b1', name: 'Aatrox', row: 0, col: 3, cost: 5, stars: 1, image: getChampionIconUrl('Aatrox'), items: ['HandOfJustice', 'Bloodthirster', 'TitansResolve'] },
        ],
        bench: [
            { id: 'bb1', name: 'Renekton', row: -1, col: 0, cost: 3, stars: 1, image: getChampionIconUrl('Renekton') },
            { id: 'bb2', name: 'Nasus', row: -1, col: 1, cost: 4, stars: 2, image: getChampionIconUrl('Nasus') },
        ],
        augments: [] // Augments should be loaded from DB
    },
    {
        id: '6',
        name: 'Fenroar',
        avatar: fenroarImg,
        hp: 100,
        gold: 50,
        status: 'active',
        isMe: false,
        arenaId: 'bilgewater_depths',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 'f1', name: 'Miss Fortune', row: 3, col: 2, cost: 4, stars: 1, image: getChampionIconUrl('Miss Fortune'), items: ['GuinsoosRageblade'] },
            { id: 'f2', name: 'Tahm Kench', row: 3, col: 4, cost: 3, stars: 1, image: getChampionIconUrl('Tahm Kench') },
            { id: 'f3', name: 'Nautilus', row: 2, col: 3, cost: 4, stars: 1, image: getChampionIconUrl('Nautilus') },
        ],
        bench: []
    },
    {
        id: '7',
        name: 'Sprite',
        avatar: spriteImg,
        hp: 100,
        gold: 25,
        status: 'active',
        isMe: false,
        arenaId: 'cyber_city',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 's1', name: 'Ziggs', row: 0, col: 0, cost: 2, stars: 2, image: getChampionIconUrl('Ziggs'), items: ['StatikkShiv'] },
            { id: 's2', name: 'Orianna', row: 0, col: 6, cost: 3, stars: 1, image: getChampionIconUrl('Orianna') },
        ],
        bench: [
            { id: 'sb1', name: 'Loris', row: -1, col: 4, cost: 2, stars: 1, image: getChampionIconUrl('Loris') },
        ],
        augments: [] // Augments should be loaded from DB
    },
    {
        id: '8',
        name: 'Molediver',
        avatar: molediverImg,
        hp: 100,
        gold: 35,
        status: 'active',
        isMe: false,
        arenaId: 'water_dragon_village',
        augmentTreeUrl: augmentTreeImg,
        units: [
            { id: 'm1', name: 'Yone', row: 1, col: 3, cost: 4, stars: 1, image: getChampionIconUrl('Yone'), items: ['SunfireCape', 'IonicSpark'] },
            { id: 'm2', name: 'Xin Zhao', row: 2, col: 2, cost: 2, stars: 1, image: getChampionIconUrl('Xin Zhao') },
        ],
        bench: [
            { id: 'mb1', name: 'Anivia', row: -1, col: 2, cost: 5, stars: 1, image: getChampionIconUrl('Anivia') },
        ],
        augments: [] // Augments should be loaded from DB
    },
];
