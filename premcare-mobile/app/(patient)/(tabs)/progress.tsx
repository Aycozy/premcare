import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../stores/authStore';
import { useAppointmentStore } from '../../../stores/appointmentStore';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../../constants/theme';
import { format } from 'date-fns';

export default function PatientProgress() {
    const { profile } = useAuthStore();
    const { appointments, fetchAppointments } = useAppointmentStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (profile) fetchAppointments(profile.id, 'patient');
    }, [profile]);

    const onRefresh = async () => {
        setRefreshing(true);
        if (profile) await fetchAppointments(profile.id, 'patient');
        setRefreshing(false);
    };

    const completedSessions = useMemo(() => {
        return appointments
            .filter(apt => apt.status === 'completed' && apt.session_note)
            .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    }, [appointments]);

    const averagePainReduction = useMemo(() => {
        if (completedSessions.length === 0) return 0;
        let totalReduction = 0;
        let count = 0;

        completedSessions.forEach(apt => {
            const before = apt.session_note?.pain_score_before;
            const after = apt.session_note?.pain_score_after;
            if (typeof before === 'number' && typeof after === 'number') {
                totalReduction += (before - after);
                count++;
            }
        });

        return count > 0 ? (totalReduction / count).toFixed(1) : 0;
    }, [completedSessions]);

    // Render Stats
    const renderStats = () => (
        <View style={styles.statsRow}>
            <View style={styles.statCard}>
                <Ionicons name="calendar-outline" size={24} color={colors.primary} style={styles.statIcon} />
                <Text style={styles.statValue}>{completedSessions.length}</Text>
                <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
            <View style={styles.statCard}>
                <Ionicons name="trending-down-outline" size={24} color={colors.success} style={styles.statIcon} />
                <Text style={styles.statValue}>
                    {averagePainReduction}
                    <Text style={styles.statUnit}> avg</Text>
                </Text>
                <Text style={styles.statLabel}>Pain Reduction</Text>
            </View>
        </View>
    );

    // Pain Trend Chart
    const renderPainTrend = () => {
        if (completedSessions.length < 2) return null;

        return (
            <View style={styles.chartContainer}>
                <Text style={styles.sectionTitle}>Pain Score Trend</Text>
                <View style={styles.chartBox}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScroll}>
                        {completedSessions.map((session, index) => {
                            const note = session.session_note;
                            const before = note?.pain_score_before ?? 0;
                            const after = note?.pain_score_after ?? 0;
                            const maxScore = 10;
                            
                            return (
                                <View key={session.id} style={styles.chartCol}>
                                    <View style={styles.chartBarContainer}>
                                        <View style={[styles.chartBar, styles.chartBarBefore, { height: `${(before / maxScore) * 100}%` }]}>
                                            <Text style={styles.chartBarText}>{before}</Text>
                                        </View>
                                        <View style={[styles.chartBar, styles.chartBarAfter, { height: `${(after / maxScore) * 100}%` }]}>
                                            <Text style={styles.chartBarText}>{after}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.chartLabel}>S{index + 1}</Text>
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: colors.warning }]} />
                        <Text style={styles.legendLabel}>Before Session</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                        <Text style={styles.legendLabel}>After Session</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderHistory = () => (
        <View style={styles.historyContainer}>
            <Text style={styles.sectionTitle}>Session History</Text>
            {completedSessions.slice().reverse().map((session) => (
                <View key={session.id} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyDate}>
                            {format(new Date(session.scheduled_at), 'MMM d, yyyy')}
                        </Text>
                        <View style={styles.scoreBadge}>
                            <Ionicons name="pulse-outline" size={14} color={colors.textPrimary} />
                            <Text style={styles.scoreText}>
                                Pain: {session.session_note?.pain_score_before} → {session.session_note?.pain_score_after}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.historyProvider}>
                        Dr. {session.clinician?.full_name?.split(' ')[0] || ''}
                    </Text>
                    
                    {session.session_note?.rom_notes && (
                        <View style={styles.noteSection}>
                            <Text style={styles.noteLabel}>Range of Motion</Text>
                            <Text style={styles.noteText}>{session.session_note.rom_notes}</Text>
                        </View>
                    )}
                    
                    {session.session_note?.plan && (
                        <View style={styles.noteSection}>
                            <Text style={styles.noteLabel}>Plan & Next Steps</Text>
                            <Text style={styles.noteText}>{session.session_note.plan}</Text>
                        </View>
                    )}
                </View>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Progress</Text>
            </View>

            {completedSessions.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="bar-chart-outline" size={64} color={colors.textMuted} />
                    <Text style={styles.emptyTitle}>No progress data yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Complete a session with your clinician to see your recovery stats and notes here.
                    </Text>
                </View>
            ) : (
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {renderStats()}
                    {renderPainTrend()}
                    {renderHistory()}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.bgDark,
    },
    header: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    headerTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: spacing['5xl'],
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing['2xl'],
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.bgCard,
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.sm,
    },
    statIcon: {
        marginBottom: spacing.sm,
    },
    statValue: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    statUnit: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.regular,
        color: colors.textMuted,
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    chartContainer: {
        marginBottom: spacing['2xl'],
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.lg,
    },
    chartBox: {
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        height: 220,
    },
    chartScroll: {
        alignItems: 'flex-end',
        paddingRight: spacing.lg,
    },
    chartCol: {
        alignItems: 'center',
        marginRight: spacing.xl,
        height: '100%',
        justifyContent: 'flex-end',
    },
    chartBarContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
        height: 140,
        marginBottom: spacing.sm,
    },
    chartBar: {
        width: 14,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        minHeight: 16,
        alignItems: 'center',
        paddingTop: 2,
    },
    chartBarBefore: {
        backgroundColor: colors.warning,
    },
    chartBarAfter: {
        backgroundColor: colors.primary,
    },
    chartBarText: {
        fontSize: 8,
        color: colors.textInverse,
        fontWeight: fontWeight.bold,
    },
    chartLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.lg,
        marginTop: spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    legendColor: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendLabel: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    historyContainer: {
        marginTop: spacing.md,
    },
    historyCard: {
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    historyDate: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    scoreBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    scoreText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    historyProvider: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        marginBottom: spacing.md,
    },
    noteSection: {
        marginTop: spacing.sm,
        backgroundColor: colors.bgDark,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    noteLabel: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
        color: colors.primaryLight,
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    noteText: {
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        lineHeight: 20,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing['3xl'],
    },
    emptyTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginTop: spacing.xl,
    },
    emptySubtitle: {
        fontSize: fontSize.base,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.md,
        lineHeight: 22,
    },
});
