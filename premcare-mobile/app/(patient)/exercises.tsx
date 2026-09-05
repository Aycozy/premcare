import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import type { Exercise, ExercisePlan } from '../../stores/exerciseStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../constants/theme';
import { format, isToday, parseISO } from 'date-fns';
import { CardSkeleton } from '../../components/ui';

export default function PatientExercisesScreen() {
    const router = useRouter();
    const { profile } = useAuthStore();
    const { plans, isLoading, fetchPatientPlans, completeExercise } = useExerciseStore();

    useEffect(() => {
        if (profile) fetchPatientPlans(profile.id);
    }, [profile]);

    const isCompletedToday = (exercise: Exercise) => {
        if (!exercise.completions) return false;
        return exercise.completions.some(c => isToday(parseISO(c.completed_at)));
    };

    const getPlanProgress = (plan: ExercisePlan) => {
        if (!plan.exercises || plan.exercises.length === 0) return 0;
        const completed = plan.exercises.filter(e => isCompletedToday(e)).length;
        return Math.round((completed / plan.exercises.length) * 100);
    };

    const handleComplete = async (exerciseId: string) => {
        if (!profile) return;
        await completeExercise(exerciseId, profile.id);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Exercises</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={() => profile && fetchPatientPlans(profile.id)}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            >
                {isLoading && plans.length === 0 ? (
                    <View style={{ padding: spacing.xl }}>
                        <CardSkeleton />
                        <CardSkeleton />
                    </View>
                ) : plans.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBg}>
                            <Ionicons name="barbell-outline" size={48} color={colors.textMuted} />
                        </View>
                        <Text style={styles.emptyTitle}>No Exercise Plans</Text>
                        <Text style={styles.emptySubtitle}>
                            Your clinician will assign exercise plans after your sessions.
                        </Text>
                    </View>
                ) : (
                    plans.map((plan) => {
                        const progress = getPlanProgress(plan);
                        return (
                            <View key={plan.id} style={styles.planCard}>
                                {/* Plan Header */}
                                <View style={styles.planHeader}>
                                    <View style={styles.planIcon}>
                                        <Ionicons name="fitness-outline" size={22} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.planTitle}>{plan.title}</Text>
                                        <Text style={styles.planMeta}>
                                            By {plan.clinician?.full_name?.split(' ')[0] || 'Clinician'} · {plan.exercises?.length || 0} exercises
                                        </Text>
                                    </View>
                                </View>

                                {plan.description && (
                                    <Text style={styles.planDescription}>{plan.description}</Text>
                                )}

                                {/* Progress Bar */}
                                <View style={styles.progressSection}>
                                    <View style={styles.progressHeader}>
                                        <Text style={styles.progressLabel}>Today's Progress</Text>
                                        <Text style={styles.progressPercent}>{progress}%</Text>
                                    </View>
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                                    </View>
                                </View>

                                {/* Exercises */}
                                {plan.exercises?.map((exercise) => {
                                    const done = isCompletedToday(exercise);
                                    return (
                                        <View key={exercise.id} style={styles.exerciseItem}>
                                            <TouchableOpacity
                                                style={[styles.checkBox, done && styles.checkBoxDone]}
                                                onPress={() => !done && handleComplete(exercise.id)}
                                                disabled={done}
                                            >
                                                {done && <Ionicons name="checkmark" size={16} color={colors.textPrimary} />}
                                            </TouchableOpacity>
                                            <View style={styles.exerciseInfo}>
                                                <Text style={[styles.exerciseName, done && styles.exerciseNameDone]}>
                                                    {exercise.name}
                                                </Text>
                                                <Text style={styles.exerciseMeta}>
                                                    {exercise.sets} sets × {exercise.reps} reps
                                                    {exercise.hold_seconds ? ` · ${exercise.hold_seconds}s hold` : ''}
                                                </Text>
                                                {exercise.description && (
                                                    <Text style={styles.exerciseDesc} numberOfLines={2}>
                                                        {exercise.description}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bgDark },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: colors.bgCard,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border,
    },
    headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
    scrollContent: { padding: spacing.xl, paddingBottom: spacing['5xl'] },
    planCard: {
        backgroundColor: colors.bgCard, borderRadius: borderRadius.xl,
        padding: spacing.xl, marginBottom: spacing.xl,
        borderWidth: 1, borderColor: colors.border,
    },
    planHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
    planIcon: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: 'rgba(10, 104, 71, 0.12)',
        justifyContent: 'center', alignItems: 'center',
    },
    planTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
    planMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
    planDescription: {
        fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20,
        marginBottom: spacing.lg,
    },
    progressSection: { marginBottom: spacing.lg },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    progressLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: fontWeight.medium },
    progressPercent: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.bold },
    progressTrack: {
        height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)',
    },
    progressFill: {
        height: '100%', borderRadius: 3, backgroundColor: colors.primary,
    },
    exerciseItem: {
        flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
        paddingVertical: spacing.md,
        borderTopWidth: 1, borderTopColor: colors.divider,
    },
    checkBox: {
        width: 28, height: 28, borderRadius: 8, borderWidth: 2,
        borderColor: colors.border, justifyContent: 'center', alignItems: 'center',
        marginTop: 2,
    },
    checkBoxDone: { backgroundColor: colors.primary, borderColor: colors.primary },
    exerciseInfo: { flex: 1 },
    exerciseName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary },
    exerciseNameDone: { textDecorationLine: 'line-through', color: colors.textMuted },
    exerciseMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
    exerciseDesc: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
    emptyState: { alignItems: 'center', paddingVertical: spacing['5xl'], paddingHorizontal: spacing['2xl'] },
    emptyIconBg: {
        width: 96, height: 96, borderRadius: 48, backgroundColor: colors.bgCard,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl,
    },
    emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.sm },
    emptySubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
});
