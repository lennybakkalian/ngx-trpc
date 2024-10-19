import {inject, PLATFORM_ID} from '@angular/core';
import {ITrpcConfig} from './trpc.config';
import {isPlatformBrowser} from '@angular/common';
import {
  createTRPCClient,
  CreateTRPCClient,
  createWSClient,
  httpLink,
  splitLink,
  TRPCLink,
  wsLink
} from '@trpc/client';
import type {AnyRouter} from '@trpc/server';
import {resolveTrpcLink} from './utils/link-resolver';

export class TrpcClient<TRouter extends AnyRouter> {
  private _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private _trpc: CreateTRPCClient<TRouter>;

  constructor(private _config: ITrpcConfig) {
    const trpcHttpLink = httpLink<any>({url: resolveTrpcLink(this._isBrowser, this._config.http)});

    let link: TRPCLink<any> = trpcHttpLink;

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

    this._trpc = createTRPCClient<TRouter>({
      links: [link]
    });
  }
}
