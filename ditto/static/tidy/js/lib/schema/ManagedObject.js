import _ from 'lodash';

export class ManagedObject {
  constructor(schema, { initial, data, onChange} = {}) {
    this._pendNextChange = false;
    this._pendingChange = null;
    this._isBound = {};
    this._errors = {};
    this._options = {};
    this._onChange = onChange;
    let path = [];

    this.managed = schema(this, this, path);
    if (initial !== undefined) {
      this.managed.set(initial);
    }
    if (data !== undefined) {
      this.managed.set(data);
    }
    this._isInitialised = true;
    if (data) {  // FIXME
      this._validate();
    }
  }

  // Public API
  static fromState(schema, state, onChange) {
    let initial = state.managedObject;
    let object = new ManagedObject(schema, {initial: initial});
    object._pendNextChange = state.pendNextChange;
    object._pendingChange = state.pendingChange;
    object._isBound = state.isBound;
    object._errors = state.errors;
    object._onChange = onChange;
    return object;
  }

  get() {
    return this._managedObject;
  }

  isChanged(original) {
//    console.log('is changed', this._managedObject, original);
    let result = !_.isEqual(this._managedObject, original);
    return result;
  }

  isValid() {
    for (let path in this._errors) {
      if (this._errors.hasOwnProperty(path)) {
        if (this._errors[path] !== null && this._errors[path].length) {
          return false;
        }
      }
    }
    return true;
  }

  pend() {
    if (this._pendNextChange) {
      throw new Error('Already pending');
    }
    this._pendNextChange = true;
    return this;
  }

  toState() {
    return {
      managedObject: this._managedObject,
      pendNextChange: this._pendNextChange,
      pendingChange: this._pendingChange,
      isBound: this._isBound,
      errors: this._errors
    };
  }

  // Private methods
  _set(path, value) {
    if (this._pendNextChange) {
      if (this._pendingChange && !_.isEqual(path, this._pendingChange.path)) {
        throw new Error('Cannot pend more than one change');
      }
      this._pendingChange = { path, value };
      this._pendNextChange = false;
    } else {
      if (this._pendingChange &&
          !_.isEqual(path, this._pendingChange.path)) {
        throw new Error('Cannot change other state while change is pending');
      }
      this._setPathToValue(path, value);
      this._pendingChange = null;
      this._pendNextChange = false;
    }
  }

  _setPathToValue(path, value) {
//    console.log('setting', path, value);
    if (this._managedObject === undefined || !path.length) {
      this._managedObject = value;
      return;
    }
    let state = this._managedObject;
    path.slice(0, path.length - 1).forEach(p => {
      state = state[p];
    });
    state[path[path.length - 1]] = value;
  }

  _get(path) {
    let item = this._managedObject;
    path.forEach(p => {
      item = item[p];
    });
    return item;
  }

  _getPending(path) {
    if (this._pendingChange && _.isEqual(path, this._pendingChange.path)) {
      return this._pendingChange.value;
    }
  }

  _validate() {
    this.managed._validate();
  }

  validateWithUnbound() {
    this._validateUnbound = true;
    this.managed._validate();
  }

  _getIsBound(path) {
    if (this._validateUnbound) {
      return true;
    }
    let stringifiedPath = String(path);
    if (this._isBound.hasOwnProperty(stringifiedPath)) {
      return this._isBound[path];
    }
    return false;
  }

  _setIsBound(path, value) {
    this._isBound[path] = value;
  }

  _getErrors(path) {
    if (this._errors.hasOwnProperty(path)) {
      return this._errors[path];
    }
    return [];
  }

  _setErrors(path, errors) {
    this._errors[path] = errors;
  }

  _removeIsBound(path) {
    delete this._isBound[path];
  }

  _removeErrors(path) {
    delete this._errors[path];
  }
}
