import { Expo, ExpoPushMessage } from "expo-server-sdk";

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export async function sendPush(tokens: string[], title: string, body: string, data?: Record<string, unknown>) {
  const messages: ExpoPushMessage[] = tokens
    .filter((t) => Expo.isExpoPushToken(t))
    .map((to) => ({ to, sound: "default", title, body, data }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [] as any[];
  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }
  return { tickets };
}

export default { sendPush };