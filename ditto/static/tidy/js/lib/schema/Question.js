import _ from 'lodash';

export class Question {
  constructor(schema, { initial = {}, data = {} }) {
    this.state = {};
    this.pendNextChange = false;
    this.pendingChange = null;

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

  set(path, value) {
    if (this.pendNextChange) {
      if (this.pendingChange && !_.isEqual(path, this.pendingChange.path)) {
        throw new Error('Cannot pend more than one change');
      }
      this.pendingChange = { path, value };
    } else {
      if (this.pendingChange &&
          !_.isEqual(path, this.pendingChange.path)) {
        throw new Error('Cannot change other state while change is pending');
      }
      this._set(path, value);
      this.pendingChange = null;
      this.pendNextChange = false;
    }
    if (this.component) {
      this.setState({question: this.state});
    }
    return this;
  }

  _set(path, value) {
    let state = this.state;
    path.slice(0, path.length - 1).forEach(p => {
      state = state[p];
    });
    state[path[path.length - 1]] = value;
    this._validate();
  }

  get(path) {
    let state = this.state;
    path.forEach(p => {
      state = state[p];
    });
    return state;
  }

  getPending(path, value) {
    if (this.pendingChange && _.isEqual(path, this.pendingChange.path)) {
      return this.pendingChange.value;
    }
    return null;
  }

  pend() {
    if (this.pendNextChange) {
      throw new Error('Already pending');
    }
    this.pendNextChange = true;
    return this;
  }

  unpend() {
    this.pendNextChange = false;
    //return this;
  }

  _validate() {
    for (let k in this) {
      if (this.hasOwnProperty(k) && this[k] && this[k]._validate !== undefined) {
        this[k]._validate();
      }
    }
  }
}
