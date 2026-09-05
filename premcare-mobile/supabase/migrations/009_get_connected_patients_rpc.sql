-- ============================================
-- RPC: get_connected_patients
-- Returns all active connections for the calling clinician,
-- including the patient's full profile, bypassing RLS safely.
-- ============================================
CREATE OR REPLACE FUNCTION get_connected_patients()
RETURNS TABLE (
  patient_id   uuid,
  full_name    text,
  email        text,
  phone        text,
  avatar_url   text,
  date_of_birth text,
  address      text,
  connected_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id           AS patient_id,
    p.full_name,
    p.email,
    p.phone,
    p.avatar_url,
    p.date_of_birth::text,
    p.address,
    pc.created_at  AS connected_at
  FROM patient_connections pc
  JOIN profiles p ON p.id = pc.patient_id
  WHERE pc.clinician_id = auth.uid()
    AND pc.status = 'active';
END;
$$;
