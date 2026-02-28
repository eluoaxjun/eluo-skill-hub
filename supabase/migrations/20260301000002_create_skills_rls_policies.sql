-- =============================================================================
-- Migration: create_skills_rls_policies
-- Description: skills 테이블 RLS 정책 설정 (인증 사용자 읽기, 관리자 CUD)
-- =============================================================================

-- 1. RLS 활성화
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- 2. 인증된 사용자: 모든 레코드 읽기 허용
CREATE POLICY "skills_select_authenticated"
  ON public.skills FOR SELECT
  TO authenticated
  USING (true);

-- 3. 관리자만: INSERT 허용
CREATE POLICY "skills_insert_admin"
  ON public.skills FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. 관리자만: UPDATE 허용
CREATE POLICY "skills_update_admin"
  ON public.skills FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. 관리자만: DELETE 허용
CREATE POLICY "skills_delete_admin"
  ON public.skills FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));
