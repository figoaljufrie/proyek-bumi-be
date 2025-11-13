import { AuthCrud } from "../../repositories/auth/crud";
import { EmailVerificationToken } from "../../repositories/auth/email-token";
import { hashPassword } from "../../utils/bcrypt/bcrypt-utils";
import { ApiError } from "../../utils/response/api-error"; // ✅ Adjust path if needed

export class VerifyEmailService {
  private authCrud = new AuthCrud();
  private emailToken = new EmailVerificationToken();

  public async verifyEmailAndSetPassword(token: string, password: string) {
    
    if (!token || typeof token !== "string")
      throw new ApiError("Invalid or missing verification token", 400, {
        layer: "service",
      });
    if (!password || password.length < 6)
      throw new ApiError("Password must be at least 6 characters long", 400, {
        layer: "service",
      });

    const record = await this.emailToken.findToken(token);
    if (!record)
      throw new ApiError("Invalid or expired verification token", 404, {
        layer: "service",
      });

    if (record.expiresAt < new Date())
      throw new ApiError("Verification token has expired", 410, {
        layer: "service",
      });

    const userId = record.userId;

    try {
      const hashedPassword = await hashPassword(password);
      await this.authCrud.emailVerificationSetPassword(userId, hashedPassword);
    } catch (error) {
      throw new ApiError("Failed to set password", 500, {
        layer: "service",
        cause: error,
      });
    }

    try {
      await this.emailToken.deleteToken(userId);
    } catch (error) {
      throw new ApiError("Failed to delete used verification token", 500, {
        layer: "service",
        cause: error,
      });
    }

    return {
      message: "Email verified and password set successfully",
      userId: userId,
      email: record.user.email,
    };
  }
}
