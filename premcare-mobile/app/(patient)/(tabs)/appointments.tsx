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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../stores/authStore';
import { useAppointmentStore } from '../../../stores/appointmentStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../constants/theme';
import { format, parseISO, isPast } from 'date-fns';
import { SERVICE_LABELS, AppointmentStatus } from '../../../lib/types';
import { AppointmentCardSkeleton } from '../../../components/ui';

const STATUS_COLORS: Record<AppointmentStatus, string> = {
    pending: colors.warning,
    confirmed: colors.success,
    in_progress: colors.info,
    completed: colors.primary,
    cancelled: colors.error,
    no_show: colors.textMuted,
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
};

type TabFilter = 'upcoming' | 'past' | 'all';

export default function PatientAppointments() {
    const { profile } = useAuthStore();
    const { appointments, fetchAppointments, isLoading } = useAppointmentStore();
    const [activeTab, setActiveTab] = useState<TabFilter>('upcoming');
    const router = useRouter();

    const loadData = async () => {
        if (!profile) return;
        await fetchAppointments(profile.id, 'patient');
    };

    useEffect(() => {
        loadData();
    }, [profile]);

    const filteredAppointments = appointments.filter((apt) => {
        if (activeTab === 'upcoming') {
            return ['pending', 'confirmed'].includes(apt.status) && !isPast(parseISO(apt.scheduled_at));
        }
        if (activeTab === 'past') {
            return ['completed', 'cancelled', 'no_show'].includes(apt.status) || isPast(parseISO(apt.scheduled_at));
        }
        return true;
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Appointments</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/(patient)/book' as any)}
                >
                    <Ionicons name="add" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Tab Filter */}
            <View style={styles.tabs}>
                {(['upcoming', 'past', 'all'] as TabFilter[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Appointments List */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={colors.primary} />
                }
            >
                {isLoading && appointments.length === 0 ? (
                    <View style={{ padding: spacing.xl }}>
                        <AppointmentCardSkeleton />
                        <AppointmentCardSkeleton />
                        <AppointmentCardSkeleton />
                    </View>
                ) : filteredAppointments.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={56} color={colors.textMuted} />
                        <Text style={styles.emptyTitle}>
                            No {activeTab === 'all' ? '' : activeTab} appointments
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {activeTab === 'upcoming'
                                ? 'Book a session to get started with your treatment'
                                : 'Your appointment history will appear here'}
                        </Text>
                    </View>
                ) : (
                    filteredAppointments.map((apt, index) => (
                        <Animated.View key={apt.id} entering={FadeInDown.delay(index * 100).springify()}>
                            <TouchableOpacity
                                style={styles.appointmentCard}
                                activeOpacity={0.85}
                                onPress={() => router.push(`/(patient)/session/${apt.id}` as any)}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.serviceRow}>
                                        <Text style={styles.serviceName}>{SERVICE_LABELS[apt.service_type]}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[apt.status]}20` }]}>
                                            <View style={[styles.statusDotSmall, { backgroundColor: STATUS_COLORS[apt.status] }]} />
                                            <Text style={[styles.statusText, { color: STATUS_COLORS[apt.status] }]}>
                                                {STATUS_LABELS[apt.status]}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.cardDetails}>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                                        <Text style={styles.detailText}>
                                            {format(parseISO(apt.scheduled_at), 'EEEE, MMMM d, yyyy')}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                                        <Text style={styles.detailText}>
                                            {format(parseISO(apt.scheduled_at), 'h:mm a')} · {apt.duration_minutes} min
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                                        <Text style={styles.detailText} numberOfLines={1}>{apt.location}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardFooter}>
                                    <View style={styles.clinicianRow}>
                                        <View style={styles.clinicianAvatar}>
                                            <Text style={styles.clinicianInitial}>
                                                {apt.clinician?.full_name?.charAt(0) || 'C'}
                                            </Text>
                                        </View>
                                        <Text style={styles.clinicianName}>
                                            {apt.clinician?.full_name?.split(' ')[0] || 'Premcare Clinician'}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.bgDark,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    headerTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    tab: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full,
        backgroundColor: colors.bgCard,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tabActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    tabText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
    },
    tabTextActive: {
        color: colors.textPrimary,
        fontWeight: fontWeight.semibold,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['5xl'],
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing['5xl'],
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
        marginTop: spacing.sm,
        textAlign: 'center',
        maxWidth: 280,
    },
    appointmentCard: {
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        marginBottom: spacing.md,
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        flex: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
    },
    statusDotSmall: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
    },
    cardDetails: {
        gap: spacing.sm,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    detailText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.md,
    },
    clinicianRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    clinicianAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clinicianInitial: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    clinicianName: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
});
