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

export interface Item {
    id: string;
    name: string;
    name_en?: string; // Original English name for matching (set by getAll)
    description: string;
    name_vi?: string;
    description_vi?: string;
    icon?: string;
    stats: Record<string, number>;
}

export const itemService = {
    async getAll() {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .is('deleted_at', null)
            .order('name', { ascending: true });

        if (error) throw error;

        return (data as any[]).map(item => ({
            ...item,
            name: item.name_vi || item.name,
            name_en: item.name, // Preserve original English name
            description: item.description_vi || item.description || '',
        })) as Item[];
    },

    async getDeleted() {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('name', { ascending: true });

        if (error) throw error;

        return (data as any[]).map(item => ({
            ...item,
            name: item.name_vi || item.name,
            name_en: item.name,
            description: item.description_vi || item.description || '',
            deleted_at: item.deleted_at
        })) as Item[];
    },

    async create(item: Omit<Item, 'id'>) {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can create items');
        }

        const { data, error } = await supabase
            .from('items')
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data as Item;
    },

    async update(id: string, updates: Partial<Item>) {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can update items');
        }

        const { data, error } = await supabase
            .from('items')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Item;
    },

    async delete(id: string) {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can delete items');
        }

        const { error } = await supabase
            .from('items')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    async restore(id: string) {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can restore items');
        }

        const { error } = await supabase
            .from('items')
            .update({ deleted_at: null })
            .eq('id', id);

        if (error) throw error;
    }
};
