import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { RefreshToken } from "../../repositories/auth/refresh-token";
import { ApiError } from "../../utils/response/api-error";

export class RefreshAccessTokenService {
  private refreshTokenRepo = new RefreshToken();
  private JWT_SECRET = process.env.JWT_SECRET!;
  private JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";

  public async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError("Refresh token is required", 400, {
        layer: "service",
        method: "refreshAccessToken",
      });
    }
    const tokenRecord = await this.refreshTokenRepo.findToken(refreshToken);
    if (!tokenRecord) {
      throw new ApiError("Invalid refresh token", 401, {
        layer: "service",
        method: "refreshAccessToken",
      });
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new ApiError("Refresh token expired", 401, {
        layer: "service",
        method: "refreshAccessToken",
      });
    }

    const user = tokenRecord.user;
    if (!user) {
      throw new ApiError("User not found", 404, {
        layer: "service",
        method: "refreshAccessToken",
      });
    }

    if (user.deletedAt) {
      throw new ApiError("User account has been deleted", 403, {
        layer: "service",
        method: "refreshAccessToken",
        userId: user.id,
      });
    }

    if (user.deactivatedAt) {
      throw new ApiError("User account is deactivated", 403, {
        layer: "service",
        method: "refreshAccessToken",
        userId: user.id,
      });
    }

    const secret: Secret = this.JWT_SECRET;
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: this.JWT_EXPIRES_IN } as SignOptions
    );

    return { accessToken };
  }

  public async revokeRefreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError("Refresh token is required", 400, {
        layer: "service",
        method: "revokeRefreshToken",
      });
    }

    const tokenRecord = await this.refreshTokenRepo.findToken(refreshToken);
    if (!tokenRecord) {
      throw new ApiError("Refresh token not found", 404, {
        layer: "service",
        method: "revokeRefreshToken",
      });
    }

    await this.refreshTokenRepo.revokeToken(refreshToken);

    return { message: "Refresh token revoked successfully" };
  }
}
