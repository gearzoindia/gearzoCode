export interface RealtimeProvider {
  trigger(channel: string, event: string, data: unknown): Promise<void>;
  authenticateUser(socketId: string, channel: string, userId: string): { auth: string; channel_data?: string };
}

export const REALTIME_PROVIDER = Symbol('REALTIME_PROVIDER');
