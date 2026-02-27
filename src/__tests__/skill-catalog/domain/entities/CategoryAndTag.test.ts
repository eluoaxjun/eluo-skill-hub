import { Category } from '@/skill-catalog/domain/entities/Category';
import { Tag } from '@/skill-catalog/domain/entities/Tag';

describe('Category', () => {
  it('카테고리를 생성한다', () => {
    const category = Category.create({
      name: '기획',
      slug: 'planning',
      description: '기획 직군을 위한 스킬',
      displayOrder: 1,
    });
    expect(category.name).toBe('기획');
    expect(category.slug).toBe('planning');
    expect(category.displayOrder).toBe(1);
  });

  it('정보를 수정한다', () => {
    const category = Category.create({
      name: '기획',
      slug: 'planning',
      description: '설명',
      displayOrder: 1,
    });
    category.updateInfo({ name: '기획팀', displayOrder: 2 });
    expect(category.name).toBe('기획팀');
    expect(category.displayOrder).toBe(2);
  });
});

describe('Tag', () => {
  it('유효한 이름으로 태그를 생성한다', () => {
    const result = Tag.create({ name: 'typescript' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe('typescript');
    }
  });

  it('빈 이름이면 에러를 반환한다', () => {
    const result = Tag.create({ name: '' });
    expect(result.ok).toBe(false);
  });

  it('50자 초과 이름이면 에러를 반환한다', () => {
    const result = Tag.create({ name: 'a'.repeat(51) });
    expect(result.ok).toBe(false);
  });

  it('정확히 50자 이름이면 성공한다', () => {
    const result = Tag.create({ name: 'a'.repeat(50) });
    expect(result.ok).toBe(true);
  });
});
