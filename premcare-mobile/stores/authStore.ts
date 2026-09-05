import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../lib/types';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    isInitialized: boolean;
    isPasswordRecovery: boolean;

    // Actions
    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string, fullName: string, phone: string, role: UserRole) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
    resetPassword: (email: string) => Promise<{ error: string | null }>;
    updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
    clearPasswordRecovery: () => void;
    setPasswordRecovery: (val: boolean) => void;
}

// Module-level guard: prevents double-initialization in React Strict Mode
let _initStarted = false;
// Stored unsubscribe function so we can clean up before re-registering on HMR
let _unsubscribeAuth: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    user: null,
    profile: null,
    isLoading: false,
    isInitialized: false,
    isPasswordRecovery: false,

    initialize: async () => {
        // Guard against re-entrant / double calls (Strict Mode, etc.)
        // IMPORTANT: In development HMR, module-level vars persist but Zustand state resets.
        // If isInitialized is false but _initStarted is true, the state was reset — reinitialize.
        if (_initStarted && get().isInitialized) {
            console.log('[Auth] initialize() called again — already started and initialized, skipping');
            return;
        }
        if (_initStarted && !get().isInitialized) {
            console.log('[Auth] initialize() — HMR detected (state reset, flag persisted). Reinitializing.');
            // Clean up the stale listener to prevent duplicate event handling
            if (_unsubscribeAuth) {
                _unsubscribeAuth();
                _unsubscribeAuth = null;
                console.log('[Auth] Previous onAuthStateChange listener removed.');
            }
            _initStarted = false;
        }
        _initStarted = true;
        console.log('[Auth] initialize() — starting');

        try {
            // Register the listener FIRST so we never miss an event
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('[Auth] onAuthStateChange event:', event, '| user:', session?.user?.email ?? 'none');

                if (event === 'INITIAL_SESSION') {
                    // Supabase fires this once on startup with whatever session exists.
                    // We rely on this instead of getSession() to avoid double fetchProfile.
                    if (session) {
                        set({ session, user: session.user });
                        // Don't fetch profile if we are already in password recovery mode
                        // (e.g. HMR re-init while the user is mid-recovery flow)
                        if (!get().isPasswordRecovery) {
                            console.log('[Auth] INITIAL_SESSION — fetching profile');
                            await get().fetchProfile();
                        } else {
                            console.log('[Auth] INITIAL_SESSION — skipping fetchProfile (recovery mode active)');
                        }
                    }
                    set({ isInitialized: true });
                    console.log('[Auth] isInitialized = true');
                    return;
                }

                if (event === 'TOKEN_REFRESHED') {
                    set({ session, user: session?.user ?? null });
                    return;
                }

                if (event === 'SIGNED_OUT') {
                    set({ session: null, user: null, profile: null, isPasswordRecovery: false });
                    return;
                }

                if (event === 'PASSWORD_RECOVERY') {
                    // Fired only with implicit/hash token flow (legacy Supabase)
                    // For PKCE (code= flow), we handle isPasswordRecovery manually in callback.tsx
                    console.log('[Auth] PASSWORD_RECOVERY event — setting recovery flag');
                    set({ session, user: session?.user ?? null, isPasswordRecovery: true });
                    return;
                }

                if (event === 'SIGNED_IN') {
                    const isRecovery = get().isPasswordRecovery;
                    console.log('[Auth] SIGNED_IN event | isPasswordRecovery:', isRecovery);
                    // If we are already in password recovery mode, do NOT fetch profile
                    // or clear the flag — that would bounce the user to the dashboard.
                    if (isRecovery) {
                        set({ session, user: session?.user ?? null });
                        console.log('[Auth] SIGNED_IN during recovery — skipping fetchProfile, staying on update-password');
                        return;
                    }
                    set({ session, user: session?.user ?? null });
                    if (session?.user) {
                        await get().fetchProfile();
                    }
                    return;
                }

                if (event === 'USER_UPDATED') {
                    console.log('[Auth] USER_UPDATED event');
                    set({ session, user: session?.user ?? null });
                    return;
                }

                // Default: update session
                console.log('[Auth] Unhandled event:', event);
                set({ session, user: session?.user ?? null });
                if (session?.user) {
                    await get().fetchProfile();
                } else {
                    set({ profile: null });
                }
            });
            // Store the unsubscribe function so we can clean up on HMR re-init
            _unsubscribeAuth = () => subscription.unsubscribe();

        } catch (error) {
            console.error('[Auth] Auth initialization error:', error);
            set({ isInitialized: true });
        }
    },

    signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                set({ isLoading: false });
                return { error: error.message };
            }
            set({ isLoading: false });
            return { error: null };
        } catch (err: any) {
            set({ isLoading: false });
            return { error: err.message || 'An unexpected error occurred' };
        }
    },

    signUp: async (email: string, password: string, fullName: string, phone: string, role: UserRole) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName, phone, role },
                    emailRedirectTo: `${window?.location?.origin || 'https://premcare.com'}/(auth)/login`,
                },
            });

            if (error) {
                set({ isLoading: false });
                return { error: error.message };
            }

            // Supabase returns an empty identities array if the user already exists 
            // and email confirmations are enabled.
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                set({ isLoading: false });
                return { error: 'An account with this email already exists' };
            }

            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        email,
                        full_name: fullName,
                        phone,
                        role,
                    });

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                }
            }

            set({ isLoading: false });
            return { error: null };
        } catch (err: any) {
            set({ isLoading: false });
            return { error: err.message || 'An unexpected error occurred' };
        }
    },

    signOut: async () => {
        try {
            set({ isLoading: true });
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            set({ session: null, user: null, profile: null, isLoading: false });
        }
    },

    fetchProfile: async () => {
        const user = get().user;
        if (!user) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (error) {
            console.error('Fetch profile error:', error);
            return;
        }

        if (!data) {
            console.warn('No profile found for user:', user.id);
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email || '',
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                    phone: user.user_metadata?.phone || '',
                    role: user.user_metadata?.role || 'patient',
                })
                .select()
                .single();

            if (createError) {
                console.error('Auto-create profile error:', createError);
                return;
            }
            set({ profile: newProfile as Profile });
            return;
        }

        set({ profile: data as Profile });
    },

    updateProfile: async (updates: Partial<Profile>) => {
        const user = get().user;
        if (!user) return { error: 'Not authenticated' };

        const { error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', user.id);

        if (error) {
            return { error: error.message };
        }

        await get().fetchProfile();
        return { error: null };
    },

    resetPassword: async (email: string) => {
        set({ isLoading: true });
        try {
            const redirectUrl = typeof window !== 'undefined'
                ? `${window.location.origin}/callback`
                : 'premcare://callback';

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });
            set({ isLoading: false });
            if (error) return { error: error.message };
            return { error: null };
        } catch (err: any) {
            set({ isLoading: false });
            return { error: err.message || 'An unexpected error occurred' };
        }
    },

    updatePassword: async (newPassword: string) => {
        set({ isLoading: true });
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            set({ isLoading: false });
            if (error) return { error: error.message };
            return { error: null };
        } catch (err: any) {
            set({ isLoading: false });
            return { error: err.message || 'An unexpected error occurred' };
        }
    },

    clearPasswordRecovery: () => {
        set({ isPasswordRecovery: false });
        supabase.auth.signOut();
    },

    setPasswordRecovery: (val: boolean) => {
        set({ isPasswordRecovery: val });
    },
}));
