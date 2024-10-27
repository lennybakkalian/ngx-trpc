declare const Zone: any;

let macroTaskId = 0;

export class MacroTask {
  private _macroTask: any;

  constructor(
    public enabled = true,
    private _name: string
  ) {
    if (typeof Zone === 'undefined') {
      // If Zone is not available, just disable the macro task
      this.enabled = false;
    }

    if (!enabled) {
      return;
    }

    this._macroTask = Zone.current.scheduleMacroTask(
      `TrpcResolve-${this._name}-${macroTaskId++}`,
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
