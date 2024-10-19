import {WebSocketClientOptions} from '@trpc/client';

export interface ITrpcLink {
  url: string;

  /**
   * URL that will be used server-side.
   */
  ssrUrl?: string;
}

export type ITrpcLinkOptions = ITrpcLink & Omit<WebSocketClientOptions, 'url'>;

export interface ITrpcConfig {
  http: ITrpcLink;

  ws?: ITrpcLinkOptions;
}
