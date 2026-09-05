import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../stores/authStore';
import { useAppointmentStore } from '../../../stores/appointmentStore';
import { supabase } from '../../../lib/supabase';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../constants/theme';
import { format, parseISO } from 'date-fns';
import { SERVICE_LABELS, SERVICE_PRICES } from '../../../lib/types';
import type { Profile, Appointment } from '../../../lib/types';
import { PatientProfileSkeleton } from '../../../components/ui/Skeleton';
import { toast } from '../../../components/ui';

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
    pending: { color: '#F59E0B', label: 'Pending', icon: 'time-outline' },
    confirmed: { color: '#10B981', label: 'Confirmed', icon: 'checkmark-circle-outline' },
    in_progress: { color: '#3B82F6', label: 'In Progress', icon: 'play-circle-outline' },
    completed: { color: '#0A6847', label: 'Completed', icon: 'checkmark-done-outline' },
    cancelled: { color: '#94A3B8', label: 'Cancelled', icon: 'close-circle-outline' },
    no_show: { color: '#EF4444', label: 'No Show', icon: 'alert-circle-outline' },
};

export default function PatientDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { profile: clinicianProfile } = useAuthStore();
    const { appointments, fetchAppointments } = useAppointmentStore();
    const [patient, setPatient] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [prospectiveSessions, setProspectiveSessions] = useState<any[]>([]);
    const [coverageLoading, setCoverageLoading] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [id, clinicianProfile]);

    const loadData = async () => {
        if (!id || !clinicianProfile) return;
        setIsLoading(true);

        await fetchAppointments(clinicianProfile.id, 'clinician');

        // Try direct fetch first (works if clinician has appointment with patient)
        let { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        // Fallback: fetch via connected patients RPC (SECURITY DEFINER bypasses RLS)
        // This handles the case where clinician is connected but has no appointment yet
        if (!profileData) {
            const { data: connectedList } = await supabase.rpc('get_connected_patients');
            const match = (connectedList || []).find((p: any) => p.patient_id === id);
            if (match) {
                profileData = {
                    id: match.patient_id,
                    full_name: match.full_name,
                    email: match.email,
                    phone: match.phone,
                    avatar_url: match.avatar_url,
                    date_of_birth: match.date_of_birth,
                    address: match.address,
                    role: 'patient',
                    medical_history: null,
                    emergency_contact_name: null,
                    emergency_contact_phone: null,
                    push_token: null,
                    is_suspended: false,
                    created_at: match.connected_at,
                    updated_at: match.connected_at,
                } as any;
            }
        }

        if (profileData) setPatient(profileData as Profile);

        // Fetch ALL upcoming sessions for this patient directly
        // (RLS policy "Connected clinicians can view patient sessions" allows this
        //  if the clinician is connected to the patient)
        const now = new Date().toISOString();
        const { data: sessionData, error: sessionError } = await supabase
            .from('appointments')
            .select('id, patient_id, clinician_id, service_type, scheduled_at, duration_minutes, status, location, coverage_clinician_id, coverage_status')
            .eq('patient_id', id)
            .gt('scheduled_at', now)
            .not('status', 'in', '(completed,cancelled,no_show)')
            .order('scheduled_at', { ascending: true });

        if (sessionError) {
            console.error('[Coverage] Query error:', sessionError.message);
        }

        if (sessionData && sessionData.length > 0) {
            // Get unique clinician IDs to fetch their names
            const clinicianIds = [...new Set(sessionData.map((s: any) => s.clinician_id))];
            const { data: clinicianProfiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', clinicianIds);

            const profileMap: Record<string, string> = {};
            (clinicianProfiles || []).forEach((p: any) => { profileMap[p.id] = p.full_name; });

            const enriched = sessionData.map((s: any) => ({
                ...s,
                clinician_name: profileMap[s.clinician_id] || 'Unknown',
                is_own_session: s.clinician_id === clinicianProfile.id,
            }));

            setProspectiveSessions(enriched);
        } else {
            setProspectiveSessions([]);
        }

        setIsLoading(false);
    };

    const handleOfferCoverage = async (appointmentId: string) => {
        setCoverageLoading(appointmentId);
        try {
            const { data, error } = await supabase.rpc('offer_session_coverage', {
                target_appointment_id: appointmentId,
            });
            if (error) throw error;
            if (data?.success) {
                toast.success('Coverage Offered', 'You are now covering this session.');
                loadData();
            } else {
                toast.error('Failed', data?.error || 'Could not offer coverage.');
            }
        } catch (err: any) {
            toast.error('Error', err.message);
        } finally {
            setCoverageLoading(null);
        }
    };

    const handleWithdrawCoverage = async (appointmentId: string) => {
        const doWithdraw = async () => {
            setCoverageLoading(appointmentId);
            try {
                const { data, error } = await supabase.rpc('withdraw_coverage', {
                    target_appointment_id: appointmentId,
                });
                if (error) throw error;
                if (data?.success) {
                    toast.success('Withdrawn', 'Coverage withdrawn successfully.');
                    loadData();
                } else {
                    toast.error('Failed', data?.error || 'Could not withdraw coverage.');
                }
            } catch (err: any) {
                toast.error('Error', err.message);
            } finally {
                setCoverageLoading(null);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Withdraw your coverage for this session?')) doWithdraw();
        } else {
            Alert.alert('Withdraw Coverage', 'Are you sure you want to withdraw from this session?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Withdraw', style: 'destructive', onPress: doWithdraw },
            ]);
        }
    };

    const confirmDisconnect = () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Are you sure you want to disconnect from this patient? They will be removed from your patient list unless they have booked appointments with you.");
            if (confirmed) {
                handleDisconnect();
            }
        } else {
            Alert.alert(
                "Disconnect Patient",
                "Are you sure you want to disconnect from this patient? They will be removed from your patient list unless they have booked appointments with you.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Disconnect", style: "destructive", onPress: handleDisconnect }
                ]
            );
        }
    };

    const handleDisconnect = async () => {
        if (!id || !clinicianProfile) return;
        setIsLoading(true);
        try {
            const { error } = await supabase.rpc('disconnect_patient', {
                target_patient_id: id
            });
            if (error) throw error;
            router.back();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to disconnect");
            setIsLoading(false);
        }
    };

    // Get this patient's appointments with the clinician
    const patientAppointments = appointments
        .filter(apt => apt.patient_id === id)
        .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

    // If we didn't get patient from direct query, get from appointments
    const patientInfo = patient || patientAppointments[0]?.patient as Profile | undefined;

    // Stats
    const totalSessions = patientAppointments.filter(a => a.status === 'completed').length;
    const upcomingSessions = patientAppointments.filter(
        a => ['pending', 'confirmed'].includes(a.status)
    ).length;
    const cancelledSessions = patientAppointments.filter(a => a.status === 'cancelled').length;

    const formatPrice = (amount: number) => `₦${amount.toLocaleString()}`;

    if (!patientInfo && !isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.topBarTitle}>Patient Details</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.emptyState}>
                    <Ionicons name="person-outline" size={48} color={colors.textMuted} />
                    <Text style={styles.emptyTitle}>Patient not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Patient Details</Text>
                <TouchableOpacity onPress={confirmDisconnect} style={styles.backBtn}>
                    <Ionicons name="person-remove-outline" size={20} color={colors.error} />
                </TouchableOpacity>
            </View>

            {isLoading && !patientInfo ? (
                <PatientProfileSkeleton />
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={colors.primary} />
                    }
                >
                {/* Patient Profile Card */}
                {patientInfo && (
                    <View style={styles.profileCard}>
                        <View style={styles.avatarLarge}>
                            <Text style={styles.avatarLargeText}>
                                {patientInfo.full_name?.charAt(0)?.toUpperCase() || 'P'}
                            </Text>
                        </View>
                        <Text style={styles.profileName}>{patientInfo.full_name}</Text>
                        {patientInfo.phone && (
                            <View style={styles.infoRow}>
                                <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
                                <Text style={styles.infoText}>{patientInfo.phone}</Text>
                            </View>
                        )}
                        {patientInfo.email && (
                            <View style={styles.infoRow}>
                                <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
                                <Text style={styles.infoText}>{patientInfo.email}</Text>
                            </View>
                        )}
                        {patientInfo.date_of_birth && (
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                                <Text style={styles.infoText}>
                                    DOB: {format(parseISO(patientInfo.date_of_birth), 'MMM d, yyyy')}
                                </Text>
                            </View>
                        )}
                        {patientInfo.address && (
                            <View style={styles.infoRow}>
                                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                                <Text style={styles.infoText}>{patientInfo.address}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionBtn}
                        activeOpacity={0.85}
                        onPress={() => router.push('/(clinician)/messages' as any)}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
                            <Ionicons name="chatbubbles-outline" size={20} color={colors.info} />
                        </View>
                        <Text style={styles.quickActionLabel}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionBtn}
                        activeOpacity={0.85}
                        onPress={() => router.push('/(clinician)/create-exercise-plan' as any)}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                            <Ionicons name="barbell-outline" size={20} color={colors.success} />
                        </View>
                        <Text style={styles.quickActionLabel}>Exercise Plan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionBtn}
                        activeOpacity={0.85}
                        onPress={() => router.push('/(clinician)/revenue' as any)}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                            <Ionicons name="receipt-outline" size={20} color={colors.warning} />
                        </View>
                        <Text style={styles.quickActionLabel}>Invoice</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{totalSessions}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: colors.info }]}>{upcomingSessions}</Text>
                        <Text style={styles.statLabel}>Upcoming</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: colors.textMuted }]}>{cancelledSessions}</Text>
                        <Text style={styles.statLabel}>Cancelled</Text>
                    </View>
                </View>

                {/* Medical History */}
                {patientInfo?.medical_history && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Medical History</Text>
                        <View style={styles.medicalCard}>
                            <Text style={styles.medicalText}>{patientInfo.medical_history}</Text>
                        </View>
                    </View>
                )}

                {/* Emergency Contact */}
                {patientInfo?.emergency_contact_name && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Emergency Contact</Text>
                        <View style={styles.medicalCard}>
                            <View style={styles.infoRow}>
                                <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                                <Text style={styles.infoText}>{patientInfo.emergency_contact_name}</Text>
                            </View>
                            {patientInfo.emergency_contact_phone && (
                                <View style={[styles.infoRow, { marginTop: spacing.sm }]}>
                                    <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
                                    <Text style={styles.infoText}>{patientInfo.emergency_contact_phone}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Upcoming Sessions */}
                <View style={styles.section}>
                    <View style={styles.prospectiveHeader}>
                        <View style={styles.prospectiveTitleRow}>
                            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                        </View>
                        <Text style={styles.prospectiveSubtitle}>
                            All future sessions — offer to cover sessions booked with other clinicians
                        </Text>
                    </View>
                    {prospectiveSessions.length === 0 ? (
                        <View style={styles.emptyHistory}>
                            <Text style={styles.emptyHistoryText}>
                                No upcoming sessions scheduled
                            </Text>
                        </View>
                    ) : (
                        prospectiveSessions.map(session => {
                            const isOwnSession = session.is_own_session;
                            const isCovering = session.coverage_clinician_id === clinicianProfile?.id
                                && session.coverage_status === 'active';
                            const isLoadingThis = coverageLoading === session.id;
                            return (
                                <View key={session.id} style={[
                                    styles.prospectiveCard,
                                    isOwnSession && styles.prospectiveCardOwn,
                                    isCovering && styles.prospectiveCardCovering,
                                ]}>
                                    <View style={styles.prospectiveLeft}>
                                        <Text style={styles.prospectiveService}>
                                            {SERVICE_LABELS[session.service_type as any] || session.service_type}
                                        </Text>
                                        <Text style={styles.prospectiveDate}>
                                            {format(parseISO(session.scheduled_at), 'EEE, MMM d · h:mm a')}
                                        </Text>
                                        <View style={styles.prospectiveClinicianRow}>
                                            <Ionicons name="person-outline" size={12} color={colors.textMuted} />
                                            <Text style={styles.prospectiveClinicianName}>
                                                {isOwnSession ? 'Your session' : `Booked with: ${session.clinician_name}`}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.prospectiveRight}>
                                        {isOwnSession ? (
                                            <View style={styles.ownSessionBadge}>
                                                <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
                                                <Text style={styles.ownSessionBadgeText}>Yours</Text>
                                            </View>
                                        ) : isCovering ? (
                                            <>
                                                <View style={styles.coveringBadge}>
                                                    <Ionicons name="shield-checkmark" size={12} color={colors.success} />
                                                    <Text style={styles.coveringBadgeText}>Covering</Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.withdrawBtn}
                                                    onPress={() => handleWithdrawCoverage(session.id)}
                                                    disabled={!!isLoadingThis}
                                                >
                                                    <Text style={styles.withdrawBtnText}>
                                                        {isLoadingThis ? '...' : 'Withdraw'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </>
                                        ) : (
                                            <TouchableOpacity
                                                style={[styles.coverBtn, isLoadingThis && { opacity: 0.6 }]}
                                                onPress={() => handleOfferCoverage(session.id)}
                                                disabled={!!isLoadingThis}
                                            >
                                                <Ionicons name="add-circle-outline" size={14} color={colors.bgDark} />
                                                <Text style={styles.coverBtnText}>
                                                    {isLoadingThis ? '...' : 'Cover'}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* Appointment History */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Appointment History ({patientAppointments.length})
                    </Text>
                    {patientAppointments.length === 0 ? (
                        <View style={styles.emptyHistory}>
                            <Text style={styles.emptyHistoryText}>No appointments yet</Text>
                        </View>
                    ) : (
                        patientAppointments.map(apt => {
                            const config = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                            return (
                                <TouchableOpacity
                                    key={apt.id}
                                    style={styles.appointmentCard}
                                    activeOpacity={0.85}
                                    onPress={() => router.push(`/(clinician)/session/${apt.id}` as any)}
                                >
                                    <View style={[styles.statusDot, { backgroundColor: config.color }]} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.aptService}>
                                            {SERVICE_LABELS[apt.service_type]}
                                        </Text>
                                        <Text style={styles.aptDate}>
                                            {format(parseISO(apt.scheduled_at), 'EEE, MMM d, yyyy · h:mm a')}
                                        </Text>
                                    </View>
                                    <View style={styles.aptRight}>
                                        <View style={[styles.statusBadge, { backgroundColor: `${config.color}18` }]}>
                                            <Text style={[styles.statusText, { color: config.color }]}>
                                                {config.label}
                                            </Text>
                                        </View>
                                        <Text style={styles.aptDuration}>{apt.duration_minutes} min</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bgDark },
    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: colors.bgCard,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border,
    },
    topBarTitle: {
        fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary,
    },
    scrollContent: {
        padding: spacing.xl, paddingBottom: spacing['5xl'],
    },
    profileCard: {
        alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: borderRadius.xl,
        padding: spacing['2xl'], marginBottom: spacing.xl,
        borderWidth: 1, borderColor: colors.border,
    },
    avatarLarge: {
        width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryDark,
        justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg,
    },
    avatarLargeText: {
        fontSize: 28, fontWeight: fontWeight.bold, color: colors.textPrimary,
    },
    profileName: {
        fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs,
    },
    infoText: {
        fontSize: fontSize.sm, color: colors.textSecondary,
    },
    quickActions: {
        flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl,
    },
    quickActionBtn: {
        flex: 1, alignItems: 'center', backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg, padding: spacing.lg,
        borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
    },
    quickActionIcon: {
        width: 40, height: 40, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
    },
    quickActionLabel: {
        fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.textSecondary,
    },
    statsRow: {
        flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1, alignItems: 'center', backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg, padding: spacing.lg,
        borderWidth: 1, borderColor: colors.border,
    },
    statValue: {
        fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary,
    },
    statLabel: {
        fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    medicalCard: {
        backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
        padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
    },
    medicalText: {
        fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22,
    },
    appointmentCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.border, gap: spacing.md,
    },
    statusDot: {
        width: 10, height: 10, borderRadius: 5,
    },
    aptService: {
        fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary,
    },
    aptDate: {
        fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2,
    },
    aptRight: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingVertical: 2, paddingHorizontal: spacing.sm, borderRadius: borderRadius.full,
    },
    statusText: {
        fontSize: 10, fontWeight: fontWeight.semibold,
    },
    aptDuration: {
        fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4,
    },
    emptyState: {
        flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['5xl'],
    },
    emptyTitle: {
        fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary,
        marginTop: spacing.lg,
    },
    emptyHistory: {
        alignItems: 'center', paddingVertical: spacing['2xl'],
        backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
        borderWidth: 1, borderColor: colors.border,
    },
    emptyHistoryText: {
        fontSize: fontSize.sm, color: colors.textMuted,
    },
    // Prospective Sessions
    prospectiveHeader: {
        marginBottom: spacing.md,
    },
    prospectiveTitleRow: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs,
    },
    prospectiveSubtitle: {
        fontSize: fontSize.xs, color: colors.textMuted,
    },
    prospectiveCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
        padding: spacing.lg, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: `${colors.warning}40`,
    },
    prospectiveCardOwn: {
        borderColor: `${colors.primary}50`,
        backgroundColor: `${colors.primary}06`,
    },
    prospectiveCardCovering: {
        borderColor: `${colors.success}60`,
        backgroundColor: `${colors.success}08`,
    },
    ownSessionBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: `${colors.primary}15`, paddingHorizontal: spacing.sm,
        paddingVertical: 4, borderRadius: borderRadius.full,
        borderWidth: 1, borderColor: `${colors.primary}50`,
    },
    ownSessionBadgeText: {
        fontSize: 10, fontWeight: fontWeight.bold, color: colors.primary,
    },
    prospectiveLeft: { flex: 1, gap: 3 },
    prospectiveService: {
        fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary,
    },
    prospectiveDate: {
        fontSize: fontSize.sm, color: colors.textSecondary,
    },
    prospectiveClinicianRow: {
        flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2,
    },
    prospectiveClinicianName: {
        fontSize: fontSize.xs, color: colors.textMuted,
    },
    prospectiveRight: {
        alignItems: 'flex-end', gap: spacing.sm, marginLeft: spacing.md,
    },
    coverBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: colors.warning, paddingHorizontal: spacing.md,
        paddingVertical: 7, borderRadius: borderRadius.full,
    },
    coverBtnText: {
        fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.bgDark,
    },
    coveringBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: `${colors.success}20`, paddingHorizontal: spacing.sm,
        paddingVertical: 4, borderRadius: borderRadius.full,
        borderWidth: 1, borderColor: colors.success,
    },
    coveringBadgeText: {
        fontSize: 10, fontWeight: fontWeight.bold, color: colors.success,
    },
    withdrawBtn: {
        paddingHorizontal: spacing.sm, paddingVertical: 4,
    },
    withdrawBtnText: {
        fontSize: fontSize.xs, color: colors.error, fontWeight: fontWeight.semibold,
    },
});
