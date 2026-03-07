import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
}

export const REQUIRED_TABLE_COLUMNS: Record<string, string[]> = {
    users: [
        'id',
        'email',
        'display_name',
        'role',
        'created_at',
        'updated_at',
        'iq_score',
        'iq_rank',
        'season',
        'total_puzzles_solved',
        'accuracy_weight',
        'speed_weight',
    ],
    champions: [
        'id',
        'name',
        'cost',
        'traits',
        'avatar',
        'stats',
        'ability_name',
        'ability_name_en',
        'ability_description',
        'ability_variables',
        'deleted_at',
    ],
    traits: [
        'id',
        'name',
        'description',
        'effects',
        'icon',
        'name_vi',
        'description_vi',
        'deleted_at',
    ],
    items: [
        'id',
        'name',
        'description',
        'stats',
        'icon',
        'name_vi',
        'description_vi',
        'deleted_at',
    ],
    augments: [
        'id',
        'name',
        'tier',
        'description',
        'icon',
        'tier_name',
        'name_vi',
        'description_vi',
        'deleted_at',
    ],
    puzzles: [
        'id',
        'pro_player',
        'rank',
        'stage',
        'meta_data',
        'board_state',
        'augments',
        'pro_first_roll',
        'pro_second_roll',
        'pro_final_pick',
        'pro_pick_round',
        'created_at',
        'deleted_at',
        'tier',
        'video_url',
        'video_title',
        'video_thumbnail_url',
    ],
    user_puzzle_history: [
        'id',
        'user_id',
        'puzzle_id',
        'completed_at',
        'created_at',
    ],
    user_puzzle_attempts: [
        'id',
        'user_id',
        'puzzle_id',
        'user_pick_id',
        'user_pick_name',
        'is_correct',
        'reroll_count',
        'reroll_indices',
        'time_to_decide_ms',
        'puzzle_stage',
        'pro_pick_id',
        'created_at',
        'declared_path',
        'intent_score',
        'time_to_path_ms',
        'declared_plan',
        'plan_score',
        'time_to_plan_ms',
    ],
    puzzle_votes: [
        'id',
        'puzzle_id',
        'augment_id',
        'augment_name',
        'session_id',
        'created_at',
    ],
    user_wallets: [
        'id',
        'user_id',
        'balance',
        'total_earned',
        'total_spent',
        'created_at',
        'updated_at',
    ],
    tcoin_transactions: [
        'id',
        'user_id',
        'amount',
        'balance_after',
        'type',
        'reason',
        'reference_id',
        'created_at',
    ],
    user_unlocked_puzzles: [
        'id',
        'user_id',
        'puzzle_id',
        'tier',
        'unlocked_at',
    ],
    pro_supporters: [
        'id',
        'user_id',
        'plan',
        'status',
        'started_at',
        'expires_at',
        'payment_ref',
        'created_at',
        'updated_at',
    ],
    donations: [
        'id',
        'user_id',
        'amount',
        'tier',
        'message',
        'payment_ref',
        'created_at',
    ],
    user_iq_history: [
        'id',
        'user_id',
        'puzzle_id',
        'change_amount',
        'time_taken_ms',
        'is_correct',
        'created_at',
    ],
    pro_players: [
        'id',
        'name',
        'region',
        'avatar_url',
        'liquipedia_url',
        'datatft_url',
        'current_iq',
        'iq_tier',
        'current_rank',
        'current_lp',
        'tournament_titles',
        'notes',
        'is_active',
        'created_at',
        'updated_at',
    ],
    pro_iq_history: [
        'id',
        'pro_player_id',
        'iq_score',
        'iq_tier',
        'change_amount',
        'change_reason',
        'source',
        'recorded_at',
    ],
    memes: [
        'id',
        'text',
        'emoji',
        'image_url',
        'category',
        'insight',
        'is_active',
        'created_by',
        'created_at',
    ],
    user_video_unlocks: [
        'id',
        'user_id',
        'puzzle_id',
        'video_url',
        'user_result',
        'iq_delta',
        'unlocked_at',
        'created_at',
        'updated_at',
    ],
};

