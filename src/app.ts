import express from "express";
import cors from "cors";
import { CronService } from "./services/cron/cron.service";
import { logger } from "./middleware/log/logger";

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

app.get("/cron/status", (req, res) => {
  const cronService = CronService.getInstance();
  res.json({
    runningJobs: cronService.getRunningJobs(),
    timestamp: new Date().toISOString(),
  });
});

const cronService = CronService.getInstance();
cronService.startAll();

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, stopping cron jobs...');
  cronService.stopAll();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, stopping services...');
  cronService.stopAll();
  process.exit(0);
});

export default app;