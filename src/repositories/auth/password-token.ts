import { CreatePasswordResetTokenDTO } from "../../dtos/auth/auth-dto";
import prisma from "../../utils/prisma/prisma";

export class PasswordResetToken {
  public async createToken(data: CreatePasswordResetTokenDTO) {
    return prisma.passwordResetToken.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt
      },
    });
  }

  public async findToken(token: string) {
    return prisma.passwordResetToken.findFirst({
      where: { token },
      include: { user: true },
    });
  }

  public async findTokenByUser(userId: string) {
    return prisma.passwordResetToken.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
    });
  }

  public async deleteToken(userId: string) {
    return prisma.passwordResetToken.deleteMany({
      where: { userId },
    });
  }

  public async deleteExpiredTokens() {
    return prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
