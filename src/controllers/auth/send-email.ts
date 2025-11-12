import { Request, Response } from "express";
import { AuthCrud } from "../../repositories/auth/crud";
import { SendEmailService } from "../../services/auth/send-email";
import {
  errorResponse,
  successResponse,
} from "../../utils/response/response-handler";

export class SendEmailController {
  private sendEmailService = new SendEmailService();
  private authCrud = new AuthCrud();

  public resendVerificationEmail = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return errorResponse(res, "Email is required", 400, "Validation error");
      }

      const user = await this.authCrud.findByEmail(email);
      if (!user) {
        return errorResponse(
          res,
          "User not found",
          404,
          "User with this email does not exist"
        );
      }

      const result = await this.sendEmailService.sendVerificationEmail(
        user.id,
        user.email
      );

      return successResponse(
        res,
        result.message || "Verification email sent successfully",
        { token: result.token },
        200
      );
    } catch (err) {
      return errorResponse(
        res,
        "Failed to send verification email",
        400,
        (err as Error).message
      );
    }
  };

  public sendPasswordResetEmail = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return errorResponse(res, "Email is required", 400, "Validation error");
      }

      const user = await this.authCrud.findByEmail(email);
      if (!user) {
        return successResponse(
          res,
          "If an account exists with this email, a password reset link has been sent",
          {},
          200
        );
      }

      const result = await this.sendEmailService.sendPasswordResetEmail(
        user.id,
        user.email
      );

      return successResponse(
        res,
        result.message || "Password reset email sent successfully",
        { token: result.token },
        200
      );
    } catch (err) {
      return errorResponse(
        res,
        "Failed to send password reset email",
        400,
        (err as Error).message
      );
    }
  };
}
