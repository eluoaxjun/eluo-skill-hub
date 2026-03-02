# Core (v1.0.0) `필수`

모든 플러그인의 기반이 되는 필수 패키지입니다. 공통 규칙(5개)과 PM Router 스킬을 포함하여 프로젝트 작업 요청을 자동으로 적절한 오케스트레이터로 라우팅합니다.

---

## 🛠 포함 자산

### Skills (1)
| 스킬명 | 설명 |
| :--- | :--- |
| `pm-router` | **PM 자동 라우팅** — 프로젝트 작업 요청을 분석하여 적절한 오케스트레이터(planning/design/publish/qa/ops)로 자동 분기 |

### 공통 규칙 (5)
| 규칙 | 설명 |
| :--- | :--- |
| `quality.md` | 산출물 품질 기준 (MECE, 두괄식, 정량적 근거) |
| `traceability.md` | ID 추적성 (FR → FN → UI → TC) |
| `pm-direction.md` | PM Direction Protocol (방향 설정, 의사결정) |
| `pipeline.md` | 파이프라인 + 협업 프로토콜 |
| `change-mgmt.md` | 변경 관리 프로토콜 |

---

## 🚀 설치

**Claude Code** 환경에서 아래 커맨드를 입력하여 설치를 진행합니다.

```bash
/plugin marketplace add eluoaxjun/eluohub
/plugin install core@eluo-hub