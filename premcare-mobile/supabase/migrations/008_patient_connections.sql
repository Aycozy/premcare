-- ============================================
-- Phase 5: Patient-Clinician Connections
-- ============================================

-- Create the connections table
CREATE TABLE patient_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) NOT NULL,
  clinician_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'rejected')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, clinician_id)
);

-- Enable RLS
ALTER TABLE patient_connections ENABLE ROW LEVEL SECURITY;

-- Patients can view their own connections
CREATE POLICY "Patients can view own connections"
  ON patient_connections FOR SELECT
  USING (auth.uid() = patient_id);

-- Clinicians can view their own connections
CREATE POLICY "Clinicians can view own connections"
  ON patient_connections FOR SELECT
  USING (auth.uid() = clinician_id);

-- Add update trigger
CREATE TRIGGER update_patient_connections_updated_at
  BEFORE UPDATE ON patient_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Update Existing Table Policies to respect connections
-- ============================================

-- Allow clinicians to view profiles of connected patients
CREATE POLICY "Clinicians can view connected patient profiles"
  ON profiles FOR SELECT
  USING (
    role = 'patient' AND
    EXISTS (
      SELECT 1 FROM patient_connections
      WHERE patient_connections.patient_id = profiles.id
        AND patient_connections.clinician_id = auth.uid()
        AND patient_connections.status = 'active'
    )
  );

-- Allow clinicians to view appointments of connected patients
CREATE POLICY "Clinicians can view appointments of connected patients"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_connections
      WHERE patient_connections.patient_id = appointments.patient_id
        AND patient_connections.clinician_id = auth.uid()
        AND patient_connections.status = 'active'
    )
  );

-- ============================================
-- RPC for Clinicians to Connect via Email
-- ============================================
-- We use SECURITY DEFINER because clinicians cannot normally search profiles by email due to RLS.
CREATE OR REPLACE FUNCTION connect_patient_by_email(target_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_patient_id uuid;
  existing_connection_id uuid;
BEGIN
  -- 1. Find the patient by email
  SELECT id INTO target_patient_id
  FROM profiles
  WHERE email = target_email AND role = 'patient';

  IF target_patient_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Patient not found with that email address.');
  END IF;

  -- 2. Check if connection already exists
  SELECT id INTO existing_connection_id
  FROM patient_connections
  WHERE patient_id = target_patient_id AND clinician_id = auth.uid();

  IF existing_connection_id IS NOT NULL THEN
    -- If it exists but is not active, we could update it, but for now just return active
    UPDATE patient_connections SET status = 'active' WHERE id = existing_connection_id;
    RETURN json_build_object('success', true, 'message', 'Connection already exists. Status set to active.');
  END IF;

  -- 3. Create the connection (auto-approved as requested)
  INSERT INTO patient_connections (patient_id, clinician_id, status)
  VALUES (target_patient_id, auth.uid(), 'active');

  RETURN json_build_object('success', true, 'message', 'Successfully connected with patient.');
END;
$$;

-- RPC for Clinicians to Disconnect a Patient
CREATE OR REPLACE FUNCTION disconnect_patient(target_patient_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM patient_connections
  WHERE patient_id = target_patient_id AND clinician_id = auth.uid();
  
  RETURN json_build_object('success', true, 'message', 'Disconnected successfully.');
END;
$$;
