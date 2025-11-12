import crypto from "crypto";
import { EmailVerificationToken } from "../../repositories/auth/email-token";
import { PasswordResetToken } from "../../repositories/auth/password-token";
import { MailUtility } from "../../utils/mail/mail-utils";

export class SendEmailService {
  private emailToken = new EmailVerificationToken();
  private passwordResetToken = new PasswordResetToken();
  private mailUtility = new MailUtility();

  private async createOrReuseEmailToken(userId: string, expiresInHours = 24) {
    const existing = await this.emailToken.findTokenByUser(userId);
    if (existing) {
      const diff = Date.now() - existing.createdAt.getTime();
      if (diff < 60 * 60 * 1000) {
        return {
          token: existing.token,
          isNew: false,
          message: "Email already sent. Please check your inbox.",
        };
      }
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    await this.emailToken.createToken({ userId, token, expiresAt });
    return { token, isNew: true };
  }

  private async createOrReusePasswordResetToken(
    userId: string,
    expiresInHours = 24
  ) {
    const existing = await this.passwordResetToken.findTokenByUser(userId);
    if (existing) {
      const diff = Date.now() - existing.createdAt.getTime();
      if (diff < 60 * 60 * 1000) {
        return {
          token: existing.token,
          isNew: false,
          message: "Email already sent. Please check your inbox.",
        };
      }
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    await this.passwordResetToken.createToken({ userId, token, expiresAt });
    return { token, isNew: true };
  }

  public async sendVerificationEmail(userId: string, email: string) {
    const { token, isNew, message } = await this.createOrReuseEmailToken(
      userId
    );

    if (isNew) {
      const verifyLink = `${process.env.API_URL}/auth/verification?token=${token}`;
      await this.mailUtility.sendEmail(
        email,
        "Verify your email",
        "email-verification",
        { token, verifyLink }
      );
    }

    return { token, message };
  }

  public async sendPasswordResetEmail(userId: string, email: string) {
    const { token, isNew, message } =
      await this.createOrReusePasswordResetToken(userId);

    if (isNew) {
      const resetLink = `${process.env.API_URL}/auth/reset-password?token=${token}`;
      await this.mailUtility.sendEmail(
        email,
        "Reset your password",
        "reset-password",
        { token, resetLink }
      );
    }

    return { token, message };
  }
}
