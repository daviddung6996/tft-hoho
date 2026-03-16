import type { AugmentData } from '../../services/augmentService';

export type CoachId = 'visian' | 'dit_sap' | 'one_by_one' | 'buffalow' | 'tftiseasy';
export type CoachRole = 'FLEX LORD' | 'WORLDS DIFF' | 'CON-TROLL' | 'LOSE STREAK' | 'PATCH DIFF';
export type CoachRegion = 'NA' | 'VN';
export type CoachUiState = 'closed' | 'select' | 'loading' | 'response';
export type CoachHeroMode = 'art' | 'pose';

export interface CoachStat {
    label: string;
    value: number;
}

export interface CoachAbility {
    key: string;
    name: string;
    description: string;
}

export interface CoachContextAugmentOption {
    id: string;
    title: string;
    icon: string;
    tier: 1 | 2 | 3;
    subtitle?: string;
}

export type CoachDecisionType = 'augment' | 'path' | 'plan';

export interface CoachContextDecisionOption {
    id: string;
    title: string;
    subtitle?: string;
    icon?: string;
    tier?: 1 | 2 | 3;
}

export interface CoachHeroPresentation {
    mode: CoachHeroMode;
    scale?: number;
    xOffsetPx?: number;
    yOffsetPx?: number;
    bottomOverlapPx?: number;
    maxWidthPx?: number;
}

export interface CoachProfile {
    id: CoachId;
    displayName: string;
    accentColor: string;
    role: CoachRole;
    region: CoachRegion;
    avatarText: string;
    imageSrc: string;
    fallbackImageSrc?: string;
    heroImageSrc?: string;
    heroFallbackImageSrc?: string;
    heroPresentation?: CoachHeroPresentation;
    tagline: string;
    description: string;
    stats: CoachStat[];
    ability: CoachAbility;
}

export interface CoachGameContext {
    stage: string;
    comp: string;
    gold: number;
    level: number;
    hp: number;
    decisionType?: CoachDecisionType;
    decisionLabel?: string;
    proChoiceId?: string;
    proChoiceLabel?: string;
    currentDecisionOptions?: CoachContextDecisionOption[];
    currentAugments: string[];
    currentAugmentOptions?: CoachContextAugmentOption[];
    chosenAugments: string[];
    synergies: string[];
    boardChampions: string[];
    items: string[];
}

export interface CoachAskResponse {
    answer: string;
}

export type CoachStreamEvent =
    | { type: 'pick'; pick: string; pickId?: string }
    | { type: 'status'; phase: 'thinking' | 'explaining' }
    | { type: 'upstream_chunk'; text: string }
    | { type: 'reasoning_chunk'; text: string }
    | { type: 'complete'; reasoning: string }
    | { type: 'error'; message: string };

export interface CoachAnswerState {
    answer: string;
    isLoading: boolean;
    isComplete: boolean;
}

export interface CoachSelectViewModel {
    coach: CoachProfile;
    currentAugments: AugmentData[];
    gameContext: CoachGameContext | null;
    uiState: Exclude<CoachUiState, 'closed'>;
    answer: CoachAnswerState;
    error: string | null;
}
