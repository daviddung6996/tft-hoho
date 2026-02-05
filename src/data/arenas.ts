export interface ArenaSkin {
    id: string;
    name: string;
    iconUrl: string;
    backgroundUrl: string;
    rarity: string;
}

// Import all arena images from the arenas folder
import summonersRift from '../assets/arenas/summoners_rift.webp';
import deepSea from '../assets/arenas/deep_sea.webp';
import lotusPond from '../assets/arenas/lotus_pond.webp';
import yuumiLibrary from '../assets/arenas/yuumi_library.webp';
import monstersAttack from '../assets/arenas/monsters_attack.webp';
import bilgewaterDepths from '../assets/arenas/bilgewater_depths.webp';
import cyberCity from '../assets/arenas/cyber_city.webp';
import waterDragonVillage from '../assets/arenas/water_dragon_village.webp';
import infernalTavern from '../assets/arenas/infernal_tavern.webp';
import zaunLaboratory from '../assets/arenas/zaun_laboratory.webp';
import ancientPortal from '../assets/arenas/ancient_portal.webp';
import frozenOnsen from '../assets/arenas/frozen_onsen.webp';

// All available arenas - 12 local webp images
export const ARENA_SKINS: ArenaSkin[] = [
    {
        id: "summoners_rift",
        name: "Summoner's Rift",
        iconUrl: summonersRift,
        backgroundUrl: summonersRift,
        rarity: "Default"
    },
    {
        id: "deep_sea",
        name: "Deep Sea",
        iconUrl: deepSea,
        backgroundUrl: deepSea,
        rarity: "Epic"
    },
    {
        id: "lotus_pond",
        name: "Lotus Pond",
        iconUrl: lotusPond,
        backgroundUrl: lotusPond,
        rarity: "Legendary"
    },
    {
        id: "yuumi_library",
        name: "Yuumi's Library",
        iconUrl: yuumiLibrary,
        backgroundUrl: yuumiLibrary,
        rarity: "Mythic"
    },
    {
        id: "monsters_attack",
        name: "Monsters Attack!",
        iconUrl: monstersAttack,
        backgroundUrl: monstersAttack,
        rarity: "Mythic"
    },
    {
        id: "bilgewater_depths",
        name: "Bilgewater Depths",
        iconUrl: bilgewaterDepths,
        backgroundUrl: bilgewaterDepths,
        rarity: "Legendary"
    },
    {
        id: "cyber_city",
        name: "Cyber City",
        iconUrl: cyberCity,
        backgroundUrl: cyberCity,
        rarity: "Legendary"
    },
    {
        id: "water_dragon_village",
        name: "Water Dragon Village",
        iconUrl: waterDragonVillage,
        backgroundUrl: waterDragonVillage,
        rarity: "Epic"
    },
    {
        id: "infernal_tavern",
        name: "Infernal Tavern",
        iconUrl: infernalTavern,
        backgroundUrl: infernalTavern,
        rarity: "Rare"
    },
    {
        id: "zaun_laboratory",
        name: "Zaun Laboratory",
        iconUrl: zaunLaboratory,
        backgroundUrl: zaunLaboratory,
        rarity: "Epic"
    },
    {
        id: "ancient_portal",
        name: "Ancient Portal",
        iconUrl: ancientPortal,
        backgroundUrl: ancientPortal,
        rarity: "Legendary"
    },
    {
        id: "frozen_onsen",
        name: "Frozen Onsen",
        iconUrl: frozenOnsen,
        backgroundUrl: frozenOnsen,
        rarity: "Rare"
    },
];
