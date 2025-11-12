import { AuthCrud } from "../../repositories/auth/crud";
import { PasswordResetToken } from "../../repositories/auth/password-token";
import { hashPassword } from "../../utils/bcrypt/bcrypt-utils";

export class PasswordResetService {
  private authCrud = new AuthCrud();
  private passwordResetToken = new PasswordResetToken();

  public async resetPassword(token: string, newPassword: string) {
    const record = await this.passwordResetToken.findToken(token);
    if (!record) throw new Error("Invalid token");
    if (record.expiresAt < new Date()) throw new Error("Token expired");

    const hashedPassword = await hashPassword(newPassword);
    await this.authCrud.updatePassword(record.userId, hashedPassword);
    await this.passwordResetToken.deleteToken(record.userId);

    return { message: "Password reset successfully" };
  }
}
