import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../constants/theme';
import { create } from 'zustand';

// Toast Types
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

// Toast Store (global)
interface ToastState {
    toasts: ToastData[];
    show: (type: ToastType, title: string, message?: string, duration?: number) => void;
    dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    show: (type, title, message, duration = 3500) => {
        const id = Date.now().toString();
        set((state) => ({
            toasts: [...state.toasts, { id, type, title, message, duration }],
        }));
        // Auto-dismiss
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        }, duration);
    },
    dismiss: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
}));

// Convenience helpers
export const toast = {
    success: (title: string, message?: string) => useToastStore.getState().show('success', title, message),
    error: (title: string, message?: string) => useToastStore.getState().show('error', title, message, 5000),
    info: (title: string, message?: string) => useToastStore.getState().show('info', title, message),
    warning: (title: string, message?: string) => useToastStore.getState().show('warning', title, message, 4000),
};

// Individual Toast Component
function ToastItem({ data, onDismiss }: { data: ToastData; onDismiss: () => void }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        ]).start();

        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
            ]).start(() => onDismiss());
        }, (data.duration || 3500) - 300);

        return () => clearTimeout(timeout);
    }, []);

    const config = TOAST_CONFIG[data.type];

    return (
        <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
            <View style={[styles.toastAccent, { backgroundColor: config.color }]} />
            <View style={[styles.toastIcon, { backgroundColor: config.bgColor }]}>
                <Ionicons name={config.icon as any} size={18} color={config.color} />
            </View>
            <View style={styles.toastContent}>
                <Text style={styles.toastTitle}>{data.title}</Text>
                {data.message && <Text style={styles.toastMessage}>{data.message}</Text>}
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.toastClose}>
                <Ionicons name="close" size={16} color={colors.textMuted} />
            </TouchableOpacity>
        </Animated.View>
    );
}

// Toast Container (mount once in root layout)
export function ToastContainer() {
    const { toasts, dismiss } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <View style={styles.container} pointerEvents="box-none">
            {toasts.map((t) => (
                <ToastItem key={t.id} data={t} onDismiss={() => dismiss(t.id)} />
            ))}
        </View>
    );
}

// Toast Configuration
const TOAST_CONFIG: Record<ToastType, { color: string; bgColor: string; icon: string }> = {
    success: { color: '#10B981', bgColor: 'rgba(16,185,129,0.12)', icon: 'checkmark-circle' },
    error: { color: '#EF4444', bgColor: 'rgba(239,68,68,0.12)', icon: 'alert-circle' },
    info: { color: '#3B82F6', bgColor: 'rgba(59,130,246,0.12)', icon: 'information-circle' },
    warning: { color: '#F59E0B', bgColor: 'rgba(245,158,11,0.12)', icon: 'warning' },
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'web' ? 20 : 60,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
        pointerEvents: 'box-none',
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        width: '90%',
        maxWidth: 440,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    toastAccent: {
        width: 4,
        alignSelf: 'stretch',
    },
    toastIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.md,
    },
    toastContent: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    toastTitle: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    toastMessage: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    toastClose: {
        padding: spacing.md,
    },
});
