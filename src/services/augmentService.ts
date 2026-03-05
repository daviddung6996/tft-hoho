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

    return data?.role === 'admin' || data?.role === 'mod';
};

// UI structure
export interface AugmentData {
    id: string;
    title: string;
    description: string;
    description_vi?: string;
    icon: string;
    tier: 1 | 2 | 3;
}

export type Augment = AugmentData;

export const augmentService = {
    async getAll(): Promise<AugmentData[]> {
        const { data, error } = await supabase
            .from('augments')
            .select('*')
            .is('deleted_at', null)
            .order('tier', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching augments:', error);
            throw error;
        }

        return (data as any[]).map(augment => ({
            id: augment.id,
            title: augment.name_vi || augment.name,
            description: augment.description_vi || augment.description || '',
            description_vi: augment.description_vi || '',
            icon: augment.icon || '',
            tier: (augment.tier as 1 | 2 | 3) || 1
        }));
    },

    async getDeleted(): Promise<AugmentData[]> {
        const { data, error } = await supabase
            .from('augments')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('tier', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching deleted augments:', error);
            throw error;
        }

        return (data as any[]).map(augment => ({
            id: augment.id,
            title: augment.name_vi || augment.name,
            description: augment.description_vi || augment.description || '',
            description_vi: augment.description_vi || '',
            icon: augment.icon || '',
            tier: (augment.tier as 1 | 2 | 3) || 1,
            deleted_at: augment.deleted_at
        }));
    },

    async search(query: string): Promise<AugmentData[]> {
        const { data, error } = await supabase
            .from('augments')
            .select('*')
            .or(`name.ilike.%${query}%,name_vi.ilike.%${query}%`)
            .order('tier', { ascending: true });

        if (error) {
            console.error('Error searching augments:', error);
            throw error;
        }

        return (data as any[]).map(augment => ({
            id: augment.id,
            title: augment.name_vi || augment.name,
            description: augment.description_vi || augment.description || '',
            description_vi: augment.description_vi || '',
            icon: augment.icon || '',
            tier: (augment.tier as 1 | 2 | 3) || 1
        }));
    },

    // For admin update
    async update(id: string, updates: Partial<AugmentData>): Promise<AugmentData> {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can update augments');
        }

        // Map UI fields back to DB fields
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.name = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.description_vi !== undefined) dbUpdates.description_vi = updates.description_vi;
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
            // Prefer Vietnamese if available
            title: (data as any).name_vi || data.name,
            description: (data as any).description_vi || data.description || '',
            description_vi: (data as any).description_vi || '',
            icon: data.icon || '',
            tier: (data.tier as 1 | 2 | 3) || 1
        };
    },

    async delete(id: string): Promise<void> {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can delete augments');
        }

        const { error } = await supabase
            .from('augments')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    async restore(id: string): Promise<void> {
        const isAdmin = await checkAdminAccess();
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can restore augments');
        }

        const { error } = await supabase
            .from('augments')
            .update({ deleted_at: null })
            .eq('id', id);

        if (error) throw error;
    }
};

// Standalone export for convenience
export const fetchAllAugments = (): Promise<AugmentData[]> => augmentService.getAll();
