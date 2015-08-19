import _ from 'lodash';

export class ManagedObject {
  constructor(schema, { initial, data, onChange} = {}) {
    // this._objectSpec = {};
    this._pendNextChange = false;
    this._pendingChange = null;
    this._isBound = {};
    this._errors = {};
    this._options = {};
    this._onChange = onChange;
    let path = [];
    
    // for (let k in schema) {
    //   if (schema.hasOwnProperty(k)) {
    this.managed = schema(this, this, path);
    //   }
    // }

    // for (let k in this) {
    //   if (this._hasOwnProperty(k) && this[k] && this[k]._validate !== undefined) {
    //     if (data && data.hasOwnProperty(k)) {
    if (initial !== undefined) {
      this.managed.set(data);
    }
    //     } else if (initial && initial.hasOwnProperty(k)) {
    //       this[k].set(initial[k]);
    //     }
    //   }
    // }
    this._isInitialised = true;
    if (data) {
      this._validate();
    }
  }

  static fromState(schema, state, onChange) {
    let initial = state.objectSpec;
    let object = new ManagedObject(schema, {initial: initial});
    object._pendNextChange = state.pendNextChange;
    object._pendingChange = state.pendingChange;
    object._isBound = state.isBound;
    object._errors = state.errors;
    object._onChange = onChange;
    return object;
  }

  // Public API
  isChanged(original) {
    let result = !_.isEqual(this._objectSpec, original);
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
      objectSpec: this._objectSpec,
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
    if (this._objectSpec === undefined || !path.length) {
      this._objectSpec = value;
      return;
    }
    let state = this._objectSpec;
    path.slice(0, path.length - 1).forEach(p => {
      state = state[p];
    });
    state[path[path.length - 1]] = value;
  }

  _get(path) {
    let item = this._objectSpec;
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

  _getIsBound(path) {
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
