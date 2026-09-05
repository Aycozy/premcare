-- ============================================
-- Premcare Mobile App — Database Schema
-- Phase 1: Auth, Profiles, Appointments, SOAP Notes
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================
-- PROFILES TABLE
-- ==================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('patient', 'clinician')) DEFAULT 'patient',
  avatar_url TEXT,
  date_of_birth DATE,
  medical_history TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);



-- ==================
-- APPOINTMENTS TABLE
-- ==================
CREATE TABLE appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) NOT NULL,
  clinician_id UUID REFERENCES profiles(id) NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN (
    'pain_management', 'sports_rehab', 'post_op_rehab',
    'neuro_rehab', 'geriatric', 'pediatric', 'general_assessment'
  )),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  )) DEFAULT 'pending',
  location TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = patient_id);

-- Clinicians can view their appointments
CREATE POLICY "Clinicians can view own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = clinician_id);

-- Patients can create appointments
CREATE POLICY "Patients can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Clinicians can update appointment status
CREATE POLICY "Clinicians can update appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = clinician_id);

-- Patients can cancel their own appointments
CREATE POLICY "Patients can cancel own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = patient_id AND status IN ('pending', 'confirmed'));

-- Indexes for common queries
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_clinician ON appointments(clinician_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Clinicians can view their patients' profiles (defined here because it references appointments)
CREATE POLICY "Clinicians can view patient profiles"
  ON profiles FOR SELECT
  USING (
    role = 'patient' AND
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.patient_id = profiles.id
        AND appointments.clinician_id = auth.uid()
    )
  );


-- ==================
-- SESSION NOTES TABLE
-- ==================
CREATE TABLE session_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) NOT NULL UNIQUE,
  clinician_id UUID REFERENCES profiles(id) NOT NULL,
  subjective TEXT NOT NULL,
  objective TEXT NOT NULL,
  assessment TEXT NOT NULL,
  plan TEXT NOT NULL,
  pain_score_before INTEGER CHECK (pain_score_before >= 0 AND pain_score_before <= 10),
  pain_score_after INTEGER CHECK (pain_score_after >= 0 AND pain_score_after <= 10),
  rom_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

-- Clinicians can create notes for their appointments
CREATE POLICY "Clinicians can create session notes"
  ON session_notes FOR INSERT
  WITH CHECK (auth.uid() = clinician_id);

-- Clinicians can view their own notes
CREATE POLICY "Clinicians can view own notes"
  ON session_notes FOR SELECT
  USING (auth.uid() = clinician_id);

-- Patients can view notes from their appointments
CREATE POLICY "Patients can view session notes"
  ON session_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = session_notes.appointment_id
        AND appointments.patient_id = auth.uid()
    )
  );

CREATE INDEX idx_session_notes_appointment ON session_notes(appointment_id);
CREATE INDEX idx_session_notes_clinician ON session_notes(clinician_id);


-- ==================
-- FUNCTIONS & TRIGGERS
-- ==================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_notes_updated_at
  BEFORE UPDATE ON session_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ==================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
