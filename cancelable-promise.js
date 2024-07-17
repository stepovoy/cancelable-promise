class CancelablePromise {
  constructor(executor) {
    this._isCanceled = false

    if (typeof executor !== 'function') {
      throw new TypeError('CancelablePromise executor must be a function')
    }

    this._promise = new Promise((resolve, reject) => {
      this._resolve = (value) => {
        if (!this._isCanceled) {
          resolve(value)
        }
      }

      this._reject = (reason) => {
        if (!this._isCanceled) {
          reject(reason)
        }
      }

      executor(this._resolve, this._reject)
    })
  }

  then(onFulfilled, onRejected) {
    if (onFulfilled && typeof onFulfilled !== 'function') {
      throw new TypeError('onFulfilled must be a function')
    }
    if (onRejected && typeof onRejected !== 'function') {
      throw new TypeError('onRejected must be a function')
    }

    return new CancelablePromise((resolve, reject) => {
      this._promise.then(
        (value) => this._isCanceled ? reject({ isCanceled: this.isCanceled }) : onFulfilled ? resolve(onFulfilled(value)) : resolve(value),
        (reason) => this._isCanceled ? reject({ isCanceled: this.isCanceled }) : onRejected ? resolve(onRejected(reason)) : reject(reason)
      )
    })
  }

  catch(onRejected) {
    return this.then(undefined, onRejected)
  }

  cancel() {
    if (!this._isCanceled) {
      this._isCanceled = true
    }
  }

  get isCanceled() {
    return this._isCanceled
  }
}

module.exports = CancelablePromise
