/**
 * TFT Asset URL Builder
 * Utility for building reliable asset URLs for TFT Set 16 from Community Dragon CDN.
 * Uses TFT-specific paths to avoid confusion with LoL assets.
 */

export type AssetType = 'champion' | 'item' | 'augment' | 'trait' | 'spatula';

interface AssetUrlOptions {
    type: AssetType;
    name?: string;
    id?: string | number;
    version?: string;
    fallbackIndex?: number;
}

// TFT Set 16 specific paths - Community Dragon primary
const COMMUNITY_DRAGON_BASE = 'https://raw.communitydragon.org/latest';
const COMMUNITY_DRAGON_PBE = 'https://raw.communitydragon.org/pbe';

// Asset path templates - TFT Set 16 specific paths ONLY
const ASSET_PATHS: Record<AssetType, string[]> = {
    champion: [
        // TFT Set 16 champion icons (with tft16_ prefix in directory and filename)
        `${COMMUNITY_DRAGON_BASE}/plugins/rcp-be-lol-game-data/global/default/assets/characters/tft16_{key}/hud/tft16_{key}_square.tft_set16.png`,
        // Fallback: PBE version
        `${COMMUNITY_DRAGON_PBE}/plugins/rcp-be-lol-game-data/global/default/assets/characters/tft16_{key}/hud/tft16_{key}_square.tft_set16.png`,
        // Fallback: JPG version
        `${COMMUNITY_DRAGON_BASE}/plugins/rcp-be-lol-game-data/global/default/assets/characters/tft16_{key}/hud/tft16_{key}_square.tft_set16.jpg`,
    ],
    item: [
        // TFT item icons (specific TFT path, not LoL items)
        `${COMMUNITY_DRAGON_BASE}/game/assets/maps/particles/tft/item_icons/standard/{key}.png`,
        // Fallback: Alternative TFT item path
        `${COMMUNITY_DRAGON_BASE}/game/assets/maps/particles/tft/item_icons/{key}.png`,
        // Fallback: PBE TFT items
        `${COMMUNITY_DRAGON_PBE}/game/assets/maps/particles/tft/item_icons/standard/{key}.png`,
    ],
    augment: [
        // TFT augments (hexcore path)
        `${COMMUNITY_DRAGON_BASE}/game/assets/maps/particles/tft/augments/hexcore/{key}.png`,
        // Fallback: Generic augments path
        `${COMMUNITY_DRAGON_BASE}/game/assets/maps/particles/tft/augments/{key}.png`,
        // Fallback: PBE augments
        `${COMMUNITY_DRAGON_PBE}/game/assets/maps/particles/tft/augments/{key}.png`,
    ],
    trait: [
        // TFT Set 16 trait icons (with trait_icon_16_ prefix and .tft_set16.png suffix)
        `${COMMUNITY_DRAGON_BASE}/game/assets/ux/traiticons/trait_icon_16_{key}.tft_set16.png`,
        // Fallback: PNG without set suffix
        `${COMMUNITY_DRAGON_BASE}/game/assets/ux/traiticons/trait_icon_16_{key}.png`,
        // Fallback: PBE version
        `${COMMUNITY_DRAGON_PBE}/game/assets/ux/traiticons/trait_icon_16_{key}.tft_set16.png`,
    ],
    spatula: [
        // TFT spatula item
        `${COMMUNITY_DRAGON_BASE}/game/assets/maps/particles/tft/item_icons/standard/spatula.png`,
        `${COMMUNITY_DRAGON_BASE}/game/assets/maps/particles/tft/item_icons/spatula.png`,
    ],
};

/**
 * Normalize asset name to key format (lowercase for TFT Set 16)
 */
function normalizeKey(name: string): string {
    // TFT Set 16 uses lowercase keys for all assets
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
        // TFT Set 16 uses lowercase champion keys
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
