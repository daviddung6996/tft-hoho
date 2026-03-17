export interface ArenaSkin {
    id: string;
    name: string;
    thumbnailUrl: string;
    iconUrl: string;
    backgroundUrl: string;
    rarity: string;
}

// Import all arena images from the arenas folder
import summonersRift from '../assets/arenas/summoners_rift.webp';
import summonersRiftThumb from '../assets/arenas/thumbs/summoners_rift.webp';
import deepSea from '../assets/arenas/deep_sea.webp';
import deepSeaThumb from '../assets/arenas/thumbs/deep_sea.webp';
import lotusPond from '../assets/arenas/lotus_pond.webp';
import lotusPondThumb from '../assets/arenas/thumbs/lotus_pond.webp';
import yuumiLibrary from '../assets/arenas/yuumi_library.webp';
import yuumiLibraryThumb from '../assets/arenas/thumbs/yuumi_library.webp';
import monstersAttack from '../assets/arenas/monsters_attack.webp';
import monstersAttackThumb from '../assets/arenas/thumbs/monsters_attack.webp';
import bilgewaterDepths from '../assets/arenas/bilgewater_depths.webp';
import bilgewaterDepthsThumb from '../assets/arenas/thumbs/bilgewater_depths.webp';
import cyberCity from '../assets/arenas/cyber_city.webp';
import cyberCityThumb from '../assets/arenas/thumbs/cyber_city.webp';
import waterDragonVillage from '../assets/arenas/water_dragon_village.webp';
import waterDragonVillageThumb from '../assets/arenas/thumbs/water_dragon_village.webp';
import infernalTavern from '../assets/arenas/infernal_tavern.webp';
import infernalTavernThumb from '../assets/arenas/thumbs/infernal_tavern.webp';
import zaunLaboratory from '../assets/arenas/zaun_laboratory.webp';
import zaunLaboratoryThumb from '../assets/arenas/thumbs/zaun_laboratory.webp';
import ancientPortal from '../assets/arenas/ancient_portal.webp';
import ancientPortalThumb from '../assets/arenas/thumbs/ancient_portal.webp';
import frozenOnsen from '../assets/arenas/frozen_onsen.webp';
import frozenOnsenThumb from '../assets/arenas/thumbs/frozen_onsen.webp';

// All available arenas - 12 local webp images
export const ARENA_SKINS: ArenaSkin[] = [
    {
        id: "summoners_rift",
        name: "Summoner's Rift",
        thumbnailUrl: summonersRiftThumb,
        iconUrl: summonersRiftThumb,
        backgroundUrl: summonersRift,
        rarity: "Default"
    },
    {
        id: "deep_sea",
        name: "Deep Sea",
        thumbnailUrl: deepSeaThumb,
        iconUrl: deepSeaThumb,
        backgroundUrl: deepSea,
        rarity: "Epic"
    },
    {
        id: "lotus_pond",
        name: "Lotus Pond",
        thumbnailUrl: lotusPondThumb,
        iconUrl: lotusPondThumb,
        backgroundUrl: lotusPond,
        rarity: "Legendary"
    },
    {
        id: "yuumi_library",
        name: "Yuumi's Library",
        thumbnailUrl: yuumiLibraryThumb,
        iconUrl: yuumiLibraryThumb,
        backgroundUrl: yuumiLibrary,
        rarity: "Mythic"
    },
    {
        id: "monsters_attack",
        name: "Monsters Attack!",
        thumbnailUrl: monstersAttackThumb,
        iconUrl: monstersAttackThumb,
        backgroundUrl: monstersAttack,
        rarity: "Mythic"
    },
    {
        id: "bilgewater_depths",
        name: "Bilgewater Depths",
        thumbnailUrl: bilgewaterDepthsThumb,
        iconUrl: bilgewaterDepthsThumb,
        backgroundUrl: bilgewaterDepths,
        rarity: "Legendary"
    },
    {
        id: "cyber_city",
        name: "Cyber City",
        thumbnailUrl: cyberCityThumb,
        iconUrl: cyberCityThumb,
        backgroundUrl: cyberCity,
        rarity: "Legendary"
    },
    {
        id: "water_dragon_village",
        name: "Water Dragon Village",
        thumbnailUrl: waterDragonVillageThumb,
        iconUrl: waterDragonVillageThumb,
        backgroundUrl: waterDragonVillage,
        rarity: "Epic"
    },
    {
        id: "infernal_tavern",
        name: "Infernal Tavern",
        thumbnailUrl: infernalTavernThumb,
        iconUrl: infernalTavernThumb,
        backgroundUrl: infernalTavern,
        rarity: "Rare"
    },
    {
        id: "zaun_laboratory",
        name: "Zaun Laboratory",
        thumbnailUrl: zaunLaboratoryThumb,
        iconUrl: zaunLaboratoryThumb,
        backgroundUrl: zaunLaboratory,
        rarity: "Epic"
    },
    {
        id: "ancient_portal",
        name: "Ancient Portal",
        thumbnailUrl: ancientPortalThumb,
        iconUrl: ancientPortalThumb,
        backgroundUrl: ancientPortal,
        rarity: "Legendary"
    },
    {
        id: "frozen_onsen",
        name: "Frozen Onsen",
        thumbnailUrl: frozenOnsenThumb,
        iconUrl: frozenOnsenThumb,
        backgroundUrl: frozenOnsen,
        rarity: "Rare"
    },
];
