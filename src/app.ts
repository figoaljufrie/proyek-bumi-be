import cors from "cors";
import express from "express";
import { logger } from "./middleware/log/logger";
import { AuthRouter } from "./routers/auth/router";
import { NotificationRouter } from "./routers/notification/router";
import { CronService } from "./services/cron/cron.service";
import prisma from "./utils/prisma/prisma";
import { successResponse, errorResponse } from "./utils/response/response-handler";
import { pushQueue } from "./thirdparty/redis/bull.queue";

export const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_, res) => {
  res.send("Bumi API is running");
});

app.get("/health", async (_, res) => {
  try {
    await prisma.$connect();
    const db = true;
    let redis = true;
    try {
      await pushQueue.getJobCounts();
    } catch {
      redis = false;
    }
    const cronService = CronService.getInstance();
    const cloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    return successResponse(res, "OK", {
      status: "healthy",
      services: {
        db,
        redis,
        cloudinary,
        cronJobs: cronService.getRunningJobs(),
      },
    });
  } catch (err) {
    return errorResponse(res, "Health check failed", 503, err);
  }
});

app.get("/cron/status", (req, res) => {
  const cronService = CronService.getInstance();
  res.json({
    runningJobs: cronService.getRunningJobs(),
    timestamp: new Date().toISOString(),
  });
});

const authRouter = new AuthRouter();
app.use("/", authRouter.getRouter());

const notificationRouter = new NotificationRouter();
app.use("/", notificationRouter.getRouter());

const cronService = CronService.getInstance();
cronService.startAll();

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, stopping cron jobs...");
  cronService.stopAll();
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, stopping services...");
  cronService.stopAll();
  process.exit(0);
});

export default app;
