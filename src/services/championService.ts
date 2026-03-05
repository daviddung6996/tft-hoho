import { supabase } from '../lib/supabase';
import { Champion } from '../data/types';

export type { Champion }; // Re-export for convenience if needed

// Helper to check if current user has admin access
const checkAdminAccess = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    return data?.role === 'admin' || data?.role === 'mod';
};

export const championService = {
    async getAll() {
        const { data, error } = await supabase
            .from('champions')
            .select('*')
            .is('deleted_at', null)
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
            items: [], // Default valid value
            // Ability fields
            ability_name: c.ability_name,
            ability_name_en: c.ability_name_en,
            ability_description: c.ability_description,
            ability_variables: c.ability_variables || [],
            stats: c.stats
        })) as Champion[];
    },

    async getDeleted() {
        const { data, error } = await supabase
            .from('champions')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('cost', { ascending: true });

        if (error) throw error;

        return data.map((c: any) => ({
            id: c.id,
            name: c.name,
            cost: c.cost,
            traits: c.traits || [],
            avatar: c.avatar,
            icon: c.avatar || c.icon || '',
            stars: 1,
            items: [],
            ability_name: c.ability_name,
            ability_name_en: c.ability_name_en,
            ability_description: c.ability_description,
            ability_variables: c.ability_variables || [],
            stats: c.stats,
            deleted_at: c.deleted_at
        })) as Champion[];
    },

    async create(champion: Omit<Champion, 'id'>) {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can create champions');
        }

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
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can update champions');
        }

        // Strip instance fields and computed fields (icon)
        // Keep ability and stats fields for DB
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
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can delete champions');
        }

        // Soft delete: set deleted_at timestamp
        const { error } = await supabase
            .from('champions')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    async restore(id: string) {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can restore champions');
        }

        // Restore: set deleted_at to null
        const { error } = await supabase
            .from('champions')
            .update({ deleted_at: null })
            .eq('id', id);

        if (error) throw error;
    }
};
