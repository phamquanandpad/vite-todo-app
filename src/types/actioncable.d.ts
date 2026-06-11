declare module '@rails/actioncable' {
  export interface Subscription {
    unsubscribe(): void;
  }

  export interface Subscriptions {
    create(
      channelNameOrParams: string | Record<string, unknown>,
      mixin: {
        received?: (data: unknown) => void;
        connected?: () => void;
        disconnected?: () => void;
        rejected?: () => void;
      }
    ): Subscription;
  }

  export interface Consumer {
    subscriptions: Subscriptions;
    disconnect(): void;
  }

  export function createConsumer(url?: string): Consumer;
}
