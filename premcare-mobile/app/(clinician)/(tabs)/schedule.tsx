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
import { supabase } from '../../../lib/supabase';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../constants/theme';
import {
    format, parseISO, isSameDay, addDays, addWeeks, subWeeks,
    startOfWeek, endOfWeek, isToday, isBefore, startOfDay,
} from 'date-fns';
import { SERVICE_LABELS } from '../../../lib/types';

type ViewMode = 'week' | 'month';

export default function ClinicianSchedule() {
    const { profile } = useAuthStore();
    const { appointments, fetchAppointments, isLoading } = useAppointmentStore();
    const [coverageSessions, setCoverageSessions] = useState<any[]>([]);
    const router = useRouter();
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentWeekStart, setCurrentWeekStart] = useState(
        startOfWeek(new Date(), { weekStartsOn: 1 })
    );

    const fetchCoverageSessions = async () => {
        const { data } = await supabase.rpc('get_my_coverage_sessions');
        if (data) setCoverageSessions(data);
    };

    const loadData = async () => {
        if (!profile) return;
        await Promise.all([
            fetchAppointments(profile.id, 'clinician'),
            fetchCoverageSessions(),
        ]);
    };

    useEffect(() => { loadData(); }, [profile]);

    // Navigation helpers
    const goToPrevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, viewMode === 'week' ? 1 : 4));
    const goToNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, viewMode === 'week' ? 1 : 4));
    const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

    // Generate days based on view mode
    const daysCount = viewMode === 'week' ? 7 : 28;
    const days = Array.from({ length: daysCount }, (_, i) => addDays(currentWeekStart, i));

    // Week label
    const weekEnd = addDays(currentWeekStart, daysCount - 1);
    const headerLabel = viewMode === 'week'
        ? `${format(currentWeekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`
        : `${format(currentWeekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;

    // Count total appointments for this period
    const periodAppointments = appointments.filter(a => {
        const aptDate = parseISO(a.scheduled_at);
        return aptDate >= startOfDay(currentWeekStart)
            && aptDate <= endOfWeek(weekEnd, { weekStartsOn: 1 })
            && a.status !== 'cancelled';
    });

    const isCurrentWeek = isSameDay(
        currentWeekStart,
        startOfWeek(new Date(), { weekStartsOn: 1 })
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Schedule</Text>
                <View style={styles.viewToggle}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, viewMode === 'week' && styles.toggleBtnActive]}
                        onPress={() => setViewMode('week')}
                    >
                        <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>
                            Week
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, viewMode === 'month' && styles.toggleBtnActive]}
                        onPress={() => setViewMode('month')}
                    >
                        <Text style={[styles.toggleText, viewMode === 'month' && styles.toggleTextActive]}>
                            Month
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Week Navigation */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={goToPrevWeek} style={styles.navBtn}>
                    <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={goToToday} style={styles.navCenter}>
                    <Text style={styles.navLabel}>{headerLabel}</Text>
                    {!isCurrentWeek && (
                        <Text style={styles.todayLink}>Go to today</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={goToNextWeek} style={styles.navBtn}>
                    <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Summary Bar */}
            <View style={styles.summaryBar}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{periodAppointments.length}</Text>
                    <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
                        {periodAppointments.filter(a => a.status === 'pending').length}
                    </Text>
                    <Text style={styles.summaryLabel}>Pending</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                        {periodAppointments.filter(a => a.status === 'confirmed').length}
                    </Text>
                    <Text style={styles.summaryLabel}>Confirmed</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>
                        {periodAppointments.filter(a => a.status === 'completed').length}
                    </Text>
                    <Text style={styles.summaryLabel}>Done</Text>
                </View>
            </View>

            {/* Schedule List */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={colors.primary} />}
            >
                {days.map((day) => {
                    const dayAppointments = appointments
                        .filter((a) => isSameDay(parseISO(a.scheduled_at), day) && a.status !== 'cancelled')
                        .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));

                    const today = isToday(day);
                    const past = isBefore(day, startOfDay(new Date())) && !today;

                    // In month view, skip days with no appointments (except today)
                    if (viewMode === 'month' && dayAppointments.length === 0 && !today) {
                        return null;
                    }

                    return (
                        <View key={day.toISOString()} style={[styles.dayGroup, past && styles.dayGroupPast]}>
                            <View style={[styles.dayHeader, today && styles.dayHeaderToday]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                    <Text style={[styles.dayName, today && styles.dayNameToday]}>
                                        {format(day, 'EEEE')}
                                    </Text>
                                    {today && (
                                        <View style={styles.todayBadge}>
                                            <Text style={styles.todayBadgeText}>TODAY</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.dayDate, today && styles.dayDateToday]}>
                                    {format(day, 'MMM d')}
                                </Text>
                            </View>

                            {dayAppointments.length === 0 ? (
                                <View style={styles.freeDay}>
                                    <Text style={styles.freeDayText}>No appointments</Text>
                                </View>
                            ) : (
                                dayAppointments.map((apt, index) => (
                                    <Animated.View key={apt.id} entering={FadeInDown.delay(index * 100).springify()}>
                                        <TouchableOpacity
                                            style={styles.scheduleCard}
                                            activeOpacity={0.85}
                                            onPress={() => router.push(`/(clinician)/session/${apt.id}` as any)}
                                        >
                                            <View style={styles.scheduleTime}>
                                                <Text style={styles.scheduleTimeText}>
                                                    {format(parseISO(apt.scheduled_at), 'h:mm a')}
                                                </Text>
                                            </View>
                                            <View style={[styles.scheduleBar, {
                                                backgroundColor: apt.status === 'completed' ? colors.primary :
                                                    apt.status === 'confirmed' ? colors.success :
                                                    apt.status === 'in_progress' ? '#3B82F6' : colors.warning,
                                            }]} />
                                            <View style={styles.scheduleDetails}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                                    <Text style={styles.scheduleService}>
                                                        {SERVICE_LABELS[apt.service_type]}
                                                    </Text>
                                                    {apt.status === 'pending' && (
                                                        <View style={styles.pendingBadge}>
                                                            <Text style={styles.pendingBadgeText}>PENDING</Text>
                                                        </View>
                                                    )}
                                                    {apt.status === 'in_progress' && (
                                                        <View style={[styles.pendingBadge, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                                                            <Text style={[styles.pendingBadgeText, { color: '#3B82F6' }]}>IN PROGRESS</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={styles.schedulePatient}>
                                                    {apt.patient?.full_name?.split(' ')[0] || 'Patient'}
                                                </Text>
                                                <Text style={styles.scheduleDuration}>
                                                    {apt.duration_minutes} min · 📍 {apt.location}
                                                </Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))
                            )}
                        </View>
                    );
                })}

                {/* Month view: show message if no appointments at all */}
                {viewMode === 'month' && periodAppointments.length === 0 && (
                    <View style={styles.emptyMonth}>
                        <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                        <Text style={styles.emptyMonthTitle}>No appointments this period</Text>
                        <Text style={styles.emptyMonthSub}>
                            Appointments will show here when patients book sessions
                        </Text>
                    </View>
                )}

                {/* Coverage Sessions Section */}
                {coverageSessions.length > 0 && (
                    <View style={styles.coverageSection}>
                        <View style={styles.coverageSectionHeader}>
                            <Ionicons name="shield-checkmark-outline" size={18} color={colors.warning} />
                            <Text style={styles.coverageSectionTitle}>Sessions I'm Covering</Text>
                        </View>
                        <Text style={styles.coverageSectionSub}>
                            You have offered to cover these sessions for other clinicians
                        </Text>
                        {coverageSessions.map((session, index) => (
                            <Animated.View key={session.id} entering={FadeInDown.delay(index * 80).springify()}>
                                <View style={styles.coverageCard}>
                                    <View style={styles.scheduleTime}>
                                        <Text style={styles.scheduleTimeText}>
                                            {format(parseISO(session.scheduled_at), 'h:mm a')}
                                        </Text>
                                        <Text style={styles.coverageDay}>
                                            {format(parseISO(session.scheduled_at), 'MMM d')}
                                        </Text>
                                    </View>
                                    <View style={[styles.scheduleBar, { backgroundColor: colors.warning }]} />
                                    <View style={styles.scheduleDetails}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                            <Text style={styles.scheduleService}>
                                                {SERVICE_LABELS[session.service_type as any] || session.service_type}
                                            </Text>
                                            <View style={styles.coverageBadge}>
                                                <Text style={styles.coverageBadgeText}>COVERAGE</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.schedulePatient}>{session.patient_name}</Text>
                                        <Text style={styles.scheduleDuration}>
                                            {session.duration_minutes} min · 📍 {session.location}
                                        </Text>
                                        <Text style={styles.coverageOriginal}>
                                            Originally: {session.clinician_name}
                                        </Text>
                                    </View>
                                </View>
                            </Animated.View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bgDark },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
    },
    headerTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    toggleBtn: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
    },
    toggleBtnActive: {
        backgroundColor: colors.primary,
    },
    toggleText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textMuted,
    },
    toggleTextActive: {
        color: colors.textPrimary,
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    navBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    navCenter: {
        alignItems: 'center',
    },
    navLabel: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    todayLink: {
        fontSize: fontSize.xs,
        color: colors.primary,
        marginTop: 2,
    },
    summaryBar: {
        flexDirection: 'row',
        marginHorizontal: spacing.xl,
        marginBottom: spacing.md,
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    summaryLabel: {
        fontSize: 10,
        color: colors.textMuted,
        marginTop: 2,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginVertical: 2,
    },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: spacing['5xl'],
    },
    dayGroup: {
        marginBottom: spacing.xl,
    },
    dayGroupPast: {
        opacity: 0.6,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    dayHeaderToday: {
        borderBottomColor: colors.primary,
        borderBottomWidth: 2,
    },
    dayName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    dayNameToday: {
        color: colors.primary,
    },
    dayDate: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    dayDateToday: {
        color: colors.primary,
        fontWeight: fontWeight.semibold,
    },
    todayBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: 1,
        borderRadius: borderRadius.full,
    },
    todayBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: fontWeight.bold,
        letterSpacing: 0.5,
    },
    freeDay: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },
    freeDayText: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    scheduleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    scheduleTime: {
        width: 80,
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },
    scheduleTimeText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textSecondary,
    },
    scheduleBar: {
        width: 3,
        alignSelf: 'stretch',
        borderRadius: 2,
    },
    scheduleDetails: {
        flex: 1,
        padding: spacing.lg,
    },
    scheduleService: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    schedulePatient: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    scheduleDuration: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    pendingBadge: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
    },
    pendingBadgeText: {
        color: '#F59E0B',
        fontSize: 10,
        fontWeight: fontWeight.semibold,
    },
    emptyMonth: {
        alignItems: 'center',
        paddingVertical: spacing['5xl'],
    },
    emptyMonthTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginTop: spacing.lg,
    },
    emptyMonthSub: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    // Coverage section
    coverageSection: {
        marginTop: spacing.xl,
        paddingTop: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    coverageSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    coverageSectionTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    coverageSectionSub: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginBottom: spacing.lg,
    },
    coverageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${colors.warning}10`,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: `${colors.warning}40`,
    },
    coverageBadge: {
        backgroundColor: `${colors.warning}25`,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
    },
    coverageBadgeText: {
        color: colors.warning,
        fontSize: 10,
        fontWeight: fontWeight.bold,
    },
    coverageDay: {
        fontSize: 10,
        color: colors.textMuted,
        marginTop: 2,
    },
    coverageOriginal: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: 2,
        fontStyle: 'italic',
    },
});
