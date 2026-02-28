/**
 * Task 6.1: react-markdown, remark-gfm, @tailwindcss/typography 패키지 설치 검증
 *
 * 이 테스트는 마크다운 렌더링에 필요한 패키지가 올바르게 설치되었는지 확인한다.
 * - react-markdown: 마크다운 콘텐츠를 React 컴포넌트로 렌더링
 * - remark-gfm: GitHub Flavored Markdown 지원 (테이블, 체크리스트 등)
 * - @tailwindcss/typography: prose 클래스 기반 마크다운 스타일링
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Task 6.1: 마크다운 렌더링 의존성 패키지 설치 검증', () => {
  const projectRoot = path.resolve(__dirname, '../../../../');
  const packageJsonPath = path.join(projectRoot, 'package.json');

  let packageJson: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };

  beforeAll(() => {
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    packageJson = JSON.parse(content);
  });

  describe('react-markdown 패키지', () => {
    it('dependencies에 react-markdown이 등록되어 있어야 한다', () => {
      expect(packageJson.dependencies).toHaveProperty('react-markdown');
    });

    it('react-markdown 모듈이 resolve 가능해야 한다', () => {
      expect(() => require.resolve('react-markdown')).not.toThrow();
    });
  });

  describe('remark-gfm 패키지', () => {
    it('dependencies에 remark-gfm이 등록되어 있어야 한다', () => {
      expect(packageJson.dependencies).toHaveProperty('remark-gfm');
    });

    it('remark-gfm 모듈이 resolve 가능해야 한다', () => {
      expect(() => require.resolve('remark-gfm')).not.toThrow();
    });
  });

  describe('@tailwindcss/typography 패키지', () => {
    it('devDependencies에 @tailwindcss/typography가 등록되어 있어야 한다', () => {
      expect(packageJson.devDependencies).toHaveProperty(
        '@tailwindcss/typography'
      );
    });

    it('@tailwindcss/typography 모듈이 resolve 가능해야 한다', () => {
      expect(() =>
        require.resolve('@tailwindcss/typography')
      ).not.toThrow();
    });
  });

  describe('Tailwind CSS v4 typography 플러그인 설정', () => {
    it('globals.css에 @plugin "@tailwindcss/typography" 가 포함되어 있어야 한다', () => {
      const globalsCssPath = path.join(projectRoot, 'src/app/globals.css');
      const cssContent = fs.readFileSync(globalsCssPath, 'utf-8');
      expect(cssContent).toContain('@plugin "@tailwindcss/typography"');
    });
  });
});
