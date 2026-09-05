import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

export interface Invoice {
    id: string;
    appointment_id: string;
    patient_id: string;
    clinician_id: string;
    amount: number; // in kobo
    status: InvoiceStatus;
    service_description: string;
    due_date: string | null;
    paid_at: string | null;
    payment_method: string | null;
    payment_reference: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    patient?: { full_name: string; email: string };
    clinician?: { full_name: string };
}

interface PaymentState {
    invoices: Invoice[];
    isLoading: boolean;
    revenueStats: {
        totalRevenue: number;
        pendingAmount: number;
        thisMonthRevenue: number;
        paidCount: number;
        pendingCount: number;
    } | null;

    // Actions
    fetchInvoices: (userId: string, role: 'patient' | 'clinician') => Promise<void>;
    createInvoice: (invoice: {
        appointment_id: string;
        patient_id: string;
        clinician_id: string;
        amount: number;
        service_description: string;
        due_date?: string;
    }) => Promise<{ error: string | null }>;
    updateInvoiceStatus: (invoiceId: string, status: InvoiceStatus, paymentMethod?: string) => Promise<{ error: string | null }>;
    fetchRevenueStats: (clinicianId: string) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
    invoices: [],
    isLoading: false,
    revenueStats: null,

    fetchInvoices: async (userId: string, role: 'patient' | 'clinician') => {
        set({ isLoading: true });
        try {
            const column = role === 'patient' ? 'patient_id' : 'clinician_id';
            const { data, error } = await supabase
                .from('invoices')
                .select(`
                    *,
                    patient:profiles!invoices_patient_id_fkey(full_name, email),
                    clinician:profiles!invoices_clinician_id_fkey(full_name)
                `)
                .eq(column, userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            set({ invoices: (data as Invoice[]) || [], isLoading: false });
        } catch (error) {
            console.error('Fetch invoices error:', error);
            set({ isLoading: false });
        }
    },

    createInvoice: async (invoice) => {
        try {
            const { error } = await supabase
                .from('invoices')
                .insert({
                    ...invoice,
                    status: 'pending',
                    due_date: invoice.due_date || null,
                });

            if (error) return { error: error.message };
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    },

    updateInvoiceStatus: async (invoiceId: string, status: InvoiceStatus, paymentMethod?: string) => {
        try {
            const updates: Record<string, any> = { status };
            if (status === 'paid') {
                updates.paid_at = new Date().toISOString();
                if (paymentMethod) updates.payment_method = paymentMethod;
            }

            const { error } = await supabase
                .from('invoices')
                .update(updates)
                .eq('id', invoiceId);

            if (error) return { error: error.message };

            set((state) => ({
                invoices: state.invoices.map(inv =>
                    inv.id === invoiceId ? { ...inv, ...updates } : inv
                ),
            }));
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    },

    fetchRevenueStats: async (clinicianId: string) => {
        try {
            const { data: allInvoices } = await supabase
                .from('invoices')
                .select('amount, status, paid_at, created_at')
                .eq('clinician_id', clinicianId);

            if (!allInvoices) return;

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            const totalRevenue = allInvoices
                .filter(i => i.status === 'paid')
                .reduce((sum, i) => sum + i.amount, 0);

            const pendingAmount = allInvoices
                .filter(i => i.status === 'pending')
                .reduce((sum, i) => sum + i.amount, 0);

            const thisMonthRevenue = allInvoices
                .filter(i => i.status === 'paid' && i.paid_at && i.paid_at >= startOfMonth)
                .reduce((sum, i) => sum + i.amount, 0);

            const paidCount = allInvoices.filter(i => i.status === 'paid').length;
            const pendingCount = allInvoices.filter(i => i.status === 'pending').length;

            set({
                revenueStats: {
                    totalRevenue,
                    pendingAmount,
                    thisMonthRevenue,
                    paidCount,
                    pendingCount,
                },
            });
        } catch (error) {
            console.error('Revenue stats error:', error);
        }
    },
}));
