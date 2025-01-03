import {
  InjectionToken,
  PLATFORM_ID,
  Provider,
  REQUEST,
  RESPONSE_INIT,
  TransferState
} from '@angular/core';
import {ITrpcConfig, provideTrpcConfig} from './trpc.config';
import {AnyRouter} from '@trpc/server';
import {CreateTRPCClient, createTRPCRxJSProxyClient} from './rxjs-proxy/create-rxjs-client';
import {createWSClient, httpBatchLink, splitLink, TRPCLink, wsLink} from '@trpc/client';
import {isPlatformBrowser} from '@angular/common';
import {
  provideTrpcCacheState,
  provideTrpcCacheStateStatusManager,
  tRPC_CACHE_STATE
} from './utils/cache-state';
import {transferStateLink} from './utils/transfer-state-link';
import {getPlatformConfig, normalizeHttpUrl, normalizeWebSocketUrl} from './utils/config-utils';
import {FetchMiddleware} from './utils/fetch.middleware';

export type TrpcClient<TRouter extends AnyRouter> = CreateTRPCClient<TRouter>;

export function createTrpcInjectionToken<T extends AnyRouter>() {
  return new InjectionToken<TrpcClient<T>>('TrpcClient');
}

export function provideTrpc<AppRouter extends AnyRouter>(
  token: InjectionToken<AppRouter>,
  config: ITrpcConfig
): Provider[] {
  return [
    provideTrpcConfig(config),
    provideTrpcCacheState(),
    provideTrpcCacheStateStatusManager(),
    {
      provide: token,
      useFactory: (req: Request | null, res: ResponseInit | null, platformId: Object) => {
        const _isBrowser = isPlatformBrowser(platformId);

        const httpConfig = getPlatformConfig(!_isBrowser, config.http, config.ssr?.http);

        const fetchMiddleware = new FetchMiddleware(config, req, res);

        const url = normalizeHttpUrl(
          req?.url ? new URL(req?.url ?? '').origin : '',
          httpConfig.url
        );

        const trpcHttpLink = httpBatchLink({
          url: url,
          fetch: (input, init) =>
            _isBrowser ? fetchMiddleware.fetchImpl(input, init) : fetchMiddleware.fetch(input, init)
        });

        let link: TRPCLink<AnyRouter> = trpcHttpLink;

        if (config.ws && _isBrowser) {
          config.ws.url = normalizeWebSocketUrl(config.ws.url);

          const wsClient = createWSClient(config.ws);

          link = splitLink({
            condition: (op) => op.type === 'subscription',
            true: wsLink({client: wsClient}),
            false: trpcHttpLink
          });
        }

        return createTRPCRxJSProxyClient({
          links: [transferStateLink(), link]
        });
      },
      deps: [REQUEST, RESPONSE_INIT, PLATFORM_ID, tRPC_CACHE_STATE, TransferState]
    }
  ];
}
