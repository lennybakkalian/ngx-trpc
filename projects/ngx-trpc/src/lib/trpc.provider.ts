import {InjectionToken, PLATFORM_ID, Provider, TransferState} from '@angular/core';
import {ITrpcConfig} from './trpc.config';
import {AnyRouter} from '@trpc/server';
import {CreateTRPCClient, createTRPCRxJSProxyClient} from './rxjs-proxy/createRxjsClient';
import {createWSClient, httpLink, splitLink, TRPCLink, wsLink} from '@trpc/client';
import {resolveTrpcLink} from './utils/link-resolver';
import {isPlatformBrowser} from '@angular/common';
import {
  provideTrpcCacheState,
  provideTrpcCacheStateStatusManager,
  tRPC_CACHE_STATE
} from './utils/cache-state';
import {transferStateLink} from './utils/transfer-state-link';

type TrpcClient<TRouter extends AnyRouter> = CreateTRPCClient<TRouter>;

export function createTrpcInjectionToken<T extends AnyRouter>() {
  return new InjectionToken<TrpcClient<T>>('TrpcClient');
}

export function provideTrpc<AppRouter extends AnyRouter>(
  token: InjectionToken<AppRouter>,
  config: ITrpcConfig
): Provider[] {
  return [
    provideTrpcCacheState(),
    provideTrpcCacheStateStatusManager(),
    {
      provide: token,
      useFactory: (platformId: Object) => {
        const _isBrowser = isPlatformBrowser(platformId);

        const trpcHttpLink = httpLink<any>({
          url: resolveTrpcLink(_isBrowser, config.http)
        });

        let link: TRPCLink<AnyRouter> = trpcHttpLink;

        if (config.ws && _isBrowser) {
          const wsClient = createWSClient({
            ...config.ws,
            url: resolveTrpcLink(_isBrowser, config.ws)
          });

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
      deps: [PLATFORM_ID, tRPC_CACHE_STATE, TransferState]
    }
  ];
}
