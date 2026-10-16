import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { PushProvider } from './push.provider';

@Injectable()
export class ExpoPushProvider implements PushProvider {
  private readonly logger = new Logger(ExpoPushProvider.name);
  private readonly expo: Expo;

  constructor() {
    const accessToken = process.env.EXPO_ACCESS_TOKEN;
    this.expo = new Expo(accessToken ? { accessToken } : undefined);
  }

  async send(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!tokens || tokens.length === 0) {
      return;
    }

    const validTokens: string[] = [];
    for (const token of tokens) {
      if (!Expo.isExpoPushToken(token)) {
        this.logger.warn(`Push token "${token}" is not a valid Expo push token`);
      } else {
        validTokens.push(token);
      }
    }

    if (validTokens.length === 0) {
      this.logger.warn('No valid push tokens provided for notification');
      return;
    }

    const messages: ExpoPushMessage[] = validTokens.map((to) => ({
      to,
      sound: 'default',
      title,
      body,
      data,
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Error sending push notification chunk: ${message}`);
      }
    }

    // Inspect tickets for immediate errors
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      if (ticket.status === 'error') {
        this.logger.error(
          `Push notification error for token "${validTokens[i]}": ${ticket.message} (code: ${ticket.details?.error})`,
        );
      }
    }
  }

  async sendToToken(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    await this.send([token], title, body, data);
  }
}
