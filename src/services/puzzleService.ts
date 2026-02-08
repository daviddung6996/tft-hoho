import { supabase } from '../lib/supabase';
import { PuzzleScenario } from '../data/puzzleScenarios';

// Helper to check if current user has admin access
const checkAdminAccess = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    return data?.role === 'admin';
};

export const puzzleService = {
    // Fetch all puzzles from Supabase
    async getAll() {
        const { data, error } = await supabase
            .from('puzzles')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map DB rows back to application domain objects if needed
        return data.map((row: any) => {
            const meta = row.meta_data || {};
            const boardState = row.board_state || {};

            return {
                id: row.id,
                title: meta.title,
                proPlayer: row.pro_player,
                rank: row.rank,
                stage: row.stage,
                // Flatten metadata back into the object for the app
                streamUrl: meta.streamUrl,
                vodTimestamp: meta.vodTimestamp,
                vodSource: meta.vodSource,
                date: meta.date,
                server: meta.server,
                encounter: meta.encounter,
                patch: meta.patch,
                proLpRank: meta.proLpRank,
                tournamentName: meta.tournamentName,
                proSocialLink: meta.proSocialLink,
                lobbyHealth: meta.lobbyHealth,
                explanation: meta.explanation,
                // Unpack board state
                playerBoard: boardState.playerBoard || [],
                // Deprecated/Legacy Opponent mapping for backward compatibility
                opponentBoard: boardState.opponentBoard || [],
                playerBench: boardState.playerBench || [],
                opponentBench: boardState.opponentBench || [],
                playerState: boardState.playerState || { gold: 0, level: 1, hp: 100, xp: 0 },
                opponentState: boardState.opponentState || { gold: 0, level: 1, hp: 100, xp: 0 },

                // [NEW] Multi-opponent support
                opponents: boardState.opponents || [],

                // Starting items/components
                startingItems: boardState.startingItems || [],

                // Augment data
                augments: row.augments,
                rerollAugments: meta.rerollAugments || [],
                secondRerollAugments: meta.secondRerollAugments || [],
                hasExtraReroll: meta.hasExtraReroll || false,
                proRerollIndices: meta.proRerollIndices || [],
                proSecondRerollIndices: meta.proSecondRerollIndices || [],
                proPickIndex: meta.proPickIndex ?? -1,

                // Pro player choices
                proFirstRoll: row.pro_first_roll,
                proSecondRoll: row.pro_second_roll,
                proFinalPick: row.pro_final_pick,
                proPickRound: row.pro_pick_round,

                // Game Info
                ioniaPathId: row.ionia_path_id,
                voidModIds: row.void_mod_ids || []
            };
        }) as PuzzleScenario[];
    },

    // Fetch deleted puzzles from Supabase
    async getDeleted() {
        const { data, error } = await supabase
            .from('puzzles')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((row: any) => {
            const meta = row.meta_data || {};
            return {
                id: row.id,
                title: meta.title,
                proPlayer: row.pro_player,
                rank: row.rank,
                stage: row.stage,
                deleted_at: row.deleted_at
            };
        });
    },

    // Save a new puzzle (or update)
    async save(puzzle: PuzzleScenario & { name?: string }) {
        // Check admin access before allowing save
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can save puzzles');
        }

        const row = {
            id: puzzle.id, // If empty/new id logic handles it, but usually upsert needs ID
            pro_player: puzzle.proPlayer,
            rank: puzzle.rank,
            stage: puzzle.stage,
            // Pack metadata
            meta_data: {
                title: puzzle.title || puzzle.name,
                streamUrl: puzzle.streamUrl,
                vodTimestamp: puzzle.vodTimestamp,
                vodSource: puzzle.vodSource,
                date: puzzle.date,
                server: puzzle.server,
                encounter: puzzle.encounter,
                patch: puzzle.patch,
                proLpRank: puzzle.proLpRank,
                tournamentName: puzzle.tournamentName,
                proSocialLink: puzzle.proSocialLink,
                lobbyHealth: puzzle.lobbyHealth,
                explanation: puzzle.explanation,
                // Reroll augment data
                rerollAugments: puzzle.rerollAugments,
                secondRerollAugments: puzzle.secondRerollAugments,
                hasExtraReroll: puzzle.hasExtraReroll,
                proRerollIndices: puzzle.proRerollIndices,
                proSecondRerollIndices: puzzle.proSecondRerollIndices,
                proPickIndex: puzzle.proPickIndex
            },
            // Pack board state
            board_state: {
                playerBoard: puzzle.playerBoard,
                opponentBoard: puzzle.opponentBoard,
                playerBench: puzzle.playerBench,
                opponentBench: puzzle.opponentBench,
                playerState: puzzle.playerState,
                opponentState: puzzle.opponentState,
                // [NEW] Persist opponents array
                opponents: puzzle.opponents,
                // Starting items/components
                startingItems: puzzle.startingItems
            },
            augments: puzzle.augments,
            pro_first_roll: puzzle.proFirstRoll,
            pro_second_roll: puzzle.proSecondRoll,
            pro_final_pick: puzzle.proFinalPick,
            pro_pick_round: puzzle.proPickRound,
            // Game Info fields
            ionia_path_id: puzzle.ioniaPathId || null,
            void_mod_ids: puzzle.voidModIds || []
        };

        // If ID is random/generated on client, we pass it. If DB generates it, we might need separate insert.
        // Assuming ID is generated or passed.
        const { data, error } = await supabase
            .from('puzzles')
            .upsert(row, { onConflict: 'id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        // Check admin access before allowing delete
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can delete puzzles');
        }

        const { error } = await supabase
            .from('puzzles')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    async restore(id: string) {
        // Check admin access before allowing restore
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can restore puzzles');
        }

        const { error } = await supabase
            .from('puzzles')
            .update({ deleted_at: null })
            .eq('id', id);

        if (error) throw error;
    },

    // Bulk Import Logic (kept for backward compat or migration if needed, but updated)
    async bulkImport(puzzles: PuzzleScenario[]) {
        // Check admin access before allowing bulk import
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can bulk import puzzles');
        }

        const rows = puzzles.map(p => ({
            id: p.id,
            pro_player: p.proPlayer,
            rank: p.rank,
            stage: p.stage,
            meta_data: {
                streamUrl: p.streamUrl,
                vodTimestamp: p.vodTimestamp,
                vodSource: p.vodSource,
                date: p.date,
                server: p.server,
                encounter: p.encounter,
                patch: p.patch,
                proLpRank: p.proLpRank,
                tournamentName: p.tournamentName,
                proSocialLink: p.proSocialLink,
                lobbyHealth: p.lobbyHealth,
                explanation: p.explanation,
                // Reroll augment data
                rerollAugments: p.rerollAugments,
                secondRerollAugments: p.secondRerollAugments,
                hasExtraReroll: p.hasExtraReroll,
                proRerollIndices: p.proRerollIndices,
                proSecondRerollIndices: p.proSecondRerollIndices,
                proPickIndex: p.proPickIndex
            },
            board_state: {
                playerBoard: p.playerBoard,
                opponentBoard: p.opponentBoard,
                playerBench: p.playerBench,
                opponentBench: p.opponentBench,
                playerState: p.playerState,
                opponentState: p.opponentState,
                opponents: p.opponents,
                startingItems: p.startingItems
            },
            augments: p.augments,
            pro_first_roll: p.proFirstRoll,
            pro_second_roll: p.proSecondRoll,
            pro_final_pick: p.proFinalPick,
            pro_pick_round: p.proPickRound
        }));

        const { data, error } = await supabase
            .from('puzzles')
            .upsert(rows, { onConflict: 'id' })
            .select();

        if (error) throw error;
        return data;
    },

    // Get list of completed puzzle IDs for a user
    async getCompletedPuzzles(userId?: string) {
        // If no userId provided, get from current session
        const uid = userId || (await supabase.auth.getUser()).data.user?.id;
        if (!uid) return [];

        const { data, error } = await supabase
            .from('user_puzzle_history')
            .select('puzzle_id')
            .eq('user_id', uid);

        if (error) {
            console.error("Error fetching puzzle history:", error);
            return [];
        }
        return data.map((row: any) => row.puzzle_id);
    },

    // Mark a puzzle as completed
    async markPuzzleCompleted(userId: string | undefined, puzzleId: string) {
        // If no userId provided, get from current session
        const uid = userId || (await supabase.auth.getUser()).data.user?.id;
        if (!uid) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('user_puzzle_history')
            .upsert({
                user_id: uid,
                puzzle_id: puzzleId,
                completed_at: new Date().toISOString()
            }, { onConflict: 'user_id, puzzle_id' });

        if (error) throw error;
    }
};
