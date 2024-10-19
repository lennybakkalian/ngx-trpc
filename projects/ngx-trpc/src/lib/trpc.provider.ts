import {InjectionToken, Provider} from '@angular/core';
import {ITrpcConfig} from './trpc.config';
import {TrpcClient} from './client';
import {AnyRouter} from '@trpc/server';

export function createTrpcInjectionToken<T extends AnyRouter>() {
  return new InjectionToken<TrpcClient<T>>('TrpcClient');
}

export const TRPC_CONFIG = new InjectionToken<ITrpcConfig>('TRPC_CONFIG');

export function provideTrpc<AppRouter extends AnyRouter>(
  token: InjectionToken<AppRouter>,
  config: ITrpcConfig
): Provider {
  return {
    provide: token,
    useFactory: () => new TrpcClient<AppRouter>(config),
    deps: []
  };
}
