-- ============================================
-- SESSION COVERAGE — FINAL FIX (SQL language)
-- Uses LANGUAGE sql instead of plpgsql to
-- eliminate ALL variable/column ambiguity issues.
-- Paste this entire block into Supabase SQL Editor.
-- ============================================

-- Drop old versions first to force clean replacement
DROP FUNCTION IF EXISTS get_patient_upcoming_sessions(uuid);
DROP FUNCTION IF EXISTS offer_session_coverage(uuid);
DROP FUNCTION IF EXISTS withdraw_coverage(uuid);
DROP FUNCTION IF EXISTS get_my_coverage_sessions();

-- Add columns if not already there
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS coverage_clinician_id UUID REFERENCES profiles(id) DEFAULT NULL;
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS coverage_status TEXT DEFAULT NULL;

-- RLS: connected clinicians can view patient sessions
DROP POLICY IF EXISTS "Connected clinicians can view patient sessions" ON appointments;
CREATE POLICY "Connected clinicians can view patient sessions"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patient_connections pc
      WHERE pc.patient_id   = appointments.patient_id
        AND pc.clinician_id = auth.uid()
        AND pc.status       = 'active'
    )
  );

-- ============================================
-- get_patient_upcoming_sessions
-- Pure SQL function — no plpgsql variables, no ambiguity
-- ============================================
CREATE OR REPLACE FUNCTION get_patient_upcoming_sessions(target_patient_id uuid)
RETURNS TABLE (
  id                    uuid,
  patient_id            uuid,
  clinician_id          uuid,
  clinician_name        text,
  service_type          text,
  scheduled_at          timestamptz,
  duration_minutes      int,
  status                text,
  location              text,
  coverage_clinician_id uuid,
  coverage_status       text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    a.id,
    a.patient_id,
    a.clinician_id,
    p.full_name           AS clinician_name,
    a.service_type,
    a.scheduled_at,
    a.duration_minutes,
    a.status,
    a.location,
    a.coverage_clinician_id,
    a.coverage_status
  FROM appointments a
  JOIN profiles p ON p.id = a.clinician_id
  WHERE a.patient_id    = target_patient_id
    AND a.clinician_id != auth.uid()
    AND a.scheduled_at  > NOW()
    AND a.status NOT IN ('completed', 'cancelled', 'no_show')
    AND EXISTS (
      SELECT 1 FROM patient_connections pc
      WHERE pc.patient_id   = target_patient_id
        AND pc.clinician_id = auth.uid()
        AND pc.status       = 'active'
    )
  ORDER BY a.scheduled_at ASC;
$$;

-- ============================================
-- offer_session_coverage
-- ============================================
CREATE OR REPLACE FUNCTION offer_session_coverage(target_appointment_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_patient_id   uuid;
  v_clinician_id uuid;
  v_status       text;
BEGIN
  SELECT a.patient_id, a.clinician_id, a.status
    INTO v_patient_id, v_clinician_id, v_status
    FROM appointments a
   WHERE a.id = target_appointment_id;

  IF v_patient_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Appointment not found.');
  END IF;

  IF v_clinician_id = auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'You are already the assigned clinician.');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM patient_connections pc
    WHERE pc.patient_id   = v_patient_id
      AND pc.clinician_id = auth.uid()
      AND pc.status       = 'active'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'You are not connected to this patient.');
  END IF;

  IF v_status IN ('completed', 'cancelled', 'no_show') THEN
    RETURN json_build_object('success', false, 'error', 'Session is not available for coverage.');
  END IF;

  UPDATE appointments
     SET coverage_clinician_id = auth.uid(),
         coverage_status       = 'active'
   WHERE id = target_appointment_id;

  RETURN json_build_object('success', true, 'message', 'You are now covering this session.');
END;
$$;

-- ============================================
-- withdraw_coverage
-- ============================================
CREATE OR REPLACE FUNCTION withdraw_coverage(target_appointment_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.id                    = target_appointment_id
      AND a.coverage_clinician_id = auth.uid()
  ) THEN
    RETURN json_build_object('success', false, 'error', 'You are not the coverage clinician for this session.');
  END IF;

  UPDATE appointments
     SET coverage_clinician_id = NULL,
         coverage_status       = NULL
   WHERE id = target_appointment_id;

  RETURN json_build_object('success', true, 'message', 'Coverage withdrawn successfully.');
END;
$$;

-- ============================================
-- get_my_coverage_sessions
-- Pure SQL — no ambiguity possible
-- ============================================
CREATE OR REPLACE FUNCTION get_my_coverage_sessions()
RETURNS TABLE (
  id               uuid,
  patient_id       uuid,
  patient_name     text,
  clinician_id     uuid,
  clinician_name   text,
  service_type     text,
  scheduled_at     timestamptz,
  duration_minutes int,
  status           text,
  location         text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    a.id,
    a.patient_id,
    pat.full_name  AS patient_name,
    a.clinician_id,
    clin.full_name AS clinician_name,
    a.service_type,
    a.scheduled_at,
    a.duration_minutes,
    a.status,
    a.location
  FROM appointments a
  JOIN profiles pat  ON pat.id  = a.patient_id
  JOIN profiles clin ON clin.id = a.clinician_id
  WHERE a.coverage_clinician_id = auth.uid()
    AND a.coverage_status       = 'active'
  ORDER BY a.scheduled_at ASC;
$$;
