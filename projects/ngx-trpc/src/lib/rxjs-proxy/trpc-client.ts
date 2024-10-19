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
import {createChain} from './internals/createChain';
import {Maybe, TRPCType} from './internals/types';
import {map, Observable as RxJSObservable} from 'rxjs';

export class TRPCClient<TRouter extends AnyRouter> {
  private readonly links: OperationLink<TRouter>[];
  public readonly runtime: TRPCClientRuntime;
  private requestId: number;

  constructor(opts: CreateTRPCClientOptions<TRouter>) {
    this.requestId = 0;

    this.runtime = {};

    // Initialize the links
    this.links = opts.links.map((link) => link(this.runtime));
  }

  private $request<TInput = unknown, TOutput = unknown>(opts: {
    type: TRPCType;
    input: TInput;
    path: string;
    context?: OperationContext;
    signal: Maybe<AbortSignal>;
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
    return trpcObservableToRxJsObservable<TValue>(chain$.pipe(share())).pipe(
      map((envelope) => envelope.result.data!)
    );
  }

  private requestAsPromise<TInput = unknown, TOutput = unknown>(opts: {
    type: TRPCType;
    input: TInput;
    path: string;
    context?: OperationContext;
    signal: Maybe<AbortSignal>;
  }): RxJSObservable<TOutput> {
    return this.$request<TInput, TOutput>(opts);
  }

  public query(path: string, input?: unknown, opts?: TRPCRequestOptions) {
    return this.requestAsPromise<unknown, unknown>({
      type: 'query',
      path,
      input,
      context: opts?.context,
      signal: opts?.signal
    });
  }
  public mutation(path: string, input?: unknown, opts?: TRPCRequestOptions) {
    return this.requestAsPromise<unknown, unknown>({
      type: 'mutation',
      path,
      input,
      context: opts?.context,
      signal: opts?.signal
    });
  }

  /*private async requestAsPromise<TInput = unknown, TOutput = unknown>(opts: {
    type: TRPCType;
    input: TInput;
    path: string;
    context?: OperationContext;
    signal: Maybe<AbortSignal>;
  }): Promise<TOutput> {
    try {
      const req$ = this.$request<TInput, TOutput>(opts);
      type TValue = inferObservableValue<typeof req$>;

      const envelope = await observableToPromise<TValue>(req$);
      const data = (envelope.result as any).data;
      return data;
    } catch (err) {
      throw TRPCClientError.from(err as Error);
    }
  }
  public query(path: string, input?: unknown, opts?: TRPCRequestOptions) {
    return this.requestAsPromise<unknown, unknown>({
      type: 'query',
      path,
      input,
      context: opts?.context,
      signal: opts?.signal
    });
  }
  public mutation(path: string, input?: unknown, opts?: TRPCRequestOptions) {
    return this.requestAsPromise<unknown, unknown>({
      type: 'mutation',
      path,
      input,
      context: opts?.context,
      signal: opts?.signal
    });
  }*/
  /*public subscription(
    path: string,
    input: unknown,
    opts: Partial<TRPCSubscriptionObserver<unknown, TRPCClientError<AnyRouter>>> &
      TRPCRequestOptions
  ): Unsubscribable {
    const observable$ = this.$request({
      type: 'subscription',
      path,
      input,
      context: opts?.context,
      signal: opts.signal
    });
    return observable$.subscribe({
      next(envelope) {
        if (envelope.result.type === 'started') {
          opts.onStarted?.({
            context: envelope.context
          });
        } else if (envelope.result.type === 'stopped') {
          opts.onStopped?.();
        } else {
          opts.onData?.(envelope.result.data);
        }
      },
      error(err) {
        opts.onError?.(err);
      },
      complete() {
        opts.onComplete?.();
      }
    });
  }*/
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
