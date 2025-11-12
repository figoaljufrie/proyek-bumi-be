import { RegisterDTO } from "../../dtos/auth/auth-dto";
import prisma from "../../utils/prisma/prisma";

export class AuthCrud {
  /**
   * Register a new user
   */
  public async register(data: RegisterDTO) {
    const auth = await prisma.user.create({
      data: {
        email: data.email,
        displayName: data.displayName || null,
      },
    });
    return auth;
  }

  /**
   * Set password and verify email (after email verification token)
   */
  public async emailVerificationSetPassword(
    userId: string,
    hashedPassword: string
  ) {
    const authRegister = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        emailVerified: true,
      },
    });
    return authRegister;
  }

  /**
   * Find user by email
   */
  public async findByEmail(email: string) {
    const auth = await prisma.user.findFirst({
      where: { email, deletedAt: null, deactivatedAt: null },
    });
    return auth || null;
  }

  /**
   * Find user by ID
   */
  public async findById(userId: string) {
    const auth = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null, deactivatedAt: null },
    });
    return auth || null;
  }

  /**
   * Find user by auth provider and email (for social OAuth)
   */
  public async findByProviderId(email: string, authProvider: "GOOGLE" | "APPLE" | "EMAIL") {
    const auth = await prisma.user.findFirst({
      where: { email, authProvider, deletedAt: null, deactivatedAt: null },
    });
    return auth || null;
  }

  /**
   * Soft delete a user (prevent login)
   */
  public async softDelete(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Deactivate a user (prevent login)
   */
  public async deactivate(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { deactivatedAt: new Date() },
    });
  }

  /**
   * Reactivate a user
   */
  public async reactivate(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { deactivatedAt: null, deletedAt: null },
    });
  }

  /**
   * Update user password (used in password reset or initial setup)
   */
  public async updatePassword(userId: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  /**
   * Mark email as verified
   */
  public async verifyEmail(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  /**
   * Update last active timestamp (called on login success)
   */
  public async updateLastActive(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });
  }
}