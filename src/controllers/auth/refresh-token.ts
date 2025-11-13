import { Request, Response } from "express";
import { RefreshAccessTokenService } from "../../services/auth/refresh-token";
import {
  errorResponse,
  successResponse,
} from "../../utils/response/response-handler";

export class RefreshTokenController {
  private refreshService = new RefreshAccessTokenService();

  public refreshAccessToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const result = await this.refreshService.refreshAccessToken(refreshToken);

      return successResponse(
        res,
        "Access token refreshed successfully",
        {
          input: { refreshToken },
          result,
        },
        200
      );
    } catch (err) {
      return errorResponse(
        res,
        "Failed to refresh access token",
        400,
        (err as Error).message
      );
    }
  };

  public revokeRefreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const result = await this.refreshService.revokeRefreshToken(refreshToken);

      return successResponse(
        res,
        "Refresh token revoked successfully",
        {
          input: { refreshToken },
          result,
        },
        200
      );
    } catch (err) {
      return errorResponse(
        res,
        "Failed to revoke refresh token",
        400,
        (err as Error).message
      );
    }
  };
}
