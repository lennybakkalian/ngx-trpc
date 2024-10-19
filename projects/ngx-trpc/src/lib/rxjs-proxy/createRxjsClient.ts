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
import {TRPCSubscriptionObserver, UntypedClientProperties} from './types';
import {CreateTRPCClientOptions, TRPCClientError} from '@trpc/client';
import {Observable as RxJSObservable} from 'rxjs';

/**
 * @public
 **/
export type inferRouterClient<TRouter extends AnyRouter> = DecoratedProcedureRecord<
  TRouter,
  TRouter['_def']['record']
>;

type ResolverDef = {
  input: any;
  output: any;
  transformer: boolean;
  errorShape: any;
};

/** @internal */
export type Resolver<TDef extends ResolverDef> = (
  input: TDef['input'],
  opts?: ProcedureOptions
) => RxJSObservable<TDef['output']>;

type SubscriptionResolver<TDef extends ResolverDef> = (
  input: TDef['input'],
  opts?: Partial<TRPCSubscriptionObserver<TDef['output'], TRPCClientError<TDef>>> & ProcedureOptions
) => RxJSObservable<TDef['output']>;

type DecorateProcedure<
  TType extends ProcedureType,
  TDef extends ResolverDef
> = TType extends 'query'
  ? {
      query: Resolver<TDef>;
    }
  : TType extends 'mutation'
    ? {
        mutate: Resolver<TDef>;
      }
    : TType extends 'subscription'
      ? {
          subscribe: SubscriptionResolver<TDef>;
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
  mutate: 'mutation',
  subscribe: 'subscription'
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
