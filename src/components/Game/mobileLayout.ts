export type LayoutMode = 'default' | 'phone-landscape';
export type MobileOverlayMode = 'none' | 'selector' | 'modal';

type MobileOverlayPhase =
    | 'declaring_intent'
    | 'declaring_plan'
    | 'selecting'
    | 'reviewing'
    | string;

export function getLayoutMode(): LayoutMode {
    if (typeof window === 'undefined') {
        return 'default';
    }

    const isLandscape = window.innerWidth > window.innerHeight;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    const isPhoneHeight = window.innerHeight <= 500;

    return isLandscape && isTouchDevice && isPhoneHeight ? 'phone-landscape' : 'default';
}

export function getMobileOverlayMode(params: {
    isMirrored: boolean;
    isAugmentOpen: boolean;
    puzzlePhase: MobileOverlayPhase;
}): MobileOverlayMode {
    const { isMirrored, isAugmentOpen, puzzlePhase } = params;

    if (isMirrored || !isAugmentOpen) {
        return 'none';
    }

    if (puzzlePhase === 'declaring_intent' || puzzlePhase === 'declaring_plan') {
        return 'selector';
    }

    if (puzzlePhase === 'selecting' || puzzlePhase === 'reviewing') {
        return 'modal';
    }

    return 'none';
}
