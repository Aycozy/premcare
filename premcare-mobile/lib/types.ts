// Shared TypeScript types for Premcare Mobile

export type UserRole = 'patient' | 'clinician' | 'admin';

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    role: UserRole;
    avatar_url: string | null;
    date_of_birth: string | null;
    medical_history: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    address: string | null;
    push_token: string | null;
    is_suspended: boolean;
    created_at: string;
    updated_at: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export type ServiceType =
    | 'pain_management'
    | 'sports_rehab'
    | 'post_op_rehab'
    | 'neuro_rehab'
    | 'geriatric'
    | 'pediatric'
    | 'general_assessment';

export const SERVICE_LABELS: Record<ServiceType, string> = {
    pain_management: 'Pain Management',
    sports_rehab: 'Sports Rehabilitation',
    post_op_rehab: 'Post-Op Rehabilitation',
    neuro_rehab: 'Neuro Rehabilitation',
    geriatric: 'Geriatric Physiotherapy',
    pediatric: 'Pediatric Care',
    general_assessment: 'General Assessment',
};

export const SERVICE_DURATIONS: Record<ServiceType, number> = {
    pain_management: 60,
    sports_rehab: 60,
    post_op_rehab: 60,
    neuro_rehab: 90,
    geriatric: 60,
    pediatric: 45,
    general_assessment: 45,
};

export const SERVICE_PRICES: Record<ServiceType, number> = {
    pain_management: 25000,
    sports_rehab: 30000,
    post_op_rehab: 30000,
    neuro_rehab: 35000,
    geriatric: 25000,
    pediatric: 20000,
    general_assessment: 15000,
};

export interface Appointment {
    id: string;
    patient_id: string;
    clinician_id: string;
    service_type: ServiceType;
    scheduled_at: string;
    duration_minutes: number;
    status: AppointmentStatus;
    location: string;
    notes: string | null;
    coverage_clinician_id: string | null;
    coverage_status: 'active' | 'withdrawn' | null;
    patient?: Profile;
    clinician?: Profile;
    coverage_clinician?: Profile;
    session_note?: SessionNote;
    created_at: string;
    updated_at: string;
}

export interface SessionNote {
    id: string;
    appointment_id: string;
    clinician_id: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    pain_score_before: number | null;
    pain_score_after: number | null;
    rom_notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface TimeSlot {
    time: string; // ISO date-time string
    available: boolean;
}

export interface DashboardStats {
    todayAppointments: number;
    upcomingAppointments: number;
    completedSessions: number;
    totalPatients: number;
}
