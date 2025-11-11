import prisma from "../../utils/prisma/prisma";
import { NotificationType, NotificationChannel } from '../../generated/prisma';

export class CronRepository {
  /**
   * Get inactive users for streak reset (>24 hours no activity)
   * @returns Array of users with id and currentStreak
   */
  async findInactiveUsersForStreakReset(): Promise<{ id: string; currentStreak: number }[]> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return await prisma.user.findMany({
      where: {
        lastActiveAt: { lt: yesterday },
        currentStreak: { gt: 0 },
      },
      select: { id: true, currentStreak: true },
    });
  }

  /**
   * Bulk update user streaks to 0
   * @param userIds - Array of user IDs to update
   * @returns Count of updated records
   */
  async bulkResetStreaks(userIds: string[]): Promise<number> {
    const result = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { currentStreak: 0 },
    });

    return result.count;
  }

  /**
   * Get users who need daily reminder (not reached daily goal)
   * @returns Users with their today's progress
   */
  async findUsersForDailyReminder(): Promise<
    Array<{
      id: string;
      email: string;
      dailyGoal: number;
      actionLogs: Array<{ id: string }>;
      notificationPreferences: Array<{ id: string }>;
    }>
  > {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.user.findMany({
      where: {
        deactivatedAt: null,
        notificationPreferences: {
          some: { type: 'DAILY_REMINDER', enabled: true },
        },
      },
      select: {
        id: true,
        email: true,
        dailyGoal: true,
        actionLogs: {
          where: { loggedAt: { gte: today } },
          select: { id: true },
        },
        notificationPreferences: {
          where: { type: 'DAILY_REMINDER', enabled: true },
          select: { id: true },
        },
      },
    });
  }

  /**
   * Bulk create notification history records
   * @param data - Array of notification data
   * @returns Count of created records
   */
  async bulkCreateNotificationHistory(
    data: Array<{
      userId: string;
      type: NotificationType;
      title: string;
      body: string;
      channel: NotificationChannel;
    }>
  ): Promise<number> {
    const result = await prisma.notificationHistory.createMany({
      data,
    });

    return result.count;
  }
}