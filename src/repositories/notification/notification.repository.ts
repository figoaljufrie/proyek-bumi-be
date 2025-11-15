import prisma from "../../utils/prisma/prisma";
import { NotificationChannel, NotificationType } from "../../generated/prisma";

export class NotificationRepository {
  async getHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.notificationHistory.findMany({
        where: { userId },
        orderBy: { deliveredAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notificationHistory.count({ where: { userId } }),
    ]);
    return { items, total };
  }

  async markRead(userId: string, id: string) {
    const found = await prisma.notificationHistory.findFirst({
      where: { id, userId },
    });
    if (!found) return null;
    return prisma.notificationHistory.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async delete(userId: string, id: string) {
    const found = await prisma.notificationHistory.findFirst({
      where: { id, userId },
    });
    if (!found) return null;
    await prisma.notificationHistory.delete({ where: { id } });
    return true;
  }

  async upsertPreference(
    userId: string,
    type: NotificationType,
    enabled: boolean,
    channel: NotificationChannel[],
    scheduledTime?: Date | null
  ) {
    return prisma.notificationPreference.upsert({
      where: { userId_type: { userId, type } },
      update: { enabled, channel, scheduledTime: scheduledTime ?? null },
      create: { userId, type, enabled, channel, scheduledTime: scheduledTime ?? null },
    });
  }

  async getPreferences(userId: string) {
    return prisma.notificationPreference.findMany({ where: { userId } });
  }

  async getPreference(userId: string, type: NotificationType) {
    return prisma.notificationPreference.findUnique({
      where: { userId_type: { userId, type } },
    });
  }

  async recordHistory(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ) {
    return prisma.notificationHistory.create({
      data: { userId, type, channel, title, body, data: data ? (data as any) : undefined },
    });
  }
}

export default NotificationRepository;