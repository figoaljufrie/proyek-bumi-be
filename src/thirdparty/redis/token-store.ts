import { pushQueue } from "./bull.queue";

const key = (userId: string) => `expo:tokens:${userId}`;

export async function saveExpoToken(userId: string, token: string) {
  const client: any = (pushQueue as any).client;
  await client.sadd(key(userId), token);
}

export async function getExpoTokens(userId: string): Promise<string[]> {
  const client: any = (pushQueue as any).client;
  const tokens = await client.smembers(key(userId));
  return tokens || [];
}

export async function removeExpoToken(userId: string, token: string) {
  const client: any = (pushQueue as any).client;
  await client.srem(key(userId), token);
}

export default { saveExpoToken, getExpoTokens, removeExpoToken };