import React, { useEffect, useState } from 'react';
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
import { supabase } from '../../../lib/supabase';
import { Card, DashboardSkeleton } from '../../../components/ui';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../../constants/theme';
import { format, isToday, parseISO } from 'date-fns';
import { SERVICE_LABELS } from '../../../lib/types';

export default function ClinicianDashboard() {
    const { profile } = useAuthStore();
    const { appointments, dashboardStats, fetchAppointments, fetchDashboardStats, isLoading } = useAppointmentStore();
    const [connectedPatients, setConnectedPatients] = useState<any[]>([]);
    const router = useRouter();

    const fetchConnectedPatients = async () => {
        if (!profile) return;
        const { data, error } = await supabase.rpc('get_connected_patients');
        if (error) {
            console.error('fetchConnectedPatients error:', error);
            return;
        }
        if (data) setConnectedPatients(data);
    };

    const loadData = async () => {
        if (!profile) return;
        await Promise.all([
            fetchAppointments(profile.id, 'clinician'),
            fetchDashboardStats(profile.id, 'clinician'),
            fetchConnectedPatients(),
        ]);
    };

    useEffect(() => {
        loadData();
    }, [profile]);

    const todayAppointments = appointments.filter(
        (a) => isToday(parseISO(a.scheduled_at)) && !['cancelled', 'no_show'].includes(a.status)
    );

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={colors.primary} />
                }
            >
                {isLoading && appointments.length === 0 ? (
                    <DashboardSkeleton />
                ) : (<>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                        <Text style={styles.name}>Dr. {profile?.full_name?.split(' ')[0] || 'Clinician'}</Text>
                    </View>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>{format(new Date(), 'EEE, MMM d')}</Text>
                    </View>
                </View>

                {/* Stats Grid */}
                {dashboardStats && (
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, styles.statPrimary]}>
                            <Ionicons name="today-outline" size={24} color={colors.textPrimary} />
                            <Text style={styles.statNumber}>{dashboardStats.todayAppointments}</Text>
                            <Text style={styles.statLabel}>Today's Sessions</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="calendar-outline" size={24} color={colors.info} />
                            <Text style={styles.statNumber}>{dashboardStats.upcomingAppointments}</Text>
                            <Text style={styles.statLabel}>Upcoming</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="people-outline" size={24} color={colors.accent} />
                            <Text style={styles.statNumber}>{dashboardStats.totalPatients}</Text>
                            <Text style={styles.statLabel}>Total Patients</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="checkmark-done-outline" size={24} color={colors.success} />
                            <Text style={styles.statNumber}>{dashboardStats.completedSessions}</Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                    </View>
                )}

                {/* Today's Appointments */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today's Schedule</Text>
                        <TouchableOpacity onPress={() => router.push('/(clinician)/(tabs)/schedule')}>
                            <Text style={styles.seeAll}>Full Schedule</Text>
                        </TouchableOpacity>
                    </View>

                    {todayAppointments.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <View style={styles.emptyState}>
                                <Ionicons name="sunny-outline" size={48} color={colors.textMuted} />
                                <Text style={styles.emptyTitle}>No sessions today</Text>
                                <Text style={styles.emptySubtitle}>Enjoy your free day!</Text>
                            </View>
                        </Card>
                    ) : (
                        todayAppointments.map((apt, index) => (
                            <TouchableOpacity
                                key={apt.id}
                                style={styles.sessionCard}
                                activeOpacity={0.85}
                                onPress={() => router.push(`/(clinician)/session/${apt.id}` as any)}
                            >
                                <View style={styles.timeColumn}>
                                    <Text style={styles.timeText}>{format(parseISO(apt.scheduled_at), 'h:mm')}</Text>
                                    <Text style={styles.timePeriod}>{format(parseISO(apt.scheduled_at), 'a')}</Text>
                                </View>
                                <View style={styles.sessionLine}>
                                    <View style={[styles.sessionDot, {
                                        backgroundColor: apt.status === 'confirmed' ? colors.success :
                                            apt.status === 'in_progress' ? colors.info :
                                                apt.status === 'completed' ? colors.primary : colors.warning,
                                    }]} />
                                    {index < todayAppointments.length - 1 && <View style={styles.connectorLine} />}
                                </View>
                                <View style={styles.sessionContent}>
                                    <Text style={styles.sessionService}>{SERVICE_LABELS[apt.service_type]}</Text>
                                    <View style={styles.sessionPatient}>
                                        <Ionicons name="person-outline" size={14} color={colors.textMuted} />
                                        <Text style={styles.patientName}>{apt.patient?.full_name?.split(' ')[0] || 'Patient'}</Text>
                                    </View>
                                    <View style={styles.sessionMeta}>
                                        <Text style={styles.sessionDuration}>{apt.duration_minutes} min</Text>
                                        <Text style={styles.sessionLocation} numberOfLines={1}>📍 {apt.location}</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Connected Patients (no appointments yet) */}
                {connectedPatients.length > 0 && (() => {
                    // Only show patients who have NO appointments with this clinician
                    const aptPatientIds = new Set(appointments.map(a => a.patient_id));
                    const newPatients = connectedPatients.filter(c => !aptPatientIds.has(c.patient_id));
                    if (newPatients.length === 0) return null;
                    return (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>New Connections</Text>
                                <TouchableOpacity onPress={() => router.push('/(clinician)/(tabs)/patients' as any)}>
                                    <Text style={styles.seeAll}>View All</Text>
                                </TouchableOpacity>
                            </View>
                            {newPatients.map(conn => (
                                <TouchableOpacity
                                    key={conn.patient_id}
                                    style={styles.connectedPatientCard}
                                    activeOpacity={0.85}
                                    onPress={() => router.push(`/(clinician)/patient/${conn.patient_id}` as any)}
                                >
                                    <View style={styles.connectedAvatar}>
                                        <Text style={styles.connectedAvatarText}>
                                            {conn.full_name?.charAt(0)?.toUpperCase() || 'P'}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.connectedName}>{conn.full_name || 'Patient'}</Text>
                                        <Text style={styles.connectedMeta}>Connected · No sessions yet</Text>
                                    </View>
                                    <View style={styles.newBadge}>
                                        <Text style={styles.newBadgeText}>New</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    );
                })()}

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={styles.quickAction}
                            activeOpacity={0.85}
                            onPress={() => router.push('/(clinician)/messages' as any)}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(10,104,71,0.12)' }]}>
                                <Ionicons name="chatbubbles-outline" size={22} color={colors.primary} />
                            </View>
                            <Text style={styles.quickActionLabel}>Messages</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickAction}
                            activeOpacity={0.85}
                            onPress={() => router.push('/(clinician)/create-exercise-plan' as any)}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
                                <Ionicons name="barbell-outline" size={22} color={colors.info} />
                            </View>
                            <Text style={styles.quickActionLabel}>Exercise Plan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickAction}
                            activeOpacity={0.85}
                            onPress={() => router.push('/(clinician)/revenue' as any)}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                                <Ionicons name="wallet-outline" size={22} color={colors.warning} />
                            </View>
                            <Text style={styles.quickActionLabel}>Revenue</Text>
                        </TouchableOpacity>
                    </View>
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
    dateBadge: {
        backgroundColor: colors.bgCard,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dateText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing['2xl'],
    },
    statCard: {
        width: '48%',
        flexGrow: 1,
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.sm,
    },
    statPrimary: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    statNumber: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    statLabel: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
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
    },
    sessionCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
        paddingVertical: spacing.md,
    },
    timeColumn: {
        width: 50,
        alignItems: 'center',
    },
    timeText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    timePeriod: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        textTransform: 'uppercase',
    },
    sessionLine: {
        alignItems: 'center',
        width: 24,
        marginHorizontal: spacing.sm,
    },
    sessionDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    connectorLine: {
        width: 2,
        flex: 1,
        backgroundColor: colors.border,
        marginTop: spacing.xs,
    },
    sessionContent: {
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sessionService: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    sessionPatient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    patientName: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    sessionMeta: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    sessionDuration: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
    },
    sessionLocation: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        flex: 1,
    },
    quickActions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    quickAction: {
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    quickActionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    quickActionLabel: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    connectedPatientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: `${colors.primary}40`,
        gap: spacing.md,
    },
    connectedAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${colors.primary}30`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    connectedAvatarText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.primary,
    },
    connectedName: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    connectedMeta: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: 2,
    },
    newBadge: {
        backgroundColor: `${colors.primary}20`,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    newBadgeText: {
        fontSize: 10,
        fontWeight: fontWeight.bold,
        color: colors.primary,
    },
});
