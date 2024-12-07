import {InjectionToken, PLATFORM_ID, Provider, TransferState} from '@angular/core';
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
import {FetchHttpClient} from './utils/fetch-http-client';
import {getPlatformConfig, normalizeWebSocketUrl} from './utils/config-utils';

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
      useFactory: (fetchHttpClient: FetchHttpClient, platformId: Object) => {
        const _isBrowser = isPlatformBrowser(platformId);

        const httpConfig = getPlatformConfig(_isBrowser, config.http, config.ssr?.http);

        const trpcHttpLink = httpBatchLink({
          url: httpConfig.url,
          fetch: fetchHttpClient.fetch.bind(fetchHttpClient)
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
      deps: [FetchHttpClient, PLATFORM_ID, tRPC_CACHE_STATE, TransferState]
    }
  ];
}
