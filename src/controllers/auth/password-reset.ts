import { Request, Response } from "express";
import { PasswordResetService } from "../../services/auth/password-reset";
import {
  errorResponse,
  successResponse,
} from "../../utils/response/response-handler";

export class PasswordResetController {
  private passwordResetService = new PasswordResetService();

  public resetPassword = async (req: Request, res: Response) => {
    try {
      const token = (req.query.token as string) || req.body.token;
      const { newPassword } = req.body;

      if (!token || !newPassword) {
        return errorResponse(
          res,
          "Missing required fields: token, newPassword",
          400,
          "Validation error"
        );
      }

      const result = await this.passwordResetService.resetPassword(
        token,
        newPassword
      );

      return successResponse(
        res,
        "Password reset successfully",
        {
          input: { token, newPassword },
          result,
        },
        200
      );
    } catch (err) {
      return errorResponse(res, "Failed to reset password", 400, err);
    }
  };
}