export const FEATURE_TABLES_WITHOUT_LOCAL_MIGRATION = [
    'pro_players',
    'pro_iq_history',
    'memes',
    'user_video_unlocks',
];

export type Severity = 'error' | 'warn';

export interface SchemaAuditIssue {
    key: string;
    severity: Severity;
    message: string;
    count?: number;
    sample?: unknown;
}

export interface TableAuditResult {
    table: string;
    rowCount: number | null;
    missingColumns: string[];
    sampleColumns: string[];
    exists: boolean;
    error?: string;
}

export interface AuditResult {
    generatedAt: string;
    tables: TableAuditResult[];
    issues: SchemaAuditIssue[];
}

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function queryTableCount(table: string): Promise<{ rowCount: number | null; error?: string }> {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
        return { rowCount: null, error: error.message };
    }
    return { rowCount: count ?? 0 };
}

async function querySampleColumns(table: string): Promise<{ columns: string[]; error?: string }> {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
        return { columns: [], error: error.message };
    }
    return { columns: data?.[0] ? Object.keys(data[0]) : [] };
}

async function columnExists(table: string, column: string): Promise<boolean> {
    const { error } = await supabase.from(table).select(column, { count: 'exact', head: true });
    return !error;
}

async function buildTableAudit(table: string, requiredColumns: string[]): Promise<TableAuditResult> {
    const [{ rowCount, error }, sample] = await Promise.all([
        queryTableCount(table),
        querySampleColumns(table),
    ]);

    if (error) {
        return {
            table,
            rowCount,
            missingColumns: requiredColumns.slice(),
            sampleColumns: [],
            exists: false,
            error,
        };
    }

    const existingColumnChecks = await Promise.all(
        requiredColumns.map(async (column) => ({
            column,
            exists: await columnExists(table, column),
        })),
    );

    return {
        table,
        rowCount,
        missingColumns: existingColumnChecks.filter((check) => !check.exists).map((check) => check.column),
        sampleColumns: sample.columns,
        exists: true,
        error: sample.error,
    };
}

function buildIssue(
    key: string,
    severity: Severity,
    message: string,
    count?: number,
    sample?: unknown,
): SchemaAuditIssue {
    return { key, severity, message, count, sample };
}

