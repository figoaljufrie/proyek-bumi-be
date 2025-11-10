import * as cron from 'node-cron';
import { CronRepository } from '../../repositories/cron/cron.repository';
import { CronValidator } from '../../utils/cron/cron-validator';
import { CronJobError } from '../../utils/cron/cron-error';
import { logger } from '../../middleware/log/logger';
import { NotificationType, NotificationChannel } from '../../generated/prisma';

export class CronService {
  private static instance: CronService;
  private repository: CronRepository;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  private constructor() {
    this.repository = new CronRepository();
  }

  static getInstance(): CronService {
    if (!CronService.instance) {
      CronService.instance = new CronService();
    }
    return CronService.instance;
  }

  /**
   * Start all cron jobs
   */
  startAll(): void {
    logger.info('Starting cron service...');

    this.startStreakResetJob();
    this.startDailyReminderJob();

    logger.info('All cron jobs started successfully');
  }

  /**
   * Stop specific job by name
   */
  stopJob(jobName: string): void {
    const job = this.jobs.get(jobName);
    if (!job) {
      logger.warn(`Attempted to stop non-existent job: ${jobName}`);
      return;
    }

    job.stop();
    this.jobs.delete(jobName);
    logger.info(`Cron job stopped: ${jobName}`);
  }

  /**
   * Stop all running jobs
   */
  stopAll(): void {
    logger.info('Stopping all cron jobs...');
    this.jobs.forEach((job) => job.stop());
    this.jobs.clear();
    logger.info('All cron jobs stopped');
  }

  /**
   * Get list of running job names
   */
  getRunningJobs(): string[] {
    return Array.from(this.jobs.keys());
  }

  // ================= PRIVATE JOB METHODS =================

  /**
   * Job: Reset streaks for inactive users (runs at 00:00 UTC daily)
   */
  private startStreakResetJob(): void {
    const jobName = 'streak-reset';

    this.scheduleJob(jobName, '0 0 * * *', async () => {
      const inactiveUsers = await this.repository.findInactiveUsersForStreakReset();

      if (inactiveUsers.length === 0) {
        logger.debug(`${jobName}: No inactive users found`);
        return;
      }

      const userIds = inactiveUsers.map((u) => u.id);
      const count = await this.repository.bulkResetStreaks(userIds);

      logger.info(`${jobName}: Successfully reset ${count} user streaks`);
    });
  }

  /**
   * Job: Send daily reminders to users (runs at 20:00 UTC daily)
   */
  private startDailyReminderJob(): void {
    const jobName = 'daily-reminder';

    this.scheduleJob(jobName, '0 20 * * *', async () => {
      const users = await this.repository.findUsersForDailyReminder();
      const usersNeedReminder = users.filter((u) => u.actionLogs.length < u.dailyGoal);

      if (usersNeedReminder.length === 0) {
        logger.debug(`${jobName}: No users need reminder`);
        return;
      }

      const notifications = usersNeedReminder.map((user) => ({
        userId: user.id,
        type: NotificationType.DAILY_REMINDER,
        title: 'Ingatkan Aksi',
        body: `Progress harianmu: ${user.actionLogs.length}/${user.dailyGoal}. Yuk selesaikan goal hari ini!`,
        channel: NotificationChannel.PUSH,
      }));

      const count = await this.repository.bulkCreateNotificationHistory(notifications);

      logger.info(`${jobName}: Successfully created ${count} notification records`);
    });
  }
  
  /**
   * Centralized job scheduler with validation and error handling
   */
  private scheduleJob(
    jobName: string,
    schedule: string,
    callback: () => Promise<void>
  ): void {
    // Validate cron schedule format
    if (!CronValidator.validateSchedule(schedule)) {
      throw new CronJobError(jobName, `Invalid schedule: ${schedule}`);
    }

    // Wrap callback with error handling and logging
    const safeCallback = async () => {
      try {
        logger.info(`Running ${jobName}...`);
        await callback();
        logger.info(`${jobName} completed successfully`);
      } catch (error) {
        const cronError =
          error instanceof CronJobError
            ? error
            : new CronJobError(jobName, 'Job execution failed', error as Error);

        logger.error(cronError.message, {
          jobName,
          stack: cronError.stack,
          cause: cronError.cause?.message,
        });
      }
    };

    // Schedule and store job
    const job = cron.schedule(schedule, safeCallback);
    this.jobs.set(jobName, job);

    logger.info(`Job scheduled: ${jobName} (${schedule})`);
  }
}