export default function SkillsLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-muted-foreground text-sm">
          스킬 목록을 불러오는 중...
        </p>
      </div>
    </div>
  );
}
