type CallbackType = ((value: any) => void) // eslint-disable-line @typescript-eslint/no-explicit-any

const signals: {[key: string]: CallbackType[]} = {}

export function subscribe(name: string, callback: CallbackType) {
  if (!signals[name]) {
    signals[name] = [];
  }
  signals[name].push(callback);
}

export function emitSignal(name: string, value: any = undefined) { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (signals[name] !== undefined) {
    signals[name].forEach(callback => {
      callback(value);
    })
  }
}
