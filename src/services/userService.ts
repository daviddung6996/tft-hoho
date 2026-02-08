import { supabase } from '../lib/supabase';
import { AuthUser } from '../lib/supabase';

export type UserRole = 'user' | 'mod' | 'admin';

export interface UserWithMeta extends AuthUser {
    created_at: string;
    updated_at: string;
    created_by?: string;
}

// Check if current user can access admin panel
export const checkAdminAccess = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (error || !data) return false;
    return data.role === 'admin' || data.role === 'mod';
};

// Check if current user can manage users (admin only)
export const checkCanManageUsers = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (error || !data) return false;
    return data.role === 'admin';
};

// Get all users (admin/mod only)
export const getAllUsers = async (): Promise<UserWithMeta[]> => {
    const canAccess = await checkAdminAccess();
    if (!canAccess) {
        throw new Error('Unauthorized: Admin/Mod access required');
    }

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

// Update user role (admin only)
export const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
    const canManage = await checkCanManageUsers();
    if (!canManage) {
        throw new Error('Unauthorized: Admin access required');
    }

    // Prevent admin from demoting themselves
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id === userId && newRole !== 'admin') {
        throw new Error('Cannot demote yourself');
    }

    const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) throw error;
};

// Delete user (admin only, cannot delete other admins)
export const deleteUser = async (userId: string): Promise<void> => {
    const canManage = await checkCanManageUsers();
    if (!canManage) {
        throw new Error('Unauthorized: Admin access required');
    }

    // Check if target is admin
    const { data: targetUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

    if (targetUser?.role === 'admin') {
        throw new Error('Cannot delete admin users');
    }

    // Delete from public.users (cascade will handle auth.users)
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

    if (error) throw error;
};

// Get user by ID
export const getUserById = async (userId: string): Promise<UserWithMeta | null> => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) return null;
    return data;
};

// Promote user to admin (using secret key - for initial setup only)
export const promoteToAdmin = async (email: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('promote_to_admin', {
        target_email: email,
        secret_key: 'tfthoho_admin_2024'
    });

    if (error) {
        console.error('Failed to promote user:', error);
        return false;
    }
    return data === true;
};
