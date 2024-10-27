declare const Zone: any;

export class MacroTask {
  private _macroTask: any;

  constructor(public enabled = true) {
    if (typeof Zone === 'undefined') {
      // If Zone is not available, just disable the macro task
      this.enabled = false;
    }

    if (!enabled) {
      return;
    }

    this._macroTask = Zone.current.scheduleMacroTask(
      `TrpcResolve-${Math.random()}`,
      () => {},
      {},
      () => {}
    );
  }

  invoke() {
    if (!this.enabled) {
      return;
    }
    this._macroTask?.invoke();
  }
}
