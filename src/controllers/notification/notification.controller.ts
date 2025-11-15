import { Request, Response } from "express";
import { NotificationChannel, NotificationType } from "../../generated/prisma";
import NotificationService from "../../services/notification/notification.service";
import { successResponse, errorResponse } from "../../utils/response/response-handler";

export class NotificationController {
  private service = new NotificationService();

  public registerToken = async (req: Request, res: Response) => {
    try {
      const userId = res.locals.user.id as string;
      const { token } = req.body as { token: string };
      if (!token) return errorResponse(res, "Token is required", 400);
      const result = await this.service.registerToken(userId, token);
      return successResponse(res, "Token registered", result, 201);
    } catch (err) {
      return errorResponse(res, "Failed to register token", 400, (err as Error).message);
    }
  };

  public getNotifications = async (req: Request, res: Response) => {
    try {
      const userId = res.locals.user.id as string;
      const page = parseInt((req.query.page as string) || "1", 10);
      const limit = parseInt((req.query.limit as string) || "20", 10);
      const result = await this.service.getNotifications(userId, page, limit);
      return successResponse(res, "Notifications fetched", result.items, 200, result.meta as any);
    } catch (err) {
      return errorResponse(res, "Failed to fetch notifications", 400, (err as Error).message);
    }
  };

  public markRead = async (req: Request, res: Response) => {
    try {
      const userId = res.locals.user.id as string;
      const { id } = req.params;
      const updated = await this.service.markRead(userId, id);
      if (!updated) return errorResponse(res, "Notification not found", 404);
      return successResponse(res, "Notification marked as read", { id: updated.id }, 200);
    } catch (err) {
      return errorResponse(res, "Failed to mark as read", 400, (err as Error).message);
    }
  };

  public delete = async (req: Request, res: Response) => {
    try {
      const userId = res.locals.user.id as string;
      const { id } = req.params;
      const ok = await this.service.delete(userId, id);
      if (!ok) return errorResponse(res, "Notification not found", 404);
      return successResponse(res, "Notification deleted", { id }, 200);
    } catch (err) {
      return errorResponse(res, "Failed to delete notification", 400, (err as Error).message);
    }
  };

  public getPreferences = async (req: Request, res: Response) => {
    try {
      const userId = res.locals.user.id as string;
      const prefs = await this.service.getPreferences(userId);
      return successResponse(res, "Preferences fetched", prefs, 200);
    } catch (err) {
      return errorResponse(res, "Failed to fetch preferences", 400, (err as Error).message);
    }
  };

  public setPreferences = async (req: Request, res: Response) => {
    try {
      const userId = res.locals.user.id as string;
      const prefs = req.body as Array<{ type: NotificationType; enabled: boolean; channel: NotificationChannel[]; scheduledTime?: string | null }>; 
      const normalized = prefs.map((p) => ({
        type: p.type,
        enabled: p.enabled,
        channel: p.channel,
        scheduledTime: p.scheduledTime ? new Date(p.scheduledTime) : null,
      }));
      const result = await this.service.setPreferences(userId, normalized);
      return successResponse(res, "Preferences updated", result as any, 200);
    } catch (err) {
      return errorResponse(res, "Failed to update preferences", 400, (err as Error).message);
    }
  };
}

export default NotificationController;