export default class BaseManager {
  constructor(question, parent, path, key, options) {
    this.__isManager = true;
    this.question = question;
    this.parent = parent;
    this.path = path;
    this.key = key;
    this.options = options;
  }
  
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

  get errors() {
    return this.question._getErrors(this.path);
  }

  addError(error) {
    let errors = this.errors;
    errors.push(error);
    this.errors = errors;
  }

  // private methods
  set isSetting(value) {
    this.question.isSetting = value;
  }

  get isSetting() {
    return this.question.isSetting;
  }
  
  set isBound(value) {
    this.question._setIsBound(this.path, value);
  }

  set errors(errors) {
    return this.question._setErrors(this.path, errors);
  }

  set(value) {
    let validate;
    if (!this.isSetting) {
      this.isSetting = true;
      validate = true;
    }
    this._checkValue(value);
    this._setCheckedValue(value);
    if (validate) {
      this._validate();
      this.isSetting = false;
    }
  }

  _setCheckedValue(value) {
    return this.question.init(this.path, value);
  }
  
  _validate() {
    if (!this.isBound) {
      this.errors = null;
      return;
    }
    let errors = this._validateBoundValue();
    if (!errors.length && !this.options.isRequired && this.isEmpty()) {
      this.errors = null;
      return;
    }
    this.errors = errors;
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
    return (
      this.parent &&
        this.parent.canReorderItems && // TODO this only needed as Question api not like Manager api, maybe should be?
        this.parent.canReorderItems()
    );
  }

  canRemove() {
    return (
      this.parent &&
        this.parent.canRemoveItems &&
        this.parent.canRemoveItems()
    );
  }

  remove = () => {
    if (!(this.parent && this.parent._remove)) {
      throw new Error('Item is not in a list');
    }
    this.parent._remove(parseInt(this.key, 10));
  }
}
