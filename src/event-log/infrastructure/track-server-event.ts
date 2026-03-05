import type { EventName, EventPropertiesMap } from '@/event-log/domain/types';
import { SupabaseEventLogRepository } from './supabase-event-log-repository';

const repo = new SupabaseEventLogRepository();

export function trackServerEvent<T extends EventName>(
  eventName: T,
  properties: EventPropertiesMap[T],
  userId?: string
): void {
  repo
    .insert({
      event_name: eventName,
      properties,
      user_id: userId,
    })
    .catch(() => {
      // fire-and-forget: 이벤트 로깅 실패가 비즈니스 로직에 영향을 주지 않도록 무시
    });
}
