import _ from 'lodash';

export function question(parts) {
  return function _question(question) {
    let path = [];
    for (let k in parts) {
      if (parts.hasOwnProperty(k)) {
        parts[k](question, question, path.concat([k]));
      }
    }
  };
}

export function string(options={}) {
  if (options.isRequired === undefined) {
    options.isRequired = false;
  }
  options.type = 'string';
  return function _string(question, chain, basePath) {
    let name = basePath[basePath.length - 1];
    chain[name] = new StringManager(question, basePath, options);
    return chain[name];
  };
}

export class StringManager {
  constructor(question, path, options) {
    this.question = question;
    this.path = path;
    this.options = options;
  }

  init(value) {
    this._set(value);
  }

  set(value) {
    console.log('setting string', value, this.question.pendNextChange);
    if (!this.question.pendNextChange) {
      this.isBound = true;
    }
    return this._set(value);
  }
  
  _set(value) {
    if (typeof value !== 'string') {
      throw new Error('Value must be a string');
    }
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
    const value = this.get();
    let errors = [];
    if (!this.isBound) {  // probably needs to recurse down!?
      this._errors = errors;
      return;
    }
    if (this.options.isRequired && value === '') {
      errors.push('This field is required');
    }
    if (this.options.maxLength !== undefined && value.length > this.options.maxLength) {
      errors.push('String is too long');
    }
    this._errors = errors;
  }
}

export function array(item, options) {
  return function _array(question, chain, basePath) {
    let name = basePath[basePath.length - 1];
    chain[name] = new ArrayManager(question, chain, basePath, name, item, options);
    return chain[name];
  };
}

export function shape(args) {
  return function _shape(question, chain, basePath) {
    let name = basePath[basePath.length - 1];
    chain[name] = new ShapeManager(question, chain, basePath, name, args);
    return chain[name];
  };
}

export class ArrayManager {
  constructor(question, chain, path, name, item, options) {
    this.question = question;
    this.chain = chain;
    this.path = path;
    this.name = name;
    this.item = item;
    this.options = options;
    this.question.set(this.path, []);
  }

  init(values) {
    return this._set(values, 'init');
  }

  set(values) {
    return this._set(values, 'set');
  }
    
  _set(values, method) {
    try {
      if (values.push === undefined) {
        throw new Error();
      }
    } catch (e) {
      throw new Error(`Values must be iterable ${values}`);
    }
    this.question.set(this.path, []);
    values.forEach((v, i) => {
      let path = this.path.concat([i]);
      if (this[i] === undefined) {
        this[i] = new ItemManager(this.question, this, path, i, this.item);
      }
      this.chain[i] = this[i];
      this[i][method](v);
    });
    return this.question;
  }

  _validate() {
    let errors = [];
    for (let k in this) {
      if (this.hasOwnProperty(k) && this[k] instanceof ItemManager && this[k].isBound) {
        let item = this[k];
        // TODO should gather items first, then do uniqueness check
        item._validate();
        let others = this._getBoundOthers(item.name);
        for (let i = 0; i < others.length; i += 1) {
          if (_.isEqual(item.get(), others[i])) {
            errors.push('Items must be unique');
            break;
          }
        }
      }
    }
    this.errors = errors;
  }

  _getBoundOthers(index) {
    let items = [];
    for (let i = 0; i < index; i += 1) {
      this[i]._validate();
      if (this[i].isBound && this[i].errors.length === 0) {
        items.push(this[i].get());
      }
    }
    console.log('others', index, items);
    return items;
  }
}

export class ShapeManager {
  constructor(question, chain, path, name, args) {
    this.question = question;
    this.chain = chain;
    this.path = path;
    this.name = name;
    this.args = args;
    this.question.set(this.path, {});
  }

  set(values) {
    this.question.set(this.path, {});
    for (let k in values) {
      if (values.hasOwnProperty(k)) {
        if (!this.args.hasOwnProperty(k)) {
          throw new Error(`Key '${k}' is not valid for object '${this.name}'`);
        }
        let path = this.path.concat([k]);
        if (this.chain[k] === undefined) {
          this.chain[k] = new ItemManager(this.question, this, path, k, this.args[k]);
        }
        this.chain[k].set(values[k]);
      }
    }
  }
}

export class ItemManager {
  constructor(question, chain, path, name, item) {
    this.question = question,
    this.chain = chain;
    this.path = path;
    this.item = item(question, this, path);
    this.name = name;
  }

  init(value) {
    return this.item.init(value);
  }
  
  set(value) {
    return this.item.set(value);
  }

  get() {
    return this.item.get();
  }
  
  getPending() {
    return this.item.getPending();
  }

  get isBound() {
    return this.item.isBound;
  }

  _validate() {
    return this.item._validate();
  }
  
  get errors() {
    return this.item.errors || []; // TODO not sure why need || clause here
  }
}

export class Question {
  constructor(schema, { initial = {}, data = {} }) {
    this.state = {};
    this.pendNextChange = false;
    this.pendingChange = null;
    schema(this);
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
