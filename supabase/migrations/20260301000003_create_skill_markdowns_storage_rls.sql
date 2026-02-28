-- =============================================================================
-- Migration: create_skill_markdowns_storage_rls
-- Description: skill-markdowns Storage 버킷 RLS 정책 설정
-- =============================================================================

-- 1. 인증된 사용자: 마크다운 파일 읽기 허용
CREATE POLICY "skill_markdowns_select_authenticated"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'skill-markdowns');

-- 2. 관리자만: 마크다운 파일 업로드 허용
CREATE POLICY "skill_markdowns_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'skill-markdowns'
    AND public.is_admin(auth.uid())
  );

-- 3. 관리자만: 마크다운 파일 삭제 허용
CREATE POLICY "skill_markdowns_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'skill-markdowns'
    AND public.is_admin(auth.uid())
  );
