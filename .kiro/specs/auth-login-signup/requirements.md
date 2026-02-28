# Requirements Document

## Project Description (Input)
로그인 페이지 및 회원가입 페이지 구현

1. 로그인은 이메일과 패스워드를 사용한다.
2. supabase auth를 사용한다.
3. 회원가입 페이지는 eluocnc.com 인 이메일만 회원가입이 가능한다.
4. 이메일+패스워드 방식을 사용하며, 회원가입 시 이메일 인증코드 확인을 수행한다.
5. /login, /signup 두 개의 라우터를 사용한다.

## Requirements

### Requirement 1: 로그인 페이지

**Objective:** 사용자로서, 이메일과 패스워드를 입력하여 로그인할 수 있어야 한다. 이를 통해 등록된 계정으로 안전하게 인증할 수 있다.

#### Acceptance Criteria

1. The Auth System shall `/login` 라우트에서 로그인 페이지를 제공한다.
2. The Auth System shall 로그인 페이지에 이메일 입력 필드, 패스워드 입력 필드, 로그인 버튼을 표시한다.
3. When 사용자가 유효한 이메일과 패스워드를 입력하고 로그인 버튼을 클릭하면, the Auth System shall Supabase Auth `signInWithPassword`를 호출하여 인증을 수행한다.
4. When 인증이 성공하면, the Auth System shall 메인 페이지로 리다이렉트한다.
5. If 유효하지 않은 이메일 형식이 입력되면, the Auth System shall 이메일 형식 오류 메시지를 표시하고 로그인 요청을 차단한다.
6. If 패스워드가 빈 값이면, the Auth System shall 패스워드 입력 오류 메시지를 표시하고 로그인 요청을 차단한다.
7. If 잘못된 자격증명(이메일 또는 패스워드 불일치)이 입력되면, the Auth System shall "이메일 또는 패스워드가 올바르지 않습니다" 오류 메시지를 표시한다.
8. If 가입되지 않은 이메일로 로그인을 시도하면, the Auth System shall 해당 이메일이 등록되지 않았음을 안내하고 회원가입 페이지로의 이동 링크를 제공한다.
9. If 이메일 인증이 완료되지 않은 사용자가 로그인을 시도하면, the Auth System shall "이메일 인증이 필요합니다. 가입 시 발송된 인증 메일을 확인해주세요" 안내 메시지를 표시한다.

---

### Requirement 2: 회원가입 페이지

**Objective:** 신규 사용자로서, eluocnc.com 도메인 이메일과 패스워드로 회원가입할 수 있어야 한다. 가입 후 이메일 인증을 완료해야 서비스를 이용할 수 있다.

#### Acceptance Criteria

1. The Auth System shall `/signup` 라우트에서 회원가입 페이지를 제공한다.
2. The Auth System shall 회원가입 페이지에 이메일 입력 필드, 패스워드 입력 필드, 패스워드 확인 입력 필드, 가입 버튼을 표시한다.
3. If `@eluocnc.com` 이외의 도메인 이메일이 입력되면, the Auth System shall "eluocnc.com 이메일만 가입이 가능합니다" 오류 메시지를 표시하고 가입 요청을 차단한다.
4. If 유효하지 않은 이메일 형식이 입력되면, the Auth System shall 이메일 형식 오류 메시지를 표시하고 가입 요청을 차단한다.
5. If 패스워드가 최소 8자 미만이거나 특수문자를 1개 이상 포함하지 않으면, the Auth System shall "패스워드는 최소 8자 이상이며 특수문자를 1개 이상 포함해야 합니다" 오류 메시지를 표시하고 가입 요청을 차단한다.
6. If 패스워드와 패스워드 확인 값이 일치하지 않으면, the Auth System shall "패스워드가 일치하지 않습니다" 오류 메시지를 표시하고 가입 요청을 차단한다.
7. When 사용자가 유효한 정보를 입력하고 가입 버튼을 클릭하면, the Auth System shall Supabase Auth `signUp`을 호출하여 회원가입을 수행하고 이메일 인증 메일을 발송한다.
8. When 회원가입이 성공하면, the Auth System shall "인증 메일이 발송되었습니다. 이메일을 확인하여 인증을 완료해주세요" 안내 화면을 표시한다.
9. If 이미 등록된 이메일로 회원가입을 시도하면, the Auth System shall 이미 가입된 이메일임을 안내하고 로그인 페이지로의 이동 링크를 제공한다.

