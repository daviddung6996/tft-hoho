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
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    display_name?: string | null;
                    role?: 'user' | 'admin';
                };
                Update: {
                    display_name?: string | null;
                    role?: 'user' | 'admin';
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
                    augments: any;
                    pro_first_roll: any;
                    pro_second_roll: any;
                    pro_final_pick: any;
                    pro_pick_round: number;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    pro_player: string;
                    rank: string;
                    stage: string;
                    meta_data: any;
                    augments: any;
                    pro_first_roll: any;
                    pro_second_roll: any;
                    pro_final_pick: any;
                    pro_pick_round: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    pro_player?: string;
                    rank?: string;
                    stage?: string;
                    meta_data?: any;
                    augments?: any;
                    pro_first_roll?: any;
                    pro_second_roll?: any;
                    pro_final_pick?: any;
                    pro_pick_round?: number;
                    created_at?: string;
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
        };
    };
};
