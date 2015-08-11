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

  get errors() {
    return this._errors;
  }

  _validate() {
    if (!this.isBound) {
      this._errors = [];
      return;
    }
    this._errors = this._validateBoundValue();
  }

  _checkValue() {
    throw new Error('Subclass must implement _checkValue method');
  }

  _validateBoundValue() {
    throw new Error('Subclass must implement _validateBoundValue method');
  }
}
