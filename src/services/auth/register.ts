import crypto from "crypto";
import { RegisterDTO } from "../../dtos/auth/auth-dto";
import { AuthCrud } from "../../repositories/auth/crud";
import { EmailVerificationToken } from "../../repositories/auth/email-token";
import { MailUtility } from "../../utils/mail/mail-utils";

export class RegisterService {
  private auth = new AuthCrud();
  private emailToken = new EmailVerificationToken();
  private mailer = new MailUtility();

  public async register(data: RegisterDTO) {
    const existingUser = await this.auth.findByEmail(data.email);
    if (existingUser) throw new Error("Email already registered");

    const user = await this.auth.register(data);

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await this.emailToken.createToken({
      userId: user.id,
      token,
      expiresAt,
    });

    await this.mailer.sendEmail(
      user.email,
      "Verify your email",
      "verify-email",
      { displayName: user.displayName, token }
    );

    return {
      userId: user.id,
      message: "Registration successful. Please verify your email.",
    };
  }
}
