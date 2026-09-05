import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { Button, toast } from '../../components/ui';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../constants/theme';

interface FormField {
    key: string;
    label: string;
    icon: string;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'phone-pad' | 'email-address';
    section: 'personal' | 'medical' | 'emergency';
}

const PATIENT_FIELDS: FormField[] = [
    { key: 'full_name', label: 'Full Name', icon: 'person-outline', placeholder: 'Enter your full name', section: 'personal' },
    { key: 'phone', label: 'Phone Number', icon: 'call-outline', placeholder: '+234 XXX XXX XXXX', keyboardType: 'phone-pad', section: 'personal' },
    { key: 'date_of_birth', label: 'Date of Birth', icon: 'calendar-outline', placeholder: 'YYYY-MM-DD', section: 'personal' },
    { key: 'address', label: 'Address', icon: 'location-outline', placeholder: 'Enter your home address', multiline: true, section: 'personal' },
    { key: 'medical_history', label: 'Medical History', icon: 'medical-outline', placeholder: 'List any relevant medical conditions, allergies, surgeries...', multiline: true, section: 'medical' },
    { key: 'emergency_contact_name', label: 'Emergency Contact Name', icon: 'people-outline', placeholder: 'Emergency contact full name', section: 'emergency' },
    { key: 'emergency_contact_phone', label: 'Emergency Contact Phone', icon: 'call-outline', placeholder: '+234 XXX XXX XXXX', keyboardType: 'phone-pad', section: 'emergency' },
];

const CLINICIAN_FIELDS: FormField[] = [
    { key: 'full_name', label: 'Full Name', icon: 'person-outline', placeholder: 'Enter your full name', section: 'personal' },
    { key: 'phone', label: 'Phone Number', icon: 'call-outline', placeholder: '+234 XXX XXX XXXX', keyboardType: 'phone-pad', section: 'personal' },
    { key: 'date_of_birth', label: 'Date of Birth', icon: 'calendar-outline', placeholder: 'YYYY-MM-DD', section: 'personal' },
    { key: 'address', label: 'Clinic Address', icon: 'location-outline', placeholder: 'Enter your clinic/office address', multiline: true, section: 'personal' },
];

export default function EditProfileScreen() {
    const router = useRouter();
    const { profile, updateProfile } = useAuthStore();
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const isClinicianRole = profile?.role === 'clinician';
    const fields = isClinicianRole ? CLINICIAN_FIELDS : PATIENT_FIELDS;

    useEffect(() => {
        if (profile) {
            const initial: Record<string, string> = {};
            fields.forEach(f => {
                initial[f.key] = (profile as any)[f.key] || '';
            });
            setFormData(initial);
        }
    }, [profile]);

    const updateField = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!hasChanges) return;

        // Validate required fields
        if (!formData.full_name?.trim()) {
            toast.error('Validation Error', 'Full name is required.');
            return;
        }

        setIsSaving(true);
        const updates: Record<string, any> = {};
        fields.forEach(f => {
            const value = formData[f.key]?.trim() || null;
            updates[f.key] = value;
        });

        const { error } = await updateProfile(updates);
        setIsSaving(false);

        if (error) {
            toast.error('Error', `Failed to update profile: ${error}`);
        } else {
            setHasChanges(false);
            toast.success('Profile Updated', 'Your profile has been updated successfully.');
            router.back();
        }
    };

    const renderSection = (title: string, sectionKey: string, icon: string) => {
        const sectionFields = fields.filter(f => f.section === sectionKey);
        if (sectionFields.length === 0) return null;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconBg}>
                        <Ionicons name={icon as any} size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.sectionTitle}>{title}</Text>
                </View>
                <View style={styles.fieldGroup}>
                    {sectionFields.map((field, index) => (
                        <View
                            key={field.key}
                            style={[
                                styles.fieldContainer,
                                index < sectionFields.length - 1 && styles.fieldBorder,
                            ]}
                        >
                            <Text style={styles.fieldLabel}>{field.label}</Text>
                            <View style={styles.inputRow}>
                                <Ionicons
                                    name={field.icon as any}
                                    size={18}
                                    color={colors.textMuted}
                                    style={styles.fieldIcon}
                                />
                                <TextInput
                                    style={[
                                        styles.input,
                                        field.multiline && styles.inputMultiline,
                                    ]}
                                    placeholder={field.placeholder}
                                    placeholderTextColor={colors.textMuted}
                                    value={formData[field.key] || ''}
                                    onChangeText={(val) => updateField(field.key, val)}
                                    multiline={field.multiline}
                                    numberOfLines={field.multiline ? 3 : 1}
                                    keyboardType={field.keyboardType || 'default'}
                                    autoCapitalize={field.key === 'email' ? 'none' : 'words'}
                                />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Avatar Header */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <Text style={styles.avatarHint}>
                            {profile?.email}
                        </Text>
                    </View>

                    {/* Personal Info */}
                    {renderSection('Personal Information', 'personal', 'person-outline')}

                    {/* Medical History (patient only) */}
                    {!isClinicianRole && renderSection('Medical Information', 'medical', 'medical-outline')}

                    {/* Emergency Contact (patient only) */}
                    {!isClinicianRole && renderSection('Emergency Contact', 'emergency', 'alert-circle-outline')}
                </ScrollView>

                {/* Save Button */}
                <View style={styles.bottomAction}>
                    <Button
                        title={isSaving ? 'Saving...' : 'Save Changes'}
                        onPress={handleSave}
                        disabled={!hasChanges || isSaving}
                        loading={isSaving}
                        fullWidth
                        size="lg"
                        variant="primary"
                    />
                </View>
            </KeyboardAvoidingView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: spacing['3xl'],
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        ...shadows.md,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    avatarHint: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    section: {
        marginBottom: spacing['2xl'],
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    sectionIconBg: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(10, 104, 71, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    fieldGroup: {
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    fieldContainer: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
    },
    fieldBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    fieldLabel: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    fieldIcon: {
        marginTop: 3,
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: fontSize.base,
        color: colors.textPrimary,
        paddingVertical: 0,
    },
    inputMultiline: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    bottomAction: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.bgDark,
    },
});
