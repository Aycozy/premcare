import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../constants/theme';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);
    const { resetPassword, isLoading } = useAuthStore();
    const router = useRouter();

    const handleReset = async () => {
        setError('');
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        const { error: resetError } = await resetPassword(email.trim().toLowerCase());
        if (resetError) {
            setError(resetError);
        } else {
            setSent(true);
        }
    };

    if (sent) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.successContainer}>
                        <View style={styles.successIcon}>
                            <Ionicons name="mail-outline" size={48} color={colors.primary} />
                        </View>
                        <Text style={styles.successTitle}>Check Your Email</Text>
                        <Text style={styles.successSubtitle}>
                            We've sent a password reset link to
                        </Text>
                        <Text style={styles.emailHighlight}>{email}</Text>
                        <Text style={styles.successHint}>
                            Click the link in the email to reset your password. If you don't see it, check your spam folder.
                        </Text>

                        <Button
                            title="Back to Login"
                            onPress={() => router.replace('/(auth)/login')}
                            variant="primary"
                            fullWidth
                            size="lg"
                            style={{ marginTop: spacing['3xl'] }}
                        />

                        <TouchableOpacity
                            style={styles.resendBtn}
                            onPress={() => {
                                setSent(false);
                                handleReset();
                            }}
                        >
                            <Text style={styles.resendText}>
                                Didn't receive it? <Text style={{ color: colors.primary }}>Resend</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backBtn}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="key-outline" size={36} color={colors.primary} />
                        </View>
                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            No worries! Enter the email address linked to your account and we'll send you a reset link.
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Email Address"
                            placeholder="you@example.com"
                            icon="mail-outline"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setError('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            error={error}
                        />

                        <Button
                            title="Send Reset Link"
                            onPress={handleReset}
                            loading={isLoading}
                            fullWidth
                            size="lg"
                            variant="primary"
                        />
                    </View>

                    {/* Footer */}
                    <TouchableOpacity
                        style={styles.footerLink}
                        onPress={() => router.replace('/(auth)/login')}
                    >
                        <Ionicons name="arrow-back-outline" size={16} color={colors.primary} />
                        <Text style={styles.footerLinkText}>Back to Login</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bgDark },
    keyboardView: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing['2xl'],
        paddingTop: spacing['2xl'],
        paddingBottom: spacing['3xl'],
        justifyContent: 'center',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: colors.bgCard, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl,
        alignSelf: 'flex-start',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['4xl'],
    },
    iconCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(10, 104, 71, 0.12)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    title: {
        fontSize: fontSize['2xl'], fontWeight: fontWeight.bold,
        color: colors.textPrimary, marginBottom: spacing.md,
    },
    subtitle: {
        fontSize: fontSize.base, color: colors.textSecondary,
        textAlign: 'center', lineHeight: 24, paddingHorizontal: spacing.xl,
    },
    form: { marginBottom: spacing['2xl'] },
    footerLink: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: spacing.sm,
    },
    footerLinkText: {
        color: colors.primary, fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
    },
    // Success state
    successContainer: {
        alignItems: 'center', paddingVertical: spacing['4xl'],
    },
    successIcon: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: 'rgba(10, 104, 71, 0.12)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    successTitle: {
        fontSize: fontSize['2xl'], fontWeight: fontWeight.bold,
        color: colors.textPrimary, marginBottom: spacing.md,
    },
    successSubtitle: {
        fontSize: fontSize.base, color: colors.textSecondary,
    },
    emailHighlight: {
        fontSize: fontSize.md, fontWeight: fontWeight.semibold,
        color: colors.primary, marginTop: spacing.xs, marginBottom: spacing.xl,
    },
    successHint: {
        fontSize: fontSize.sm, color: colors.textMuted,
        textAlign: 'center', lineHeight: 22, paddingHorizontal: spacing.xl,
    },
    resendBtn: {
        marginTop: spacing['2xl'], paddingVertical: spacing.md,
    },
    resendText: {
        fontSize: fontSize.sm, color: colors.textSecondary,
    },
});
