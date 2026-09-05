-- ============================================
-- Premcare Mobile App — Push Notifications
-- Phase 4: Add push token to profiles
-- ============================================

-- Add push_token column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token TEXT;
