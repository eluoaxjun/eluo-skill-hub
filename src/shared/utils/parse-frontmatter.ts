interface ParsedFrontmatter {
  metadata: Record<string, unknown> | null;
  content: string;
}

/**
 * 순수 regex 기반 frontmatter 파서.
 * gray-matter(+ js-yaml) 의존성 제거하여 클라이언트 번들 ~15KB 절감.
 * YAML의 단순 key: value 쌍만 파싱합니다 (중첩 구조 미지원).
 */
export function parseFrontmatter(rawContent: string): ParsedFrontmatter {
  if (!rawContent || !rawContent.trimStart().startsWith('---')) {
    return { metadata: null, content: rawContent };
  }

  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return { metadata: null, content: rawContent };
  }

  const [, yamlBlock, body] = match;

  try {
    const metadata: Record<string, unknown> = {};
    const lines = yamlBlock.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) continue;

      const key = trimmed.slice(0, colonIdx).trim();
      let value: unknown = trimmed.slice(colonIdx + 1).trim();

      // 따옴표 제거
      if (
        typeof value === 'string' &&
        ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'")))
      ) {
        value = value.slice(1, -1);
      }

      // 불리언/숫자 변환
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (value === 'null' || value === '') value = null;
      else if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) {
        value = Number(value);
      }

      if (key) metadata[key] = value;
    }

    if (Object.keys(metadata).length === 0) {
      return { metadata: null, content: body };
    }

    return { metadata, content: body };
  } catch {
    return { metadata: null, content: rawContent };
  }
}
