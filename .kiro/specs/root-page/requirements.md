# Requirements Document

## Introduction

Eluo Skill Hub의 루트 페이지 레이아웃을 구현한다. AI Skills Platform Dashboard 디자인 구조를 기반으로, 사이드바 내비게이션 + 상단 헤더 + 메인 콘텐츠 영역의 3분할 레이아웃을 구성한다. 카테고리는 기획/디자인/퍼블리싱/개발/QA 5개 직군으로 구성하며, 향후 Supabase MCP 데이터 연동을 고려한 구조를 갖춘다.

## Requirements

### Requirement 1: 루트 레이아웃 구조

**Objective:** 사용자로서, 사이드바/상단 헤더/메인 콘텐츠로 구성된 일관된 대시보드 레이아웃을 보고 싶다. 그래야 플랫폼의 각 기능 영역을 직관적으로 탐색할 수 있다.

#### Acceptance Criteria

1. The Root Layout shall 사이드바, 상단 헤더, 메인 콘텐츠 영역의 3분할 레이아웃으로 페이지를 렌더링한다.
2. The Root Layout shall 사이드바를 화면 왼쪽에 수직으로 고정 배치한다.
3. The Root Layout shall 상단 헤더를 사이드바 오른쪽 상단에 가로 방향으로 고정 배치한다.
4. The Root Layout shall 메인 콘텐츠 영역을 상단 헤더 아래에 남은 공간을 채우도록 배치한다.
5. The Root Layout shall 전체 뷰포트 높이(100vh)를 사용하여 스크롤 없이 레이아웃 골격을 표시한다.

### Requirement 2: 사이드바 내비게이션

**Objective:** 사용자로서, 사이드바에서 직군별 카테고리와 주요 메뉴를 확인하고 싶다. 그래야 원하는 기능 영역으로 빠르게 이동할 수 있다.

#### Acceptance Criteria

1. The Sidebar shall 플랫폼 로고 또는 서비스명("Eluo Skill Hub")을 상단에 표시한다.
2. The Sidebar shall 기획, 디자인, 퍼블리싱, 개발, QA 5개 직군 카테고리를 내비게이션 메뉴 항목으로 표시한다.
3. The Sidebar shall 각 카테고리 항목에 해당 직군을 식별할 수 있는 아이콘을 함께 표시한다.
4. When 사용자가 카테고리 항목을 클릭하면, the Sidebar shall 해당 항목을 시각적으로 활성(active) 상태로 표시한다.
5. When 사용자가 카테고리 항목을 클릭하면, the Sidebar shall 메인 콘텐츠 영역에 해당 카테고리의 콘텐츠를 표시하도록 상태를 전달한다.

### Requirement 3: 상단 헤더

**Objective:** 사용자로서, 상단 헤더에서 현재 위치를 확인하고 검색 및 사용자 관련 액션에 접근하고 싶다. 그래야 플랫폼 내에서 효율적으로 작업할 수 있다.

#### Acceptance Criteria

1. The Header shall 현재 선택된 카테고리 또는 페이지 제목을 표시한다.
2. The Header shall 스킬 검색을 위한 검색 입력 필드를 포함한다.
3. The Header shall 사용자 프로필 영역(아바타 또는 아이콘)을 오른쪽에 표시한다.
4. While 사이드바에서 카테고리가 변경된 상태이면, the Header shall 변경된 카테고리명을 페이지 제목으로 반영한다.

### Requirement 4: 메인 콘텐츠 영역

**Objective:** 사용자로서, 메인 콘텐츠 영역에서 선택된 카테고리에 해당하는 스킬 정보를 한눈에 보고 싶다. 그래야 원하는 스킬을 빠르게 탐색하고 선택할 수 있다.

#### Acceptance Criteria

1. The Main Content shall 기본(홈) 상태에서 대시보드 요약 정보를 표시한다.
2. When 카테고리가 선택되면, the Main Content shall 해당 카테고리에 속하는 스킬 카드 목록을 그리드 형태로 표시한다.
3. The Main Content shall 각 스킬 카드에 스킬명, 간단한 설명, 카테고리 태그를 포함한다.
4. The Main Content shall 콘텐츠가 영역을 초과할 경우 세로 스크롤을 지원한다.
5. While 데이터가 로딩 중인 상태이면, the Main Content shall 로딩 인디케이터를 표시한다.
6. If 표시할 스킬 데이터가 없으면, the Main Content shall "등록된 스킬이 없습니다"와 같은 빈 상태(empty state) 메시지를 표시한다.

### Requirement 5: 반응형 레이아웃

**Objective:** 사용자로서, 다양한 화면 크기에서 레이아웃이 적절히 조정되기를 원한다. 그래야 모바일이나 태블릿에서도 플랫폼을 사용할 수 있다.

#### Acceptance Criteria

1. When 화면 너비가 768px 미만이면, the Root Layout shall 사이드바를 숨기고 햄버거 메뉴 버튼을 상단 헤더에 표시한다.
2. When 햄버거 메뉴 버튼을 클릭하면, the Root Layout shall 사이드바를 오버레이 형태로 표시한다.
3. When 오버레이 사이드바 외부 영역을 클릭하면, the Root Layout shall 오버레이 사이드바를 닫는다.
4. When 화면 너비가 768px 이상이면, the Root Layout shall 사이드바를 항상 표시한다.
5. The Root Layout shall 메인 콘텐츠 영역의 스킬 카드 그리드 열 수를 화면 너비에 따라 조정한다.

### Requirement 6: 다크 모드 지원

**Objective:** 사용자로서, 라이트/다크 모드를 전환할 수 있기를 원한다. 그래야 선호하는 테마로 플랫폼을 사용할 수 있다.

#### Acceptance Criteria

1. The Root Layout shall 시스템 테마 설정(prefers-color-scheme)을 감지하여 초기 테마를 적용한다.
2. The Header shall 라이트/다크 모드 전환 토글 버튼을 제공한다.
3. When 테마 전환 토글을 클릭하면, the Root Layout shall 전체 레이아웃(사이드바, 헤더, 메인 콘텐츠)의 색상 테마를 즉시 전환한다.
4. The Root Layout shall 사용자가 선택한 테마를 로컬 저장소에 저장하여 재방문 시 유지한다.

### Requirement 7: 접근성

**Objective:** 모든 사용자로서, 키보드 및 스크린 리더를 통해 레이아웃을 탐색할 수 있기를 원한다. 그래야 접근성 요구사항을 충족하는 포용적인 플랫폼이 될 수 있다.

#### Acceptance Criteria

1. The Root Layout shall 사이드바에 `nav` 시맨틱 태그와 `aria-label`을 적용한다.
2. The Root Layout shall 상단 헤더에 `header` 시맨틱 태그를 적용한다.
3. The Root Layout shall 메인 콘텐츠 영역에 `main` 시맨틱 태그를 적용한다.
4. The Sidebar shall 키보드 Tab 키를 사용하여 모든 내비게이션 항목을 순서대로 탐색할 수 있도록 한다.
5. When 내비게이션 항목이 포커스된 상태에서 Enter 키를 누르면, the Sidebar shall 해당 항목을 활성화한다.
