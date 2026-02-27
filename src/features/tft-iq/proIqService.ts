import { supabase } from '../../lib/supabase';
import { ProPlayer, ProIqHistoryEntry, CreateProPlayerPayload, ProIqUpdatePayload } from './proIq.types';
import { calculateIqTier } from './proIqCalculator';

// ─── READ ───

export async function getAllProPlayers(): Promise<ProPlayer[]> {
    const { data, error } = await supabase
        .from('pro_players')
        .select('*')
        .order('current_iq', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getProPlayer(id: string): Promise<ProPlayer | null> {
    const { data, error } = await supabase
        .from('pro_players')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function getIqHistory(proPlayerId: string): Promise<ProIqHistoryEntry[]> {
    const { data, error } = await supabase
        .from('pro_iq_history')
        .select('*')
        .eq('pro_player_id', proPlayerId)
        .order('recorded_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

// ─── CREATE ───

export async function createProPlayer(payload: CreateProPlayerPayload): Promise<ProPlayer> {
    const iq = payload.current_iq ?? 1500;
    const tier = calculateIqTier(iq);

    const { data, error } = await supabase
        .from('pro_players')
        .insert({
            ...payload,
            current_iq: iq,
            iq_tier: tier,
            is_active: true,
        })
        .select()
        .single();

    if (error) throw error;

    // Record initial IQ in history
    await supabase.from('pro_iq_history').insert({
        pro_player_id: data.id,
        iq_score: iq,
        iq_tier: tier,
        change_amount: 0,
        change_reason: 'Initial IQ',
        source: 'manual',
    });

    return data;
}

// ─── UPDATE ───

export async function updateProPlayer(id: string, updates: Partial<ProPlayer>): Promise<ProPlayer> {
    // Recalculate tier if IQ changed
    if (updates.current_iq !== undefined) {
        updates.iq_tier = calculateIqTier(updates.current_iq);
    }

    const { data, error } = await supabase
        .from('pro_players')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateIqScore(
    proPlayerId: string,
    payload: ProIqUpdatePayload
): Promise<{ player: ProPlayer; history: ProIqHistoryEntry }> {
    // Get current IQ
    const current = await getProPlayer(proPlayerId);
    if (!current) throw new Error('Pro player not found');

    const changeAmount = payload.new_iq - current.current_iq;
    const newTier = calculateIqTier(payload.new_iq);

    // Update player
    const { data: player, error: playerErr } = await supabase
        .from('pro_players')
        .update({
            current_iq: payload.new_iq,
            iq_tier: newTier,
            updated_at: new Date().toISOString(),
        })
        .eq('id', proPlayerId)
        .select()
        .single();

    if (playerErr) throw playerErr;

    // Record history
    const { data: history, error: histErr } = await supabase
        .from('pro_iq_history')
        .insert({
            pro_player_id: proPlayerId,
            iq_score: payload.new_iq,
            iq_tier: newTier,
            change_amount: changeAmount,
            change_reason: payload.reason,
            source: payload.source,
        })
        .select()
        .single();

    if (histErr) throw histErr;

    return { player, history };
}

// ─── DELETE ───

export async function deleteProPlayer(id: string): Promise<void> {
    const { error } = await supabase
        .from('pro_players')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw error;
}

export async function getDeletedProPlayers(): Promise<ProPlayer[]> {
    const { data, error } = await supabase
        .from('pro_players')
        .select('*')
        .eq('is_active', false)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function restoreProPlayer(id: string): Promise<void> {
    const { error } = await supabase
        .from('pro_players')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw error;
}

export async function hardDeleteProPlayer(id: string): Promise<void> {
    const { error } = await supabase
        .from('pro_players')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ─── BULK ───

export async function bulkUpdateIq(
    updates: { proPlayerId: string; newIq: number; reason: string }[]
): Promise<void> {
    for (const u of updates) {
        await updateIqScore(u.proPlayerId, {
            new_iq: u.newIq,
            reason: u.reason,
            source: 'manual',
        });
    }
}
