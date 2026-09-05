import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, toast, AppointmentCardSkeleton, CardSkeleton } from '../../../components/ui';
import { useAppointmentStore } from '../../../stores/appointmentStore';
import { useAuthStore } from '../../../stores/authStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../constants/theme';
import { format, parseISO } from 'date-fns';
import { SERVICE_LABELS, SERVICE_PRICES, SessionNote } from '../../../lib/types';

export default function ClinicianSessionDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { profile } = useAuthStore();
    const {
        selectedAppointment,
        fetchAppointmentById,
        updateAppointmentStatus,
        createSessionNote,
        fetchSessionNote,
    } = useAppointmentStore();

    const [showNoteForm, setShowNoteForm] = useState(false);
    const [existingNote, setExistingNote] = useState<SessionNote | null>(null);
    const [noteForm, setNoteForm] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        pain_score_before: '',
        pain_score_after: '',
        rom_notes: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (id) {
            fetchAppointmentById(id);
            loadNote();
        }
    }, [id]);

    const loadNote = async () => {
        if (!id) return;
        const note = await fetchSessionNote(id);
        if (note) {
            setExistingNote(note);
            setNoteForm({
                subjective: note.subjective,
                objective: note.objective,
                assessment: note.assessment,
                plan: note.plan,
                pain_score_before: note.pain_score_before?.toString() || '',
                pain_score_after: note.pain_score_after?.toString() || '',
                rom_notes: note.rom_notes || '',
            });
        }
    };

    const handleConfirmAppointment = async () => {
        if (!id) return;
        const { error } = await updateAppointmentStatus(id, 'confirmed');
        if (error) {
            toast.error('Error', error);
        } else {
            toast.success('Confirmed ✅', 'Appointment has been confirmed.');
        }
    };

    const handleDeclineAppointment = async () => {
        if (!id) return;
        const doDecline = async () => {
            const { error } = await updateAppointmentStatus(id, 'cancelled');
            if (error) {
                toast.error('Error', error);
            } else {
                toast.info('Declined', 'Appointment has been cancelled.');
                router.back();
            }
        };
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to decline this appointment?')) doDecline();
        } else {
            Alert.alert('Decline Appointment?', 'This cannot be undone.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Decline', style: 'destructive', onPress: doDecline },
            ]);
        }
    };

    const handleStartSession = async () => {
        if (!id) return;
        const { error } = await updateAppointmentStatus(id, 'in_progress');
        if (error) toast.error('Error', error);
        else toast.info('Session Started', 'Session is now in progress.');
    };

    const handleSaveNote = async () => {
        if (!id || !profile) return;

        if (!noteForm.subjective.trim() || !noteForm.objective.trim() ||
            !noteForm.assessment.trim() || !noteForm.plan.trim()) {
            toast.warning('Incomplete', 'Please fill in all SOAP sections.');
            return;
        }

        setIsSaving(true);
        const { error } = await createSessionNote({
            appointment_id: id,
            clinician_id: profile.id,
            subjective: noteForm.subjective.trim(),
            objective: noteForm.objective.trim(),
            assessment: noteForm.assessment.trim(),
            plan: noteForm.plan.trim(),
            pain_score_before: noteForm.pain_score_before ? parseInt(noteForm.pain_score_before) : null,
            pain_score_after: noteForm.pain_score_after ? parseInt(noteForm.pain_score_after) : null,
            rom_notes: noteForm.rom_notes.trim() || null,
        });
        setIsSaving(false);

        if (error) {
            toast.error('Error', error);
        } else {
            toast.success('Session Complete ✅', 'SOAP note saved and session marked as completed.');
            router.back();
        }
    };

    if (!selectedAppointment) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ padding: spacing.xl }}>
                    <AppointmentCardSkeleton />
                    <AppointmentCardSkeleton />
                    <CardSkeleton />
                </View>
            </SafeAreaView>
        );
    }

    const apt = selectedAppointment;
    const formatPrice = (amount: number) => `₦${amount.toLocaleString()}`;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Session Management</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Patient & Appointment Info */}
                    <Card style={styles.infoCard}>
                        <View style={styles.patientRow}>
                            <View style={styles.patientAvatar}>
                                <Text style={styles.avatarText}>
                                    {apt.patient?.full_name?.charAt(0) || 'P'}
                                </Text>
                            </View>
                            <View style={styles.patientInfo}>
                                <Text style={styles.patientName}>{apt.patient?.full_name?.split(' ')[0] || 'Patient'}</Text>
                                <Text style={styles.patientPhone}>{apt.patient?.phone || ''}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.aptDetails}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Service</Text>
                                <Text style={styles.detailValue}>{SERVICE_LABELS[apt.service_type]}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Date</Text>
                                <Text style={styles.detailValue}>
                                    {format(parseISO(apt.scheduled_at), 'EEE, MMM d · h:mm a')}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Duration</Text>
                                <Text style={styles.detailValue}>{apt.duration_minutes} minutes</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Location</Text>
                                <Text style={styles.detailValue}>{apt.location}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Fee</Text>
                                <Text style={[styles.detailValue, { color: colors.primary }]}>
                                    {formatPrice(SERVICE_PRICES[apt.service_type])}
                                </Text>
                            </View>
                        </View>
                    </Card>

                    {/* Session Actions */}
                    {apt.status === 'pending' && (
                        <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
                            <View style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: borderRadius.lg,
                                padding: spacing.lg,
                                borderWidth: 1,
                                borderColor: 'rgba(245, 158, 11, 0.2)',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: spacing.sm,
                            }}>
                                <Ionicons name="time-outline" size={20} color="#F59E0B" />
                                <Text style={{ color: '#F59E0B', fontSize: fontSize.sm, fontWeight: fontWeight.semibold, flex: 1 }}>
                                    This appointment is awaiting your confirmation
                                </Text>
                            </View>
                            <Button
                                title="✅ Confirm Appointment"
                                onPress={handleConfirmAppointment}
                                variant="primary"
                                fullWidth
                                size="lg"
                            />
                            <TouchableOpacity
                                style={{
                                    paddingVertical: spacing.md,
                                    alignItems: 'center',
                                    borderRadius: borderRadius.lg,
                                    borderWidth: 1,
                                    borderColor: 'rgba(239, 68, 68, 0.3)',
                                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                }}
                                onPress={handleDeclineAppointment}
                            >
                                <Text style={{ color: '#EF4444', fontWeight: fontWeight.semibold, fontSize: fontSize.base }}>
                                    Decline
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {apt.status === 'confirmed' && (
                        <Button
                            title="▶ Start Session"
                            onPress={handleStartSession}
                            variant="primary"
                            fullWidth
                            size="lg"
                            style={{ marginBottom: spacing.xl }}
                        />
                    )}

                    {apt.status === 'in_progress' && !existingNote && (
                        <Button
                            title="📝 Write SOAP Note"
                            onPress={() => setShowNoteForm(true)}
                            variant="accent"
                            fullWidth
                            size="lg"
                            style={{ marginBottom: spacing.xl }}
                        />
                    )}

                    {/* SOAP Note Form */}
                    {(showNoteForm || existingNote) && (
                        <Card title="SOAP Note" style={styles.noteCard}>
                            {/* Pain Score */}
                            <View style={styles.painRow}>
                                <View style={styles.painInput}>
                                    <Text style={styles.noteLabel}>Pain Before (0-10)</Text>
                                    <TextInput
                                        style={styles.painTextInput}
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={noteForm.pain_score_before}
                                        onChangeText={(v) => setNoteForm({ ...noteForm, pain_score_before: v })}
                                        placeholder="—"
                                        placeholderTextColor={colors.textMuted}
                                        editable={!existingNote}
                                    />
                                </View>
                                <View style={styles.painInput}>
                                    <Text style={styles.noteLabel}>Pain After (0-10)</Text>
                                    <TextInput
                                        style={styles.painTextInput}
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={noteForm.pain_score_after}
                                        onChangeText={(v) => setNoteForm({ ...noteForm, pain_score_after: v })}
                                        placeholder="—"
                                        placeholderTextColor={colors.textMuted}
                                        editable={!existingNote}
                                    />
                                </View>
                            </View>

                            {/* SOAP Fields */}
                            {([
                                { key: 'subjective', label: 'Subjective', placeholder: "Patient's reported symptoms, complaints, and history..." },
                                { key: 'objective', label: 'Objective', placeholder: 'Clinical findings, ROM, strength tests, palpation...' },
                                { key: 'assessment', label: 'Assessment', placeholder: 'Clinical interpretation, diagnosis, progress analysis...' },
                                { key: 'plan', label: 'Plan', placeholder: 'Treatment plan, exercises prescribed, follow-up schedule...' },
                            ] as const).map(({ key, label, placeholder }) => (
                                <View key={key} style={styles.noteField}>
                                    <Text style={styles.noteFieldLabel}>{label}</Text>
                                    <TextInput
                                        style={styles.noteTextInput}
                                        multiline
                                        numberOfLines={4}
                                        placeholder={placeholder}
                                        placeholderTextColor={colors.textMuted}
                                        value={noteForm[key]}
                                        onChangeText={(v) => setNoteForm({ ...noteForm, [key]: v })}
                                        textAlignVertical="top"
                                        editable={!existingNote}
                                    />
                                </View>
                            ))}

                            {/* ROM Notes */}
                            <View style={styles.noteField}>
                                <Text style={styles.noteFieldLabel}>ROM / Additional Notes</Text>
                                <TextInput
                                    style={styles.noteTextInput}
                                    multiline
                                    numberOfLines={3}
                                    placeholder="Range of motion measurements, special tests..."
                                    placeholderTextColor={colors.textMuted}
                                    value={noteForm.rom_notes}
                                    onChangeText={(v) => setNoteForm({ ...noteForm, rom_notes: v })}
                                    textAlignVertical="top"
                                    editable={!existingNote}
                                />
                            </View>

                            {!existingNote && (
                                <Button
                                    title="Save Note & Complete Session"
                                    onPress={handleSaveNote}
                                    loading={isSaving}
                                    variant="primary"
                                    fullWidth
                                    size="lg"
                                    style={{ marginTop: spacing.lg }}
                                />
                            )}
                        </Card>
                    )}

                    {/* Existing Note Display */}
                    {existingNote && (
                        <View style={styles.completedBanner}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                            <Text style={styles.completedText}>Session completed & documented</Text>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bgDark },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    topBarTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: colors.textSecondary, fontSize: fontSize.base },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: spacing['5xl'],
    },
    infoCard: {
        marginBottom: spacing.xl,
    },
    patientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    patientAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    avatarText: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    patientInfo: { flex: 1 },
    patientName: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    patientPhone: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginBottom: spacing.lg,
    },
    aptDetails: { gap: spacing.md },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    detailValue: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
    },
    noteCard: {
        marginBottom: spacing.xl,
    },
    painRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    painInput: {
        flex: 1,
    },
    noteLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    painTextInput: {
        backgroundColor: colors.bgInput,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        color: colors.textPrimary,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    noteField: {
        marginBottom: spacing.xl,
    },
    noteFieldLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.primary,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    noteTextInput: {
        backgroundColor: colors.bgInput,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        color: colors.textPrimary,
        fontSize: fontSize.base,
        minHeight: 100,
        borderWidth: 1,
        borderColor: colors.border,
        lineHeight: 22,
    },
    completedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    completedText: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.success,
    },
});
