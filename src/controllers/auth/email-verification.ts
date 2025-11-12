import { Request, Response } from "express";
import { VerifyEmailService } from "../../services/auth/email-verification";
import {
  errorResponse,
  successResponse,
} from "../../utils/response/response-handler";

export class EmailVerificationController {
  private verifyEmailService = new VerifyEmailService();

  public verifyEmailAndSetPassword = async (req: Request, res: Response) => {
    try {
      // Token comes from query params (from email link)
      const token = req.query.token as string;
      const { password } = req.body;

      if (!token) {
        return errorResponse(
          res,
          "Token is required in query params",
          400,
          "Validation error"
        );
      }

      if (!password) {
        return errorResponse(
          res,
          "Password is required in request body",
          400,
          "Validation error"
        );
      }

      const result = await this.verifyEmailService.verifyEmailAndSetPassword(
        token,
        password
      );

      return successResponse(
        res,
        "Email verified and password set successfully",
        result,
        200
      );
    } catch (err) {
      return errorResponse(
        res,
        "Failed to verify email and set password",
        400,
        (err as Error).message
      );
    }
  };
}
