export class CronValidator {
  private static readonly CRON_REGEX =
    /^(\*|\d{1,2}|\*\/\d{1,2}|\d{1,2}-\d{1,2}) (\*|\d{1,2}|\*\/\d{1,2}|\d{1,2}-\d{1,2}) (\*|\d{1,2}|\*\/\d{1,2}|\d{1,2}-\d{1,2}) (\*|\d{1,2}|\*\/\d{1,2}|\d{1,2}-\d{1,2}) (\*|\d{1,2}|\*\/\d{1,2}|\d{1,2}-\d{1,2})$/;

  /**
   * Validate cron schedule expression
   * @param schedule - Cron expression string
   * @returns true if valid
   */
  static validateSchedule(schedule: string): boolean {
    return this.CRON_REGEX.test(schedule);
  }

  /**
   * Validate timezone string
   * @param timezone - Timezone string (e.g., Asia/Jakarta)
   * @returns true if valid
   */
  static validateTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }
}