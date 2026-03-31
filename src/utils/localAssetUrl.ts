/**
 * Intercepts third-party TFT asset URLs and maps them to local assets in /tft-assets/.
 * Root-domain Pages deploys should resolve to /tft-assets/* via BASE_URL without
 * hardcoding a domain or reviving the old /training/ subpath pattern.
 */
export function getLocalUrl(originalUrl: string | undefined | null): string {
    if (!originalUrl) return '';

    if (originalUrl.includes('raw.communitydragon.org') || originalUrl.includes('ap.tft.tools')) {
        const parts = originalUrl.split('/');
        const filename = parts[parts.length - 1].split('?')[0];

        const base = import.meta.env.BASE_URL || '/';
        const cleanBase = base.endsWith('/') ? base : `${base}/`;

        return `${cleanBase}tft-assets/${filename}`;
    }

    return originalUrl;
}
