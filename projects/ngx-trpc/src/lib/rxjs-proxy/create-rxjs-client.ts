/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {
  AnyProcedure,
  AnyRouter,
  inferClientTypes,
  inferProcedureInput,
  inferTransformedProcedureOutput,
  IntersectionError,
  ProcedureOptions,
  ProcedureType,
  RouterRecord
} from '@trpc/server/unstable-core-do-not-import';
import {createFlatProxy, createRecursiveProxy} from '@trpc/server/unstable-core-do-not-import';
import {TRPCClient} from './trpc-client';
import {TRPCSubscriptionObserver, UntypedClientProperties, YieldType} from './types';
import {CreateTRPCClientOptions, TRPCClientError} from '@trpc/client';
import {Observable as RxJSObservable} from 'rxjs';
import {Signal} from '@angular/core';

/**
 * @public
 **/
export type inferRouterClient<TRouter extends AnyRouter> = DecoratedProcedureRecord<
  TRouter,
  TRouter['_def']['record']
>;

export type QueryRefOutput<T> = {
  value: Signal<T>;
  refetch: () => void;
};

type ResolverDef = {
  input: any;
  output: any;
  transformer: boolean;
  errorShape: any;
};

export type Resolver<TDef extends ResolverDef, TOutput = RxJSObservable<TDef['output']>> = (
  input: TDef['input'],
  opts?: ProcedureOptions
) => TOutput;

export type SignalResolver<TDef extends ResolverDef> = Resolver<TDef, Signal<TDef['output']>>;
export type QueryRefSignalResolver<TDef extends ResolverDef> = Resolver<
  TDef,
  QueryRefOutput<TDef['output']>
>;

type SubscriptionResolver<
  TDef extends ResolverDef,
  TOutput = RxJSObservable<YieldType<TDef['output']>>
> = (
  input: TDef['input'],
  opts?: Partial<TRPCSubscriptionObserver<TDef['output'], TRPCClientError<TDef>>> & ProcedureOptions
) => TOutput;

export type SubscriptionSignalResolver<TDef extends ResolverDef> = SubscriptionResolver<
  TDef,
  Signal<YieldType<TDef['output']>>
>;

type DecorateProcedure<
  TType extends ProcedureType,
  TDef extends ResolverDef
> = TType extends 'query'
  ? {
      query: Resolver<TDef>;
      querySignal: SignalResolver<TDef>;
      queryRef: QueryRefSignalResolver<TDef>;
    }
  : TType extends 'mutation'
    ? {
        mutate: Resolver<TDef>;
      }
    : TType extends 'subscription'
      ? {
          subscribe: SubscriptionResolver<TDef>;
          subscribeSignal: SubscriptionSignalResolver<TDef>;
        }
      : never;

/**
 * @internal
 */
type DecoratedProcedureRecord<TRouter extends AnyRouter, TRecord extends RouterRecord> = {
  [TKey in keyof TRecord]: TRecord[TKey] extends infer $Value
    ? $Value extends RouterRecord
      ? DecoratedProcedureRecord<TRouter, $Value>
      : $Value extends AnyProcedure
        ? DecorateProcedure<
            $Value['_def']['type'],
            {
              input: inferProcedureInput<$Value>;
              output: inferTransformedProcedureOutput<inferClientTypes<TRouter>, $Value>;
              errorShape: inferClientTypes<TRouter>['errorShape'];
              transformer: inferClientTypes<TRouter>['transformer'];
            }
          >
        : never
    : never;
};

const clientCallTypeMap: Record<keyof DecorateProcedure<any, any>, ProcedureType> = {
  query: 'query',
  querySignal: 'querySignal',
  queryRef: 'queryRef',
  mutate: 'mutation',
  subscribe: 'subscription',
  subscribeSignal: 'subscriptionSignal'
};

/** @internal */
export const clientCallTypeToProcedureType = (clientCallType: string): ProcedureType => {
  return clientCallTypeMap[clientCallType as keyof typeof clientCallTypeMap];
};

/**
 * Creates a proxy client and shows type errors if you have query names that collide with built-in properties
 */
export type CreateTRPCClient<TRouter extends AnyRouter> =
  inferRouterClient<TRouter> extends infer $Value
    ? UntypedClientProperties & keyof $Value extends never
      ? inferRouterClient<TRouter>
      : IntersectionError<UntypedClientProperties & keyof $Value>
    : never;

export function createTRPCRxJSProxyClient<TRouter extends AnyRouter>(
  opts: CreateTRPCClientOptions<TRouter>
) {
  const client = new TRPCClient<TRouter>(opts);
  return createTRPCRxJSClientProxy(client as TRPCClient<TRouter>);
}

function createTRPCRxJSClientProxy<TRouter extends AnyRouter>(
  client: TRPCClient<TRouter>
): CreateTRPCClient<TRouter> {
  const proxy = createRecursiveProxy<CreateTRPCClient<TRouter>>(({path, args}) => {
    const pathCopy = [...path];
    const procedureType = clientCallTypeToProcedureType(pathCopy.pop()!);

    const fullPath = pathCopy.join('.');

    return (client as any)[procedureType](fullPath, ...args);
  });
  return createFlatProxy<CreateTRPCClient<TRouter>>((key) => {
    if (client.hasOwnProperty(key)) {
      return (client as any)[key as any];
    }
    if (key === '__untypedClient') {
      return client;
    }
    return proxy[key];
  });
}
