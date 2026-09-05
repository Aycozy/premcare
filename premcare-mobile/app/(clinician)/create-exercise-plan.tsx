import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { Button, toast } from '../../components/ui';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../constants/theme';

interface ExerciseInput {
    name: string;
    description: string;
    sets: string;
    reps: string;
    hold_seconds: string;
}

const EMPTY_EXERCISE: ExerciseInput = {
    name: '', description: '', sets: '3', reps: '10', hold_seconds: '',
};

export default function ClinicianCreateExercisePlanScreen() {
    const router = useRouter();
    const { profile } = useAuthStore();
    const { createPlan, isLoading } = useExerciseStore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [patientId, setPatientId] = useState('');
    const [exercises, setExercises] = useState<ExerciseInput[]>([{ ...EMPTY_EXERCISE }]);

    const addExercise = () => {
        setExercises([...exercises, { ...EMPTY_EXERCISE }]);
    };

    const removeExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const updateExercise = (index: number, field: keyof ExerciseInput, value: string) => {
        const updated = [...exercises];
        updated[index] = { ...updated[index], [field]: value };
        setExercises(updated);
    };

    const handleCreate = async () => {
        if (!profile || !title.trim() || !patientId.trim()) {
            toast.error('Missing Info', 'Please fill in the plan title and patient ID.');
            return;
        }

        const validExercises = exercises.filter(e => e.name.trim());
        if (validExercises.length === 0) {
            toast.error('Missing Info', 'Please add at least one exercise.');
            return;
        }

        const { error } = await createPlan({
            patient_id: patientId.trim(),
            clinician_id: profile.id,
            title: title.trim(),
            description: description.trim() || undefined,
            exercises: validExercises.map(e => ({
                name: e.name.trim(),
                description: e.description.trim() || undefined,
                sets: parseInt(e.sets) || 3,
                reps: parseInt(e.reps) || 10,
                hold_seconds: e.hold_seconds ? parseInt(e.hold_seconds) : undefined,
            })),
        });

        if (error) {
            toast.error('Error', `Failed to create plan: ${error}`);
        } else {
            // Notify patient
            try {
                await useNotificationStore.getState().createNotification({
                    user_id: patientId.trim(),
                    type: 'general',
                    title: 'New Exercise Plan Assigned 💪',
                    body: `Your clinician has created a new exercise plan: "${title.trim()}"`,
                });
            } catch {}

            toast.success('Plan Created! 🎉', 'Exercise plan created and assigned to the patient.');
            router.back();
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Exercise Plan</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Plan Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Plan Details</Text>
                    <View style={styles.fieldGroup}>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>PLAN TITLE</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Knee Rehabilitation Week 1"
                                placeholderTextColor={colors.textMuted}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                        <View style={[styles.field, styles.fieldBorder]}>
                            <Text style={styles.fieldLabel}>DESCRIPTION (OPTIONAL)</Text>
                            <TextInput
                                style={[styles.input, { minHeight: 50 }]}
                                placeholder="Instructions for the patient..."
                                placeholderTextColor={colors.textMuted}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />
                        </View>
                        <View style={[styles.field, styles.fieldBorder]}>
                            <Text style={styles.fieldLabel}>PATIENT ID</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Paste patient UUID"
                                placeholderTextColor={colors.textMuted}
                                value={patientId}
                                onChangeText={setPatientId}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                </View>

                {/* Exercises */}
                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Text style={styles.sectionTitle}>Exercises</Text>
                        <TouchableOpacity onPress={addExercise} style={styles.addBtn}>
                            <Ionicons name="add" size={18} color={colors.primary} />
                            <Text style={styles.addBtnText}>Add</Text>
                        </TouchableOpacity>
                    </View>

                    {exercises.map((exercise, index) => (
                        <View key={index} style={styles.exerciseCard}>
                            <View style={styles.exerciseHeader}>
                                <Text style={styles.exerciseNum}>Exercise {index + 1}</Text>
                                {exercises.length > 1 && (
                                    <TouchableOpacity onPress={() => removeExercise(index)}>
                                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TextInput
                                style={styles.exerciseInput}
                                placeholder="Exercise name"
                                placeholderTextColor={colors.textMuted}
                                value={exercise.name}
                                onChangeText={(v) => updateExercise(index, 'name', v)}
                            />
                            <TextInput
                                style={[styles.exerciseInput, { marginTop: spacing.sm }]}
                                placeholder="Description / instructions (optional)"
                                placeholderTextColor={colors.textMuted}
                                value={exercise.description}
                                onChangeText={(v) => updateExercise(index, 'description', v)}
                                multiline
                            />
                            <View style={styles.numberRow}>
                                <View style={styles.numberField}>
                                    <Text style={styles.numberLabel}>Sets</Text>
                                    <TextInput
                                        style={styles.numberInput}
                                        value={exercise.sets}
                                        onChangeText={(v) => updateExercise(index, 'sets', v)}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                    />
                                </View>
                                <View style={styles.numberField}>
                                    <Text style={styles.numberLabel}>Reps</Text>
                                    <TextInput
                                        style={styles.numberInput}
                                        value={exercise.reps}
                                        onChangeText={(v) => updateExercise(index, 'reps', v)}
                                        keyboardType="number-pad"
                                        maxLength={3}
                                    />
                                </View>
                                <View style={styles.numberField}>
                                    <Text style={styles.numberLabel}>Hold (sec)</Text>
                                    <TextInput
                                        style={styles.numberInput}
                                        placeholder="—"
                                        placeholderTextColor={colors.textMuted}
                                        value={exercise.hold_seconds}
                                        onChangeText={(v) => updateExercise(index, 'hold_seconds', v)}
                                        keyboardType="number-pad"
                                        maxLength={3}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.bottomAction}>
                <Button
                    title="Create Exercise Plan"
                    onPress={handleCreate}
                    disabled={!title.trim() || !patientId.trim() || isLoading}
                    loading={isLoading}
                    fullWidth
                    size="lg"
                    variant="primary"
                />
            </View>
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
    scrollContent: { padding: spacing.xl, paddingBottom: spacing['3xl'] },
    section: { marginBottom: spacing['2xl'] },
    sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.md },
    sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingVertical: spacing.xs, paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full, backgroundColor: 'rgba(10,104,71,0.12)',
    },
    addBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
    fieldGroup: {
        backgroundColor: colors.bgCard, borderRadius: borderRadius.xl,
        borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    },
    field: { padding: spacing.lg },
    fieldBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
    fieldLabel: {
        fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textMuted,
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm,
    },
    input: { fontSize: fontSize.base, color: colors.textPrimary },
    exerciseCard: {
        backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
        padding: spacing.lg, marginBottom: spacing.md,
        borderWidth: 1, borderColor: colors.border,
    },
    exerciseHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: spacing.md,
    },
    exerciseNum: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
    exerciseInput: {
        backgroundColor: colors.bgInput, borderRadius: borderRadius.md,
        padding: spacing.md, fontSize: fontSize.base, color: colors.textPrimary,
        borderWidth: 1, borderColor: colors.border,
    },
    numberRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    numberField: { flex: 1 },
    numberLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 4, fontWeight: fontWeight.medium },
    numberInput: {
        backgroundColor: colors.bgInput, borderRadius: borderRadius.md,
        padding: spacing.md, fontSize: fontSize.base, color: colors.textPrimary,
        textAlign: 'center', borderWidth: 1, borderColor: colors.border,
    },
    bottomAction: {
        paddingHorizontal: spacing.xl, paddingVertical: spacing.lg,
        borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgDark,
    },
});
