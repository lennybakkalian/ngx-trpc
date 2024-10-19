import {InjectionToken, PLATFORM_ID, Provider} from '@angular/core';
import {ITrpcConfig} from './trpc.config';
import {AnyRouter} from '@trpc/server';
import {CreateTRPCClient, createTRPCRxJSProxyClient} from './rxjs-proxy/createRxjsClient';
import {createWSClient, httpLink, splitLink, TRPCLink, wsLink} from '@trpc/client';
import {resolveTrpcLink} from './utils/link-resolver';
import {isPlatformBrowser} from '@angular/common';

type TrpcClient<TRouter extends AnyRouter> = CreateTRPCClient<TRouter>;

export function createTrpcInjectionToken<T extends AnyRouter>() {
  return new InjectionToken<TrpcClient<T>>('TrpcClient');
}

export const TRPC_CONFIG = new InjectionToken<ITrpcConfig>('TRPC_CONFIG');

export function provideTrpc<AppRouter extends AnyRouter>(
  token: InjectionToken<AppRouter>,
  config: ITrpcConfig
): Provider[] {
  return [
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
            url: resolveTrpcLink(_isBrowser, config.ws)
          });

          link = splitLink({
            condition: (op) => op.type === 'subscription',
            true: wsLink({client: wsClient}),
            false: trpcHttpLink
          });
        }

        return createTRPCRxJSProxyClient({
          links: [link]
        });
      },
      deps: [PLATFORM_ID]
    }
  ];
}
