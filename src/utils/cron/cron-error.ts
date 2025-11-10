export class CronJobError extends Error {
  constructor(
    public jobName: string,
    message: string,
    public cause?: Error
  ) {
    super(`[${jobName}] ${message}`);
    this.name = 'CronJobError';
  }
}