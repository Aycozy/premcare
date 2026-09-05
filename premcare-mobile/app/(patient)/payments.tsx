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
import { CardSkeleton } from '../../components/ui';

const STATUS_CONFIG: Record<InvoiceStatus, { color: string; label: string; icon: string }> = {
    pending: { color: '#F59E0B', label: 'Pending', icon: 'time-outline' },
    paid: { color: '#10B981', label: 'Paid', icon: 'checkmark-circle-outline' },
    overdue: { color: '#EF4444', label: 'Overdue', icon: 'alert-circle-outline' },
    cancelled: { color: '#94A3B8', label: 'Cancelled', icon: 'close-circle-outline' },
    refunded: { color: '#8B5CF6', label: 'Refunded', icon: 'arrow-undo-outline' },
};

type FilterTab = 'all' | 'pending' | 'paid';

export default function PatientPaymentsScreen() {
    const router = useRouter();
    const { profile } = useAuthStore();
    const { invoices, isLoading, fetchInvoices } = usePaymentStore();
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    useEffect(() => {
        if (profile) fetchInvoices(profile.id, 'patient');
    }, [profile]);

    const formatAmount = (kobo: number) => `₦${(kobo / 100).toLocaleString()}`;

    const filteredInvoices = invoices.filter(inv => {
        if (activeTab === 'all') return true;
        return inv.status === activeTab;
    });

    const totalOwed = invoices
        .filter(i => i.status === 'pending' || i.status === 'overdue')
        .reduce((sum, i) => sum + i.amount, 0);

    const renderInvoice = ({ item }: { item: Invoice }) => {
        const config = STATUS_CONFIG[item.status];
        return (
            <View style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                    <View style={[styles.statusIcon, { backgroundColor: `${config.color}18` }]}>
                        <Ionicons name={config.icon as any} size={20} color={config.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.invoiceService} numberOfLines={1}>
                            {item.service_description}
                        </Text>
                        <Text style={styles.invoiceDate}>
                            {format(parseISO(item.created_at), 'MMM d, yyyy')}
                        </Text>
                    </View>
                    <View style={styles.invoiceRight}>
                        <Text style={styles.invoiceAmount}>{formatAmount(item.amount)}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${config.color}18` }]}>
                            <Text style={[styles.statusText, { color: config.color }]}>
                                {config.label}
                            </Text>
                        </View>
                    </View>
                </View>
                {item.due_date && item.status === 'pending' && (
                    <Text style={styles.dueDate}>
                        Due: {format(parseISO(item.due_date), 'MMM d, yyyy')}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payments</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Outstanding Balance */}
            {totalOwed > 0 && (
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Outstanding Balance</Text>
                    <Text style={styles.balanceAmount}>{formatAmount(totalOwed)}</Text>
                </View>
            )}

            {/* Filter Tabs */}
            <View style={styles.tabs}>
                {(['all', 'pending', 'paid'] as FilterTab[]).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab === 'all' ? 'All' : tab === 'pending' ? 'Pending' : 'Paid'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading && invoices.length === 0 ? (
                <View style={{ paddingHorizontal: spacing.xl }}>
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </View>
            ) : (
            <FlatList
                data={filteredInvoices}
                keyExtractor={(item) => item.id}
                renderItem={renderInvoice}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={() => profile && fetchInvoices(profile.id, 'patient')}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBg}>
                            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
                        </View>
                        <Text style={styles.emptyTitle}>No Invoices</Text>
                        <Text style={styles.emptySubtitle}>
                            Your payment history will appear here after your sessions.
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
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: colors.bgCard,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border,
    },
    headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
    balanceCard: {
        marginHorizontal: spacing.xl, marginBottom: spacing.lg,
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderRadius: borderRadius.lg, padding: spacing.xl,
        borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
        alignItems: 'center',
    },
    balanceLabel: { fontSize: fontSize.sm, color: colors.error, fontWeight: fontWeight.medium },
    balanceAmount: { fontSize: 28, fontWeight: fontWeight.bold, color: colors.error, marginTop: 4 },
    tabs: {
        flexDirection: 'row', marginHorizontal: spacing.xl, marginBottom: spacing.lg,
        backgroundColor: colors.bgCard, borderRadius: borderRadius.lg,
        padding: 4, borderWidth: 1, borderColor: colors.border,
    },
    tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: borderRadius.md },
    tabActive: { backgroundColor: colors.primary },
    tabText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textMuted },
    tabTextActive: { color: colors.textPrimary, fontWeight: fontWeight.semibold },
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
    invoiceService: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary },
    invoiceDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
    invoiceRight: { alignItems: 'flex-end' },
    invoiceAmount: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
    statusBadge: {
        paddingVertical: 2, paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full, marginTop: 4,
    },
    statusText: { fontSize: 10, fontWeight: fontWeight.semibold },
    dueDate: {
        fontSize: fontSize.xs, color: '#F59E0B', marginTop: spacing.sm,
        paddingLeft: 52,
    },
    emptyState: { alignItems: 'center', paddingVertical: spacing['5xl'], paddingHorizontal: spacing['2xl'] },
    emptyIconBg: {
        width: 96, height: 96, borderRadius: 48, backgroundColor: colors.bgCard,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl,
    },
    emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.sm },
    emptySubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
});
