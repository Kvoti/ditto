export default class BaseManager {
  constructor(question, parent, path, key, options) {
    this.__isManager = true;
    this._question = question;
    this._parent = parent;
    this._path = path;
    this._key = key;
    this._options = options;
  }

  // Public API
  get() {
    return this._question._get(this._path);
  }

  set(value) {
    let validate;
    if (!this._isSetting) {
      console.log('setting top level', this._path, value);
      this._isSetting = true;
      validate = true;
    }
    this._checkValue(value);
    this._setCheckedValue(value);
    if (validate) {
      console.log('validating top level');
      this._question._validate();
      console.log('ERRORS', this._question._errors);
      this._isSetting = false;
      if (this._question._onChange) {
        console.log('CHANGING STATE');
        this._question._onChange(this._question._toState());
      }
    }
  }

  pend() {
    this._question._pend();
    return this;
  }

  getPending() {
    return this._question._getPending(this._path);
  }

  getPendingOrCurrent() {
    let pending = this._getPending();
    return pending !== undefined ? pending : this._get();
  }

  get isBound() {
    return this._question._getIsBound(this._path);
  }

  get errors() {
    return this._question._getErrors(this._path);
  }

  addError(error) {
    let errors = this._errors;
    errors.push(error);
    this._errors = errors;
  }

  canReorder() {
    return (
      this._parent &&
        this._parent.canReorderItems && // TODO this only needed as Question api not like Manager api, maybe should be?
        this._parent.canReorderItems()
    );
  }

  canRemove() {
    return (
      this._parent &&
        this._parent.canRemoveItems &&
        this._parent.canRemoveItems()
    );
  }

  remove = () => {
    if (!(this._parent && this._parent._remove)) {
      throw new Error('Item is not in a list');
    }
    this._parent._remove(parseInt(this._key, 10));
  }

  // Private methods
  set _isSetting(value) {
    this._question._isSetting = value;
  }

  get _isSetting() {
    return this._question._isSetting;
  }

  set isBound(value) {
    this._question._setIsBound(this._path, value);
  }

  set errors(errors) {
    return this._question._setErrors(this._path, errors);
  }

  _setCheckedValue(value) {
    throw new Error('Subclass must implement _setCheckedValue');
  }

  _validate() {
    if (!this._isBound) {
      this._errors = null;
    } else {
      let errors = this._validateBoundValue();
      if (!errors.length && !this._options.isRequired && this._isEmpty()) {
        this._errors = null;
      } else {
        this._errors = errors;
      }
    }
    if (this._options.validate) {
      let errors = this._options.validate.apply(this);
      console.log('extra errors', errors, this._errors);
      if (errors.length) {
        if (this._errors === null) {
          this._errors = errors;
        } else {
          this._errors = this._errors.concat(errors);
        }
      }
    }
  }

  _checkValue() {
    throw new Error('Subclass must implement _checkValue method');
  }

  _validateBoundValue() {
    throw new Error('Subclass must implement _validateBoundValue method');
  }
}
