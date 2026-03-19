-- ============================================================================
-- Migration: add items column to game_data
-- Date: 2026-03-19
-- Reason: Item system added to frontend (rpg_items_v1). Without this column
--         the Edge Function upsert fails entirely because PostgreSQL rejects
--         unknown columns, causing ALL game data to fail to sync.
-- ============================================================================

ALTER TABLE public.game_data
  ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.game_data.items IS 'UserItem[] — itens comprados e equipados pelo jogador (weapon/armor/accessory/relic)';
