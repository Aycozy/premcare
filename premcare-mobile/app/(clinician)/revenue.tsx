import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { usePaymentStore } from '../../stores/paymentStore';
import type { Invoice, InvoiceStatus } from '../../stores/paymentStore';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../constants/theme';
import { format, parseISO } from 'date-fns';

const STATUS_CONFIG: Record<InvoiceStatus, { color: string; label: string; icon: string }> = {
    pending: { color: '#F59E0B', label: 'Pending', icon: 'time-outline' },
    paid: { color: '#10B981', label: 'Paid', icon: 'checkmark-circle-outline' },
    overdue: { color: '#EF4444', label: 'Overdue', icon: 'alert-circle-outline' },
    cancelled: { color: '#94A3B8', label: 'Cancelled', icon: 'close-circle-outline' },
    refunded: { color: '#8B5CF6', label: 'Refunded', icon: 'arrow-undo-outline' },
};

export default function ClinicianRevenueScreen() {
    const router = useRouter();
    const { profile } = useAuthStore();
    const { invoices, revenueStats, isLoading, fetchInvoices, fetchRevenueStats } = usePaymentStore();

    useEffect(() => {
        if (profile) {
            fetchInvoices(profile.id, 'clinician');
            fetchRevenueStats(profile.id);
        }
    }, [profile]);

    const formatAmount = (kobo: number) => `₦${(kobo / 100).toLocaleString()}`;

    const renderInvoice = ({ item }: { item: Invoice }) => {
        const config = STATUS_CONFIG[item.status];
        return (
            <View style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                    <View style={[styles.statusIcon, { backgroundColor: `${config.color}18` }]}>
                        <Ionicons name={config.icon as any} size={20} color={config.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.invoiceName} numberOfLines={1}>
                            {(item.patient as any)?.full_name?.split(' ')[0] || 'Patient'}
                        </Text>
                        <Text style={styles.invoiceService} numberOfLines={1}>
                            {item.service_description}
                        </Text>
                    </View>
                    <View style={styles.invoiceRight}>
                        <Text style={styles.invoiceAmount}>{formatAmount(item.amount)}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${config.color}18` }]}>
                            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Revenue</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Revenue Stats */}
            {revenueStats && (
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Ionicons name="wallet-outline" size={22} color={colors.primary} />
                        <Text style={styles.statValue}>{formatAmount(revenueStats.totalRevenue)}</Text>
                        <Text style={styles.statLabel}>Total Revenue</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="trending-up-outline" size={22} color="#10B981" />
                        <Text style={styles.statValue}>{formatAmount(revenueStats.thisMonthRevenue)}</Text>
                        <Text style={styles.statLabel}>This Month</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="time-outline" size={22} color="#F59E0B" />
                        <Text style={styles.statValue}>{formatAmount(revenueStats.pendingAmount)}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="receipt-outline" size={22} color="#8B5CF6" />
                        <Text style={styles.statValue}>{revenueStats.paidCount}</Text>
                        <Text style={styles.statLabel}>Paid Invoices</Text>
                    </View>
                </View>
            )}

            {/* Recent Invoices */}
            <Text style={styles.recentTitle}>Recent Invoices</Text>

            <FlatList
                data={invoices}
                keyExtractor={(item) => item.id}
                renderItem={renderInvoice}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={() => {
                            if (profile) {
                                fetchInvoices(profile.id, 'clinician');
                                fetchRevenueStats(profile.id);
                            }
                        }}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
                        <Text style={styles.emptyText}>No invoices yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bgDark },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: colors.bgCard,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border,
    },
    headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md,
        paddingHorizontal: spacing.xl, marginBottom: spacing.xl,
    },
    statCard: {
        width: '47%', backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg, padding: spacing.lg,
        borderWidth: 1, borderColor: colors.border,
        gap: spacing.xs,
    },
    statValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
    statLabel: { fontSize: fontSize.xs, color: colors.textMuted },
    recentTitle: {
        fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary,
        paddingHorizontal: spacing.xl, marginBottom: spacing.md,
    },
    listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing['5xl'] },
    invoiceCard: {
        backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
        padding: spacing.lg, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: colors.border,
    },
    invoiceHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    statusIcon: {
        width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    },
    invoiceName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary },
    invoiceService: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
    invoiceRight: { alignItems: 'flex-end' },
    invoiceAmount: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
    statusBadge: {
        paddingVertical: 2, paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full, marginTop: 4,
    },
    statusText: { fontSize: 10, fontWeight: fontWeight.semibold },
    emptyState: { alignItems: 'center', paddingVertical: spacing['5xl'] },
    emptyText: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.md },
});
