import {AnyRouter} from '@trpc/server';
import {inferObservableValue, Observable as TrpcObservable, share} from '@trpc/server/observable';
import {
  CreateTRPCClientOptions,
  OperationContext,
  OperationLink,
  TRPCClientError,
  TRPCClientRuntime,
  TRPCRequestOptions
} from '@trpc/client';
import {Maybe, TRPCSubscriptionObserver, TRPCType} from './types';
import {map, Observable, Observable as RxJSObservable} from 'rxjs';
import {waitFor} from '../utils/wait-for';
import {createChain} from './createChain';

export class TRPCClient<TRouter extends AnyRouter> {
  private readonly links: OperationLink<TRouter>[];
  public readonly runtime: TRPCClientRuntime;
  private requestId: number;

  constructor(opts: CreateTRPCClientOptions<TRouter>) {
    this.requestId = 0;

    this.runtime = {};

    this.links = opts.links.map((link) => link(this.runtime));
  }

  private $request<TInput = unknown, TOutput = unknown>(opts: {
    type: TRPCType;
    input: TInput;
    path: string;
    context?: OperationContext;
    signal: Maybe<AbortSignal>;
    dontWait?: boolean;
  }) {
    const chain$ = createChain<AnyRouter, TInput, TOutput>({
      links: this.links as OperationLink<any, any, any>[],
      op: {
        ...opts,
        context: opts.context ?? {},
        id: ++this.requestId
      }
    });
    type TValue = inferObservableValue<typeof chain$>;
    const x = trpcObservableToRxJsObservable<TValue>(chain$.pipe(share())).pipe(
      map((envelope) => envelope.result.data!)
    );
    if (opts.dontWait) {
      return x;
    }
    return waitFor(x);
  }

  public query(path: string, input?: unknown, opts?: TRPCRequestOptions) {
    return this.$request({
      type: 'query',
      path,
      input,
      context: opts?.context,
      signal: opts?.signal
    });
  }
  public mutation(path: string, input?: unknown, opts?: TRPCRequestOptions) {
    return this.$request({
      type: 'mutation',
      path,
      input,
      context: opts?.context,
      signal: opts?.signal
    });
  }

  public subscription(
    path: string,
    input: unknown,
    opts: Partial<TRPCSubscriptionObserver<unknown, TRPCClientError<AnyRouter>>> &
      TRPCRequestOptions
  ) {
    if (typeof window !== 'object') {
      return new Observable((subscriber) => {
        // Subscriptions will just be ignored server side
        subscriber.complete();
      });
    }

    return this.$request({
      type: 'subscription',
      path,
      input,
      context: opts?.context,
      signal: opts?.signal,
      dontWait: true
    });
  }
}

function trpcObservableToRxJsObservable<TValue>(
  observable: TrpcObservable<TValue, unknown>
): RxJSObservable<TValue> {
  return new RxJSObservable<TValue>((subscriber) => {
    const sub = observable.subscribe({
      next: (value) => subscriber.next(value),
      error: (err) => subscriber.error(TRPCClientError.from(err as Error)),
      complete: () => subscriber.complete()
    });
    return () => {
      sub.unsubscribe();
    };
  });
}