export async function runAudit(): Promise<AuditResult> {
    const tables = await Promise.all(
        Object.entries(REQUIRED_TABLE_COLUMNS).map(([table, columns]) => buildTableAudit(table, columns)),
    );

    const issues: SchemaAuditIssue[] = [];

    tables.forEach((table) => {
        if (!table.exists) {
            issues.push(buildIssue(
                `schema.table_missing.${table.table}`,
                'error',
                `Table ${table.table} is missing or unreadable from the configured Supabase project.`,
                undefined,
                table.error,
            ));
            return;
        }

        if (table.missingColumns.length > 0) {
            issues.push(buildIssue(
                `schema.columns_missing.${table.table}`,
                'error',
                `Table ${table.table} is missing required columns.`,
                table.missingColumns.length,
                table.missingColumns,
            ));
        }
    });

    FEATURE_TABLES_WITHOUT_LOCAL_MIGRATION.forEach((table) => {
        issues.push(buildIssue(
            `schema.migration_gap.${table}`,
            'warn',
            `Table ${table} is used by the app but was not codified in the pre-existing local migration set.`,
        ));
    });

    const [
        usersResult,
        puzzlesResult,
        walletResult,
        txResult,
        unlockResult,
        attemptsResult,
        historyResult,
        votesResult,
        iqHistoryResult,
        supporterResult,
        videoUnlockResult,
    ] = await Promise.all([
        supabase.from('users').select('id,email,role').limit(5000),
        supabase.from('puzzles').select('id,tier,meta_data,board_state,augments,pro_first_roll,pro_second_roll,pro_final_pick').limit(5000),
        supabase.from('user_wallets').select('user_id,balance,total_earned,total_spent').limit(5000),
        supabase.from('tcoin_transactions').select('user_id,amount,balance_after,type,reason,reference_id,created_at').limit(10000),
        supabase.from('user_unlocked_puzzles').select('id,user_id,puzzle_id,tier').limit(5000),
        supabase.from('user_puzzle_attempts').select('id,puzzle_id').limit(10000),
        supabase.from('user_puzzle_history').select('id,puzzle_id').limit(10000),
        supabase.from('puzzle_votes').select('id,puzzle_id,session_id').limit(10000),
        supabase.from('user_iq_history').select('id,puzzle_id').limit(10000),
        supabase.from('pro_supporters').select('id,user_id,plan,status,expires_at').limit(5000),
        supabase.from('user_video_unlocks').select('id,puzzle_id,user_result').limit(5000),
    ]);

    const users = usersResult.data ?? [];
    const puzzles = puzzlesResult.data ?? [];
    const wallets = walletResult.data ?? [];
    const transactions = txResult.data ?? [];
    const unlocks = unlockResult.data ?? [];
    const attempts = attemptsResult.data ?? [];
    const histories = historyResult.data ?? [];
    const votes = votesResult.data ?? [];
    const iqHistory = iqHistoryResult.data ?? [];
    const supporters = supporterResult.data ?? [];
    const videoUnlocks = videoUnlockResult.data ?? [];

    const puzzleIds = new Set(puzzles.map((puzzle) => puzzle.id));
    const validRoles = new Set(['user', 'mod', 'admin']);
    const validPuzzleTiers = new Set(['free', 'advanced', 'rare']);
    const validSupporterPlans = new Set(['monthly', 'lifetime']);
    const validSupporterStatuses = new Set(['active', 'expired', 'cancelled']);
    const validVideoResults = new Set(['correct', 'incorrect']);

    const invalidRoles = users.filter((user) => !validRoles.has(String(user.role)));
    if (invalidRoles.length > 0) {
        issues.push(buildIssue(
            'data.users.invalid_role',
            'error',
            'Found users with invalid role values.',
            invalidRoles.length,
            invalidRoles.slice(0, 5),
        ));
    }

    const invalidPuzzleTiers = puzzles.filter((puzzle) => !validPuzzleTiers.has(String(puzzle.tier ?? 'free')));
    if (invalidPuzzleTiers.length > 0) {
        issues.push(buildIssue(
            'data.puzzles.invalid_tier',
            'error',
            'Found puzzles with invalid tier values.',
            invalidPuzzleTiers.length,
            invalidPuzzleTiers.slice(0, 5),
        ));
    }

    const invalidPuzzleShapes = puzzles.filter((puzzle) => {
        const hasObjectMeta = puzzle.meta_data === null || typeof puzzle.meta_data === 'object';
        const hasObjectBoard = puzzle.board_state === null || typeof puzzle.board_state === 'object';
        const hasAugmentArray = Array.isArray(puzzle.augments);
        const hasFirstRollArray = Array.isArray(puzzle.pro_first_roll);
        const hasSecondRollArray = Array.isArray(puzzle.pro_second_roll);
        const finalPickValid = puzzle.pro_final_pick === null || typeof puzzle.pro_final_pick === 'object';
        return !(hasObjectMeta && hasObjectBoard && hasAugmentArray && hasFirstRollArray && hasSecondRollArray && finalPickValid);
    });
    if (invalidPuzzleShapes.length > 0) {
        issues.push(buildIssue(
            'data.puzzles.invalid_json_shape',
            'error',
            'Found puzzles with invalid JSON structure in gameplay columns.',
            invalidPuzzleShapes.length,
            invalidPuzzleShapes.slice(0, 5).map((puzzle) => puzzle.id),
        ));
    }

    const negativeWallets = wallets.filter((wallet) => (wallet.balance ?? 0) < 0);
    if (negativeWallets.length > 0) {
        issues.push(buildIssue(
            'data.user_wallets.negative_balance',
            'error',
            'Found wallets with negative balance.',
            negativeWallets.length,
            negativeWallets.slice(0, 5),
        ));
    }

    const earnedLessThanBalance = wallets.filter((wallet) => (wallet.total_earned ?? 0) < (wallet.balance ?? 0));
    if (earnedLessThanBalance.length > 0) {
        issues.push(buildIssue(
            'data.user_wallets.earned_less_than_balance',
            'error',
            'Found wallets where total_earned is lower than current balance.',
            earnedLessThanBalance.length,
            earnedLessThanBalance.slice(0, 5),
        ));
    }

    const invalidTransactions = transactions.filter((tx) => (
        !['earn', 'spend'].includes(String(tx.type)) ||
        (tx.type === 'earn' && (tx.amount ?? 0) <= 0) ||
        (tx.type === 'spend' && (tx.amount ?? 0) >= 0) ||
        (tx.balance_after ?? 0) < 0
    ));
    if (invalidTransactions.length > 0) {
        issues.push(buildIssue(
            'data.tcoin_transactions.invalid_ledger_row',
            'error',
            'Found invalid T-Coin ledger rows.',
            invalidTransactions.length,
            invalidTransactions.slice(0, 5),
        ));
    }

    const orphanUnlocks = unlocks.filter((unlock) => !puzzleIds.has(String(unlock.puzzle_id)));
    if (orphanUnlocks.length > 0) {
        issues.push(buildIssue(
            'data.user_unlocked_puzzles.orphan_puzzle_id',
            'error',
            'Found unlocked puzzle rows referencing puzzle IDs that no longer exist.',
            orphanUnlocks.length,
            orphanUnlocks.slice(0, 5),
        ));
    }

    const orphanHistories = histories.filter((history) => !puzzleIds.has(String(history.puzzle_id)));
    if (orphanHistories.length > 0) {
        issues.push(buildIssue(
            'data.user_puzzle_history.orphan_puzzle_id',
            'error',
            'Found puzzle completion history rows referencing deleted or missing puzzles.',
            orphanHistories.length,
            orphanHistories.slice(0, 5),
        ));
    }

    const orphanVotes = votes.filter((vote) => !puzzleIds.has(String(vote.puzzle_id)));
    if (orphanVotes.length > 0) {
        issues.push(buildIssue(
            'data.puzzle_votes.orphan_puzzle_id',
            'error',
            'Found puzzle vote rows referencing deleted or missing puzzles.',
            orphanVotes.length,
            orphanVotes.slice(0, 5),
        ));
    }

    const orphanIqHistory = iqHistory.filter((entry) => !puzzleIds.has(String(entry.puzzle_id)));
    if (orphanIqHistory.length > 0) {
        issues.push(buildIssue(
            'data.user_iq_history.orphan_puzzle_id',
            'error',
            'Found IQ history rows referencing deleted or missing puzzles.',
            orphanIqHistory.length,
            orphanIqHistory.slice(0, 5),
        ));
    }

    const orphanAttempts = attempts.filter((attempt) => !puzzleIds.has(String(attempt.puzzle_id)));
    if (orphanAttempts.length > 0) {
        issues.push(buildIssue(
            'data.user_puzzle_attempts.orphan_puzzle_id',
            'error',
            'Found puzzle attempt rows referencing deleted or missing puzzles.',
            orphanAttempts.length,
            orphanAttempts.slice(0, 5),
        ));
    }

    const invalidSupporters = supporters.filter((supporter) => (
        !validSupporterPlans.has(String(supporter.plan)) ||
        !validSupporterStatuses.has(String(supporter.status)) ||
        (supporter.plan === 'monthly' && !supporter.expires_at)
    ));
    if (invalidSupporters.length > 0) {
        issues.push(buildIssue(
            'data.pro_supporters.invalid_state',
            'error',
            'Found supporter rows with invalid plan/status/expires_at combinations.',
            invalidSupporters.length,
            invalidSupporters.slice(0, 5),
        ));
    }

    const invalidVideoUnlocks = videoUnlocks.filter((unlock) => (
        !puzzleIds.has(String(unlock.puzzle_id)) ||
        !validVideoResults.has(String(unlock.user_result))
    ));
    if (invalidVideoUnlocks.length > 0) {
        issues.push(buildIssue(
            'data.user_video_unlocks.invalid_reference_or_result',
            'error',
            'Found video unlock rows with invalid puzzle_id or user_result.',
            invalidVideoUnlocks.length,
            invalidVideoUnlocks.slice(0, 5),
        ));
    }

    return {
        generatedAt: new Date().toISOString(),
        tables,
        issues,
    };
}
