import Queue from "bull";
import { sendPush } from "../expo/push-notification.service";

const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || "127.0.0.1"}:${process.env.REDIS_PORT || "6379"}`;

export const pushQueue = new Queue("push-notifications", redisUrl);

pushQueue.process(async (job) => {
  const { tokens, title, body, data } = job.data as {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, unknown>;
  };
  return await sendPush(tokens, title, body, data);
});

export async function enqueuePush(payload: {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  return pushQueue.add(payload, { attempts: 3, backoff: { type: "exponential", delay: 60000 } });
}