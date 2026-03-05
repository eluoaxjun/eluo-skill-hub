import type { Metadata } from 'next';
import {
  BookOpen,
  Download,
  FolderOpen,
  Play,
  Server,
  RefreshCw,
  Trash2,
  AlertTriangle,
  ChevronRight,
  FileText,
  Terminal,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '도움말',
};

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 페이지 헤더 */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-[#00007F] rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen size={24} className="text-[#FEFE01]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">도움말 센터</h1>
            <p className="text-sm text-gray-500 mt-1">
              엘루오 허브 스킬을 다운로드하고 바로 사용하기까지의 과정을 안내합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 사전 요구사항 */}
      <Section
        icon={<Terminal size={20} />}
        title="사전 요구사항"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RequirementCard
            label="Claude Code"
            version="v2.1 이상"
            command="claude --version"
          />
          <RequirementCard
            label="Node.js"
            version="18 이상"
            command="node --version"
          />
        </div>
      </Section>

      {/* 1단계 */}
      <Section
        icon={<Download size={20} />}
        title="1단계: 스킬 폴더 다운로드"
        step={1}
      >
        <p className="text-gray-600 mb-4">
          필요한 스킬 폴더를 다운로드합니다. 각 폴더는 <strong>자기완결형</strong>이므로 하나만 받아도 바로 사용할 수 있습니다.
        </p>
        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">스킬</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">폴더명</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">설명</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-3 text-gray-800">고객질의서</td>
                <td className="px-4 py-3"><code className="bg-[#00007F]/10 text-[#00007F] px-2 py-0.5 rounded text-xs font-mono">plan-qst/</code></td>
                <td className="px-4 py-3 text-gray-500">고객 요구사항 수집</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-800">요구사항정의서</td>
                <td className="px-4 py-3"><code className="bg-[#00007F]/10 text-[#00007F] px-2 py-0.5 rounded text-xs font-mono">plan-req/</code></td>
                <td className="px-4 py-3 text-gray-500">기능/비기능 요구사항 정의</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-800">기능정의서</td>
                <td className="px-4 py-3"><code className="bg-[#00007F]/10 text-[#00007F] px-2 py-0.5 rounded text-xs font-mono">plan-fn/</code></td>
                <td className="px-4 py-3 text-gray-500">입력-처리-출력 상세 명세</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* 2단계 */}
      <Section
        icon={<FolderOpen size={20} />}
        title="2단계: 스킬 폴더에서 Claude Code 실행"
        step={2}
      >
        <p className="text-gray-600 mb-4">
          다운로드한 스킬 폴더를 열고 Claude Code를 실행합니다.
        </p>
        <div className="bg-gray-900 rounded-xl p-5 text-sm font-mono text-gray-300 space-y-1 mb-6">
          <div className="text-[#FEFE01]">plan-req/</div>
          <div className="pl-4 flex items-center gap-2"><ChevronRight size={12} className="text-gray-500" /> <span className="text-blue-400">.claude/</span> <span className="text-gray-500 ml-4">← 스킬 설정 (자동 인식, 수정 불필요)</span></div>
          <div className="pl-4 flex items-center gap-2"><ChevronRight size={12} className="text-gray-500" /> <span className="text-green-400">README.md</span> <span className="text-gray-500 ml-4">← 사용 설명</span></div>
          <div className="pl-4 flex items-center gap-2"><ChevronRight size={12} className="text-gray-500" /> <span className="text-blue-400">input/</span> <span className="text-gray-500 ml-4">← 참고 자료 (제안서, 시안, RFP 등)</span></div>
          <div className="pl-4 flex items-center gap-2"><ChevronRight size={12} className="text-gray-500" /> <span className="text-blue-400">output/</span> <span className="text-gray-500 ml-4">← 산출물이 여기에 생성됩니다</span></div>
        </div>

        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FileText size={16} className="text-[#00007F]" />
          참고 자료 넣기
        </h4>
        <p className="text-gray-600 mb-3">
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">input/</code> 폴더에 아래와 같은 자료를 넣으면 산출물 품질이 향상됩니다:
        </p>
        <ul className="list-none space-y-2 mb-6">
          {['제안서, RFP', '디자인 시안 (이미지, PDF)', '현행 사이트 분석 자료', '벤치마킹 레퍼런스'].map((item) => (
            <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00007F]" />
              {item}
            </li>
          ))}
        </ul>

        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FileText size={16} className="text-[#00007F]" />
          PROJECT.md (자동 생성)
        </h4>
        <p className="text-gray-600 mb-3">
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">PROJECT.md</code>는 <strong>직접 작성할 필요 없습니다.</strong> 스킬을 처음 실행하면 프로젝트 유형·고객사·요구사항 등을 질문한 뒤 자동으로 생성됩니다.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">원하면 직접 작성해도 됩니다:</p>
          <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-300 space-y-1">
            <div className="text-white font-bold"># 프로젝트명</div>
            <div className="mt-2 text-white font-bold">## 개요</div>
            <div className="text-gray-400">- 고객사: OOO</div>
            <div className="text-gray-400">- 프로젝트 유형: 신규 구축 / 리뉴얼 / 운영</div>
            <div className="text-gray-400">- 오픈 예정일: YYYY-MM-DD</div>
            <div className="mt-2 text-white font-bold">## 주요 요구사항</div>
            <div className="text-gray-400">- (고객이 전달한 핵심 내용을 기술)</div>
          </div>
        </div>
      </Section>

      {/* 3단계 */}
      <Section
        icon={<Play size={20} />}
        title="3단계: 동작 테스트"
        step={3}
      >
        <p className="text-gray-600 mb-4">
          스킬 폴더에서 Claude Code를 실행한 뒤, 자연어로 요청합니다.
        </p>
        <div className="bg-gray-900 rounded-xl p-5 text-sm font-mono mb-4">
          <span className="text-gray-500">$ </span>
          <span className="text-[#FEFE01]">&quot;요구사항 정리해줘&quot;</span>
        </div>
        <p className="text-gray-600">
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">output/</code> 폴더에 산출물 파일이 생성되면 설치가 완료된 것입니다.
        </p>
      </Section>

      {/* MCP 서버 */}
      <Section
        icon={<Server size={20} />}
        title="MCP 서버"
      >
        <p className="text-gray-600">
          대부분의 스킬은 <strong>MCP 서버가 필요 없습니다.</strong>
        </p>
        <p className="text-gray-500 text-sm mt-2">
          일부 스킬(디자인 벤치마킹, QA 성능 테스트 등)은 MCP 서버(Playwright 등)가 필요할 수 있습니다.
          해당 스킬의 README.md에 설치 안내가 포함됩니다.
        </p>
      </Section>

      {/* 업데이트 */}
      <Section
        icon={<RefreshCw size={20} />}
        title="업데이트"
      >
        <p className="text-gray-600">
          새 버전을 배포받으면, 스킬 폴더의 <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">.claude/</code> 내용물을 덮어쓰기합니다.
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm ml-1">input/</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">output/</code> 등 작업 데이터는 영향 없습니다.
        </p>
      </Section>

      {/* 제거 */}
      <Section
        icon={<Trash2 size={20} />}
        title="제거"
      >
        <p className="text-gray-600">
          스킬 폴더를 삭제합니다. 산출물을 보관하려면 <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">output/</code> 폴더만 별도로 백업하세요.
        </p>
      </Section>

      {/* 문제 해결 */}
      <Section
        icon={<AlertTriangle size={20} />}
        title="문제 해결"
      >
        <div className="space-y-3">
          <TroubleshootCard
            symptom="자연어 요청에 반응 안 함"
            cause="Claude Code 재시작 필요"
            solution="Claude Code 완전 종료(Ctrl+C) 후 재시작"
          />
          <TroubleshootCard
            symptom="산출물이 생성되지 않음"
            cause="스킬 폴더 밖에서 실행"
            solution="스킬 폴더에서 Claude Code 실행"
          />
          <TroubleshootCard
            symptom="스킬이 동작 안 함"
            cause=".claude/ 경로 오류"
            solution=".claude/skills/ 하위에 스킬 폴더가 있는지 확인"
          />
        </div>
      </Section>
    </div>
  );
}

