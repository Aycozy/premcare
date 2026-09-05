import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useMessageStore } from '../../stores/messageStore';
import type { Conversation } from '../../stores/messageStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../constants/theme';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function PatientMessagesScreen() {
    const router = useRouter();
    const { profile } = useAuthStore();
    const { conversations, isLoading, fetchConversations } = useMessageStore();

    useEffect(() => {
        if (profile) fetchConversations(profile.id, 'patient');
    }, [profile]);

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '';
        try {
            return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
        } catch {
            return '';
        }
    };

    const renderConvo = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={styles.convoCard}
            activeOpacity={0.8}
            onPress={() => router.push(`/(patient)/chat/${item.clinician_id}` as any)}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {item.clinician?.full_name?.charAt(0)?.toUpperCase() || 'C'}
                </Text>
            </View>
            <View style={styles.convoContent}>
                <View style={styles.convoHeader}>
                    <Text style={styles.convoName} numberOfLines={1}>
                        Dr. {item.clinician?.full_name?.split(' ')[0] || 'Clinician'}
                    </Text>
                    <Text style={styles.convoTime}>{formatTime(item.last_message_at)}</Text>
                </View>
                <Text style={styles.convoPreview} numberOfLines={1}>
                    {item.last_message_text || 'Start a conversation...'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Messages</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={renderConvo}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={() => profile && fetchConversations(profile.id, 'patient')}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBg}>
                            <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
                        </View>
                        <Text style={styles.emptyTitle}>No Messages Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Your conversations with clinicians will appear here after you book an appointment.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bgDark },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: colors.bgCard,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border,
    },
    headerTitle: {
        fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary,
    },
    listContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['5xl'],
    },
    convoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    avatar: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: colors.primaryDark,
        justifyContent: 'center', alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary,
    },
    convoContent: { flex: 1 },
    convoHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 2,
    },
    convoName: {
        fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary, flex: 1,
    },
    convoTime: {
        fontSize: fontSize.xs, color: colors.textMuted, marginLeft: spacing.sm,
    },
    convoPreview: {
        fontSize: fontSize.sm, color: colors.textSecondary,
    },
    emptyState: {
        alignItems: 'center', paddingVertical: spacing['5xl'], paddingHorizontal: spacing['2xl'],
    },
    emptyIconBg: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: colors.bgCard,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border,
        marginBottom: spacing.xl,
    },
    emptyTitle: {
        fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 280,
    },
});
