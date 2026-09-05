-- ============================================
-- Premcare Mobile App — Exercise Plans Schema
-- Phase 3: Exercise/Treatment Plans
-- ============================================

-- ==================
-- EXERCISE PLANS TABLE
-- ==================
CREATE TABLE exercise_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  clinician_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE exercise_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their exercise plans"
  ON exercise_plans FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Clinicians can view their exercise plans"
  ON exercise_plans FOR SELECT
  USING (auth.uid() = clinician_id);

CREATE POLICY "Clinicians can create exercise plans"
  ON exercise_plans FOR INSERT
  WITH CHECK (auth.uid() = clinician_id);

CREATE POLICY "Clinicians can update exercise plans"
  ON exercise_plans FOR UPDATE
  USING (auth.uid() = clinician_id);

-- ==================
-- EXERCISES TABLE (individual exercises within a plan)
-- ==================
CREATE TABLE exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_id UUID REFERENCES exercise_plans(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sets INTEGER DEFAULT 3,
  reps INTEGER DEFAULT 10,
  hold_seconds INTEGER,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exercises in their plans"
  ON exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exercise_plans
      WHERE exercise_plans.id = exercises.plan_id
        AND (exercise_plans.patient_id = auth.uid() OR exercise_plans.clinician_id = auth.uid())
    )
  );

CREATE POLICY "Clinicians can manage exercises"
  ON exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercise_plans
      WHERE exercise_plans.id = exercises.plan_id
        AND exercise_plans.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can update exercises"
  ON exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM exercise_plans
      WHERE exercise_plans.id = exercises.plan_id
        AND exercise_plans.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can delete exercises"
  ON exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM exercise_plans
      WHERE exercise_plans.id = exercises.plan_id
        AND exercise_plans.clinician_id = auth.uid()
    )
  );

-- ==================
-- EXERCISE COMPLETIONS TABLE (patient tracking)
-- ==================
CREATE TABLE exercise_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their completions"
  ON exercise_completions FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Clinicians can view patient completions"
  ON exercise_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN exercise_plans ON exercise_plans.id = exercises.plan_id
      WHERE exercises.id = exercise_completions.exercise_id
        AND exercise_plans.clinician_id = auth.uid()
    )
  );

CREATE POLICY "Patients can log completions"
  ON exercise_completions FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Indexes
CREATE INDEX idx_exercise_plans_patient ON exercise_plans(patient_id);
CREATE INDEX idx_exercise_plans_clinician ON exercise_plans(clinician_id);
CREATE INDEX idx_exercises_plan ON exercises(plan_id);
CREATE INDEX idx_exercise_completions_exercise ON exercise_completions(exercise_id);
CREATE INDEX idx_exercise_completions_patient ON exercise_completions(patient_id);

-- Trigger
CREATE TRIGGER update_exercise_plans_updated_at
  BEFORE UPDATE ON exercise_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
