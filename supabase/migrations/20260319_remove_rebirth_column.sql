-- Migration: remove rebirth column (mechanic removed)
ALTER TABLE public.game_data DROP COLUMN IF EXISTS rebirth;
