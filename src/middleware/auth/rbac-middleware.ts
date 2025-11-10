import { NextFunction, Request, Response } from "express";
import { $Enums } from "../../generated/prisma";
import { errorResponse } from "../../utils/response-handler";
import { JwtUserPayload } from "./jwt-middleware";

export class RBACMiddleware {
  public checkRole(requiredRoles: $Enums.UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = res.locals.user as JwtUserPayload;
        if (!user) return errorResponse(res, "Unauthorized user", 401);

        if (!user.role || !requiredRoles.includes(user.role)) {
          return errorResponse(res, "Forbidden: insufficient permissions", 403);
        }
        next();
      } catch (error) {
        return errorResponse(res, "Failed to check roles", 500, error);
      }
    };
  }

  public requiredLogin = (req: Request, res: Response, next: NextFunction) => {
    const authUser = res.locals.user;
    if (!authUser) {
      return errorResponse(res, "You must login first", 401);
    }
    next();
  };
}
