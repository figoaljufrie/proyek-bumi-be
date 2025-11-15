import { Router } from "express";
import NotificationController from "../../controllers/notification/notification.controller";
import { JwtMiddleware } from "../../middleware/auth/jwt-middleware";

export class NotificationRouter {
  private router = Router();
  private controller = new NotificationController();
  private jwt = new JwtMiddleware();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/notifications/register-token",
      this.jwt.verifyToken,
      this.controller.registerToken
    );

    this.router.get(
      "/notifications",
      this.jwt.verifyToken,
      this.controller.getNotifications
    );

    this.router.patch(
      "/notifications/:id/read",
      this.jwt.verifyToken,
      this.controller.markRead
    );

    this.router.delete(
      "/notifications/:id",
      this.jwt.verifyToken,
      this.controller.delete
    );

    this.router.get(
      "/notifications/preferences",
      this.jwt.verifyToken,
      this.controller.getPreferences
    );

    this.router.put(
      "/notifications/preferences",
      this.jwt.verifyToken,
      this.controller.setPreferences
    );
  }

  public getRouter() {
    return this.router;
  }
}

export default NotificationRouter;