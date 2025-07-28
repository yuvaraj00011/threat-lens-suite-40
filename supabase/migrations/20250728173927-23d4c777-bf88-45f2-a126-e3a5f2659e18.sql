-- Enable email OTP for existing users only
-- This allows OTP authentication for users created via admin panel

-- First, let's ensure we have a way to distinguish admin-created users
-- Add a column to track if user was created by admin
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_by_admin BOOLEAN DEFAULT FALSE;

-- Update existing profiles to mark them as admin-created
UPDATE public.profiles 
SET created_by_admin = TRUE;