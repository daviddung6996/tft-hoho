import { supabase } from '../lib/supabase';

export interface Item {
    id: string;
    name: string;
    description: string;
    icon?: string;
    stats: Record<string, number>;
}

export const itemService = {
    async getAll() {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data as Item[];
    },

    async create(item: Omit<Item, 'id'>) {
        const { data, error } = await supabase
            .from('items')
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data as Item;
    },

    async update(id: string, updates: Partial<Item>) {
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
        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
