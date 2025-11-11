import { RecordLoginAttemptDTO } from "../../dtos/auth/auth-dto";
import prisma from "../../utils/prisma/prisma";

export class LoginAttempt {
  public async recordLoginAttempt(data: RecordLoginAttemptDTO) {
    return prisma.loginAttempt.create({
      data: {
        userId: data.userId,
        success: data.success,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        lockedUntil: data.lockedUntil || null,
      },
    });
  }

  public async countFailedAttempts(userId: string, withinMinutes: number) {
    const since = new Date(Date.now() - withinMinutes * 60 * 1000);
    return prisma.loginAttempt.count({
      where: {
        userId,
        success: false,
        attemptedAt: { gte: since },
      },
    });
  }

  public async lockUserLogin(userId: string, untilDate: Date) {
    return prisma.loginAttempt.create({
      data: {
        userId,
        success: false,
        lockedUntil: untilDate,
      },
    });
  }

  public async clearLoginAttempts(userId: string) {
    return prisma.loginAttempt.deleteMany({
      where: { userId },
    });
  }

  public async getLastLoginAttempt(userId: string) {
    return prisma.loginAttempt.findFirst({
      where: { userId },
      orderBy: { attemptedAt: "desc" },
    });
  }
}
