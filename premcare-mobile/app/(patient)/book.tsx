import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, toast } from '../../components/ui';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../stores/authStore';
import { useAppointmentStore } from '../../stores/appointmentStore';
import { supabase } from '../../lib/supabase';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../constants/theme';
import {
    ServiceType,
    SERVICE_LABELS,
    SERVICE_DURATIONS,
    SERVICE_PRICES,
} from '../../lib/types';
import { format, addDays, setHours, setMinutes } from 'date-fns';

const SERVICES: ServiceType[] = [
    'general_assessment',
    'pain_management',
    'sports_rehab',
    'post_op_rehab',
    'neuro_rehab',
    'geriatric',
    'pediatric',
];

const SERVICE_ICONS: Record<ServiceType, string> = {
    pain_management: 'flash-outline',
    sports_rehab: 'fitness-outline',
    post_op_rehab: 'medkit-outline',
    neuro_rehab: 'pulse-outline',
    geriatric: 'heart-outline',
    pediatric: 'happy-outline',
    general_assessment: 'clipboard-outline',
};

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

type BookingStep = 'service' | 'datetime' | 'location' | 'confirm';

export default function BookingScreen() {
    const router = useRouter();
    const { profile } = useAuthStore();
    const { createAppointment, isLoading } = useAppointmentStore();

    const [step, setStep] = useState<BookingStep>('service');
    const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [location, setLocation] = useState(profile?.address || '');
    const [notes, setNotes] = useState('');
    const [clinicianId, setClinicianId] = useState<string | null>(null);
    const [clinicians, setClinicians] = useState<{ id: string; full_name: string }[]>([]);
    const [clinicianError, setClinicianError] = useState(false);

    // Fetch available clinicians on mount
    useEffect(() => {
        const fetchClinicians = async () => {
            // Try fetching clinician profiles directly
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('role', 'clinician');

            if (data && data.length > 0) {
                setClinicians(data);
                setClinicianId(data[0].id);
                return;
            }

            // Fallback: get clinician IDs from past appointments
            if (profile) {
                const { data: apts } = await supabase
                    .from('appointments')
                    .select('clinician_id')
                    .eq('patient_id', profile.id)
                    .limit(10);

                if (apts && apts.length > 0) {
                    const uniqueIds = [...new Set(apts.map(a => a.clinician_id))];
                    const clinicianList = uniqueIds.map(id => ({ id, full_name: 'Clinician' }));
                    setClinicians(clinicianList);
                    setClinicianId(uniqueIds[0]);
                    return;
                }
            }

            // If we still have no clinicians, flag the error
            setClinicianError(true);
        };
        fetchClinicians();
    }, [profile]);

    // Generate next 14 days
    const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

    const handleBook = async () => {
        if (!profile || !selectedService || !selectedDate || !selectedTime || !clinicianId) return;

        const [hours, minutes] = selectedTime.split(':').map(Number);
        const scheduledAt = setMinutes(setHours(selectedDate, hours), minutes);

        const { error } = await createAppointment({
            patient_id: profile.id,
            clinician_id: clinicianId,
            service_type: selectedService,
            scheduled_at: scheduledAt.toISOString(),
            duration_minutes: SERVICE_DURATIONS[selectedService],
            location: location.trim(),
            notes: notes.trim() || undefined,
        });

        if (error) {
            toast.error('Booking Failed', error);
        } else {
            toast.success('Appointment Booked! 🎉', 'You will receive a confirmation shortly.');
            router.back();
        }
    };

    const formatPrice = (amount: number) => `₦${amount.toLocaleString()}`;

    const renderServiceStep = () => (
        <>
            <Text style={styles.stepTitle}>Select Service</Text>
            <Text style={styles.stepSubtitle}>What type of treatment do you need?</Text>
            <View style={styles.serviceList}>
                {SERVICES.map((service) => (
                    <TouchableOpacity
                        key={service}
                        style={[
                            styles.serviceCard,
                            selectedService === service && styles.serviceCardSelected,
                        ]}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedService(service);
                        }}
                        activeOpacity={0.8}
                    >
                        <View style={[
                            styles.serviceIcon,
                            selectedService === service && styles.serviceIconSelected,
                        ]}>
                            <Ionicons
                                name={SERVICE_ICONS[service] as any}
                                size={24}
                                color={selectedService === service ? colors.textPrimary : colors.primary}
                            />
                        </View>
                        <View style={styles.serviceInfo}>
                            <Text style={styles.serviceName}>{SERVICE_LABELS[service]}</Text>
                            <Text style={styles.serviceMeta}>
                                {SERVICE_DURATIONS[service]} min · {formatPrice(SERVICE_PRICES[service])}
                            </Text>
                        </View>
                        {selectedService === service && (
                            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );

    const renderDateTimeStep = () => (
        <>
            <Text style={styles.stepTitle}>Pick Date & Time</Text>
            <Text style={styles.stepSubtitle}>Choose a convenient slot</Text>

            {/* Date Picker */}
            <Text style={styles.subLabel}>Date</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dateScroll}
            >
                {availableDates.map((date) => {
                    const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                    const dayName = format(date, 'EEE');
                    const dayNum = format(date, 'd');
                    const month = format(date, 'MMM');
                    const isSunday = date.getDay() === 0;

                    return (
                        <TouchableOpacity
                            key={date.toISOString()}
                            style={[
                                styles.dateCard,
                                isSelected && styles.dateCardSelected,
                                isSunday && styles.dateCardDisabled,
                            ]}
                            onPress={() => {
                                if (!isSunday) {
                                    Haptics.selectionAsync();
                                    setSelectedDate(date);
                                }
                            }}
                            disabled={isSunday}
                        >
                            <Text style={[styles.dateDayName, isSelected && styles.dateTextSelected]}>
                                {dayName}
                            </Text>
                            <Text style={[styles.dateDayNum, isSelected && styles.dateTextSelected]}>
                                {dayNum}
                            </Text>
                            <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>
                                {month}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Time Picker */}
            {selectedDate && (
                <>
                    <Text style={[styles.subLabel, { marginTop: spacing['2xl'] }]}>Time</Text>
                    <View style={styles.timeGrid}>
                        {TIME_SLOTS.map((time) => {
                            const isSelected = selectedTime === time;
                            // Saturday has limited hours
                            const isSaturday = selectedDate.getDay() === 6;
                            const hour = parseInt(time.split(':')[0]);
                            const isDisabled = isSaturday && (hour < 9 || hour >= 15);

                            return (
                                <TouchableOpacity
                                    key={time}
                                    style={[
                                        styles.timeSlot,
                                        isSelected && styles.timeSlotSelected,
                                        isDisabled && styles.timeSlotDisabled,
                                    ]}
                                    onPress={() => {
                                        if (!isDisabled) {
                                            Haptics.selectionAsync();
                                            setSelectedTime(time);
                                        }
                                    }}
                                    disabled={isDisabled}
                                >
                                    <Text style={[
                                        styles.timeText,
                                        isSelected && styles.timeTextSelected,
                                        isDisabled && styles.timeTextDisabled,
                                    ]}>
                                        {format(setHours(setMinutes(new Date(), 0), parseInt(time.split(':')[0])), 'h:mm a')}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </>
            )}
        </>
    );

    const renderLocationStep = () => (
        <>
            <Text style={styles.stepTitle}>Your Location</Text>
            <Text style={styles.stepSubtitle}>Where should we come for your session?</Text>

            <View style={styles.locationInput}>
                <Ionicons name="location-outline" size={22} color={colors.primary} style={{ marginRight: spacing.md }} />
                <TextInput
                    style={styles.locationTextInput}
                    placeholder="Enter your address in Lagos..."
                    placeholderTextColor={colors.textMuted}
                    value={location}
                    onChangeText={setLocation}
                    multiline
                    numberOfLines={3}
                />
            </View>

            <Text style={[styles.subLabel, { marginTop: spacing['2xl'] }]}>Additional Notes (optional)</Text>
            <View style={styles.notesInput}>
                <TextInput
                    style={styles.notesTextInput}
                    placeholder="Any specific concerns or requirements..."
                    placeholderTextColor={colors.textMuted}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                />
            </View>
        </>
    );

    const renderConfirmStep = () => (
        <>
            <Text style={styles.stepTitle}>Confirm Booking</Text>
            <Text style={styles.stepSubtitle}>Review your appointment details</Text>

            {clinicianError && (
                <View style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: borderRadius.lg,
                    padding: spacing.lg,
                    marginBottom: spacing.lg,
                    borderWidth: 1,
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                }}>
                    <Text style={{ color: '#EF4444', fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                        ⚠️ No clinicians available
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 4 }}>
                        Please ensure a clinician account exists in the system, or run the migration 006_fix_clinician_visibility.sql on your Supabase project.
                    </Text>
                </View>
            )}

            {clinicians.length > 1 && (
                <View style={{ marginBottom: spacing.lg }}>
                    <Text style={styles.subLabel}>Select Clinician</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {clinicians.map(c => (
                            <TouchableOpacity
                                key={c.id}
                                style={[
                                    styles.dateCard,
                                    clinicianId === c.id && styles.dateCardSelected,
                                    { marginRight: spacing.sm, paddingHorizontal: spacing.lg },
                                ]}
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    setClinicianId(c.id);
                                }}
                            >
                                <Text style={[
                                    styles.dateDayName,
                                    clinicianId === c.id && styles.dateTextSelected,
                                ]}>
                                    Dr. {c.full_name?.split(' ')[0] || 'Clinician'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Service</Text>
                    <Text style={styles.summaryValue}>
                        {selectedService ? SERVICE_LABELS[selectedService] : ''}
                    </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Date</Text>
                    <Text style={styles.summaryValue}>
                        {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}
                    </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Time</Text>
                    <Text style={styles.summaryValue}>{selectedTime || ''}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Duration</Text>
                    <Text style={styles.summaryValue}>
                        {selectedService ? `${SERVICE_DURATIONS[selectedService]} minutes` : ''}
                    </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Location</Text>
                    <Text style={[styles.summaryValue, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
                        {location}
                    </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Fee</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary, fontWeight: fontWeight.bold }]}>
                        {selectedService ? formatPrice(SERVICE_PRICES[selectedService]) : ''}
                    </Text>
                </View>
            </View>
        </>
    );

    const steps: BookingStep[] = ['service', 'datetime', 'location', 'confirm'];
    const currentStepIndex = steps.indexOf(step);

    const canProceed = () => {
        switch (step) {
            case 'service': return !!selectedService;
            case 'datetime': return !!selectedDate && !!selectedTime;
            case 'location': return location.trim().length > 5;
            case 'confirm': return !!clinicianId;
            default: return false;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => {
                    if (currentStepIndex > 0) {
                        setStep(steps[currentStepIndex - 1]);
                    } else {
                        router.back();
                    }
                }}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Book Appointment</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
                {steps.map((s, i) => (
                    <View key={s} style={styles.stepDotContainer}>
                        <View style={[
                            styles.stepDot,
                            i <= currentStepIndex && styles.stepDotActive,
                        ]} />
                        {i < steps.length - 1 && (
                            <View style={[
                                styles.stepLine,
                                i < currentStepIndex && styles.stepLineActive,
                            ]} />
                        )}
                    </View>
                ))}
            </View>

            {/* Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {step === 'service' && renderServiceStep()}
                {step === 'datetime' && renderDateTimeStep()}
                {step === 'location' && renderLocationStep()}
                {step === 'confirm' && renderConfirmStep()}
            </ScrollView>

            {/* Bottom Action */}
            <View style={styles.bottomAction}>
                <Button
                    title={step === 'confirm' ? 'Confirm Booking' : 'Continue'}
                    onPress={() => {
                        if (step === 'confirm') {
                            handleBook();
                        } else {
                            setStep(steps[currentStepIndex + 1]);
                        }
                    }}
                    disabled={!canProceed()}
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
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing['4xl'],
        paddingBottom: spacing.xl,
    },
    stepDotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.bgInput,
        borderWidth: 2,
        borderColor: colors.border,
    },
    stepDotActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    stepLine: {
        width: 48,
        height: 2,
        backgroundColor: colors.border,
    },
    stepLineActive: {
        backgroundColor: colors.primary,
    },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: spacing['5xl'],
    },
    stepTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    stepSubtitle: {
        fontSize: fontSize.base,
        color: colors.textSecondary,
        marginBottom: spacing['2xl'],
    },
    subLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    serviceList: {
        gap: spacing.md,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    serviceCardSelected: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(10, 104, 71, 0.08)',
    },
    serviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(10, 104, 71, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    serviceIconSelected: {
        backgroundColor: colors.primary,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    serviceMeta: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    dateScroll: {
        marginHorizontal: -spacing.xl,
        paddingHorizontal: spacing.xl,
    },
    dateCard: {
        width: 68,
        alignItems: 'center',
        paddingVertical: spacing.lg,
        marginRight: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.bgCard,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dateCardSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    dateCardDisabled: {
        opacity: 0.3,
    },
    dateDayName: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        fontWeight: fontWeight.medium,
    },
    dateDayNum: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginVertical: spacing.xs,
    },
    dateMonth: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
    },
    dateTextSelected: {
        color: colors.textPrimary,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    timeSlot: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.bgCard,
        borderWidth: 1,
        borderColor: colors.border,
        minWidth: '30%',
        alignItems: 'center',
    },
    timeSlotSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    timeSlotDisabled: {
        opacity: 0.3,
    },
    timeText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
    },
    timeTextSelected: {
        color: colors.textPrimary,
        fontWeight: fontWeight.semibold,
    },
    timeTextDisabled: {
        color: colors.textMuted,
    },
    locationInput: {
        flexDirection: 'row',
        backgroundColor: colors.bgInput,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'flex-start',
    },
    locationTextInput: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: fontSize.base,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    notesInput: {
        backgroundColor: colors.bgInput,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    notesTextInput: {
        color: colors.textPrimary,
        fontSize: fontSize.base,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    summaryCard: {
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: colors.divider,
    },
    summaryLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    summaryValue: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
    },
    bottomAction: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.bgDark,
    },
});
