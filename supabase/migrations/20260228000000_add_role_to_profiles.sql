-- =============================================================================
-- Migration: add_role_to_profiles
-- Description: profiles 테이블에 role 컬럼 추가, RLS 정책 확장, 관리자 함수 설정
-- =============================================================================

-- 1. role 컬럼 추가 (TEXT, NOT NULL, DEFAULT 'user')
ALTER TABLE public.profiles
  ADD COLUMN role TEXT NOT NULL DEFAULT 'user';

-- 2. CHECK 제약조건: role 값은 'user' 또는 'admin'만 허용
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin'));

-- 3. is_admin() SECURITY DEFINER 함수 생성
--    RLS 정책에서 관리자 여부를 확인하는 데 사용
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = check_user_id
      AND role = 'admin'
  );
END;
$$;

-- 4. 관리자 SELECT RLS 정책: 관리자가 전체 사용자 프로필을 조회 가능
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 5. 관리자 UPDATE RLS 정책: 관리자가 다른 사용자의 역할을 수정 가능
CREATE POLICY "Admins can update user roles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6. handle_new_user() 트리거 함수 수정: role 컬럼에 기본값 'user' 포함
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, created_at)
  VALUES (NEW.id, NEW.email, 'user', now());
  RETURN NEW;
END;
$$;

-- 7. jrlee@eluocnc.com 사용자를 관리자로 설정
UPDATE public.profiles
  SET role = 'admin'
  WHERE email = 'jrlee@eluocnc.com';
