-- =============================================================================
-- Migration: create_skills_table
-- Description: skills 테이블 생성 (Skill Catalog 바운디드 컨텍스트)
-- =============================================================================

-- 1. skills 테이블 생성
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('기획', '디자인', '퍼블리싱', '개발', 'QA')),
  markdown_file_path text NOT NULL,
  author_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. 인덱스 생성
CREATE INDEX idx_skills_category ON public.skills(category);
CREATE INDEX idx_skills_author_id ON public.skills(author_id);
CREATE INDEX idx_skills_created_at ON public.skills(created_at DESC);
