import { CreateRefreshTokenDTO } from "../../dtos/auth/auth-dto";
import prisma from "../../utils/prisma/prisma";

export class RefreshToken {
  public async createToken(data: CreateRefreshTokenDTO) {
    return prisma.refreshToken.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
  }

  public async findToken(token: string) {
    return prisma.refreshToken.findFirst({
      where: { token },
      include: { user: true },
    });
  }

  public async revokeToken(token: string) {
    return prisma.refreshToken.updateMany({
      where: { token },
      data: { revokedAt: new Date() },
    });
  }

  public async deleteAllForUser(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  public async deleteExpiredTokens() {
    return prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}
