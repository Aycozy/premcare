import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Alert,
    Linking,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, toast } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../constants/theme';

export default function ConfirmEmailScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const router = useRouter();
    const { signIn } = useAuthStore();
    const [canResend, setCanResend] = useState(false);
    const [countdown, setCountdown] = useState(60);

    // Animations
    const envelopeAnim = useRef(new Animated.Value(0)).current;
    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(30)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Entrance animations
        Animated.sequence([
            Animated.spring(envelopeAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(fadeIn, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(slideUp, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Pulse animation for the envelope icon
        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.08,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        );
        pulseLoop.start();

        return () => pulseLoop.stop();
    }, []);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) {
            setCanResend(true);
            return;
        }
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResendEmail = async () => {
        if (!email) return;

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) {
                toast.error('Failed to resend', error.message);
            } else {
                toast.success('Email Resent', 'A new verification link has been sent to your email.');
            }
        } catch (err: any) {
            toast.error('Error', err.message || 'Something went wrong. Please try again.');
        }

        setCanResend(false);
        setCountdown(60);
    };

    const handleOpenEmailApp = () => {
        Linking.openURL('mailto:');
    };

    const handleGoToLogin = () => {
        router.replace('/(auth)/login');
    };

    const maskedEmail = email
        ? email.replace(/(.{2})(.*)(@.*)/, (_, first, middle, domain) =>
            `${first}${'•'.repeat(Math.min(middle.length, 6))}${domain}`
        )
        : 'your email';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={handleGoToLogin}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>

                <View style={styles.content}>
                    {/* Animated Envelope Icon */}
                    <Animated.View
                        style={[
                            styles.iconContainer,
                            {
                                transform: [
                                    { scale: Animated.multiply(envelopeAnim, pulseAnim) },
                                ],
                                opacity: envelopeAnim,
                            },
                        ]}
                    >
                        <View style={styles.iconOuter}>
                            <View style={styles.iconInner}>
                                <Ionicons name="mail-outline" size={48} color={colors.textPrimary} />
                            </View>
                        </View>

                        {/* Decorative dots */}
                        <View style={[styles.dot, styles.dot1]} />
                        <View style={[styles.dot, styles.dot2]} />
                        <View style={[styles.dot, styles.dot3]} />
                    </Animated.View>

                    {/* Text Content */}
                    <Animated.View
                        style={[
                            styles.textContent,
                            {
                                opacity: fadeIn,
                                transform: [{ translateY: slideUp }],
                            },
                        ]}
                    >
                        <Text style={styles.title}>Check Your Email</Text>
                        <Text style={styles.subtitle}>
                            We've sent a verification link to
                        </Text>
                        <View style={styles.emailBadge}>
                            <Ionicons name="mail" size={16} color={colors.primary} />
                            <Text style={styles.emailText}>{maskedEmail}</Text>
                        </View>
                        <Text style={styles.description}>
                            Click the link in the email to verify your account. Once verified, you can sign in and start booking appointments.
                        </Text>
                    </Animated.View>

                    {/* Actions */}
                    <Animated.View
                        style={[
                            styles.actions,
                            {
                                opacity: fadeIn,
                                transform: [{ translateY: slideUp }],
                            },
                        ]}
                    >
                        <Button
                            title="Open Email App"
                            onPress={handleOpenEmailApp}
                            variant="primary"
                            fullWidth
                            size="lg"
                            icon={<Ionicons name="open-outline" size={18} color={colors.textPrimary} />}
                        />

                        <Button
                            title="I've Verified — Sign In"
                            onPress={handleGoToLogin}
                            variant="secondary"
                            fullWidth
                            size="lg"
                            icon={<Ionicons name="log-in-outline" size={18} color={colors.textPrimary} />}
                        />

                        {/* Resend */}
                        <TouchableOpacity
                            style={[styles.resendButton, !canResend && styles.resendDisabled]}
                            onPress={canResend ? handleResendEmail : undefined}
                            disabled={!canResend}
                        >
                            <Ionicons
                                name="refresh-outline"
                                size={16}
                                color={canResend ? colors.primary : colors.textMuted}
                            />
                            <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
                                {canResend
                                    ? 'Resend verification email'
                                    : `Resend in ${countdown}s`}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Help Section */}
                    <Animated.View style={[styles.helpSection, { opacity: fadeIn }]}>
                        <View style={styles.helpDivider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Didn't receive it?</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.helpTips}>
                            <View style={styles.tipRow}>
                                <Ionicons name="folder-outline" size={16} color={colors.textMuted} />
                                <Text style={styles.tipText}>Check your spam or junk folder</Text>
                            </View>
                            <View style={styles.tipRow}>
                                <Ionicons name="at-outline" size={16} color={colors.textMuted} />
                                <Text style={styles.tipText}>Verify you entered the correct email</Text>
                            </View>
                            <View style={styles.tipRow}>
                                <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                                <Text style={styles.tipText}>The email may take a few minutes to arrive</Text>
                            </View>
                        </View>
                    </Animated.View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.bgDark,
    },
    container: {
        flex: 1,
        paddingHorizontal: spacing['2xl'],
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.bgCard,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.md,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: spacing['4xl'],
    },
    iconContainer: {
        marginBottom: spacing['3xl'],
        position: 'relative',
    },
    iconOuter: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(10, 104, 71, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconInner: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    dot: {
        position: 'absolute',
        borderRadius: 50,
        backgroundColor: colors.primary,
    },
    dot1: {
        width: 8,
        height: 8,
        top: 4,
        right: 8,
        opacity: 0.6,
    },
    dot2: {
        width: 6,
        height: 6,
        bottom: 8,
        left: 2,
        opacity: 0.4,
    },
    dot3: {
        width: 10,
        height: 10,
        top: 20,
        left: -4,
        opacity: 0.3,
    },
    textContent: {
        alignItems: 'center',
        marginBottom: spacing['3xl'],
    },
    title: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: fontSize.base,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    emailBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(10, 104, 71, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(10, 104, 71, 0.25)',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full,
        marginBottom: spacing.xl,
    },
    emailText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.primary,
    },
    description: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 320,
    },
    actions: {
        width: '100%',
        gap: spacing.md,
        marginBottom: spacing['3xl'],
    },
    resendButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.md,
    },
    resendDisabled: {
        opacity: 0.6,
    },
    resendText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.primary,
    },
    resendTextDisabled: {
        color: colors.textMuted,
    },
    helpSection: {
        width: '100%',
    },
    helpDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
        gap: spacing.md,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.divider,
    },
    dividerText: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        fontWeight: fontWeight.medium,
    },
    helpTips: {
        gap: spacing.md,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    tipText: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
});
