import { AuthCrud } from "../../repositories/auth/crud";
import { EmailVerificationToken } from "../../repositories/auth/email-token";
import { hashPassword } from "../../utils/bcrypt/bcrypt-utils";

export class VerifyEmailService {
  private authCrud = new AuthCrud();
  private emailToken = new EmailVerificationToken();

  public async verifyEmailAndSetPassword(
    userId: string,
    token: string,
    password: string
  ) {
    const record = await this.emailToken.findToken(token);
    if (!record || record.userId !== userId) throw new Error("Invalid token");
    if (record.expiresAt < new Date()) throw new Error("Token expired");

    const hashedPassword = await hashPassword(password);
    await this.authCrud.emailVerificationSetPassword(userId, hashedPassword);
    await this.emailToken.deleteToken(userId);

    return { message: "Email verified and password set successfully" };
  }
}
