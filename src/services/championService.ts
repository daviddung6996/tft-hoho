import { supabase } from '../lib/supabase';
import { Champion } from '../data/types';

export type { Champion }; // Re-export for convenience if needed

export const championService = {
    async getAll() {
        const { data, error } = await supabase
            .from('champions')
            .select('*')
            .order('cost', { ascending: true });

        if (error) throw error;

        // Map DB data to Champion interface
        // All data should come from DB - no fallback URLs
        return data.map((c: any) => ({
            id: c.id,
            name: c.name,
            cost: c.cost,
            traits: c.traits || [],
            avatar: c.avatar,
            icon: c.avatar || c.icon || '', // Use DB data only
            stars: 1, // Default valid value
            items: [] // Default valid value
        })) as Champion[];
    },

    async create(champion: Omit<Champion, 'id'>) {
        // When creating, we strip out the instance fields if they shouldn't be in DB
        const { stars, items, ...dbPayload } = champion;

        const { data, error } = await supabase
            .from('champions')
            .insert([dbPayload])
            .select()
            .single();

        if (error) throw error;
        return { ...data, stars: 1, items: [] } as Champion;
    },

    async update(id: string, updates: Partial<Champion>) {
        // Strip instance fields and computed fields (icon)
        const { stars, items, icon, ...dbUpdates } = updates;

        const { data, error } = await supabase
            .from('champions')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { ...data, stars: 1, items: [] } as Champion;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('champions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
