import { supabase } from '../lib/supabase';

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

export interface Trait {
    id: string;
    name: string;
    name_en: string; // Original English name for matching with champion.traits
    description: string;
    name_vi?: string;
    description_vi?: string;
    effects: Record<string, any>; // Flexible JSON for effect intervals
    icon?: string; // Icon URL from DB
}

export const traitService = {
    async getAll() {
        const { data, error } = await supabase
            .from('traits')
            .select('*')
            .is('deleted_at', null)
            .order('name', { ascending: true });

        if (error) throw error;

        return (data as any[]).map(trait => ({
            ...trait,
            name: trait.name_vi || trait.name,
            name_en: trait.name, // Preserve original English name
            description: trait.description_vi || trait.description || '',
            icon: trait.icon || '', // Include icon from DB
        })) as Trait[];
    },

    async getDeleted() {
        const { data, error } = await supabase
            .from('traits')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('name', { ascending: true });

        if (error) throw error;

        return (data as any[]).map(trait => ({
            ...trait,
            name: trait.name_vi || trait.name,
            name_en: trait.name,
            description: trait.description_vi || trait.description || '',
            deleted_at: trait.deleted_at
        })) as Trait[];
    },

    async create(trait: Omit<Trait, 'id'>) {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can create traits');
        }

        const { data, error } = await supabase
            .from('traits')
            .insert([trait])
            .select()
            .single();

        if (error) throw error;
        return data as Trait;
    },

    async update(id: string, updates: Partial<Trait>) {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can update traits');
        }

        const { data, error } = await supabase
            .from('traits')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Trait;
    },

    async delete(id: string) {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can delete traits');
        }

        const { error } = await supabase
            .from('traits')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    async restore(id: string) {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can restore traits');
        }

        const { error } = await supabase
            .from('traits')
            .update({ deleted_at: null })
            .eq('id', id);

        if (error) throw error;
    }
};
