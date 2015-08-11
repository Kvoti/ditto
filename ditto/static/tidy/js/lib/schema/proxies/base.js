export class BaseItemManager {
  constructor(question, path, options) {
    this.question = question;
    this.path = path;
    this.options = options;
  }

  init(value) {
    this._set(value);
  }

  set(value) {
    if (!this.question.pendNextChange) {
      this.isBound = true;
    }
    return this._set(value);
  }

  _set(value) {
    this._checkValue(value);
    return this.question.set(this.path, value);
  }

  get() {
    return this.question.get(this.path);
  }

  getPending() {
    return this.question.getPending(this.path);
  }

  getPendingOrCurrent() {
    let pending = this.getPending();
    return pending !== undefined ? pending : this.get();
  }
  
  set errors(errors) {
    return this.question._setErrors(this.path, errors);

  }
  
  get errors() {
    return this.question._getErrors(this.path);
  }

  _validate() {
    if (!this.isBound) {
      this.errors = [];
      return;
    }
    this.errors = this._validateBoundValue();
  }

  _checkValue() {
    throw new Error('Subclass must implement _checkValue method');
  }

  _validateBoundValue() {
    throw new Error('Subclass must implement _validateBoundValue method');
  }

  set isBound(value) {
    this.question._setIsBound(this.path, value);
  }

  get isBound() {
    return this.question._getIsBound(this.path);
  }
}
