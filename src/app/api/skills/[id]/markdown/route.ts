import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const supabase = await createSupabaseServerClient();

    // 1. 스킬 조회하여 마크다운 파일 경로 획득
    const { data: skill, error: skillError } = await supabase
      .from("skills")
      .select("id, markdown_file_path")
      .eq("id", id)
      .single();

    if (skillError || !skill) {
      return NextResponse.json(
        { error: "스킬을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 2. Storage에서 마크다운 파일 다운로드
    const { data: fileData, error: storageError } = await supabase.storage
      .from("skill-markdowns")
      .download(skill.markdown_file_path);

    if (storageError || !fileData) {
      return NextResponse.json(
        { error: "마크다운 파일을 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    const content = await fileData.text();

    return NextResponse.json({ content });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
