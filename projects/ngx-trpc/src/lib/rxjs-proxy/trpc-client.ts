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
import {Observable, Observable as RxJSObservable, startWith, Subject, switchMap} from 'rxjs';
import {createChain} from './create-chain';
import {MacroTask} from '../utils/macro-task';
import {toSignal} from '@angular/core/rxjs-interop';
import {QueryRefOutput} from './create-rxjs-client';

interface RequestOpts<TInput> {
  type: TRPCType;
  input: TInput;
  path: string;
  context?: OperationContext;
  signal: Maybe<AbortSignal>;
}

type SubscriptionOpts = Partial<TRPCSubscriptionObserver<unknown, TRPCClientError<AnyRouter>>>;

export class TRPCClient<TRouter extends AnyRouter> {
  private readonly links: OperationLink<TRouter>[];
  public readonly runtime: TRPCClientRuntime;
  private requestId: number;

  constructor(opts: CreateTRPCClientOptions<TRouter>) {
    this.requestId = 0;

    this.runtime = {};

    this.links = opts.links.map((link) => link(this.runtime));
  }

  private $request<TInput = unknown, TOutput = unknown>(opts: RequestOpts<TInput>) {
    const chain$ = createChain<AnyRouter, TInput, TOutput>({
      links: this.links as OperationLink<any, any, any>[],
      op: {
        ...opts,
        context: opts.context ?? {},
        id: ++this.requestId
      }
    });

    return trpcObservableToRxJsObservable(opts, chain$.pipe(share()));
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

  public querySignal(path: string, input?: unknown, opts?: TRPCRequestOptions) {
    return toSignal(this.query(path, input, opts));
  }

  public queryRef(
    path: string,
    input?: unknown,
    opts?: TRPCRequestOptions
  ): QueryRefOutput<unknown> {
    const refetch$ = new Subject<void>();
    return {
      refetch: () => refetch$.next(),
      value: toSignal(
        refetch$.pipe(
          startWith(null),
          switchMap(() => this.query(path, input, opts))
        )
      )
    };
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
        // subscriptions will just be completed in ssr context
        subscriber.complete();
      });
    }

    return this.$request({
      type: 'subscription',
      path,
      input,
      context: opts?.context,
      signal: opts?.signal
    });
  }

  public subscriptionSignal(
    path: string,
    input: unknown,
    opts: SubscriptionOpts & TRPCRequestOptions
  ) {
    return toSignal(this.subscription(path, input, opts));
  }
}

function trpcObservableToRxJsObservable<TInput, TOutput>(
  opts: SubscriptionOpts & RequestOpts<TInput>,
  observable: TrpcObservable<
    OperationResultEnvelope<TOutput, TRPCClientError<AnyRouter>>,
    TRPCClientError<AnyRouter>
  >
): RxJSObservable<TOutput> {
  return new RxJSObservable<TOutput>((subscriber) => {
    // create a macroTask as long as the request type is not a subscription
    // it will be invoked on data or errors
    const macroTask = new MacroTask(opts.type !== 'subscription', opts.path);

    const sub = observable.subscribe({
      next: (value) => {
        switch (value.result.type) {
          case undefined:
          case 'data':
            subscriber.next(value.result.data);
            macroTask.invoke();
            break;
          case 'state': // todo
            break;
          case 'started':
            opts.onStarted?.({context: value.context});
            break;
          case 'stopped':
            opts.onStopped?.();
            break;
        }
      },
      error: (err) => {
        subscriber.error(err);
        macroTask.invoke();
      },
      complete: () => {
        subscriber.complete();
        macroTask.invoke();
      }
    });
    return () => sub.unsubscribe();
  });
}
