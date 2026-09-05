-- ============================================
-- Premcare Mobile App — Fix: Allow patients to view clinician profiles
-- This is needed for the booking flow (clinician selection)
-- ============================================

-- Patients can view clinician profiles (for booking)
CREATE POLICY "Patients can view clinician profiles"
  ON profiles FOR SELECT
  USING (role = 'clinician');
