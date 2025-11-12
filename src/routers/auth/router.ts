import { Router } from "express";
import { EmailVerificationController } from "../../controllers/auth/email-verification";
import { LoginController } from "../../controllers/auth/login";
import { PasswordResetController } from "../../controllers/auth/password-reset";
import { RefreshTokenController } from "../../controllers/auth/refresh-token";
import { RegisterController } from "../../controllers/auth/register";
import { SendEmailController } from "../../controllers/auth/send-email";

export class AuthRouter {
  private router = Router();

  private registerController = new RegisterController();
  private loginController = new LoginController();
  private emailVerificationController = new EmailVerificationController();
  private sendEmailController = new SendEmailController();
  private refreshTokenController = new RefreshTokenController();
  private passwordResetController = new PasswordResetController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Register a new user
    this.router.post("/auth/register", this.registerController.register);

    // Login user
    this.router.post("/auth/login", this.loginController.login);

    // Verify email and set password (token can be in query or body)
    this.router.post(
      "/auth/verification",
      this.emailVerificationController.verifyEmailAndSetPassword
    );

    // Resend verification email
    this.router.post(
      "/auth/resend-verification",
      this.sendEmailController.resendVerificationEmail
    );

    // Send password reset email
    this.router.post(
      "/auth/forgot-password",
      this.sendEmailController.sendPasswordResetEmail
    );

    // Reset password with token
    this.router.post(
      "/auth/reset-password",
      this.passwordResetController.resetPassword
    );

    // Refresh access token
    this.router.post(
      "/auth/refresh",
      this.refreshTokenController.refreshAccessToken
    );

    // Revoke refresh token (logout)
    this.router.post(
      "/auth/logout",
      this.refreshTokenController.revokeRefreshToken
    );
  }

  public getRouter() {
    return this.router;
  }
}
