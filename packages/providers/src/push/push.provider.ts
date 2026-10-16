export interface PushProvider {
  send(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<void>;
  sendToToken(token: string, title: string, body: string, data?: Record<string, string>): Promise<void>;
}

export const PUSH_PROVIDER = Symbol('PUSH_PROVIDER');
