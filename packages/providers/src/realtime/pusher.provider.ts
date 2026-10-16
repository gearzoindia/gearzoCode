import { Injectable, Logger } from '@nestjs/common';
import Pusher from 'pusher';
import { RealtimeProvider } from './realtime.provider';

@Injectable()
export class PusherRealtimeProvider implements RealtimeProvider {
  private readonly logger = new Logger(PusherRealtimeProvider.name);
  private readonly pusher: Pusher;

  constructor() {
    const appId = process.env.PUSHER_APP_ID || '';
    const key = process.env.PUSHER_KEY || '';
    const secret = process.env.PUSHER_SECRET || '';
    const cluster = process.env.PUSHER_CLUSTER || 'ap2';

    if (!appId || !key || !secret) {
      this.logger.warn(
        'Pusher environment variables (PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET) are not fully configured',
      );
    }

    this.pusher = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }

  async trigger(channel: string, event: string, data: unknown): Promise<void> {
    try {
      await this.pusher.trigger(channel, event, data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to trigger Pusher event "${event}" on channel "${channel}": ${message}`,
      );
      throw error;
    }
  }

  authenticateUser(
    socketId: string,
    channel: string,
    userId: string,
  ): { auth: string; channel_data?: string } {
    try {
      const channelData = channel.startsWith('presence-')
        ? { user_id: userId, user_info: { id: userId } }
        : undefined;

      return this.pusher.authorizeChannel(socketId, channel, channelData);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to authorize Pusher channel "${channel}" for user "${userId}": ${message}`,
      );
      throw error;
    }
  }
}
