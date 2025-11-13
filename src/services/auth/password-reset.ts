import { AuthCrud } from "../../repositories/auth/crud";
import { PasswordResetToken } from "../../repositories/auth/password-token";
import { hashPassword } from "../../utils/bcrypt/bcrypt-utils";
import { ApiError } from "../../utils/response/api-error"; // ✅ adjust path if needed

export class PasswordResetService {
  private authCrud = new AuthCrud();
  private passwordResetToken = new PasswordResetToken();

  public async resetPassword(token: string, newPassword: string) {
    
    if (!token || typeof token !== "string")
      throw new ApiError("Invalid or missing reset token", 400, {
        layer: "service",
      });
    if (!newPassword || newPassword.length < 6)
      throw new ApiError("Password must be at least 6 characters long", 400, {
        layer: "service",
      });

    const record = await this.passwordResetToken.findToken(token);
    if (!record)
      throw new ApiError("Invalid or expired reset token", 404, {
        layer: "service",
      });

    if (record.expiresAt < new Date())
      throw new ApiError("Reset token has expired", 410, {
        layer: "service",
      });

    try {
      const hashedPassword = await hashPassword(newPassword);
      await this.authCrud.updatePassword(record.userId, hashedPassword);
    } catch (error) {
      throw new ApiError("Failed to update password", 500, {
        layer: "service",
        cause: error,
      });
    }

    try {
      await this.passwordResetToken.deleteToken(record.userId);
    } catch (error) {
      throw new ApiError("Failed to delete used reset token", 500, {
        layer: "service",
        cause: error,
      });
    }

    return { message: "Password reset successfully" };
  }
}