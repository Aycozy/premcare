import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../stores/authStore';
import { ProfileSkeleton } from '../../../components/ui';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../constants/theme';

export default function PatientProfile() {
    const { profile, signOut } = useAuthStore();
    const router = useRouter();

    const handleSignOut = () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm('Are you sure you want to sign out?');
            if (confirmed) {
                signOut();
            }
        } else {
            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: signOut },
            ]);
        }
    };

    const menuItems = [
        { icon: 'person-outline' as const, label: 'Edit Profile', onPress: () => router.push('/(patient)/edit-profile' as any) },
        { icon: 'location-outline' as const, label: 'My Addresses', onPress: () => router.push('/(patient)/edit-profile' as any) },
        { icon: 'document-text-outline' as const, label: 'Medical History', onPress: () => router.push('/(patient)/edit-profile' as any) },
        { icon: 'shield-checkmark-outline' as const, label: 'Insurance/HMO', onPress: () => { } },
        { icon: 'notifications-outline' as const, label: 'Notifications', onPress: () => router.push('/(patient)/notifications' as any) },
        { icon: 'help-circle-outline' as const, label: 'Help & Support', onPress: () => { } },
        { icon: 'information-circle-outline' as const, label: 'About Premcare', onPress: () => { } },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {!profile ? (
                    <ProfileSkeleton />
                ) : (<>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {profile?.full_name?.charAt(0)?.toUpperCase() || 'P'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.profileName}>{profile?.full_name?.split(' ')[0] || 'Patient'}</Text>
                    <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>Patient</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.menuItem,
                                index < menuItems.length - 1 && styles.menuItemBorder,
                            ]}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuLeft}>
                                <View style={styles.menuIconBg}>
                                    <Ionicons name={item.icon} size={20} color={colors.primary} />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sign Out */}
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={20} color={colors.error} />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={styles.version}>Premcare Mobile v1.0.0</Text>
                </>)}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.bgDark,
    },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: spacing['5xl'],
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: spacing['3xl'],
    },
    avatarContainer: {
        marginBottom: spacing.lg,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    profileName: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    profileEmail: {
        fontSize: fontSize.base,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    profilePhone: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    roleBadge: {
        marginTop: spacing.md,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(10, 104, 71, 0.15)',
    },
    roleText: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.semibold,
    },
    menuContainer: {
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        marginBottom: spacing['2xl'],
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    menuIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(10, 104, 71, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
    },
    signOutText: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.error,
    },
    version: {
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: fontSize.xs,
        marginTop: spacing.xl,
    },
});
