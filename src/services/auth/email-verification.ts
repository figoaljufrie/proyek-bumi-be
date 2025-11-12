import { AuthCrud } from "../../repositories/auth/crud";
import { EmailVerificationToken } from "../../repositories/auth/email-token";
import { hashPassword } from "../../utils/bcrypt/bcrypt-utils";

export class VerifyEmailService {
  private authCrud = new AuthCrud();
  private emailToken = new EmailVerificationToken();

  public async verifyEmailAndSetPassword(token: string, password: string) {
    // Find token record with user info
    const record = await this.emailToken.findToken(token);

    if (!record) throw new Error("Invalid token");
    if (record.expiresAt < new Date()) throw new Error("Token expired");

    const userId = record.userId;

    // Hash password and update user
    const hashedPassword = await hashPassword(password);
    await this.authCrud.emailVerificationSetPassword(userId, hashedPassword);

    // Delete used token
    await this.emailToken.deleteToken(userId);

    return {
      message: "Email verified and password set successfully",
      userId: userId,
      email: record.user.email,
    };
  }
}