function Section({
  icon,
  title,
  step,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  step?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-[#00007F]/10 rounded-lg flex items-center justify-center text-[#00007F]">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {step !== undefined && (
            <span className="text-[#00007F] mr-1">Step {step}.</span>
          )}
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function RequirementCard({
  label,
  version,
  command,
}: {
  label: string;
  version: string;
  command: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="font-semibold text-gray-800 mb-1">{label}</div>
      <div className="text-sm text-[#00007F] font-medium mb-2">{version}</div>
      <div className="bg-gray-900 rounded-lg px-3 py-2 text-xs font-mono text-gray-400">
        <span className="text-gray-500">$ </span>{command}
      </div>
    </div>
  );
}

function TroubleshootCard({
  symptom,
  cause,
  solution,
}: {
  symptom: string;
  cause: string;
  solution: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
        <div className="flex-1">
          <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">증상</span>
          <p className="text-sm text-gray-800 mt-0.5">{symptom}</p>
        </div>
        <div className="flex-1">
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">원인</span>
          <p className="text-sm text-gray-600 mt-0.5">{cause}</p>
        </div>
        <div className="flex-1">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">해결</span>
          <p className="text-sm text-gray-800 mt-0.5">{solution}</p>
        </div>
      </div>
    </div>
  );
}
