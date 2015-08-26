export default class BaseManager {
  constructor(managedObject, parent, path, options) {
    this.__isManager = true;
    this._object = managedObject;
    this.parent = parent;
    this._path = path;
    this._options = options;
  }

  // Public API
  get() {
    return this._object._get(this._path);
  }

  get key() {
    return this._path[this._path.length - 1];
  }

  set(value) {
//    console.log('setting', this._path, value);
    let validate;
    if (!this._isSetting) {
      this._isSetting = true;
      validate = true;
    }
    this._checkValue(value);
    this._setCheckedValue(value);
//    console.log('validate?', validate);
    if (validate) {
      this._object._validate();
      this._isSetting = false;
      if (this._object._onChange) {
//        console.log('emitting state change');
        this._object._onChange(this._object.toState());
      }
    }
  }

  // TODO need to be able to initialise values without settings isBound and without
  // triggering validation
  // init(value) {
  //   this._checkValue(value);
  //   this._setCheckedValue(value);
  //   if (this._object._onChange) {
  //     this._object._onChange(this._object.toState());
  //   }
  // }

  pend() {
    this._object.pend();
    return this;
  }

  getPending() {
    return this._object._getPending(this._path);
  }

  getPendingOrCurrent() {
    let pending = this.getPending();
    return pending !== undefined ? pending : this.get();
  }

  get isBound() {
    return this._object._getIsBound(this._path);
  }

  get errors() {
    return this._object._getErrors(this._path);
  }

  addError(error) {
    let errors = this.errors;
    errors.push(error);
    this.errors = errors;
  }

  canReorder() {
    return (
      this.parent &&
        this.parent.canReorderItems && // TODO this only needed as ManagedObject api not like Manager api, maybe should be?
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

  // Private methods
  set _isSetting(value) {
    this._object._isSetting = value;
  }

  get _isSetting() {
    return this._object._isSetting;
  }

  set isBound(value) {
    this._object._setIsBound(this._path, value);
  }

  set errors(errors) {
    return this._object._setErrors(this._path, errors);
  }

  _setCheckedValue(value) {
    throw new Error('Subclass must implement _setCheckedValue');
  }

  _validate() {
    if (!this.isBound) {
      this.errors = null;
    } else {
      let errors = this._validateBoundValue();
      if (!errors.length && !this._options.isRequired && this._isEmpty()) {
        this.errors = null;
      } else {
        this.errors = errors;
      }
    }
    if (this._options.validate) {
      let errors = this._options.validate.apply(this);
      if (errors.length) {
        if (this.errors === null) {
          this.errors = errors;
        } else {
          this.errors = this.errors.concat(errors);
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
