-- =============================================================================
-- Migration: create_skill_markdowns_bucket
-- Description: skill-markdowns Storage 버킷 생성 (프라이빗, RLS 기반 접근 제어)
-- =============================================================================

-- 1. skill-markdowns 프라이빗 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('skill-markdowns', 'skill-markdowns', false);
