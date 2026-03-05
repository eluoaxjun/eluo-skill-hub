import { NextResponse } from 'next/server';
import { SupabaseEventLogRepository } from '@/event-log/infrastructure/supabase-event-log-repository';
import type { EventLogInsert } from '@/event-log/domain/types';

const repo = new SupabaseEventLogRepository();

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const events = body as EventLogInsert[];
    await repo.insertBatch(events);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to log events' }, { status: 500 });
  }
}
