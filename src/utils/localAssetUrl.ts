/**
 * Intercepts Community Dragon URLs and maps them to local assets in /tft-assets/.
 * Root-domain Pages deploys should resolve to /tft-assets/* via BASE_URL without
 * hardcoding a domain or reviving the old /training/ subpath pattern.
 */
export function getLocalUrl(originalUrl: string | undefined | null): string {
    if (!originalUrl) return '';

    // Only intercept Community Dragon URLs
    if (originalUrl.includes('raw.communitydragon.org')) {
        // Extract just the filename (e.g. "tft16_jinx_square.tft_set16.png")
        const parts = originalUrl.split('/');
        const filename = parts[parts.length - 1].split('?')[0];

        // Respect Vite BASE_URL so the same helper works for root deploys and previews.
        const base = import.meta.env.BASE_URL || '/';
        const cleanBase = base.endsWith('/') ? base : `${base}/`;

        // Keep the flat local asset folder convention used in public/tft-assets.
        return `${cleanBase}tft-assets/${filename}`;
    }

    // Return original url if it's already local or from another source
    return originalUrl;
}
