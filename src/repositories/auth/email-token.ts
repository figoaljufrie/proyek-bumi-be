import { CreateEmailVerificationTokenDTO } from "../../dtos/auth/auth-dto";
import prisma from "../../utils/prisma/prisma";

export class EmailVerificationToken {
  public async createToken(data: CreateEmailVerificationTokenDTO) {
    return prisma.emailVerificationToken.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
  }

  public async findToken(token: string) {
    return prisma.emailVerificationToken.findFirst({
      where: { token },
      include: { user: true },
    });
  }

  public async findTokenByUser(userId: string) {
    return prisma.emailVerificationToken.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() }, 
      },
    });
  }

  public async deleteToken(userId: string) {
    return prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });
  }

  public async deleteExpiredTokens() {
    return prisma.emailVerificationToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
