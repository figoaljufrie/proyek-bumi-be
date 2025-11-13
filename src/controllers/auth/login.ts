import { Request, Response } from "express";
import { LoginService } from "../../services/auth/login";
import {
  errorResponse,
  successResponse,
} from "../../utils/response/response-handler";

export class LoginController {
  private loginService = new LoginService();

  public login = async (req: Request, res: Response) => {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";

      const result = await this.loginService.login(
        req.body,
        ipAddress,
        userAgent
      );

      const { email } = req.body;

      return successResponse(
        res,
        "Login successful",
        {
          input: { email },
          result: {
            userId: result.userId,
            email: result.email,
            role: result.role,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
        },
        200
      );
    } catch (err) {
      return errorResponse(res, "Failed to login user", 400, err);
    }
  };
}
