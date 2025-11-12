import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { RefreshToken } from "../../repositories/auth/refresh-token";

export class RefreshAccessTokenService {
  private refreshTokenRepo = new RefreshToken();
  private JWT_SECRET = process.env.JWT_SECRET!;
  private JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";

  public async refreshAccessToken(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepo.findToken(refreshToken);
    if (!tokenRecord) throw new Error("Invalid refresh token");
    if (tokenRecord.expiresAt < new Date())
      throw new Error("Refresh token expired");

    const user = tokenRecord.user;
    if (!user || user.deletedAt || user.deactivatedAt)
      throw new Error("User not active");

    const secret: Secret = this.JWT_SECRET;
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: this.JWT_EXPIRES_IN } as SignOptions
    );

    return { accessToken };
  }

  public async revokeRefreshToken(refreshToken: string) {
    await this.refreshTokenRepo.revokeToken(refreshToken);
    return { message: "Refresh token revoked successfully" };
  }
}
