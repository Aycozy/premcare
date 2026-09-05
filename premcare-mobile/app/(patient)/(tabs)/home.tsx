import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../stores/authStore';
import { useAppointmentStore } from '../../../stores/appointmentStore';
import { useNotificationStore } from '../../../stores/notificationStore';
import { Card, DashboardSkeleton } from '../../../components/ui';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../../constants/theme';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { SERVICE_LABELS } from '../../../lib/types';

export default function PatientHome() {
    const { profile } = useAuthStore();
    const { appointments, dashboardStats, fetchAppointments, fetchDashboardStats, isLoading } = useAppointmentStore();
    const { unreadCount, fetchNotifications, subscribeToNotifications } = useNotificationStore();
    const router = useRouter();

    const loadData = async () => {
        if (!profile) return;
        await Promise.all([
            fetchAppointments(profile.id, 'patient'),
            fetchDashboardStats(profile.id, 'patient'),
            fetchNotifications(profile.id),
        ]);
    };

    useEffect(() => {
        loadData();
        if (profile) {
            const unsubscribe = subscribeToNotifications(profile.id);
            return unsubscribe;
        }
    }, [profile]);

    const upcomingAppointments = appointments
        .filter(a => ['pending', 'confirmed'].includes(a.status))
        .slice(0, 3);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const formatAppointmentDate = (dateStr: string) => {
        const date = parseISO(dateStr);
        if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
        if (isTomorrow(date)) return `Tomorrow, ${format(date, 'h:mm a')}`;
        return format(date, 'EEE, MMM d · h:mm a');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={loadData}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            >
                {isLoading && appointments.length === 0 ? (
                    <DashboardSkeleton />
                ) : (<>
                {/* Greeting Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                        <Text style={styles.name}>{profile?.full_name?.split(' ')[0] || 'Patient'}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.notificationBtn}
                        onPress={() => router.push('/(patient)/notifications' as any)}
                    >
                        <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
                        {unreadCount > 0 && (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationBadgeText}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.primaryAction}
                        onPress={() => router.push('/(patient)/book' as any)}
                        activeOpacity={0.85}
                    >
                        <View style={styles.primaryActionIcon}>
                            <Ionicons name="calendar-outline" size={28} color={colors.textPrimary} />
                        </View>
                        <View style={styles.primaryActionText}>
                            <Text style={styles.primaryActionTitle}>Book Appointment</Text>
                            <Text style={styles.primaryActionSubtitle}>Schedule your next session</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <View style={styles.secondaryActions}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            activeOpacity={0.85}
                            onPress={() => router.push('/(patient)/messages' as any)}
                        >
                            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                                <Ionicons name="chatbubbles-outline" size={22} color={colors.info} />
                            </View>
                            <Text style={styles.actionLabel}>Messages</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            activeOpacity={0.85}
                            onPress={() => router.push('/(patient)/exercises' as any)}
                        >
                            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                                <Ionicons name="barbell-outline" size={22} color={colors.success} />
                            </View>
                            <Text style={styles.actionLabel}>Exercises</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            activeOpacity={0.85}
                            onPress={() => router.push('/(patient)/payments' as any)}
                        >
                            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                                <Ionicons name="receipt-outline" size={22} color={colors.warning} />
                            </View>
                            <Text style={styles.actionLabel}>Payments</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats Row */}
                {dashboardStats && (
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{dashboardStats.todayAppointments}</Text>
                            <Text style={styles.statLabel}>Today</Text>
                        </View>
                        <View style={[styles.statCard, styles.statCardAccent]}>
                            <Text style={[styles.statNumber, { color: colors.primary }]}>
                                {dashboardStats.upcomingAppointments}
                            </Text>
                            <Text style={styles.statLabel}>Upcoming</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{dashboardStats.completedSessions}</Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                    </View>
                )}

                {/* Upcoming Appointments */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                        <TouchableOpacity onPress={() => router.push('/(patient)/(tabs)/appointments')}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {upcomingAppointments.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                                <Text style={styles.emptyTitle}>No Upcoming Sessions</Text>
                                <Text style={styles.emptySubtitle}>
                                    Book your first appointment to get started
                                </Text>
                            </View>
                        </Card>
                    ) : (
                        upcomingAppointments.map((apt) => (
                            <TouchableOpacity
                                key={apt.id}
                                style={styles.appointmentCard}
                                activeOpacity={0.85}
                                onPress={() => router.push(`/(patient)/session/${apt.id}` as any)}
                            >
                                <View style={styles.appointmentLeft}>
                                    <View style={[
                                        styles.statusDot,
                                        { backgroundColor: apt.status === 'confirmed' ? colors.success : colors.warning },
                                    ]} />
                                    <View>
                                        <Text style={styles.appointmentService}>
                                            {SERVICE_LABELS[apt.service_type]}
                                        </Text>
                                        <Text style={styles.appointmentDate}>
                                            {formatAppointmentDate(apt.scheduled_at)}
                                        </Text>
                                        <Text style={styles.appointmentClinician}>
                                            with {apt.clinician?.full_name?.split(' ')[0] || 'Clinician'}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Health Tips */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Health Tips</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipsScroll}>
                        {[
                            { title: 'Stay Active', desc: 'Regular movement helps recovery', icon: 'walk-outline' as const, bg: 'rgba(10, 104, 71, 0.12)' },
                            { title: 'Stay Hydrated', desc: 'Drink 2-3L of water daily', icon: 'water-outline' as const, bg: 'rgba(59, 130, 246, 0.12)' },
                            { title: 'Posture Check', desc: 'Keep your spine aligned', icon: 'body-outline' as const, bg: 'rgba(245, 158, 11, 0.12)' },
                        ].map((tip, i) => (
                            <View key={i} style={[styles.tipCard, { backgroundColor: tip.bg }]}>
                                <Ionicons name={tip.icon} size={28} color={colors.textPrimary} />
                                <Text style={styles.tipTitle}>{tip.title}</Text>
                                <Text style={styles.tipDesc}>{tip.desc}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    greeting: {
        fontSize: fontSize.base,
        color: colors.textSecondary,
    },
    name: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginTop: spacing.xs,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: colors.bgDark,
    },
    notificationBadgeText: {
        fontSize: 10,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    quickActions: {
        marginBottom: spacing['2xl'],
    },
    primaryAction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    primaryActionIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    primaryActionText: {
        flex: 1,
    },
    primaryActionTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    primaryActionSubtitle: {
        fontSize: fontSize.sm,
        color: 'rgba(255,255,255,0.75)',
        marginTop: 2,
    },
    secondaryActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    actionCard: {
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    actionIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    actionLabel: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing['2xl'],
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    statCardAccent: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(10, 104, 71, 0.08)',
    },
    statNumber: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    statLabel: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    section: {
        marginBottom: spacing['2xl'],
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    seeAll: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.semibold,
    },
    emptyCard: {
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
    },
    emptyTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginTop: spacing.lg,
    },
    emptySubtitle: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    appointmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    appointmentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: spacing.md,
    },
    appointmentService: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    appointmentDate: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    appointmentClinician: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: 2,
    },
    tipsScroll: {
        marginTop: spacing.md,
    },
    tipCard: {
        width: 160,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginRight: spacing.md,
    },
    tipTitle: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginTop: spacing.md,
    },
    tipDesc: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
});
