/**
 * Intercepts Community Dragon URLs and maps them to local assets in /tft-assets/
 * This prevents the application from depending on an external CDN.
 */
export function getLocalUrl(originalUrl: string | undefined | null): string {
    if (!originalUrl) return '';

    // Only intercept Community Dragon URLs
    if (originalUrl.includes('raw.communitydragon.org')) {
        // Extract just the filename (e.g. "tft16_jinx_square.tft_set16.png")
        const parts = originalUrl.split('/');
        const filename = parts[parts.length - 1].split('?')[0];

        // Ensure we handle base URL correctly based on environment
        const base = import.meta.env.BASE_URL || '/';
        const cleanBase = base.endsWith('/') ? base : `${base}/`;

        // Map to local flat folder
        return `${cleanBase}tft-assets/${filename}`;
    }

    // Return original url if it's already local or from another source
    return originalUrl;
}
