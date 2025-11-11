import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { $Enums } from "../../generated/prisma";
import { errorResponse } from "../../utils/response/response-handler";

export interface JwtUserPayload extends JwtPayload {
  id: string;
  email: string;
  role: $Enums.UserRole;
}

export class JwtMiddleware {
  public verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) return errorResponse(res, "JWT secret key not set", 500);

      const token = req.headers.authorization?.split(" ")[1];

      if (!token) return errorResponse(res, "No token provided", 401);

      let decoded: string | JwtPayload;
      try {
        decoded = verify(token, secret);
      } catch (error) {
        return errorResponse(res, "Token expired or invalid", 401, error);
      }
      res.locals.user = decoded as JwtUserPayload;
      next();
    } catch (error) {
      return errorResponse(res, "Failed to verify token", 401, error);
    }
  };
}
