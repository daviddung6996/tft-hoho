import { supabase } from '../../../lib/supabase';
import { MemeItem, MemeCategory } from './meme.types';

interface MemeRow {
    id: string;
    text: string;
    emoji: string;
    image_url: string | null;
    category: string;
    insight: string | null;
    is_active: boolean;
    created_by: string | null;
    created_at: string;
}

function rowToMeme(row: MemeRow): MemeItem {
    return {
        id: row.id,
        text: row.text,
        emoji: row.emoji,
        imageUrl: row.image_url || undefined,
        category: row.category as MemeCategory,
        insight: row.insight || undefined,
        isActive: row.is_active,
    };
}

export async function fetchMemesByCategory(category: MemeCategory): Promise<MemeItem[]> {
    const { data, error } = await supabase
        .from('memes')
        .select('*')
        .eq('category', category)
        .eq('is_active', true);

    if (error) throw error;
    return (data as MemeRow[]).map(rowToMeme);
}

export async function fetchAllMemes(): Promise<MemeItem[]> {
    const { data, error } = await supabase
        .from('memes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as MemeRow[]).map(rowToMeme);
}

export async function createMeme(meme: {
    text: string;
    emoji: string;
    imageUrl?: string;
    category: MemeCategory;
    insight?: string;
}): Promise<MemeItem> {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('memes')
        .insert({
            text: meme.text,
            emoji: meme.emoji,
            image_url: meme.imageUrl || null,
            category: meme.category,
            insight: meme.insight || null,
            created_by: userData?.user?.id || null,
        })
        .select()
        .single();

    if (error) throw error;
    return rowToMeme(data as MemeRow);
}

export async function updateMeme(
    id: string,
    updates: Partial<{ text: string; emoji: string; imageUrl: string; category: MemeCategory; insight: string; isActive: boolean }>
): Promise<MemeItem> {
    const payload: Record<string, unknown> = {};
    if (updates.text !== undefined) payload.text = updates.text;
    if (updates.emoji !== undefined) payload.emoji = updates.emoji;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.insight !== undefined) payload.insight = updates.insight;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

    const { data, error } = await supabase
        .from('memes')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return rowToMeme(data as MemeRow);
}

export async function getDeletedMemes(): Promise<MemeItem[]> {
    const { data, error } = await supabase
        .from('memes')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as MemeRow[]).map(rowToMeme);
}

export async function deleteMeme(id: string): Promise<void> {
    const { error } = await supabase
        .from('memes')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw error;
}

export async function restoreMeme(id: string): Promise<void> {
    const { error } = await supabase
        .from('memes')
        .update({ is_active: true })
        .eq('id', id);

    if (error) throw error;
}

export async function hardDeleteMeme(id: string): Promise<void> {
    const { error } = await supabase
        .from('memes')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
