import { createClient } from '@/shared/infrastructure/supabase/server';
import type { EventLogInsert, EventLogRepository } from '@/event-log/domain/types';

export class SupabaseEventLogRepository implements EventLogRepository {
  async insert(event: EventLogInsert): Promise<void> {
    const supabase = await createClient();
    await supabase.from('event_logs').insert(event);
  }

  async insertBatch(events: EventLogInsert[]): Promise<void> {
    if (events.length === 0) return;
    const supabase = await createClient();
    await supabase.from('event_logs').insert(events);
  }
}
