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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import {
    useNotificationStore,
    getNotificationIcon,
    getNotificationColor,
} from '../../stores/notificationStore';
import type { Notification } from '../../stores/notificationStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../constants/theme';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function NotificationsScreen() {
    const router = useRouter();
    const { profile } = useAuthStore();
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        subscribeToNotifications,
    } = useNotificationStore();

    useEffect(() => {
        if (profile) {
            fetchNotifications(profile.id);
            const unsubscribe = subscribeToNotifications(profile.id);
            return unsubscribe;
        }
    }, [profile]);

    const handleNotificationPress = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        // Navigate based on notification type
        const data = notification.data;
        if (data?.appointment_id) {
            const role = profile?.role || 'patient';
            router.push(`/(${role})/session/${data.appointment_id}` as any);
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
        } catch {
            return '';
        }
    };

    const renderNotification = ({ item, index }: { item: Notification, index: number }) => {
        const iconName = getNotificationIcon(item.type);
        const iconColor = getNotificationColor(item.type);

        return (
            <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                <TouchableOpacity
                    style={[
                        styles.notificationCard,
                        !item.is_read && styles.notificationUnread,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleNotificationPress(item)}
                >
                    <View style={[styles.iconContainer, { backgroundColor: `${iconColor}18` }]}>
                        <Ionicons name={iconName as any} size={22} color={iconColor} />
                    </View>
                    <View style={styles.notificationContent}>
                        <View style={styles.notificationHeader}>
                            <Text style={styles.notificationTitle} numberOfLines={1}>
                                {item.title}
                            </Text>
                            {!item.is_read && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.notificationBody} numberOfLines={2}>
                            {item.body}
                        </Text>
                        <Text style={styles.notificationTime}>
                            {formatTime(item.created_at)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => deleteNotification(item.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 ? (
                    <TouchableOpacity
                        onPress={() => profile && markAllAsRead(profile.id)}
                        style={styles.markAllBtn}
                    >
                        <Text style={styles.markAllText}>Read All</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 60 }} />
                )}
            </View>

            {/* Unread Count Badge */}
            {unreadCount > 0 && (
                <View style={styles.unreadBanner}>
                    <Ionicons name="mail-unread-outline" size={16} color={colors.primary} />
                    <Text style={styles.unreadBannerText}>
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </Text>
                </View>
            )}

            {/* Notification List */}
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderNotification}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={() => profile && fetchNotifications(profile.id)}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBg}>
                            <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
                        </View>
                        <Text style={styles.emptyTitle}>All Caught Up!</Text>
                        <Text style={styles.emptySubtitle}>
                            You'll receive notifications about your appointments, session notes, and more.
                        </Text>
                    </View>
                }
            />
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
    markAllBtn: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(10, 104, 71, 0.12)',
    },
    markAllText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
        color: colors.primary,
    },
    unreadBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginHorizontal: spacing.xl,
        marginBottom: spacing.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        backgroundColor: 'rgba(10, 104, 71, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(10, 104, 71, 0.2)',
    },
    unreadBannerText: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.medium,
    },
    listContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['5xl'],
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    notificationUnread: {
        backgroundColor: 'rgba(10, 104, 71, 0.05)',
        borderColor: 'rgba(10, 104, 71, 0.15)',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    notificationTitle: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginLeft: spacing.sm,
    },
    notificationBody: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 20,
        marginTop: 2,
    },
    notificationTime: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    deleteBtn: {
        padding: spacing.xs,
        marginLeft: spacing.sm,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing['5xl'],
        paddingHorizontal: spacing['2xl'],
    },
    emptyIconBg: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.xl,
    },
    emptyTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 280,
    },
});
