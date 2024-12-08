import {WebSocketClientOptions} from '@trpc/client';
import {InjectionToken, Provider} from '@angular/core';

export const TRPC_CONFIG = new InjectionToken<ITrpcConfig>('TRPC_CONFIG');

export const provideTrpcConfig = (config: ITrpcConfig): Provider => ({
  provide: TRPC_CONFIG,
  useValue: config
});

type HttpOptions = {
  url: string;
};

type WsOptions = {
  url: string;
} & Omit<WebSocketClientOptions, 'url'>;

export interface ITrpcConfig {
  http: HttpOptions & {withCredentials?: boolean};

  ws?: WsOptions;

  ssr?: {
    /**
     * Overwrite http options in SSR context.
     */
    http?: HttpOptions;

    /**
     * Overwrite ws options in SSR context.
     */
    // ws?: WsOptions; // Not supported yet

    /**
     * Define all headers that should be forwarded to the client.
     *
     * Default: `['set-cookie']`
     */
    forwardHeaders?: string[];

    /**
     * Disable sequential requests in SSR context.
     * Only enable this, if you don't set cookies in createContext while doing sequential requests in ssr.
     */
    disableSequentialRequests?: boolean;
  };
}
