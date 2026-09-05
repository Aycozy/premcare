import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, toast, AppointmentCardSkeleton } from '../../../components/ui';
import { useAppointmentStore } from '../../../stores/appointmentStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../constants/theme';
import { format, parseISO, isPast } from 'date-fns';
import { SERVICE_LABELS, SERVICE_PRICES } from '../../../lib/types';

export default function PatientSessionDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { selectedAppointment, fetchAppointmentById, cancelAppointment } = useAppointmentStore();

    useEffect(() => {
        if (id) fetchAppointmentById(id);
    }, [id]);

    const handleCancel = () => {
        Alert.alert(
            'Cancel Appointment',
            'Are you sure you want to cancel this appointment? This action cannot be undone.',
            [
                { text: 'Keep It', style: 'cancel' },
                {
                    text: 'Cancel Appointment',
                    style: 'destructive',
                    onPress: async () => {
                        if (!id) return;
                        const { error } = await cancelAppointment(id);
                        if (error) {
                            toast.error('Error', error);
                        } else {
                            toast.info('Cancelled', 'Your appointment has been cancelled.');
                            router.back();
                        }
                    },
                },
            ]
        );
    };

    if (!selectedAppointment) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ padding: spacing.xl }}>
                    <AppointmentCardSkeleton />
                    <AppointmentCardSkeleton />
                </View>
            </SafeAreaView>
        );
    }

    const apt = selectedAppointment;
    const isUpcoming = ['pending', 'confirmed'].includes(apt.status) && !isPast(parseISO(apt.scheduled_at));
    const formatPrice = (amount: number) => `₦${amount.toLocaleString()}`;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Session Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Status Banner */}
                <View style={[styles.statusBanner, {
                    backgroundColor: apt.status === 'confirmed' ? 'rgba(16,185,129,0.1)' :
                        apt.status === 'pending' ? 'rgba(245,158,11,0.1)' :
                            apt.status === 'completed' ? 'rgba(10,104,71,0.1)' :
                                'rgba(239,68,68,0.1)',
                }]}>
                    <Ionicons
                        name={
                            apt.status === 'confirmed' ? 'checkmark-circle' :
                                apt.status === 'pending' ? 'time' :
                                    apt.status === 'completed' ? 'trophy' :
                                        'close-circle'
                        }
                        size={20}
                        color={
                            apt.status === 'confirmed' ? colors.success :
                                apt.status === 'pending' ? colors.warning :
                                    apt.status === 'completed' ? colors.primary :
                                        colors.error
                        }
                    />
                    <Text style={[styles.statusText, {
                        color: apt.status === 'confirmed' ? colors.success :
                            apt.status === 'pending' ? colors.warning :
                                apt.status === 'completed' ? colors.primary :
                                    colors.error
                    }]}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1).replace('_', ' ')}
                    </Text>
                </View>

                {/* Service Info */}
                <Card style={styles.mainCard}>
                    <Text style={styles.serviceName}>{SERVICE_LABELS[apt.service_type]}</Text>
                    <Text style={styles.servicePrice}>
                        {formatPrice(SERVICE_PRICES[apt.service_type])}
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
                        <Text style={styles.detailText}>
                            {format(parseISO(apt.scheduled_at), 'EEEE, MMMM d, yyyy')}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={18} color={colors.textMuted} />
                        <Text style={styles.detailText}>
                            {format(parseISO(apt.scheduled_at), 'h:mm a')} · {apt.duration_minutes} minutes
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={18} color={colors.textMuted} />
                        <Text style={styles.detailText}>{apt.location}</Text>
                    </View>
                </Card>

                {/* Clinician Card */}
                <Card title="Your Clinician" style={styles.clinicianCard}>
                    <View style={styles.clinicianRow}>
                        <View style={styles.clinicianAvatar}>
                            <Text style={styles.clinicianInitial}>
                                {apt.clinician?.full_name?.charAt(0) || 'C'}
                            </Text>
                        </View>
                        <View style={styles.clinicianInfo}>
                            <Text style={styles.clinicianName}>
                                {apt.clinician?.full_name || 'Premcare Clinician'}
                            </Text>
                            <Text style={styles.clinicianLabel}>Licensed Physiotherapist</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.callButton}
                            onPress={() => Linking.openURL('tel:+2348023331387')}
                        >
                            <Ionicons name="call" size={18} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Session Notes (if completed) */}
                {apt.session_note && (
                    <Card title="Session Notes" style={styles.notesCard}>
                        {(['subjective', 'objective', 'assessment', 'plan'] as const).map((field) => (
                            <View key={field} style={styles.noteSection}>
                                <Text style={styles.noteLabel}>
                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                </Text>
                                <Text style={styles.noteContent}>
                                    {(apt.session_note as any)[field] || 'N/A'}
                                </Text>
                            </View>
                        ))}
                    </Card>
                )}

                {/* Notes */}
                {apt.notes && (
                    <Card title="Your Notes" style={styles.notesCard}>
                        <Text style={styles.noteContent}>{apt.notes}</Text>
                    </Card>
                )}

                {/* Actions */}
                {isUpcoming && (
                    <View style={styles.actions}>
                        <Button
                            title="Cancel Appointment"
                            onPress={handleCancel}
                            variant="danger"
                            fullWidth
                            size="lg"
                        />
                    </View>
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
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: colors.textSecondary,
        fontSize: fontSize.base,
    },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: spacing['5xl'],
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xl,
    },
    statusText: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
    },
    mainCard: {
        marginBottom: spacing.lg,
    },
    serviceName: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    servicePrice: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.primary,
        marginTop: spacing.xs,
    },
    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginVertical: spacing.lg,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    detailText: {
        fontSize: fontSize.base,
        color: colors.textSecondary,
        flex: 1,
    },
    clinicianCard: {
        marginBottom: spacing.lg,
    },
    clinicianRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    clinicianAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    clinicianInitial: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    clinicianInfo: {
        flex: 1,
    },
    clinicianName: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    clinicianLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(10, 104, 71, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notesCard: {
        marginBottom: spacing.lg,
    },
    noteSection: {
        marginBottom: spacing.lg,
    },
    noteLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.primary,
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    noteContent: {
        fontSize: fontSize.base,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    actions: {
        marginTop: spacing.lg,
    },
});
