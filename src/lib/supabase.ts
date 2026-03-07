import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing! Please check your .env file.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

// Auth helper types
export type AuthUser = {
    id: string;
    email: string;
    display_name: string | null;
    role: 'user' | 'mod' | 'admin';
};

export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    display_name: string | null;
                    role: 'user' | 'mod' | 'admin';
                    created_by: string | null;
                    created_at: string;
                    updated_at: string;
                    iq_score: number;
                    iq_rank: string;
                    season: number;
                    total_puzzles_solved: number;
                    accuracy_weight: number;
                    speed_weight: number;
                };
                Insert: {
                    id: string;
                    email: string;
                    display_name?: string | null;
                    role?: 'user' | 'mod' | 'admin';
                    created_by?: string | null;
                };
                Update: {
                    display_name?: string | null;
                    role?: 'user' | 'mod' | 'admin';
                    created_by?: string | null;
                };
            };
            champions: {
                Row: {
                    id: string;
                    name: string;
                    cost: number;
                    traits: string[];
                };
                Insert: {
                    id: string;
                    name: string;
                    cost: number;
                    traits?: string[];
                };
                Update: {
                    id?: string;
                    name?: string;
                    cost?: number;
                    traits?: string[];
                };
            };
            augments: {
                Row: {
                    id: string;
                    name: string;
                    tier: 1 | 2 | 3;
                    description: string;
                };
                Insert: {
                    id: string;
                    name: string;
                    tier: 1 | 2 | 3;
                    description: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    tier?: 1 | 2 | 3;
                    description?: string;
                };
            };
            traits: {
                Row: {
                    id: string;
                    name: string;
                    description: string;
                    effects: any;
                };
                Insert: {
                    id: string;
                    name: string;
                    description: string;
                    effects: any;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string;
                    effects?: any;
                };
            };
            items: {
                Row: {
                    id: string;
                    name: string;
                    description: string;
                    stats: any;
                };
                Insert: {
                    id: string;
                    name: string;
                    description: string;
                    stats: any;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string;
                    stats?: any;
                };
            };
            puzzles: {
                Row: {
                    id: string;
                    pro_player: string;
                    rank: string;
                    stage: string;
                    meta_data: any;
                    board_state: any;
                    augments: any;
                    pro_first_roll: any;
                    pro_second_roll: any;
                    pro_final_pick: any;
                    pro_pick_round: number;
                    created_at: string;
                    ionia_path_id: string | null;
                    void_mod_ids: any;
                    deleted_at: string | null;
                    tier: 'free' | 'advanced' | 'rare';
                    video_url: string | null;
                    video_title: string | null;
                    video_thumbnail_url: string | null;
                };
                Insert: {
                    id: string;
                    pro_player: string;
                    rank: string;
                    stage: string;
                    meta_data: any;
                    board_state?: any;
                    augments: any;
                    pro_first_roll: any;
                    pro_second_roll: any;
                    pro_final_pick: any;
                    pro_pick_round: number;
                    created_at?: string;
                    ionia_path_id?: string | null;
                    void_mod_ids?: any;
                    deleted_at?: string | null;
                    tier?: 'free' | 'advanced' | 'rare';
                    video_url?: string | null;
                    video_title?: string | null;
                    video_thumbnail_url?: string | null;
                };
                Update: {
                    id?: string;
                    pro_player?: string;
                    rank?: string;
                    stage?: string;
                    meta_data?: any;
                    board_state?: any;
                    augments?: any;
                    pro_first_roll?: any;
                    pro_second_roll?: any;
                    pro_final_pick?: any;
                    pro_pick_round?: number;
                    created_at?: string;
                    ionia_path_id?: string | null;
                    void_mod_ids?: any;
                    deleted_at?: string | null;
                    tier?: 'free' | 'advanced' | 'rare';
                    video_url?: string | null;
                    video_title?: string | null;
                    video_thumbnail_url?: string | null;
                };
            };
            user_puzzle_history: {
                Row: {
                    user_id: string;
                    puzzle_id: string;
                    completed_at: string;
                };
                Insert: {
                    user_id: string;
                    puzzle_id: string;
                    completed_at?: string;
                };
                Update: {
                    user_id?: string;
                    puzzle_id?: string;
                    completed_at?: string;
                };
            };
            user_puzzle_attempts: {
                Row: {
                    id: string;
                    user_id: string;
                    puzzle_id: string;
                    user_pick_id: string;
                    user_pick_name: string | null;
                    is_correct: boolean;
                    reroll_count: number;
                    reroll_indices: number[];
                    time_to_decide_ms: number | null;
                    puzzle_stage: string | null;
                    pro_pick_id: string | null;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    puzzle_id: string;
                    user_pick_id: string;
                    user_pick_name?: string;
                    is_correct: boolean;
                    reroll_count?: number;
                    reroll_indices?: number[];
                    time_to_decide_ms?: number;
                    puzzle_stage?: string;
                    pro_pick_id?: string;
                };
                Update: {
                    user_pick_id?: string;
                    user_pick_name?: string;
                    is_correct?: boolean;
                    reroll_count?: number;
                    reroll_indices?: number[];
                    time_to_decide_ms?: number;
                    puzzle_stage?: string;
                    pro_pick_id?: string;
                };
            };
            puzzle_votes: {
                Row: {
                    id: string;
                    puzzle_id: string;
                    augment_id: string;
                    augment_name: string;
                    session_id: string;
                    created_at: string;
                };
                Insert: {
                    puzzle_id: string;
                    augment_id: string;
                    augment_name: string;
                    session_id: string;
                };
                Update: {
                    augment_id?: string;
                    augment_name?: string;
                };
            };
            user_wallets: {
                Row: {
                    id: string;
                    user_id: string;
                    balance: number;
                    total_earned: number;
                    total_spent: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    balance?: number;
                    total_earned?: number;
                    total_spent?: number;
                };
                Update: {
                    balance?: number;
                    total_earned?: number;
                    total_spent?: number;
                    updated_at?: string;
                };
            };
            tcoin_transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    amount: number;
                    balance_after: number;
                    type: 'earn' | 'spend';
                    reason: string;
                    reference_id: string | null;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    amount: number;
                    balance_after: number;
                    type: 'earn' | 'spend';
                    reason: string;
                    reference_id?: string | null;
                };
                Update: {};
            };
            user_unlocked_puzzles: {
                Row: {
                    id: string;
                    user_id: string;
                    puzzle_id: string;
                    tier: string;
                    unlocked_at: string;
                };
                Insert: {
                    user_id: string;
                    puzzle_id: string;
                    tier: string;
                };
                Update: {};
            };
            pro_supporters: {
                Row: {
                    id: string;
                    user_id: string;
                    plan: 'monthly' | 'lifetime';
                    status: 'active' | 'expired' | 'cancelled';
                    started_at: string;
                    expires_at: string | null;
                    payment_ref: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    plan: 'monthly' | 'lifetime';
                    status?: string;
                    expires_at?: string | null;
                    payment_ref?: string | null;
                    updated_at?: string;
                };
                Update: {
                    status?: string;
                    expires_at?: string | null;
                    updated_at?: string;
                };
            };
            donations: {
                Row: {
                    id: string;
                    user_id: string | null;
                    amount: number;
                    tier: 'thanks' | 'superfan';
                    message: string | null;
                    payment_ref: string | null;
                    created_at: string;
                };
                Insert: {
                    user_id?: string | null;
                    amount: number;
                    tier: 'thanks' | 'superfan';
                    message?: string | null;
                    payment_ref?: string | null;
                };
                Update: {};
            };
            user_iq_history: {
                Row: {
                    id: string;
                    user_id: string;
                    puzzle_id: string;
                    change_amount: number;
                    time_taken_ms: number;
                    is_correct: boolean;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    puzzle_id: string;
                    change_amount: number;
                    time_taken_ms: number;
                    is_correct: boolean;
                    created_at?: string;
                };
                Update: {};
            };
            pro_players: {
                Row: {
                    id: string;
                    name: string;
                    region: 'AMER' | 'EMEA' | 'APAC' | 'CN' | 'VN' | 'OTHER';
                    avatar_url: string | null;
                    liquipedia_url: string | null;
                    datatft_url: string | null;
                    current_iq: number;
                    iq_tier: 'GOAT' | 'Elite' | 'Top Pro' | 'Pro' | 'Rising';
                    current_rank: string | null;
                    current_lp: number | null;
                    tournament_titles: number | null;
                    notes: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    name: string;
                    region: 'AMER' | 'EMEA' | 'APAC' | 'CN' | 'VN' | 'OTHER';
                    avatar_url?: string | null;
                    liquipedia_url?: string | null;
                    datatft_url?: string | null;
                    current_iq?: number;
                    iq_tier?: 'GOAT' | 'Elite' | 'Top Pro' | 'Pro' | 'Rising';
                    current_rank?: string | null;
                    current_lp?: number | null;
                    tournament_titles?: number | null;
                    notes?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    region?: 'AMER' | 'EMEA' | 'APAC' | 'CN' | 'VN' | 'OTHER';
                    avatar_url?: string | null;
                    liquipedia_url?: string | null;
                    datatft_url?: string | null;
                    current_iq?: number;
                    iq_tier?: 'GOAT' | 'Elite' | 'Top Pro' | 'Pro' | 'Rising';
                    current_rank?: string | null;
                    current_lp?: number | null;
                    tournament_titles?: number | null;
                    notes?: string | null;
                    is_active?: boolean;
                    updated_at?: string;
                };
            };
            pro_iq_history: {
                Row: {
                    id: string;
                    pro_player_id: string;
                    iq_score: number;
                    iq_tier: 'GOAT' | 'Elite' | 'Top Pro' | 'Pro' | 'Rising';
                    change_amount: number;
                    change_reason: string;
                    source: 'manual' | 'tournament' | 'ladder';
                    recorded_at: string;
                };
                Insert: {
                    pro_player_id: string;
                    iq_score: number;
                    iq_tier: 'GOAT' | 'Elite' | 'Top Pro' | 'Pro' | 'Rising';
                    change_amount: number;
                    change_reason: string;
                    source: 'manual' | 'tournament' | 'ladder';
                    recorded_at?: string;
                };
                Update: {};
            };
            memes: {
                Row: {
                    id: string;
                    text: string;
                    emoji: string;
                    image_url: string | null;
                    category: 'correct' | 'incorrect';
                    insight: string | null;
                    is_active: boolean;
                    created_by: string | null;
                    created_at: string;
                };
                Insert: {
                    text: string;
                    emoji: string;
                    image_url?: string | null;
                    category: 'correct' | 'incorrect';
                    insight?: string | null;
                    is_active?: boolean;
                    created_by?: string | null;
                    created_at?: string;
                };
                Update: {
                    text?: string;
                    emoji?: string;
                    image_url?: string | null;
                    category?: 'correct' | 'incorrect';
                    insight?: string | null;
                    is_active?: boolean;
                };
            };
            user_video_unlocks: {
                Row: {
                    id: string;
                    user_id: string;
                    puzzle_id: string;
                    video_url: string;
                    user_result: 'correct' | 'incorrect';
                    iq_delta: number | null;
                    unlocked_at: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    puzzle_id: string;
                    video_url: string;
                    user_result: 'correct' | 'incorrect';
                    iq_delta?: number | null;
                    unlocked_at?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    video_url?: string;
                    user_result?: 'correct' | 'incorrect';
                    iq_delta?: number | null;
                    updated_at?: string;
                };
            };
        };
    };
};
