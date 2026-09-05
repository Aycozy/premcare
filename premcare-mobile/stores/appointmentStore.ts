import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Appointment, AppointmentStatus, ServiceType, SessionNote, DashboardStats } from '../lib/types';
import { SERVICE_LABELS } from '../lib/types';
import { startOfDay, endOfDay, addDays, format } from 'date-fns';
import { useNotificationStore } from './notificationStore';

interface AppointmentState {
    appointments: Appointment[];
    selectedAppointment: Appointment | null;
    isLoading: boolean;
    dashboardStats: DashboardStats | null;

    // Actions
    fetchAppointments: (userId: string, role: 'patient' | 'clinician') => Promise<void>;
    fetchAppointmentById: (id: string) => Promise<void>;
    createAppointment: (appointment: {
        patient_id: string;
        clinician_id: string;
        service_type: ServiceType;
        scheduled_at: string;
        duration_minutes: number;
        location: string;
        notes?: string;
    }) => Promise<{ error: string | null; data: Appointment | null }>;
    updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<{ error: string | null }>;
    cancelAppointment: (id: string) => Promise<{ error: string | null }>;
    fetchDashboardStats: (userId: string, role: 'patient' | 'clinician') => Promise<void>;

    // Session notes
    createSessionNote: (note: Omit<SessionNote, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
    fetchSessionNote: (appointmentId: string) => Promise<SessionNote | null>;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
    appointments: [],
    selectedAppointment: null,
    isLoading: false,
    dashboardStats: null,

    fetchAppointments: async (userId: string, role: 'patient' | 'clinician') => {
        set({ isLoading: true });
        try {
            const column = role === 'patient' ? 'patient_id' : 'clinician_id';
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(*),
          clinician:profiles!appointments_clinician_id_fkey(*),
          session_note:session_notes(*)
        `)
                .eq(column, userId)
                .order('scheduled_at', { ascending: true });

            if (error) throw error;
            set({ appointments: (data as Appointment[]) || [], isLoading: false });
        } catch (error) {
            console.error('Fetch appointments error:', error);
            set({ isLoading: false });
        }
    },

    fetchAppointmentById: async (id: string) => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(*),
          clinician:profiles!appointments_clinician_id_fkey(*),
          session_note:session_notes(*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            set({ selectedAppointment: data as Appointment });
        } catch (error) {
            console.error('Fetch appointment error:', error);
        }
    },

    createAppointment: async (appointment) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase
                .from('appointments')
                .insert({
                    ...appointment,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) {
                set({ isLoading: false });
                return { error: error.message, data: null };
            }

            // Notify clinician about new booking
            if (data) {
                try {
                    const serviceName = SERVICE_LABELS[appointment.service_type] || appointment.service_type;
                    await useNotificationStore.getState().createNotification({
                        user_id: appointment.clinician_id,
                        type: 'appointment_booked',
                        title: 'New Appointment Booked',
                        body: `A patient booked a ${serviceName} session on ${format(new Date(appointment.scheduled_at), 'MMM d, h:mm a')}.`,
                        data: { appointment_id: (data as Appointment).id },
                    });
                } catch (e) {
                    console.error('Notification error:', e);
                }
            }

            set({ isLoading: false });
            return { error: null, data: data as Appointment };
        } catch (err: any) {
            set({ isLoading: false });
            return { error: err.message, data: null };
        }
    },

    updateAppointmentStatus: async (id: string, status: AppointmentStatus) => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) return { error: error.message };

            // Notify relevant user about status change
            try {
                const apt = get().appointments.find(a => a.id === id);
                if (apt) {
                    if (status === 'confirmed' && apt.patient_id) {
                        const serviceName = SERVICE_LABELS[apt.service_type] || apt.service_type;
                        await useNotificationStore.getState().createNotification({
                            user_id: apt.patient_id,
                            type: 'appointment_confirmed',
                            title: 'Appointment Confirmed ✅',
                            body: `Your ${serviceName} session has been confirmed by your clinician.`,
                            data: { appointment_id: id },
                        });
                    }
                }
            } catch (e) {
                console.error('Notification error:', e);
            }

            // Refresh the appointment
            await get().fetchAppointmentById(id);
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    },

    cancelAppointment: async (id: string) => {
        return get().updateAppointmentStatus(id, 'cancelled');
    },

    fetchDashboardStats: async (userId: string, role: 'patient' | 'clinician') => {
        try {
            const column = role === 'patient' ? 'patient_id' : 'clinician_id';
            const today = new Date();
            const todayStart = startOfDay(today).toISOString();
            const todayEnd = endOfDay(today).toISOString();

            // Today's appointments
            const { count: todayCount } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq(column, userId)
                .gte('scheduled_at', todayStart)
                .lte('scheduled_at', todayEnd)
                .not('status', 'eq', 'cancelled');

            // Upcoming appointments
            const { count: upcomingCount } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq(column, userId)
                .gte('scheduled_at', todayEnd)
                .in('status', ['pending', 'confirmed']);

            // Completed sessions
            const { count: completedCount } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq(column, userId)
                .eq('status', 'completed');

            // Total patients (clinician only) - includes connections + appointment patients
            let totalPatients = 0;
            if (role === 'clinician') {
                const { data: aptPatients } = await supabase
                    .from('appointments')
                    .select('patient_id')
                    .eq('clinician_id', userId);

                const { data: connPatients } = await supabase
                    .from('patient_connections')
                    .select('patient_id')
                    .eq('clinician_id', userId)
                    .eq('status', 'active');

                const uniquePatients = new Set([
                    ...(aptPatients?.map(p => p.patient_id) || []),
                    ...(connPatients?.map(p => p.patient_id) || []),
                ]);
                totalPatients = uniquePatients.size;
            }

            set({
                dashboardStats: {
                    todayAppointments: todayCount || 0,
                    upcomingAppointments: upcomingCount || 0,
                    completedSessions: completedCount || 0,
                    totalPatients,
                },
            });
        } catch (error) {
            console.error('Dashboard stats error:', error);
        }
    },

    createSessionNote: async (note) => {
        try {
            const { error } = await supabase
                .from('session_notes')
                .insert(note);

            if (error) return { error: error.message };

            // Mark appointment as completed
            await get().updateAppointmentStatus(note.appointment_id, 'completed');

            // Notify patient that session note is ready
            try {
                const apt = get().appointments.find(a => a.id === note.appointment_id);
                if (apt && apt.patient_id) {
                    await useNotificationStore.getState().createNotification({
                        user_id: apt.patient_id,
                        type: 'session_note_ready',
                        title: 'Session Notes Ready 📋',
                        body: 'Your clinician has completed notes for your session. Check your progress tab for details.',
                        data: { appointment_id: note.appointment_id },
                    });
                }
            } catch (e) {
                console.error('Notification error:', e);
            }

            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    },

    fetchSessionNote: async (appointmentId: string) => {
        try {
            const { data, error } = await supabase
                .from('session_notes')
                .select('*')
                .eq('appointment_id', appointmentId)
                .single();

            if (error) return null;
            return data as SessionNote;
        } catch {
            return null;
        }
    },
}));
