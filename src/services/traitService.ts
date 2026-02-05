import { supabase } from '../lib/supabase';

export interface Trait {
    id: string;
    name: string;
    description: string;
    effects: Record<string, any>; // Flexible JSON for effect intervals
}

export const traitService = {
    async getAll() {
        const { data, error } = await supabase
            .from('traits')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data as Trait[];
    },

    async create(trait: Omit<Trait, 'id'>) {
        const { data, error } = await supabase
            .from('traits')
            .insert([trait])
            .select()
            .single();

        if (error) throw error;
        return data as Trait;
    },

    async update(id: string, updates: Partial<Trait>) {
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
        const { error } = await supabase
            .from('traits')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
