export default class BaseManager {
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

  _set(value, method) {
    this._checkValue(value);
    return this.question.set(this.path, value, method);
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

  canReorder() {
    return (this.chain && this.chain.chain &&
            this.chain.chain.canReorderItems());
  }
  
  canReorderItems() {
    return false;
  }

  canRemoveItems() {
    return false;
  }
  
  canRemove() {
    return (this.chain && this.chain.chain &&
            this.chain.chain.canRemoveItems());
  }

  remove() {
    console.log('removing', this.path);
    (this.chain && this.chain.chain &&
     this.chain.chain._remove(parseInt(this.chain.name)));
  }
}
