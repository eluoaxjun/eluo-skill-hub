/**
 * SkillRegisterForm 클라이언트 컴포넌트 단위 테스트 (Task 7.3)
 *
 * 테스트 대상:
 * - 스킬 제목 텍스트 입력 필드
 * - 카테고리 드롭다운 (5개 옵션: 기획, 디자인, 퍼블리싱, 개발, QA)
 * - 마크다운 파일 업로드 (accept=".md")
 * - 폼 제출 시 server action 호출
 * - 성공/실패 메시지 표시
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// registerSkillAction 모킹
jest.mock('@/app/(admin)/admin/skills/actions', () => ({
  registerSkillAction: jest.fn(),
}));

import SkillRegisterForm from '@/app/(admin)/admin/skills/SkillRegisterForm';
import { registerSkillAction } from '@/app/(admin)/admin/skills/actions';

const mockRegisterSkillAction = registerSkillAction as jest.MockedFunction<typeof registerSkillAction>;

/**
 * 헬퍼 함수: 폼 필드를 채우고 제출한다.
 * JSDOM은 file input의 required 속성에 대한 native validation을 완전히 지원하지 않으므로
 * fireEvent.submit을 사용하여 native constraint validation을 우회한다.
 */
async function fillAndSubmitForm(overrides?: {
  title?: string;
  category?: string;
  file?: File;
}) {
  const title = overrides?.title ?? '테스트 스킬';
  const category = overrides?.category ?? '기획';
  const file =
    overrides?.file ??
    new File(['# Test'], 'test.md', { type: 'text/markdown' });

  await userEvent.type(screen.getByLabelText(/제목/), title);
  await userEvent.selectOptions(screen.getByLabelText(/카테고리/), category);
  await userEvent.upload(
    screen.getByLabelText(/마크다운 파일/) as HTMLInputElement,
    file
  );

  // fireEvent.submit으로 native form validation을 우회한다
  const form = screen.getByLabelText(/제목/).closest('form');
  fireEvent.submit(form!);
}

describe('SkillRegisterForm 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('폼 필드 렌더링', () => {
    it('스킬 제목 입력 필드를 표시해야 한다', () => {
      render(<SkillRegisterForm />);

      expect(screen.getByLabelText(/제목/)).toBeInTheDocument();
    });

    it('카테고리 선택 필드를 표시해야 한다', () => {
      render(<SkillRegisterForm />);

      expect(screen.getByLabelText(/카테고리/)).toBeInTheDocument();
    });

    it('카테고리 드롭다운에 5개 옵션이 있어야 한다', () => {
      render(<SkillRegisterForm />);

      const select = screen.getByLabelText(/카테고리/) as HTMLSelectElement;
      const options = select.querySelectorAll('option');
      const categoryOptions = Array.from(options).filter(
        (opt) => opt.value !== ''
      );
      expect(categoryOptions).toHaveLength(5);
    });

    it('5개 카테고리(기획, 디자인, 퍼블리싱, 개발, QA) 옵션이 있어야 한다', () => {
      render(<SkillRegisterForm />);

      const select = screen.getByLabelText(/카테고리/) as HTMLSelectElement;
      const optionTexts = Array.from(select.querySelectorAll('option'))
        .map((opt) => opt.textContent)
        .filter((text) => text !== '' && text !== '카테고리 선택');

      expect(optionTexts).toContain('기획');
      expect(optionTexts).toContain('디자인');
      expect(optionTexts).toContain('퍼블리싱');
      expect(optionTexts).toContain('개발');
      expect(optionTexts).toContain('QA');
    });

    it('마크다운 파일 업로드 필드를 표시해야 한다', () => {
      render(<SkillRegisterForm />);

      const fileInput = screen.getByLabelText(/마크다운 파일/);
      expect(fileInput).toBeInTheDocument();
    });

    it('파일 입력의 accept 속성이 .md여야 한다', () => {
      render(<SkillRegisterForm />);

      const fileInput = screen.getByLabelText(/마크다운 파일/);
      expect(fileInput).toHaveAttribute('accept', '.md');
    });

    it('등록 버튼을 표시해야 한다', () => {
      render(<SkillRegisterForm />);

      expect(screen.getByRole('button', { name: /등록/ })).toBeInTheDocument();
    });
  });

  describe('폼 제출', () => {
    it('모든 필드를 입력하고 제출하면 registerSkillAction을 호출해야 한다', async () => {
      mockRegisterSkillAction.mockResolvedValue({
        status: 'success',
        message: '스킬이 등록되었습니다.',
      });

      render(<SkillRegisterForm />);

      await fillAndSubmitForm({
        title: 'React 컴포넌트 생성기',
        category: '개발',
      });

      await waitFor(() => {
        expect(mockRegisterSkillAction).toHaveBeenCalledTimes(1);
      });

      // FormData가 전달되었는지 확인
      const calledFormData = mockRegisterSkillAction.mock.calls[0][0] as FormData;
      expect(calledFormData.get('title')).toBe('React 컴포넌트 생성기');
      expect(calledFormData.get('category')).toBe('개발');
      expect(calledFormData.get('file')).toBeInstanceOf(File);
    });

    it('등록 성공 시 성공 메시지를 표시해야 한다', async () => {
      mockRegisterSkillAction.mockResolvedValue({
        status: 'success',
        message: '스킬이 등록되었습니다.',
      });

      render(<SkillRegisterForm />);

      await fillAndSubmitForm();

      await waitFor(() => {
        expect(screen.getByText('스킬이 등록되었습니다.')).toBeInTheDocument();
      });
    });

    it('등록 실패 시 오류 메시지를 표시해야 한다', async () => {
      mockRegisterSkillAction.mockResolvedValue({
        status: 'error',
        message: '스킬 등록에 실패했습니다.',
      });

      render(<SkillRegisterForm />);

      await fillAndSubmitForm();

      await waitFor(() => {
        expect(
          screen.getByText('스킬 등록에 실패했습니다.')
        ).toBeInTheDocument();
      });
    });

    it('등록 성공 후 폼이 초기화되어야 한다', async () => {
      mockRegisterSkillAction.mockResolvedValue({
        status: 'success',
        message: '스킬이 등록되었습니다.',
      });

      render(<SkillRegisterForm />);

      const titleInput = screen.getByLabelText(/제목/) as HTMLInputElement;

      await fillAndSubmitForm();

      await waitFor(() => {
        expect(titleInput.value).toBe('');
      });
    });
  });

  describe('클라이언트 측 파일 검증', () => {
    it('마크다운 파일 입력이 accept=".md" 속성을 가져야 한다', () => {
      render(<SkillRegisterForm />);

      const fileInput = screen.getByLabelText(/마크다운 파일/);
      expect(fileInput).toHaveAttribute('accept', '.md');
    });
  });
});
