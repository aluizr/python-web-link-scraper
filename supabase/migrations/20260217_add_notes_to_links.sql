-- Add notes column to links table
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';
