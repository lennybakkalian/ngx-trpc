import {inject, PLATFORM_ID} from '@angular/core';
import {ITrpcConfig} from './trpc.config';
import {isPlatformBrowser} from '@angular/common';
import {createWSClient, httpLink, splitLink, TRPCLink, wsLink} from '@trpc/client';
import type {AnyRouter} from '@trpc/server';
import {resolveTrpcLink} from './utils/link-resolver';
import {CreateTRPCClient, createTRPCRxJSProxyClient} from './rxjs-proxy/createRxjsClient';

//import {CreateTRPCClient} from './rxjs-proxy/createRxjsClient';

export class TrpcClient<TRouter extends AnyRouter> {
  private _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  _trpc: CreateTRPCClient<TRouter>;

  constructor(private _config: ITrpcConfig) {
    const trpcHttpLink = httpLink<any>({url: resolveTrpcLink(this._isBrowser, this._config.http)});

    let link: TRPCLink<TRouter> = trpcHttpLink;

    if (this._config.ws && this._isBrowser) {
      const wsClient = createWSClient({
        url: resolveTrpcLink(this._isBrowser, this._config.ws)
      });

      link = splitLink({
        condition: (op) => op.type === 'subscription',
        true: trpcHttpLink,
        false: wsLink({client: wsClient})
      });
    }

    this._trpc = createTRPCRxJSProxyClient({
      links: [link]
    });
  }
}
