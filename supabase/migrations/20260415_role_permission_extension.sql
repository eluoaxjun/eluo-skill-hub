-- =========================================================
-- 다운로드 등급(Tier) 시스템 마이그레이션
-- 작성일: 2026-04-16
-- =========================================================
-- 핵심 원칙: 역할(Role)과 등급(Tier)은 분리된 개념
--   역할(Role): admin / user / viewer — 시스템 접근 제어 (기존 유지)
--   등급(Tier): general / senior / executive — 다운로드 권한 세분화 (신규)
-- =========================================================

BEGIN;

-- ---------------------------------------------------------
-- 1) profiles 테이블에 download_tier 컬럼 추가
--    user 역할 사용자의 다운로드 등급을 나타냄
--    admin → 등급 무관 (항상 가능)
--    viewer → 등급 무관 (항상 차단)
-- ---------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS download_tier text NOT NULL DEFAULT 'general';

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_download_tier_check
  CHECK (download_tier IN ('general', 'senior', 'executive'));

-- ---------------------------------------------------------
-- 2) skill_download_tiers 테이블 신설 (스킬당 1행)
--    스킬마다 다운로드 허용 최소 등급을 지정
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skill_download_tiers (
  skill_id   uuid PRIMARY KEY REFERENCES public.skills(id) ON DELETE CASCADE,
  min_tier   text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT skill_download_tiers_min_tier_check
    CHECK (min_tier IN ('general', 'senior', 'executive'))
);

CREATE OR REPLACE FUNCTION public.set_skill_download_tiers_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_skill_download_tiers_updated_at ON public.skill_download_tiers;
CREATE TRIGGER trg_skill_download_tiers_updated_at
  BEFORE UPDATE ON public.skill_download_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_skill_download_tiers_updated_at();

-- ---------------------------------------------------------
-- 3) 기존 모든 스킬 백필 → 최소 등급 = general
-- ---------------------------------------------------------
INSERT INTO public.skill_download_tiers (skill_id, min_tier)
SELECT id, 'general'
FROM public.skills
ON CONFLICT (skill_id) DO NOTHING;

-- ---------------------------------------------------------
-- 4) RLS
-- ---------------------------------------------------------
ALTER TABLE public.skill_download_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS skill_download_tiers_select_all ON public.skill_download_tiers;
CREATE POLICY skill_download_tiers_select_all
  ON public.skill_download_tiers
  FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS skill_download_tiers_admin_write ON public.skill_download_tiers;
CREATE POLICY skill_download_tiers_admin_write
  ON public.skill_download_tiers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.name = 'admin'
    )
  );

-- ---------------------------------------------------------
-- 5) GRANT
-- ---------------------------------------------------------
GRANT SELECT ON public.skill_download_tiers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.skill_download_tiers TO authenticated;

-- ---------------------------------------------------------
-- 6) 이전 마이그레이션 아티팩트 정리
--    (skill_role_permissions, roles.level 이 남아있으면 제거)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS public.skill_role_permissions;
ALTER TABLE public.roles DROP COLUMN IF EXISTS level;

-- executive/senior/general 역할이 잘못 추가됐으면 제거
-- (해당 역할에 profile이 있으면 user로 복원)
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'user' LIMIT 1)
WHERE role_id IN (
  SELECT id FROM public.roles WHERE name IN ('executive', 'senior', 'general')
);

DELETE FROM public.role_permissions
WHERE role_id IN (
  SELECT id FROM public.roles WHERE name IN ('executive', 'senior', 'general')
);

DELETE FROM public.roles
WHERE name IN ('executive', 'senior', 'general');

COMMIT;
