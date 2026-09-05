-- ============================================
-- Premcare Mobile App — Payments Schema
-- Phase 3: Invoices & Payment Tracking
-- ============================================

-- ==================
-- INVOICES TABLE
-- ==================
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) NOT NULL,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  clinician_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in kobo (smallest currency unit)
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'paid', 'overdue', 'cancelled', 'refunded'
  )) DEFAULT 'pending',
  service_description TEXT NOT NULL,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Clinicians can view their invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = clinician_id);

CREATE POLICY "System can create invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = patient_id OR auth.uid() = clinician_id);

CREATE POLICY "Clinicians can update invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = clinician_id);

CREATE POLICY "Patients can update own invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = patient_id);

-- Indexes
CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_clinician ON invoices(clinician_id);
CREATE INDEX idx_invoices_appointment ON invoices(appointment_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Trigger
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
