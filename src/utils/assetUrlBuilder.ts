/**
 * TFT Asset URL Builder
 * Utility for building reliable asset URLs for TFT Set 17.
 * Uses TFT-specific paths and tactics.tools fallbacks for current Set 17 assets.
 */

export type AssetType = 'champion' | 'item' | 'augment' | 'trait' | 'spatula';

interface AssetUrlOptions {
    type: AssetType;
    name?: string;
    id?: string | number;
    version?: string;
    fallbackIndex?: number;
}

// TFT Set 17 specific paths
const COMMUNITY_DRAGON_BASE = 'https://raw.communitydragon.org/latest';
const COMMUNITY_DRAGON_PBE = 'https://raw.communitydragon.org/pbe';
const TACTICS_TOOLS_BASE = 'https://ap.tft.tools';

const ASSET_PATHS: Record<AssetType, string[]> = {
    champion: [
        `${TACTICS_TOOLS_BASE}/img/new17/face/tft17_{key}.jpg`,
        `${COMMUNITY_DRAGON_BASE}/plugins/rcp-be-lol-game-data/global/default/assets/characters/tft17_{key}/hud/tft17_{key}_square.tft_set17.png`,
        `${COMMUNITY_DRAGON_PBE}/plugins/rcp-be-lol-game-data/global/default/assets/characters/tft17_{key}/hud/tft17_{key}_square.tft_set17.png`,
    ],
    item: [
        `${COMMUNITY_DRAGON_BASE}/game/assets/maps/particles/tft/item_icons/standard/{key}.png`,
        `${COMMUNITY_DRAGON_BASE}/game/assets/maps/particles/tft/item_icons/{key}.png`,
        `${COMMUNITY_DRAGON_PBE}/game/assets/maps/particles/tft/item_icons/standard/{key}.png`,
    ],
    augment: [
        `${COMMUNITY_DRAGON_BASE}/game/assets/maps/particles/tft/augments/hexcore/{key}.png`,
        `${COMMUNITY_DRAGON_BASE}/game/assets/maps/particles/tft/augments/{key}.png`,
        `${COMMUNITY_DRAGON_PBE}/game/assets/maps/particles/tft/augments/{key}.png`,
    ],
    trait: [
        `${TACTICS_TOOLS_BASE}/static/trait-icons/new17_tft17_{key}_w.svg`,
        `${COMMUNITY_DRAGON_BASE}/game/assets/ux/traiticons/trait_icon_17_{key}.tft_set17.png`,
        `${COMMUNITY_DRAGON_PBE}/game/assets/ux/traiticons/trait_icon_17_{key}.tft_set17.png`,
    ],
    spatula: [
        `${COMMUNITY_DRAGON_BASE}/game/assets/maps/particles/tft/item_icons/standard/spatula.png`,
        `${COMMUNITY_DRAGON_BASE}/game/assets/maps/particles/tft/item_icons/spatula.png`,
    ],
};

/**
 * Normalize asset name to key format (lowercase for TFT Set 17)
 */
function normalizeKey(name: string): string {
    // TFT Set 17 uses lowercase keys for current URL templates
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Get item key from name (convert to underscore format for TFT items)
 * Handles both "Infinity Edge" and "InfinityEdge" -> "infinity_edge"
 */
function getItemKey(name: string): string {
    // First, convert PascalCase to spaces (InfinityEdge -> Infinity Edge)
    const withSpaces = name.replace(/([a-z])([A-Z])/g, '$1 $2');
    // Remove special characters and convert to lowercase
    const normalized = withSpaces.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    // Replace spaces with underscores
    return normalized.replace(/\s+/g, '_');
}

/**
 * Build asset URL
 */
export function buildAssetUrl(options: AssetUrlOptions): string {
    const { type, name, id, fallbackIndex = 0 } = options;

    const paths = ASSET_PATHS[type];
    if (!paths || fallbackIndex >= paths.length) {
        throw new Error(`Invalid asset type or fallback index: ${type}`);
    }

    let url = paths[fallbackIndex];

    if (type === 'champion') {
        // TFT Set 17 uses lowercase champion keys
        const key = normalizeKey(name || String(id));
        url = url.replace(/{key}/g, key);
    } else if (type === 'item' || type === 'spatula') {
        // Items use normalized lowercase keys (not numeric IDs for TFT)
        const key = name ? getItemKey(name) : String(id).toLowerCase();
        url = url.replace(/{key}/g, key);
    } else {
        const key = normalizeKey(name || String(id));
        url = url.replace(/{key}/g, key);
    }

    return url;
}

/**
 * Get all possible URLs for an asset (for fallback)
 */
export function getAllAssetUrls(options: Omit<AssetUrlOptions, 'fallbackIndex'>): string[] {
    const { type } = options;
    const paths = ASSET_PATHS[type];

    return paths.map((_, index) => buildAssetUrl({ ...options, fallbackIndex: index }));
}

// Convenience functions for each asset type

export function getChampionIconUrl(name: string): string {
    return buildAssetUrl({ type: 'champion', name });
}

export function getItemIconUrl(name: string): string {
    return buildAssetUrl({ type: 'item', name });
}

export function getAugmentIconUrl(name: string): string {
    return buildAssetUrl({ type: 'augment', name });
}

export function getTraitIconUrl(name: string): string {
    return buildAssetUrl({ type: 'trait', name });
}
