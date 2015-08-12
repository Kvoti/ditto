export class BaseManager {
  get() {
    return this.question.get(this.path);
  }

  pend() {
    this.question.pend();
    return this;
  }

  getPending() {
    return this.question.getPending(this.path);
  }

  getPendingOrCurrent() {
    let pending = this.getPending();
    return pending !== undefined ? pending : this.get();
  }

  get isBound() {
    return this.question._getIsBound(this.path);
  }

  set isBound(value) {
    this.question._setIsBound(this.path, value);
  }

  set errors(errors) {
    return this.question._setErrors(this.path, errors);
  }

  get errors() {
    return this.question._getErrors(this.path);
  }

  addError(error) {
    let errors = this.errors;
    errors.push(error);
    this.errors = errors;
  }

  _set(value) {
    this._checkValue(value);
    return this.question.set(this.path, value);
  }

  _validate() {
    if (!this.isBound) {
      this.errors = [];
      return;
    }
    this.errors = this._validateBoundValue();
    if (this.options.validate) {
      this.errors = this.errors.concat(this.options.validate.apply(this));
    }
  }

  _checkValue() {
    throw new Error('Subclass must implement _checkValue method');
  }

  _validateBoundValue() {
    throw new Error('Subclass must implement _validateBoundValue method');
  }

}

export class BaseItemManager extends BaseManager {
  constructor(question, path, options) {
    super();
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
}

export class BaseCollectionManager extends BaseManager {
  init(values) {
    return this._set(values, 'init');
  }

  set(values) {
    return this._set(values, 'set');
  }
}
