import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface ExercisePlan {
    id: string;
    patient_id: string;
    clinician_id: string;
    appointment_id: string | null;
    title: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    exercises?: Exercise[];
    clinician?: { full_name: string };
}

export interface Exercise {
    id: string;
    plan_id: string;
    name: string;
    description: string | null;
    sets: number;
    reps: number;
    hold_seconds: number | null;
    image_url: string | null;
    sort_order: number;
    created_at: string;
    completions?: ExerciseCompletion[];
}

export interface ExerciseCompletion {
    id: string;
    exercise_id: string;
    patient_id: string;
    completed_at: string;
    notes: string | null;
}

interface ExerciseState {
    plans: ExercisePlan[];
    activePlan: ExercisePlan | null;
    isLoading: boolean;

    // Patient actions
    fetchPatientPlans: (patientId: string) => Promise<void>;
    completeExercise: (exerciseId: string, patientId: string, notes?: string) => Promise<{ error: string | null }>;
    fetchCompletionsForDate: (patientId: string, date: string) => Promise<ExerciseCompletion[]>;

    // Clinician actions
    fetchClinicianPlans: (clinicianId: string) => Promise<void>;
    createPlan: (plan: {
        patient_id: string;
        clinician_id: string;
        appointment_id?: string;
        title: string;
        description?: string;
        exercises: {
            name: string;
            description?: string;
            sets: number;
            reps: number;
            hold_seconds?: number;
        }[];
    }) => Promise<{ error: string | null; planId: string | null }>;
    togglePlanActive: (planId: string, isActive: boolean) => Promise<void>;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
    plans: [],
    activePlan: null,
    isLoading: false,

    fetchPatientPlans: async (patientId: string) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase
                .from('exercise_plans')
                .select(`
                    *,
                    clinician:profiles!exercise_plans_clinician_id_fkey(full_name),
                    exercises(
                        *,
                        completions:exercise_completions(*)
                    )
                `)
                .eq('patient_id', patientId)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            set({ plans: (data as ExercisePlan[]) || [], isLoading: false });
        } catch (error) {
            console.error('Fetch patient plans error:', error);
            set({ isLoading: false });
        }
    },

    completeExercise: async (exerciseId: string, patientId: string, notes?: string) => {
        try {
            const { error } = await supabase
                .from('exercise_completions')
                .insert({
                    exercise_id: exerciseId,
                    patient_id: patientId,
                    notes: notes || null,
                });

            if (error) return { error: error.message };

            // Refresh plans to update completion counts
            await get().fetchPatientPlans(patientId);
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    },

    fetchCompletionsForDate: async (patientId: string, date: string) => {
        try {
            const startOfDay = `${date}T00:00:00.000Z`;
            const endOfDay = `${date}T23:59:59.999Z`;

            const { data, error } = await supabase
                .from('exercise_completions')
                .select('*')
                .eq('patient_id', patientId)
                .gte('completed_at', startOfDay)
                .lte('completed_at', endOfDay);

            if (error) throw error;
            return (data as ExerciseCompletion[]) || [];
        } catch {
            return [];
        }
    },

    fetchClinicianPlans: async (clinicianId: string) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase
                .from('exercise_plans')
                .select(`
                    *,
                    exercises(*),
                    patient:profiles!exercise_plans_patient_id_fkey(full_name)
                `)
                .eq('clinician_id', clinicianId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            set({ plans: (data as ExercisePlan[]) || [], isLoading: false });
        } catch (error) {
            console.error('Fetch clinician plans error:', error);
            set({ isLoading: false });
        }
    },

    createPlan: async (plan) => {
        set({ isLoading: true });
        try {
            // Create the plan
            const { data: planData, error: planError } = await supabase
                .from('exercise_plans')
                .insert({
                    patient_id: plan.patient_id,
                    clinician_id: plan.clinician_id,
                    appointment_id: plan.appointment_id || null,
                    title: plan.title,
                    description: plan.description || null,
                })
                .select()
                .single();

            if (planError) {
                set({ isLoading: false });
                return { error: planError.message, planId: null };
            }

            // Insert exercises
            if (plan.exercises.length > 0) {
                const exercises = plan.exercises.map((ex, idx) => ({
                    plan_id: planData.id,
                    name: ex.name,
                    description: ex.description || null,
                    sets: ex.sets,
                    reps: ex.reps,
                    hold_seconds: ex.hold_seconds || null,
                    sort_order: idx,
                }));

                const { error: exerciseError } = await supabase
                    .from('exercises')
                    .insert(exercises);

                if (exerciseError) {
                    console.error('Insert exercises error:', exerciseError);
                }
            }

            set({ isLoading: false });
            return { error: null, planId: planData.id };
        } catch (err: any) {
            set({ isLoading: false });
            return { error: err.message, planId: null };
        }
    },

    togglePlanActive: async (planId: string, isActive: boolean) => {
        try {
            await supabase
                .from('exercise_plans')
                .update({ is_active: isActive })
                .eq('id', planId);

            set((state) => ({
                plans: state.plans.map(p =>
                    p.id === planId ? { ...p, is_active: isActive } : p
                ),
            }));
        } catch (error) {
            console.error('Toggle plan error:', error);
        }
    },
}));
