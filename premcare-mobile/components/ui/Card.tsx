import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, shadows, fontSize, fontWeight } from '../../constants/theme';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    style?: ViewStyle;
    variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, title, subtitle, style, variant = 'default' }: CardProps) {
    return (
        <View style={[styles.card, styles[variant], style]}>
            {(title || subtitle) && (
                <View style={styles.header}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            )}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
    },
    default: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    elevated: {
        ...shadows.md,
        borderWidth: 0,
    },
    outlined: {
        borderWidth: 1.5,
        borderColor: colors.borderLight,
        backgroundColor: 'transparent',
    },
    header: {
        marginBottom: spacing.lg,
    },
    title: {
        color: colors.textPrimary,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: fontSize.sm,
    },
});
