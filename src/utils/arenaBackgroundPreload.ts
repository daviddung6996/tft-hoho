const loadedImageAssets = new Set<string>();
const imageAssetPreloads = new Map<string, Promise<void>>();

function markImageAssetReady(url: string) {
    loadedImageAssets.add(url);
    imageAssetPreloads.delete(url);
}

function clearImageAssetRequest(url: string) {
    imageAssetPreloads.delete(url);
}

function waitForDecodedImage(img: HTMLImageElement): Promise<void> {
    if (typeof img.decode === 'function') {
        return img.decode().catch(() => undefined);
    }

    return Promise.resolve();
}

export function isImageAssetReady(url?: string | null): boolean {
    return !!url && loadedImageAssets.has(url);
}

export function preloadImageAsset(url?: string | null): Promise<void> {
    if (!url) {
        return Promise.resolve();
    }

    if (loadedImageAssets.has(url)) {
        return Promise.resolve();
    }

    const existingRequest = imageAssetPreloads.get(url);
    if (existingRequest) {
        return existingRequest;
    }

    const request = new Promise<void>((resolve) => {
        const img = new Image();
        let settled = false;

        const finalize = () => {
            if (settled) {
                return;
            }

            settled = true;
            markImageAssetReady(url);
            resolve();
        };

        const finalizeAfterDecode = () => {
            void waitForDecodedImage(img).finally(finalize);
        };

        img.onload = finalizeAfterDecode;
        img.onerror = () => {
            if (settled) {
                return;
            }

            settled = true;
            clearImageAssetRequest(url);
            resolve();
        };
        img.decoding = 'async';
        img.src = url;

        // Cached images can report complete immediately, but CSS background swaps
        // still flicker if we commit before decode finishes.
        if (img.complete && img.naturalWidth > 0) {
            finalizeAfterDecode();
        }
    });

    imageAssetPreloads.set(url, request);
    return request;
}

export function isArenaBackgroundReady(url?: string | null): boolean {
    return isImageAssetReady(url);
}

export function preloadArenaBackground(url?: string | null): Promise<void> {
    return preloadImageAsset(url);
}

export function resetArenaBackgroundPreloadStateForTests() {
    loadedImageAssets.clear();
    imageAssetPreloads.clear();
}
