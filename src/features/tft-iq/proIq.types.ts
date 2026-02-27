export interface ProPlayer {
    id: string;
    name: string;
    region: ProRegion;
    avatar_url?: string;
    liquipedia_url?: string;
    datatft_url?: string;
    current_iq: number;
    iq_tier: ProIqTier;
    current_rank?: string;
    current_lp?: number;
    tournament_titles?: number;
    notes?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProIqHistoryEntry {
    id: string;
    pro_player_id: string;
    iq_score: number;
    iq_tier: ProIqTier;
    change_amount: number;
    change_reason: string;
    source: IqSource;
    recorded_at: string;
}

export interface ProIqUpdatePayload {
    new_iq: number;
    reason: string;
    source: IqSource;
}

export interface CreateProPlayerPayload {
    name: string;
    region: ProRegion;
    avatar_url?: string;
    liquipedia_url?: string;
    datatft_url?: string;
    current_iq?: number;
    current_rank?: string;
    current_lp?: number;
    tournament_titles?: number;
    notes?: string;
}

export type ProRegion = 'AMER' | 'EMEA' | 'APAC' | 'CN' | 'VN' | 'OTHER';
export type ProIqTier = 'GOAT' | 'Elite' | 'Top Pro' | 'Pro' | 'Rising';
export type IqSource = 'manual' | 'tournament' | 'ladder';

export const PRO_REGIONS: { value: ProRegion; label: string }[] = [
    { value: 'AMER', label: '🌎 AMER' },
    { value: 'EMEA', label: '🌍 EMEA' },
    { value: 'APAC', label: '🌏 APAC' },
    { value: 'CN', label: '🇨🇳 CN' },
    { value: 'VN', label: '🇻🇳 VN' },
    { value: 'OTHER', label: '🌐 Other' },
];

export const IQ_TIERS: { min: number; tier: ProIqTier; icon: string }[] = [
    { min: 2500, tier: 'GOAT', icon: '🏆' },
    { min: 2200, tier: 'Elite', icon: '👑' },
    { min: 2000, tier: 'Top Pro', icon: '💎' },
    { min: 1800, tier: 'Pro', icon: '⚔️' },
    { min: 0, tier: 'Rising', icon: '🌟' },
];

export const IQ_SOURCES: { value: IqSource; label: string }[] = [
    { value: 'manual', label: '✏️ Thủ công' },
    { value: 'tournament', label: '🏆 Tournament' },
    { value: 'ladder', label: '📊 Ladder' },
];
