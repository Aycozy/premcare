import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type NotificationType =
    | 'appointment_booked'
    | 'appointment_confirmed'
    | 'appointment_cancelled'
    | 'appointment_reminder'
    | 'session_completed'
    | 'session_note_ready'
    | 'profile_updated'
    | 'general';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, any>;
    is_read: boolean;
    created_at: string;
}

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
    appointment_booked: 'calendar-outline',
    appointment_confirmed: 'checkmark-circle-outline',
    appointment_cancelled: 'close-circle-outline',
    appointment_reminder: 'alarm-outline',
    session_completed: 'checkmark-done-outline',
    session_note_ready: 'document-text-outline',
    profile_updated: 'person-outline',
    general: 'notifications-outline',
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
    appointment_booked: '#3B82F6',
    appointment_confirmed: '#10B981',
    appointment_cancelled: '#EF4444',
    appointment_reminder: '#F59E0B',
    session_completed: '#0A6847',
    session_note_ready: '#8B5CF6',
    profile_updated: '#06B6D4',
    general: '#94A3B8',
};

export const getNotificationIcon = (type: NotificationType) => NOTIFICATION_ICONS[type];
export const getNotificationColor = (type: NotificationType) => NOTIFICATION_COLORS[type];

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;

    // Actions
    fetchNotifications: (userId: string) => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: (userId: string) => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    createNotification: (notification: {
        user_id: string;
        type: NotificationType;
        title: string;
        body: string;
        data?: Record<string, any>;
    }) => Promise<void>;
    subscribeToNotifications: (userId: string) => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async (userId: string) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            const notifications = (data as Notification[]) || [];
            set({
                notifications,
                unreadCount: notifications.filter(n => !n.is_read).length,
                isLoading: false,
            });
        } catch (error) {
            console.error('Fetch notifications error:', error);
            set({ isLoading: false });
        }
    },

    markAsRead: async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;

            set((state) => ({
                notifications: state.notifications.map(n =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    },

    markAllAsRead: async (userId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) throw error;

            set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, is_read: true })),
                unreadCount: 0,
            }));
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    },

    deleteNotification: async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (error) throw error;

            set((state) => {
                const deleted = state.notifications.find(n => n.id === notificationId);
                return {
                    notifications: state.notifications.filter(n => n.id !== notificationId),
                    unreadCount: deleted && !deleted.is_read
                        ? Math.max(0, state.unreadCount - 1)
                        : state.unreadCount,
                };
            });
        } catch (error) {
            console.error('Delete notification error:', error);
        }
    },

    createNotification: async (notification) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    ...notification,
                    data: notification.data || {},
                });

            if (error) throw error;

            // Re-fetch to get the proper record
            await get().fetchNotifications(notification.user_id);
        } catch (error) {
            console.error('Create notification error:', error);
        }
    },

    subscribeToNotifications: (userId: string) => {
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const newNotification = payload.new as Notification;
                    set((state) => ({
                        notifications: [newNotification, ...state.notifications],
                        unreadCount: state.unreadCount + 1,
                    }));
                }
            )
            .subscribe();

        // Return unsubscribe function
        return () => {
            supabase.removeChannel(channel);
        };
    },
}));
