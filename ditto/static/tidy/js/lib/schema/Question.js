import _ from 'lodash';

export class Question {
  constructor(schema, { initial = {}, data = {},  onChange}) {
    this.questionSpec = {};
    this.pendNextChange = false;
    this.pendingChange = null;
    this.isBound = {};
    this.errors = {};
    this.onChange = onChange;

    let path = [];
    for (let k in schema) {
      if (schema.hasOwnProperty(k)) {
        schema[k](this, this, path.concat([k]));
      }
    }

    for (let k in this) {
      if (this.hasOwnProperty(k) && this[k] && this[k]._validate !== undefined) {
        if (data.hasOwnProperty(k)) {
          this[k].set(data[k]);
        }
        if (initial.hasOwnProperty(k)) {
          this[k].init(initial[k]);
        }
      }
    }
  }

  isChanged(original) {
    console.log('checking changes');
    return !_.isEqual(this.quesitonSpec, original);
  }

  isValid() {
    for (let path in this.errors) {
      if (this.errors.hasOwnProperty(path)) {
        if (this.errors[path].length) {
          return false;
        }
      }
    }
    return true;
  }
  
  static fromState(schema, state, onChange) {
    let initial = state.questionSpec;
    let question = new Question(schema, {initial: initial});
    question.pendNextChange = state.pendNextChange;
    question.pendingChange = state.pendingChange;
    question.isBound = state.isBound;
    question.errors = state.errors;
    question.onChange = onChange;
    return question;
  }
  
  set(path, value) {
    if (this.pendNextChange) {
      if (this.pendingChange && !_.isEqual(path, this.pendingChange.path)) {
        throw new Error('Cannot pend more than one change');
      }
      this.pendingChange = { path, value };
      this.pendNextChange = false;
    } else {
      if (this.pendingChange &&
          !_.isEqual(path, this.pendingChange.path)) {
        throw new Error('Cannot change other state while change is pending');
      }
      this._set(path, value);
      this.pendingChange = null;
      this.pendNextChange = false;
    }
    if (this.onChange) {
      this.onChange(this.toState());
    }
    return this;
  }

  toState() {
    return {
      questionSpec: this.questionSpec,
      pendNextChange: this.pendNextChange,
      pendingChange: this.pendingChange,
      isBound: this.isBound,
      errors: this.errors
    };
  }
    
  _set(path, value) {
    let state = this.questionSpec;
    path.slice(0, path.length - 1).forEach(p => {
      state = state[p];
    });
    state[path[path.length - 1]] = value;
    this._validate();
  }

  get(path) {
    let state = this.questionSpec;
    path.forEach(p => {
      state = state[p];
    });
    return state;
  }

  getPending(path, value) {
    if (this.pendingChange && _.isEqual(path, this.pendingChange.path)) {
      return this.pendingChange.value;
    }
  }

  pend() {
    if (this.pendNextChange) {
      throw new Error('Already pending');
    }
    this.pendNextChange = true;
    return this;
  }

  _validate() {
    for (let k in this) {
      if (this.hasOwnProperty(k) && this[k] && this[k]._validate !== undefined) {
        this[k]._validate();
      }
    }
  }

  _getIsBound(path) {
    if (this.isBound.hasOwnProperty(path)) {
      return this.isBound[path];
    }
    return false;
  }

  _setIsBound(path, value) {
    this.isBound[path] = value;
  }

  _getErrors(path) {
    if (this.errors.hasOwnProperty(path)) {
      return this.errors[path];
    }
    return [];
  }

  _setErrors(path, errors) {
    this.errors[path] = errors;
  }
}