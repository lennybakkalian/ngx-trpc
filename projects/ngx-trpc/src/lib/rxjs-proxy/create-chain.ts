import type {AnyRouter} from '@trpc/server/unstable-core-do-not-import';
import {observable} from '@trpc/server/observable';
import {Operation, OperationLink, OperationResultObservable} from '@trpc/client';

export function createChain<TRouter extends AnyRouter, TInput = unknown, TOutput = unknown>(opts: {
  links: OperationLink<TRouter, TInput, TOutput>[];
  op: Operation<TInput>;
}): OperationResultObservable<TRouter, TOutput> {
  return observable((observer) => {
    function execute(index = 0, op = opts.op) {
      const next = opts.links[index];
      if (!next) {
        throw new Error('No more links to execute - did you forget to add an ending link?');
      }
      const subscription = next({
        op,
        next(nextOp) {
          return execute(index + 1, nextOp);
        }
      });
      return subscription;
    }

    const obs$ = execute();
    return obs$.subscribe(observer);
  });
}
