import crypto from "crypto";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { LoginDTO } from "../../dtos/auth/auth-dto";
import { AuthCrud } from "../../repositories/auth/crud";
import { LoginAttempt } from "../../repositories/auth/login-attempt";
import { RefreshToken } from "../../repositories/auth/refresh-token";
import { comparePassword } from "../../utils/bcrypt/bcrypt-utils";
import { ApiError } from "../../utils/response/api-error";

export class LoginService {
  private authCrud = new AuthCrud();
  private loginAttempt = new LoginAttempt();
  private refreshToken = new RefreshToken();

  private JWT_SECRET = process.env.JWT_SECRET!;
  private JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";
  private REFRESH_TOKEN_EXPIRES_IN_HOURS = 24 * 7; // 7 days

  public async login(data: LoginDTO, ipAddress: string, userAgent: string) {
    
    const user = await this.authCrud.findByEmail(data.email);
    if (!user)
      throw new ApiError("Invalid email or password", 401, {
        layer: "service",
      });
    if (user.deletedAt || user.deactivatedAt)
      throw new ApiError("User not active", 403, { layer: "service" });
    if (!user.emailVerified)
      throw new ApiError("Email not verified", 403, { layer: "service" });

    const failedAttempts = await this.loginAttempt.countFailedAttempts(
      user.id,
      15
    ); 
    if (failedAttempts >= 5) {
      const lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // lock 15 mins
      await this.loginAttempt.lockUserLogin(user.id, lockedUntil);
      throw new ApiError("Too many failed attempts. Try again later", 429, {
        layer: "service",
      });
    }

    const passwordMatch = await comparePassword(data.password, user.password!);
    await this.loginAttempt.recordLoginAttempt({
      userId: user.id,
      success: passwordMatch,
      ipAddress,
      userAgent,
    });
    if (!passwordMatch)
      throw new ApiError("Invalid email or password", 401, {
        layer: "service",
      });

    await this.authCrud.updateLastActive(user.id);
    await this.loginAttempt.clearLoginAttempts(user.id);

    const secret: Secret = this.JWT_SECRET; // explicitly typed for TS
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: this.JWT_EXPIRES_IN } as SignOptions
    );

    const refreshTokenValue = crypto.randomUUID();
    const refreshTokenExpiresAt = new Date(
      Date.now() + this.REFRESH_TOKEN_EXPIRES_IN_HOURS * 60 * 60 * 1000
    );
    await this.refreshToken.createToken({
      userId: user.id,
      token: refreshTokenValue,
      expiresAt: refreshTokenExpiresAt,
    });

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }
}
