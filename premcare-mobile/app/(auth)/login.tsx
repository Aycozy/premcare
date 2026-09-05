import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
    TouchableOpacity,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, toast } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../constants/theme';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const { signIn, isLoading } = useAuthStore();
    const router = useRouter();

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email address';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        const { error } = await signIn(email.trim().toLowerCase(), password);
        if (error) {
            toast.error('Login Failed', error);
        } else {
            toast.success('Welcome back!');
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
                    {/* Logo & Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <Text style={styles.logoText}>P</Text>
                            </View>
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>
                            Sign in to your Premcare account
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Email Address"
                            placeholder="you@example.com"
                            icon="mail-outline"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            icon="lock-closed-outline"
                            isPassword
                            value={password}
                            onChangeText={setPassword}
                            error={errors.password}
                        />

                        <Link href="/(auth)/forgot-password" asChild>
                            <TouchableOpacity
                                style={{ alignSelf: 'flex-end', marginBottom: spacing.xl, marginTop: -spacing.sm }}
                            >
                                <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>
                        </Link>

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={isLoading}
                            fullWidth
                            size="lg"
                            variant="primary"
                        />
                    </View>

                    {/* Footer Links */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Don't have an account?{' '}
                        </Text>
                        <Link href="/(auth)/register" style={styles.link}>
                            Create Account
                        </Link>
                    </View>

                    {/* Clinic Info */}
                    <View style={styles.clinicInfo}>
                        <Text style={styles.clinicText}>Premcare Physiotherapy Clinic</Text>
                        <Text style={styles.clinicSubtext}>Expert care, wherever you are</Text>
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
        paddingTop: spacing['4xl'],
        paddingBottom: spacing['3xl'],
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['4xl'],
    },
    logoContainer: {
        marginBottom: spacing['2xl'],
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    logoText: {
        fontSize: 36,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    title: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: fontSize.base,
        color: colors.textSecondary,
    },
    form: {
        marginBottom: spacing['3xl'],
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing['3xl'],
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
    clinicInfo: {
        alignItems: 'center',
        paddingTop: spacing['2xl'],
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    clinicText: {
        color: colors.textMuted,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    clinicSubtext: {
        color: colors.textMuted,
        fontSize: fontSize.xs,
        marginTop: spacing.xs,
    },
});
