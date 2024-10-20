import {WebSocketClientOptions} from '@trpc/client';
import {InjectionToken, Provider} from '@angular/core';

export const TRPC_CONFIG = new InjectionToken<ITrpcConfig>('TRPC_CONFIG');

export const provideTrpcConfig = (config: ITrpcConfig): Provider => ({
  provide: TRPC_CONFIG,
  useValue: config
});

export interface ITrpcLink {
  url: string;

  /**
   * URL that will be used server-side.
   */
  ssrUrl?: string;

  /**
   * If TRPC is hosted on a different domain than the frontend, you can set this to `true` to send cookies with the request.
   * Please adjust the `Access-Control-Allow-Origin` header on the server to allow credentials.
   */
  withCredentials?: boolean;
}

export type ITrpcLinkOptions = ITrpcLink & Omit<WebSocketClientOptions, 'url'>;

export interface ITrpcConfig {
  http: ITrpcLink;

  ws?: ITrpcLinkOptions;
}
