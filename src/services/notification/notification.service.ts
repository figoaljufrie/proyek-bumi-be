import { NotificationChannel, NotificationType } from "../../generated/prisma";
import NotificationRepository from "../../repositories/notification/notification.repository";
import { getExpoTokens, saveExpoToken } from "../../thirdparty/redis/token-store";
import { enqueuePush } from "../../thirdparty/redis/bull.queue";

export class NotificationService {
  private repo = new NotificationRepository();

  async registerToken(userId: string, token: string) {
    await saveExpoToken(userId, token);
    return { token };
  }

  async getNotifications(userId: string, page = 1, limit = 20) {
    const { items, total } = await this.repo.getHistory(userId, page, limit);
    return { items, meta: { total, page, limit } };
  }

  async markRead(userId: string, id: string) {
    const updated = await this.repo.markRead(userId, id);
    return updated;
  }

  async delete(userId: string, id: string) {
    const ok = await this.repo.delete(userId, id);
    return ok;
  }

  async getPreferences(userId: string) {
    return this.repo.getPreferences(userId);
  }

  async setPreferences(
    userId: string,
    prefs: Array<{ type: NotificationType; enabled: boolean; channel: NotificationChannel[]; scheduledTime?: Date | null }>
  ) {
    const results = [] as unknown[];
    for (const p of prefs) {
      const r = await this.repo.upsertPreference(userId, p.type, p.enabled, p.channel, p.scheduledTime ?? null);
      results.push(r);
    }
    return results;
  }

  async dispatch(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ) {
    const pref = await this.repo.getPreference(userId, type);
    const channels = pref?.channel?.length ? pref.channel : [NotificationChannel.PUSH, NotificationChannel.IN_APP];

    const results: Record<string, unknown> = {};

    if (channels.includes(NotificationChannel.IN_APP)) {
      const record = await this.repo.recordHistory(userId, type, NotificationChannel.IN_APP, title, body, data);
      results[NotificationChannel.IN_APP] = { id: record.id };
    }

    if (channels.includes(NotificationChannel.PUSH)) {
      const tokens = await getExpoTokens(userId);
      if (tokens.length > 0) {
        const job = await enqueuePush({ tokens, title, body, data });
        await this.repo.recordHistory(userId, type, NotificationChannel.PUSH, title, body, data);
        results[NotificationChannel.PUSH] = { jobId: (job as any).id };
      } else {
        results[NotificationChannel.PUSH] = { skipped: true };
      }
    }

    return results;
  }
}

export default NotificationService;