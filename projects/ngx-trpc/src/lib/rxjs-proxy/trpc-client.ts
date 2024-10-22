import {AnyRouter} from '@trpc/server';
import {Observable as TrpcObservable, share} from '@trpc/server/observable';
import {
  CreateTRPCClientOptions,
  OperationContext,
  OperationLink,
  OperationResultEnvelope,
  TRPCClientError,
  TRPCClientRuntime,
  TRPCRequestOptions
} from '@trpc/client';
import {Maybe, TRPCSubscriptionObserver, TRPCType} from './types';
import {Observable, Observable as RxJSObservable} from 'rxjs';
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
    const result = trpcObservableToRxJsObservable(chain$.pipe(share()));

    return opts.dontWait ? result : waitFor(result);
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

function trpcObservableToRxJsObservable<TOutput>(
  observable: TrpcObservable<
    OperationResultEnvelope<TOutput, TRPCClientError<AnyRouter>>,
    TRPCClientError<AnyRouter>
  >
): RxJSObservable<TOutput> {
  return new RxJSObservable<TOutput>((subscriber) => {
    const sub = observable.subscribe({
      next: (value) => {
        switch (value.result.type) {
          case 'data':
            subscriber.next(value.result.data);
            break;
          case 'state': // todo
            break;
          case 'started': // todo
            break;
          case 'stopped':
            subscriber.complete();
            break;
        }
      },
      error: (err) => subscriber.error(err),
      complete: () => subscriber.complete()
    });
    return () => sub.unsubscribe();
  });
}
