import { supabase } from '../lib/supabase';
import { Database } from '../data/supabase_types';

type AugmentRow = Database['public']['Tables']['augments']['Row'];

// UI structure
export interface AugmentData {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: 'silver' | 'gold' | 'prismatic';
    tier?: 1 | 2 | 3;
}

export type Augment = AugmentData;

export const augmentService = {
    async getAll(): Promise<AugmentData[]> {
        const { data, error } = await supabase
            .from('augments')
            .select('*')
            .order('tier', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching augments:', error);
            throw error;
        }

        return (data as AugmentRow[]).map(augment => ({
            id: augment.id,
            title: augment.name,
            description: augment.description || '',
            icon: augment.icon || '',
            rarity: this.mapTierToRarity(augment.tier || 0),
            tier: (augment.tier as 1 | 2 | 3) || 1
        }));
    },

    async search(query: string): Promise<AugmentData[]> {
        const { data, error } = await supabase
            .from('augments')
            .select('*')
            .ilike('name', `%${query}%`)
            .order('tier', { ascending: true });

        if (error) {
            console.error('Error searching augments:', error);
            throw error;
        }

        return (data as AugmentRow[]).map(augment => ({
            id: augment.id,
            title: augment.name,
            description: augment.description || '',
            icon: augment.icon || '',
            rarity: this.mapTierToRarity(augment.tier || 0),
            tier: (augment.tier as 1 | 2 | 3) || 1
        }));
    },

    mapTierToRarity(tier: number): 'silver' | 'gold' | 'prismatic' {
        switch (tier) {
            case 1: return 'silver';
            case 2: return 'gold';
            case 3: return 'prismatic';
            default: return 'gold';
        }
    },

    // For admin update
    async update(id: string, updates: Partial<AugmentData>): Promise<AugmentData> {
        // Map UI fields back to DB fields
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.name = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
        if (updates.tier !== undefined) dbUpdates.tier = updates.tier;

        const { data, error } = await supabase
            .from('augments')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            title: data.name,
            description: data.description || '',
            icon: data.icon || '',
            rarity: this.mapTierToRarity(data.tier || 0),
            tier: (data.tier as 1 | 2 | 3) || 1
        };
    },

    // For admin deletion
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('augments')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// Standalone export for convenience
export const fetchAllAugments = (): Promise<AugmentData[]> => augmentService.getAll();
