import {OperationContext} from '@trpc/client';

export type Maybe<TType> = TType | null | undefined;

export type UntypedClientProperties =
  | '$request'
  | 'links'
  | 'mutation'
  | 'query'
  | 'requestAsPromise'
  | 'requestId'
  | 'runtime'
  | 'subscription';

export type TRPCType = 'mutation' | 'query' | 'subscription';

type inferAsyncIterableYield<T> = T extends AsyncIterable<infer U> ? U : T;

export interface TRPCSubscriptionObserver<TValue, TError> {
  onStarted: (opts: {context: OperationContext | undefined}) => void;
  onData: (value: inferAsyncIterableYield<TValue>) => void;
  onError: (err: TError) => void;
  onStopped: () => void;
  onComplete: () => void;
}

export type YieldType<T> = inferAsyncIterableYield<T>;
