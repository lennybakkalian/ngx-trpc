import {Observable, tap} from 'rxjs';

declare const Zone: any;

export function waitFor<T>(observable: Observable<T>) {
  if (typeof Zone === 'undefined') {
    return;
  }

  const macroTask = Zone.current.scheduleMacroTask(
    `TrpcResolve-${Math.random()}`,
    () => {},
    {},
    () => {}
  );

  return observable.pipe(tap(() => macroTask.invoke()));
}
