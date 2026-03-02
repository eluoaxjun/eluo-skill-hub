import React from 'react';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '../MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('h1 제목이 렌더링된다', () => {
    render(<MarkdownRenderer content="# 제목 1" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('제목 1');
  });

  it('h2 제목이 렌더링된다', () => {
    render(<MarkdownRenderer content="## 제목 2" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('제목 2');
  });

  it('h3 제목이 렌더링된다', () => {
    render(<MarkdownRenderer content="### 제목 3" />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('제목 3');
  });

  it('코드 블록이 pre/code 태그로 렌더링된다', () => {
    render(<MarkdownRenderer content={'```\nconst x = 1;\n```'} />);
    expect(document.querySelector('pre')).toBeTruthy();
    expect(document.querySelector('code')).toBeTruthy();
  });

  it('순서 없는 목록(ul/li)이 렌더링된다', () => {
    const { container } = render(<MarkdownRenderer content={'- 항목 1\n- 항목 2\n'} />);
    expect(container.querySelector('ul')).toBeTruthy();
    expect(container.querySelectorAll('li').length).toBeGreaterThanOrEqual(1);
  });

  it('순서 있는 목록(ol/li)이 렌더링된다', () => {
    const { container } = render(<MarkdownRenderer content={'1. 항목 1\n2. 항목 2\n'} />);
    expect(container.querySelector('ol')).toBeTruthy();
    expect(container.querySelectorAll('li').length).toBeGreaterThanOrEqual(1);
  });

  it('표(table/th/td)가 렌더링된다', () => {
    const tableMarkdown = `| 제목 | 내용 |\n| --- | --- |\n| 행1 | 데이터1 |`;
    render(<MarkdownRenderer content={tableMarkdown} />);
    expect(document.querySelector('table')).toBeTruthy();
    expect(document.querySelector('th')).toBeTruthy();
    expect(document.querySelector('td')).toBeTruthy();
  });

  it('인라인 코드가 code 태그로 렌더링된다', () => {
    render(<MarkdownRenderer content="인라인 `코드` 입니다" />);
    const codeEl = document.querySelector('code');
    expect(codeEl).toBeTruthy();
    expect(codeEl?.textContent).toBe('코드');
  });

  it('bold 텍스트가 렌더링된다', () => {
    render(<MarkdownRenderer content="**굵은글씨**" />);
    expect(document.querySelector('strong')).toBeTruthy();
  });

  it('italic 텍스트가 렌더링된다', () => {
    render(<MarkdownRenderer content="*기울임글씨*" />);
    expect(document.querySelector('em')).toBeTruthy();
  });

  it('구분선(hr)이 렌더링된다', () => {
    render(<MarkdownRenderer content="---" />);
    expect(document.querySelector('hr')).toBeTruthy();
  });
});
