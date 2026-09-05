import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../stores/authStore';
import { useAppointmentStore } from '../../../stores/appointmentStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../constants/theme';
import type { Profile } from '../../../lib/types';
import { CardSkeleton, Button, Input, toast } from '../../../components/ui';

export default function ClinicianPatients() {
    const { profile } = useAuthStore();
    const { appointments, fetchAppointments, isLoading } = useAppointmentStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [connections, setConnections] = useState<any[]>([]);
    const [isConnectionsLoading, setIsConnectionsLoading] = useState(false);
    
    // Connect modal state
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [connectEmail, setConnectEmail] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    
    const router = useRouter();

    const fetchConnections = async () => {
        if (!profile) return;
        const { data, error } = await supabase
            .from('patient_connections')
            .select('patient_id, patient:profiles!patient_id(*)')
            .eq('clinician_id', profile.id)
            .eq('status', 'active');
            
        if (error) {
            console.error('Error fetching connections:', error);
            return;
        }
        if (data) setConnections(data);
    };

    const loadData = async () => {
        if (!profile) return;
        setIsConnectionsLoading(true);
        await Promise.all([
            fetchAppointments(profile.id, 'clinician'),
            fetchConnections()
        ]);
        setIsConnectionsLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [profile])
    );

    // Extract unique patients from appointments
    const patientsMap = new Map<string, { profile: Profile; sessionCount: number; lastVisit: string }>();
    appointments.forEach((apt) => {
        if (apt.patient) {
            const existing = patientsMap.get(apt.patient.id);
            if (existing) {
                existing.sessionCount++;
                if (apt.scheduled_at > existing.lastVisit) existing.lastVisit = apt.scheduled_at;
            } else {
                patientsMap.set(apt.patient.id, {
                    profile: apt.patient,
                    sessionCount: 1,
                    lastVisit: apt.scheduled_at,
                });
            }
        }
    });

    connections.forEach((conn) => {
        const p = conn.patient;
        if (p && !patientsMap.has(p.id)) {
            patientsMap.set(p.id, {
                profile: p,
                sessionCount: 0,
                lastVisit: '',
            });
        }
    });

    const patients = Array.from(patientsMap.values()).filter((p) =>
        p.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleConnectPatient = async () => {
        if (!connectEmail.trim()) return;
        setIsConnecting(true);
        
        try {
            const { data, error } = await supabase.rpc('connect_patient_by_email', {
                target_email: connectEmail.trim().toLowerCase()
            });
            
            if (error) throw error;
            
            if (data?.success) {
                toast.success('Success', data.message);
                setShowConnectModal(false);
                setConnectEmail('');
                loadData();
            } else {
                toast.error('Connection Failed', data?.error || 'Patient not found');
            }
        } catch (err: any) {
            toast.error('Error', err.message);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>My Patients</Text>
                    <Text style={styles.patientCount}>{patients.length} patients</Text>
                </View>
                <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => setShowConnectModal(true)}
                >
                    <Ionicons name="add" size={20} color={colors.bgDark} />
                    <Text style={styles.addBtnText}>Connect</Text>
                </TouchableOpacity>
            </View>

            {/* Connect Modal */}
            {showConnectModal && (
                <Animated.View entering={FadeInDown.springify()} style={styles.modalCard}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Connect Patient</Text>
                        <TouchableOpacity onPress={() => setShowConnectModal(false)}>
                            <Ionicons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.modalDesc}>
                        Enter the patient's email address to instantly add them to your care list.
                    </Text>
                    <Input
                        placeholder="patient@email.com"
                        value={connectEmail}
                        onChangeText={setConnectEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Button
                        title="Connect to Patient"
                        onPress={handleConnectPatient}
                        loading={isConnecting}
                        variant="primary"
                        fullWidth
                    />
                </Animated.View>
            )}

            {/* Search */}
            {!showConnectModal && (
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search patients..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            )}

            {(isLoading || isConnectionsLoading) && appointments.length === 0 && connections.length === 0 ? (
                <View style={{ padding: spacing.xl }}>
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </View>
            ) : (
            <FlatList
                data={patients}
                keyExtractor={(item) => item.profile.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading || isConnectionsLoading} onRefresh={loadData} tintColor={colors.primary} />
                }
                renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                        <TouchableOpacity
                            style={styles.patientCard}
                            activeOpacity={0.85}
                            onPress={() => router.push(`/(clinician)/patient/${item.profile.id}` as any)}
                        >
                            <View style={styles.patientAvatar}>
                                <Text style={styles.avatarText}>
                                    {item.profile.full_name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.patientInfo}>
                                <Text style={styles.patientName}>{item.profile.full_name?.split(' ')[0] || 'Patient'}</Text>
                                <Text style={styles.patientMeta}>
                                    {item.sessionCount} session{item.sessionCount !== 1 ? 's' : ''} · {item.profile.phone || 'No phone'}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    </Animated.View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={56} color={colors.textMuted} />
                        <Text style={styles.emptyTitle}>No patients yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Your patients will appear here once they book appointments
                        </Text>
                    </View>
                }
            />
            )}
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
        paddingBottom: spacing.md,
    },
    headerTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    patientCount: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.xl,
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        height: 48,
        backgroundColor: colors.bgInput,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        color: colors.textPrimary,
        fontSize: fontSize.base,
    },
    listContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['5xl'],
    },
    patientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    patientAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    patientInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    patientMeta: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
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
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    addBtnText: {
        color: colors.bgDark,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
    },
    modalCard: {
        marginHorizontal: spacing.xl,
        marginBottom: spacing.lg,
        padding: spacing.xl,
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    modalTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    modalDesc: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
});
