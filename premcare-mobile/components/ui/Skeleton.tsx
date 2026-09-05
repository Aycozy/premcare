import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../../constants/theme';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius: radius = 8, style }: SkeletonProps) {
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const opacity = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius: radius,
                    backgroundColor: colors.bgInput,
                    opacity,
                },
                style,
            ]}
        />
    );
}

// Pre-built skeleton layouts
export function CardSkeleton() {
    return (
        <View style={skeletonStyles.card}>
            <View style={skeletonStyles.cardHeader}>
                <Skeleton width={44} height={44} borderRadius={22} />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="40%" height={12} style={{ marginTop: spacing.sm }} />
                </View>
            </View>
            <Skeleton width="100%" height={12} style={{ marginTop: spacing.lg }} />
            <Skeleton width="80%" height={12} style={{ marginTop: spacing.sm }} />
        </View>
    );
}

export function AppointmentCardSkeleton() {
    return (
        <View style={skeletonStyles.card}>
            <View style={skeletonStyles.cardHeader}>
                <Skeleton width={80} height={16} />
                <Skeleton width={70} height={24} borderRadius={12} />
            </View>
            <Skeleton width="55%" height={14} style={{ marginTop: spacing.md }} />
            <Skeleton width="70%" height={12} style={{ marginTop: spacing.sm }} />
            <Skeleton width="45%" height={12} style={{ marginTop: spacing.sm }} />
        </View>
    );
}

export function DashboardSkeleton() {
    return (
        <View style={{ padding: spacing.xl }}>
            {/* Header */}
            <Skeleton width="50%" height={24} style={{ marginBottom: spacing.sm }} />
            <Skeleton width="30%" height={16} style={{ marginBottom: spacing['2xl'] }} />

            {/* Stats Grid */}
            <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing['2xl'] }}>
                <View style={{ flex: 1 }}>
                    <View style={skeletonStyles.statCard}>
                        <Skeleton width={32} height={32} borderRadius={8} />
                        <Skeleton width="40%" height={28} style={{ marginTop: spacing.md }} />
                        <Skeleton width="70%" height={12} style={{ marginTop: spacing.sm }} />
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={skeletonStyles.statCard}>
                        <Skeleton width={32} height={32} borderRadius={8} />
                        <Skeleton width="40%" height={28} style={{ marginTop: spacing.md }} />
                        <Skeleton width="70%" height={12} style={{ marginTop: spacing.sm }} />
                    </View>
                </View>
            </View>

            {/* List Items */}
            <Skeleton width="35%" height={18} style={{ marginBottom: spacing.lg }} />
            <AppointmentCardSkeleton />
            <AppointmentCardSkeleton />
        </View>
    );
}

export function ProfileSkeleton() {
    return (
        <View style={{ alignItems: 'center', padding: spacing['2xl'] }}>
            <Skeleton width={80} height={80} borderRadius={40} />
            <Skeleton width={160} height={20} style={{ marginTop: spacing.lg }} />
            <Skeleton width={120} height={14} style={{ marginTop: spacing.sm }} />
            <View style={{ width: '100%', marginTop: spacing['2xl'] }}>
                <Skeleton width="100%" height={52} borderRadius={12} style={{ marginBottom: spacing.md }} />
                <Skeleton width="100%" height={52} borderRadius={12} style={{ marginBottom: spacing.md }} />
                <Skeleton width="100%" height={52} borderRadius={12} style={{ marginBottom: spacing.md }} />
            </View>
        </View>
    );
}

export function PatientProfileSkeleton() {
    return (
        <View style={{ padding: spacing.xl }}>
            {/* Header / Avatar */}
            <View style={{ alignItems: 'center', marginBottom: spacing['2xl'] }}>
                <Skeleton width={100} height={100} borderRadius={50} />
                <Skeleton width={200} height={28} style={{ marginTop: spacing.md }} />
                <Skeleton width={120} height={16} style={{ marginTop: spacing.sm }} />
            </View>

            {/* Quick Stats */}
            <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing['2xl'] }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Skeleton width={40} height={40} borderRadius={20} />
                    <Skeleton width={60} height={12} style={{ marginTop: spacing.sm }} />
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Skeleton width={40} height={40} borderRadius={20} />
                    <Skeleton width={60} height={12} style={{ marginTop: spacing.sm }} />
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Skeleton width={40} height={40} borderRadius={20} />
                    <Skeleton width={60} height={12} style={{ marginTop: spacing.sm }} />
                </View>
            </View>

            {/* Content Cards */}
            <Skeleton width="40%" height={20} style={{ marginBottom: spacing.md }} />
            <CardSkeleton />
            
            <Skeleton width="50%" height={20} style={{ marginTop: spacing.xl, marginBottom: spacing.md }} />
            <AppointmentCardSkeleton />
            <AppointmentCardSkeleton />
        </View>
    );
}

export function MessageListSkeleton() {
    return (
        <View style={{ padding: spacing.xl }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
                    <Skeleton width={50} height={50} borderRadius={25} />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                            <Skeleton width="40%" height={16} />
                            <Skeleton width="15%" height={12} />
                        </View>
                        <Skeleton width="80%" height={14} />
                    </View>
                </View>
            ))}
        </View>
    );
}

export function InvoiceSkeleton() {
    return (
        <View style={skeletonStyles.card}>
            <View style={skeletonStyles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Skeleton width="50%" height={16} />
                    <Skeleton width="30%" height={12} style={{ marginTop: spacing.xs }} />
                </View>
                <Skeleton width={80} height={28} borderRadius={14} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg }}>
                <Skeleton width="40%" height={14} />
                <Skeleton width="25%" height={16} />
            </View>
        </View>
    );
}

const skeletonStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
});
