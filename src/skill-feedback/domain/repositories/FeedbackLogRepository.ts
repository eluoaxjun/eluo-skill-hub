import type { FeedbackLog } from "../entities/FeedbackLog";

export interface FeedbackLogRepository {
  save(log: FeedbackLog): Promise<void>;
}
