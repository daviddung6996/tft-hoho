import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing! Please check your .env file.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

export type Database = {
    public: {
        Tables: {
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
        };
    };
};
