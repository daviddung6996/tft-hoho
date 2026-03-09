type FullscreenDocument = Document & {
    webkitExitFullscreen?: () => Promise<void> | void;
    webkitFullscreenElement?: Element | null;
};

type FullscreenElement = HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
};

export const canUseFullscreen = () => {
    if (typeof document === 'undefined') {
        return false;
    }

    const element = document.documentElement as FullscreenElement;
    return typeof element.requestFullscreen === 'function'
        || typeof element.webkitRequestFullscreen === 'function';
};

export const isFullscreenActive = () => {
    if (typeof document === 'undefined') {
        return false;
    }

    const fullscreenDocument = document as FullscreenDocument;
    return !!(fullscreenDocument.fullscreenElement || fullscreenDocument.webkitFullscreenElement);
};

export const requestDocumentFullscreenSafe = async () => {
    if (!canUseFullscreen() || isFullscreenActive()) {
        return false;
    }

    const element = document.documentElement as FullscreenElement;

    try {
        if (typeof element.requestFullscreen === 'function') {
            await element.requestFullscreen();
            return true;
        }

        if (typeof element.webkitRequestFullscreen === 'function') {
            await Promise.resolve(element.webkitRequestFullscreen());
            return true;
        }
    } catch {
        return false;
    }

    return false;
};

export const exitDocumentFullscreenSafe = async () => {
    if (typeof document === 'undefined' || !isFullscreenActive()) {
        return false;
    }

    const fullscreenDocument = document as FullscreenDocument;

    try {
        if (typeof document.exitFullscreen === 'function') {
            await document.exitFullscreen();
            return true;
        }

        if (typeof fullscreenDocument.webkitExitFullscreen === 'function') {
            await Promise.resolve(fullscreenDocument.webkitExitFullscreen());
            return true;
        }
    } catch {
        return false;
    }

    return false;
};
