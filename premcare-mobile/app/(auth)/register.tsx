import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, toast } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../constants/theme';
import type { UserRole } from '../../lib/types';

export default function RegisterScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole>('patient');
    const [clinicianCode, setClinicianCode] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { signUp, isLoading } = useAuthStore();
    const router = useRouter();

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email address';
        if (!phone.trim()) newErrors.phone = 'Phone number is required';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Minimum 6 characters';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        
        if (role === 'clinician') {
            const CLINICIAN_ACCESS_CODE = 'PREMCARE2026';
            if (!clinicianCode) newErrors.clinicianCode = 'Clinician code is required';
            else if (clinicianCode !== CLINICIAN_ACCESS_CODE) newErrors.clinicianCode = 'Invalid clinician code';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        const { error } = await signUp(
            email.trim().toLowerCase(),
            password,
            fullName.trim(),
            phone.trim(),
            role
        );

        if (error) {
            toast.error('Registration Failed', error);
        } else {
            router.replace({
                pathname: '/(auth)/confirm-email',
                params: { email: email.trim().toLowerCase() },
            });
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
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>P</Text>
                        </View>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join Premcare Physiotherapy</Text>
                    </View>

                    {/* Role Selector */}
                    <View style={styles.roleContainer}>
                        <Text style={styles.roleLabel}>I am a:</Text>
                        <View style={styles.roleButtons}>
                            <TouchableOpacity
                                style={[styles.roleButton, role === 'patient' && styles.roleButtonActive]}
                                onPress={() => setRole('patient')}
                            >
                                <Text style={[styles.roleButtonText, role === 'patient' && styles.roleButtonTextActive]}>
                                    🏥 Patient
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.roleButton, role === 'clinician' && styles.roleButtonActive]}
                                onPress={() => setRole('clinician')}
                            >
                                <Text style={[styles.roleButtonText, role === 'clinician' && styles.roleButtonTextActive]}>
                                    🧑‍⚕️ Clinician
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            icon="person-outline"
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                            error={errors.fullName}
                        />

                        <Input
                            label="Email Address"
                            placeholder="you@example.com"
                            icon="mail-outline"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                        />

                        <Input
                            label="Phone Number"
                            placeholder="+234 802 333 1387"
                            icon="call-outline"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            error={errors.phone}
                        />

                        <Input
                            label="Password"
                            placeholder="Minimum 6 characters"
                            icon="lock-closed-outline"
                            isPassword
                            value={password}
                            onChangeText={setPassword}
                            error={errors.password}
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="Re-enter your password"
                            icon="lock-closed-outline"
                            isPassword
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            error={errors.confirmPassword}
                        />

                        {role === 'clinician' && (
                            <Input
                                label="Clinician Registration Code"
                                placeholder="Enter your access code"
                                icon="key-outline"
                                value={clinicianCode}
                                onChangeText={setClinicianCode}
                                error={errors.clinicianCode}
                            />
                        )}

                        <Button
                            title="Create Account"
                            onPress={handleRegister}
                            loading={isLoading}
                            fullWidth
                            size="lg"
                            variant="primary"
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/(auth)/login" style={styles.link}>
                            Sign In
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.bgDark,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing['2xl'],
        paddingTop: spacing['3xl'],
        paddingBottom: spacing['3xl'],
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['3xl'],
    },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    logoText: {
        fontSize: 28,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    title: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.base,
        color: colors.textSecondary,
    },
    roleContainer: {
        marginBottom: spacing['2xl'],
    },
    roleLabel: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        marginBottom: spacing.sm,
    },
    roleButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    roleButton: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.bgInput,
        alignItems: 'center',
    },
    roleButtonActive: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(10, 104, 71, 0.15)',
    },
    roleButtonText: {
        color: colors.textSecondary,
        fontSize: fontSize.base,
        fontWeight: fontWeight.medium,
    },
    roleButtonTextActive: {
        color: colors.primary,
        fontWeight: fontWeight.semibold,
    },
    form: {
        marginBottom: spacing['2xl'],
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: fontSize.base,
    },
    link: {
        color: colors.primary,
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
    },
});
