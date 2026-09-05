import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, toast } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../constants/theme';

export default function UpdatePasswordScreen() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { updatePassword, clearPasswordRecovery, isLoading } = useAuthStore();
    const router = useRouter();

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdate = async () => {
        if (!validate()) return;

        const { error } = await updatePassword(password);
        if (error) {
            toast.error('Update Failed', error);
        } else {
            toast.success('Password Updated! 🔐', 'Your password has been changed. Please sign in with your new password.');
            clearPasswordRecovery(); // clears flag + signs out
            router.replace('/(auth)/login');
        }
    };

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
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="lock-closed-outline" size={36} color={colors.primary} />
                        </View>
                        <Text style={styles.title}>Set New Password</Text>
                        <Text style={styles.subtitle}>
                            Create a strong new password for your Premcare account.
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="New Password"
                            placeholder="Minimum 8 characters"
                            icon="lock-closed-outline"
                            isPassword
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setErrors(prev => ({ ...prev, password: '' }));
                            }}
                            error={errors.password}
                        />

                        <Input
                            label="Confirm New Password"
                            placeholder="Re-enter your new password"
                            icon="lock-closed-outline"
                            isPassword
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                setErrors(prev => ({ ...prev, confirmPassword: '' }));
                            }}
                            error={errors.confirmPassword}
                        />

                        {/* Password strength hints */}
                        <View style={styles.hints}>
                            <PasswordHint met={password.length >= 8} label="At least 8 characters" />
                            <PasswordHint met={/[A-Z]/.test(password)} label="One uppercase letter" />
                            <PasswordHint met={/[0-9]/.test(password)} label="One number" />
                        </View>

                        <Button
                            title="Update Password"
                            onPress={handleUpdate}
                            loading={isLoading}
                            fullWidth
                            size="lg"
                            variant="primary"
                        />
                    </View>

                    {/* Back to login */}
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

function PasswordHint({ met, label }: { met: boolean; label: string }) {
    return (
        <View style={hintStyles.row}>
            <Ionicons
                name={met ? 'checkmark-circle' : 'ellipse-outline'}
                size={14}
                color={met ? colors.success : colors.textMuted}
            />
            <Text style={[hintStyles.label, met && hintStyles.labelMet]}>{label}</Text>
        </View>
    );
}

const hintStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    label: { fontSize: fontSize.xs, color: colors.textMuted },
    labelMet: { color: colors.success },
});

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bgDark },
    keyboardView: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing['2xl'],
        paddingTop: spacing['3xl'],
        paddingBottom: spacing['3xl'],
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['3xl'],
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(10, 104, 71, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing['2xl'],
        borderWidth: 1,
        borderColor: 'rgba(10, 104, 71, 0.25)',
    },
    title: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    subtitle: {
        fontSize: fontSize.base,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: spacing.xl,
    },
    form: { marginBottom: spacing['2xl'] },
    hints: {
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.xl,
        gap: 4,
    },
    footerLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    footerLinkText: {
        color: colors.primary,
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
    },
});
