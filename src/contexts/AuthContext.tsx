import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, AuthUser } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
    user: AuthUser | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isMod: boolean;
    canAccessAdmin: boolean;
    canManageUsers: boolean;
    isGuest: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    continueAsGuest: () => void;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // Check localStorage for persisted guest choice
    const [isGuest, setIsGuest] = useState(() => {
        return localStorage.getItem('tft_guest_mode') === 'true';
    });

    // Fetch user profile from public.users table
    const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<AuthUser | null> => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', supabaseUser.id)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
                // Return fallback user with default role if profile fetch fails
                return {
                    id: supabaseUser.id,
                    email: supabaseUser.email || '',
                    display_name: supabaseUser.user_metadata?.display_name || supabaseUser.email?.split('@')[0] || null,
                    role: 'user'
                };
            }

            return {
                id: data.id,
                email: data.email,
                display_name: data.display_name,
                role: data.role
            };
        } catch (error) {
            console.error('Exception fetching user profile:', error);
            // Return fallback user
            return {
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                display_name: supabaseUser.user_metadata?.display_name || null,
                role: 'user'
            };
        }
    };

    // Initialize auth state
    // Using onAuthStateChange as primary mechanism (Supabase recommended approach)
    // It fires immediately with current session when subscribed
    useEffect(() => {
        let isMounted = true;
        let loadingTimeout: NodeJS.Timeout;

        // Subscribe to auth changes first - this is the primary session restoration mechanism
        // onAuthStateChange fires immediately with current session
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Clear any pending timeout since we got a response
            if (loadingTimeout) clearTimeout(loadingTimeout);

            if (!isMounted) return;

            // If token refresh failed (stale refresh token), clear local session data
            if (event === 'TOKEN_REFRESHED' && !session) {
                await supabase.auth.signOut({ scope: 'local' });
                return;
            }

            setSession(session);

            if (session?.user) {
                // Set basic user info immediately from session to enable authentication
                // This ensures session persistence works even if profile fetch fails
                const basicUser: AuthUser = {
                    id: session.user.id,
                    email: session.user.email || '',
                    display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || null,
                    role: 'user' // Default role, will be updated from profile
                };

                setUser(basicUser);
                setIsGuest(false);
                setIsLoading(false);

                // Fetch full profile in background (non-blocking)
                fetchUserProfile(session.user)
                    .then(profile => {
                        if (isMounted && profile) {
                            setUser(profile); // Update with full profile including role
                        }
                    })
                    .catch(err => {
                        console.warn('[Auth] Profile fetch failed, using basic user:', err);
                        // Keep basic user, no action needed
                    });
            } else {
                setUser(null);
                // Don't auto-set guest - preserve explicit user choice from localStorage

                if (isMounted) {
                    setIsLoading(false);
                }
            }
        });

        // Fallback timeout in case onAuthStateChange doesn't fire
        loadingTimeout = setTimeout(() => {
            if (isMounted) {
                console.warn('[Auth] Timeout - forcing loading complete');
                setIsLoading(false);
            }
        }, 5000);

        return () => {
            isMounted = false;
            if (loadingTimeout) clearTimeout(loadingTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        if (data.user) {
            const profile = await fetchUserProfile(data.user);
            setUser(profile);
        }
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName
                }
            }
        });

        if (error) throw error;

        // Note: User will need to confirm email before being able to sign in
        // You can customize this in Supabase dashboard settings

        // If email confirmation is disabled, fetch profile immediately
        if (data.user && data.session) {
            const profile = await fetchUserProfile(data.user);
            setUser(profile);
        }
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) throw error;
    };

    const continueAsGuest = () => {
        localStorage.setItem('tft_guest_mode', 'true');
        setIsGuest(true);
        setIsLoading(false);
    };

    const signOut = async () => {
        if (!isGuest) {
            // Use scope: 'local' to clear tokens locally even if server rejects stale token
            try {
                await supabase.auth.signOut();
            } catch {
                await supabase.auth.signOut({ scope: 'local' });
            }
        }
        setUser(null);
        setSession(null);
        // Always fall back to guest mode so the app keeps working
        setIsGuest(true);
    };

    const refreshUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const profile = await fetchUserProfile(session.user);
            setUser(profile);
        }
    };

    const value: AuthContextType = {
        user,
        session,
        isLoading,
        isAuthenticated: !!user || isGuest,
        isAdmin: user?.role === 'admin',
        isMod: user?.role === 'mod',
        canAccessAdmin: user?.role === 'admin' || user?.role === 'mod',
        canManageUsers: user?.role === 'admin',
        isGuest,
        signIn,
        signUp,
        signInWithGoogle,
        continueAsGuest,
        signOut,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