---

### Requirement 3: 페이지 간 네비게이션

**Objective:** 사용자로서, 로그인 페이지와 회원가입 페이지 사이를 쉽게 이동할 수 있어야 한다. 이를 통해 원하는 인증 흐름을 빠르게 선택할 수 있다.

#### Acceptance Criteria

1. The Auth System shall 로그인 페이지에 "아직 계정이 없으신가요? 회원가입" 링크를 제공하여 `/signup` 페이지로 이동할 수 있도록 한다.
2. The Auth System shall 회원가입 페이지에 "이미 계정이 있으신가요? 로그인" 링크를 제공하여 `/login` 페이지로 이동할 수 있도록 한다.

---

### Requirement 4: 인증 상태 관리

**Objective:** 시스템으로서, 사용자의 인증 상태를 올바르게 관리하여 인증된 사용자와 미인증 사용자의 접근을 적절히 제어해야 한다.

#### Acceptance Criteria

1. While 사용자가 이미 인증된 상태에서 `/login` 또는 `/signup` 페이지에 접근하면, the Auth System shall 자동으로 메인 페이지로 리다이렉트한다.
2. The Auth System shall 인증 세션을 Supabase Auth 기반으로 관리한다.
3. When 사용자가 로그아웃하면, the Auth System shall 인증 세션을 종료하고 로그인 페이지로 리다이렉트한다.
4. If 이메일 인증이 완료되지 않은 사용자가 보호된 페이지에 접근하면, the Auth System shall 이메일 인증 완료 안내 메시지와 함께 접근을 차단한다.

---

### Requirement 5: 로딩 및 에러 처리

**Objective:** 사용자로서, 인증 과정에서 명확한 피드백을 받아야 한다. 이를 통해 현재 상태를 파악하고 문제 발생 시 적절히 대응할 수 있다.

#### Acceptance Criteria

1. While 로그인 요청이 진행 중일 때, the Auth System shall 로딩 인디케이터를 표시하고 중복 요청을 방지한다.
2. While 회원가입 요청이 진행 중일 때, the Auth System shall 로딩 인디케이터를 표시하고 중복 제출을 방지한다.
3. If Supabase Auth 서비스와의 통신에 실패하면, the Auth System shall 네트워크 오류 메시지를 표시하고 재시도 옵션을 제공한다.

---

### Requirement 6: 회원가입 시 유저 프로필 DB 저장

**Objective:** 시스템으로서, 회원가입 시 사용자의 프로필 정보를 `public.profiles` 테이블에 자동 저장해야 한다. 이를 통해 인증 데이터와 별도로 사용자 프로필을 도메인 수준에서 관리하고, 향후 프로필 조회/수정 기능을 지원할 수 있다.

#### Acceptance Criteria

1. The Auth System shall `public.profiles` 테이블에 `id` (UUID, `auth.users.id` 참조), `email` (text), `created_at` (timestamptz) 컬럼을 포함하는 스키마를 정의한다.
2. When `auth.users` 테이블에 새로운 레코드가 INSERT 되면, the Auth System shall PostgreSQL 트리거를 통해 `public.profiles` 테이블에 해당 사용자의 프로필 레코드를 자동으로 생성한다.
3. The Auth System shall `public.profiles` 테이블에 RLS(Row Level Security) 정책을 적용하여, 인증된 사용자가 본인의 프로필 데이터만 읽기(SELECT) 및 수정(UPDATE)할 수 있도록 한다.
4. The Auth System shall `UserProfile` 도메인 엔티티를 정의하여 `id`, `email`, `createdAt` 속성을 포함하는 프로필 데이터를 표현한다.
5. The Auth System shall `UserRepository` 인터페이스를 도메인 계층에 정의하여 프로필 조회(`findById`) 및 수정(`update`) 계약을 명세한다.
6. The Auth System shall `SupabaseUserRepository` 구현체를 인프라 계층에 제공하여, `public.profiles` 테이블을 대상으로 프로필 조회 및 수정 기능을 수행한다.
7. When 회원가입이 완료되면, the Auth System shall DB 트리거에 의해 프로필이 자동 생성되므로 기존 `SignUpUseCase`의 변경 없이 프로필 저장을 보장한다.
8. If DB 트리거가 실패하여 프로필 레코드가 생성되지 않으면, the Auth System shall `auth.users` INSERT 트랜잭션도 롤백되어 데이터 정합성을 보장한다.
