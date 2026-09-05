import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { colors, fontSize, fontWeight, spacing } from '../../constants/theme';

// Module-level flag: survives React Strict Mode remounts within a single page load
let exchangeInProgress = false;

export default function AuthCallbackScreen() {
    const router = useRouter();
    // PKCE flow puts the code in query params: /callback?code=xxx
    const params = useLocalSearchParams<{ code?: string }>();
    const code = params.code as string | undefined;
    const isInitialized = useAuthStore((s) => s.isInitialized);
    const [status, setStatus] = useState<'loading' | 'error'>('loading');
    // Per-instance ref: prevents double-execution in Strict Mode
    const hasStartedRef = useRef(false);

    useEffect(() => {
        if (!isInitialized) return;
        if (hasStartedRef.current) return;
        if (exchangeInProgress) return;

        hasStartedRef.current = true;
        exchangeInProgress = true;

        processCallback();

        return () => {
            // Intentionally not resetting — run once per page load only
        };
    }, [isInitialized, code]);

    /**
     * Read implicit-flow hash tokens from window.location.hash.
     *
     * Supabase implicit flow sends the reset link as:
     *   http://localhost:8081/callback#access_token=xxx&refresh_token=yyy&type=recovery
     *
     * Expo Router only exposes query params (?foo=bar) via useLocalSearchParams.
     * Hash fragments (#...) are stripped from the router params, so we must read
     * window.location.hash directly to retrieve them.
     */
    const readHashTokens = (): {
        accessToken: string;
        refreshToken: string;
        type: string;
    } | null => {
        if (typeof window === 'undefined') return null;
        const hash = window.location.hash;
        if (!hash || hash.length <= 1) return null;
        const p = new URLSearchParams(hash.replace(/^#/, ''));
        const accessToken = p.get('access_token');
        const refreshToken = p.get('refresh_token');
        const type = p.get('type') ?? '';
        if (accessToken && refreshToken) {
            return { accessToken, refreshToken, type };
        }
        return null;
    };

    const processCallback = async () => {
        try {
            // ── PKCE Flow (?code= in URL query params) ──────────────────────────
            // Supabase sends this when your project's Auth > Email is set to "PKCE"
            if (code) {
                console.log('[Callback] PKCE flow detected — exchanging code');

                // Set recovery flag BEFORE exchange so SIGNED_IN handler skips fetchProfile.
                // fetchProfile being called sets `profile`, which makes the layout guard
                // redirect to the dashboard instead of staying on update-password.
                useAuthStore.getState().setPasswordRecovery(true);

                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) throw error;

                console.log('[Callback] PKCE exchange complete — layout guard will route to update-password');
                return;
            }

            // ── Implicit Flow (#access_token= in URL hash fragment) ──────────────
            // Supabase sends this when your project's Auth > Email is set to "Implicit"
            // (the Supabase default for older projects).
            // Expo Router strips the hash from params, so we read window.location.hash.
            const hashTokens = readHashTokens();

            if (hashTokens) {
                console.log('[Callback] Implicit flow detected | type:', hashTokens.type);

                // Remove hash from URL immediately to prevent token reuse on refresh
                window.history.replaceState(null, '', window.location.pathname);

                if (hashTokens.type === 'recovery') {
                    // Password reset link
                    useAuthStore.getState().setPasswordRecovery(true);

                    const { error } = await supabase.auth.setSession({
                        access_token: hashTokens.accessToken,
                        refresh_token: hashTokens.refreshToken,
                    });
                    if (error) throw error;

                    console.log('[Callback] Implicit recovery session set — layout guard will route to update-password');
                } else {
                    // Other implicit token (email confirmation, magic link, etc.)
                    // No recovery mode needed — let the normal SIGNED_IN flow handle it.
                    const { error } = await supabase.auth.setSession({
                        access_token: hashTokens.accessToken,
                        refresh_token: hashTokens.refreshToken,
                    });
                    if (error) throw error;
                    console.log('[Callback] Implicit session set (non-recovery) — layout guard will route to dashboard');
                }

                return;
            }

            // ── No code and no hash tokens ───────────────────────────────────────
            // Link is invalid, expired, or already used
            console.warn('[Callback] No PKCE code and no implicit hash tokens found — showing error');
            useAuthStore.getState().setPasswordRecovery(false);
            setStatus('error');

        } catch (err: any) {
            console.error('[Callback] Auth error:', err.message ?? err);
            useAuthStore.getState().setPasswordRecovery(false);
            setStatus('error');
        } finally {
            exchangeInProgress = false;
        }
    };

    if (status === 'error') {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.errorCircle}>
                        <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
                    </View>
                    <Text style={styles.title}>Link Expired</Text>
                    <Text style={styles.subtitle}>
                        This password reset link has expired or already been used.{'\n'}
                        Please request a new one.
                    </Text>
                    <Text
                        style={styles.link}
                        onPress={() => {
                            exchangeInProgress = false;
                            router.replace('/(auth)/forgot-password');
                        }}
                    >
                        Request a new link →
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Verifying your reset link…</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bgDark },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing['2xl'],
    },
    errorCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    subtitle: {
        fontSize: fontSize.base,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing['2xl'],
    },
    link: {
        color: colors.primary,
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
    },
    loadingText: {
        marginTop: spacing.xl,
        fontSize: fontSize.base,
        color: colors.textSecondary,
    },
});
