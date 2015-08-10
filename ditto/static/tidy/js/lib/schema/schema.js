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

  set(value) {
    // if (typeof(value) !== 'string') {
    //   throw new Error('Value must be a string');
    // }
    // if (this.options.maxLength !== undefined && value.length > this.options.maxLength) {
    //   throw new Error('String is too long');
    // }
    return this.question.set(this.path, value);
  }

  get() {
    return this.question.get(this.path);
  }

  getPending() {
    return this.question.getPending(this.path);
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

  set(values) {
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
        this[i] = new ArrayItemManager(this.question, this, path, i, this.item);
      }
      this.chain[i] = this[i];
      this[i].set(v);
    });
  }

  validate() {


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
          this.chain[k] = new ArrayItemManager(this.question, this, path, k, this.args[k]);
        }
        this.chain[k].set(values[k]);
      }
    }
  }
}

export class ArrayItemManager {
  constructor(question, chain, path, name, item) {
    this.question = question,
    this.chain = chain;
    this.path = path;
    this.item = item(question, this, path);
    this.name = name;
  }

  set(value) {
    this.item.set(value);
  }
}

export class Question {
  constructor(schema) {
    this.state = {};
    this.pendNextChange = false;
    this.pendingChange = null;
    schema(this);
  }

  set(path, value) {
    if (this.pendNextChange) {
      if (this.pendingChange) {
        throw new Error('Cannot pend more than one change');
      }
      this.pendingChange = { path, value };
      return this;
    } else {
      if (this.pendingChange &&
          !_.isEqual(path, this.pendingChange.path)) {
        throw new Error('Cannot change other state while change is pending');
      }
      this._set(path, value);
      this.pendingChange = null;
      this.pendNextChange = false;
    }
  }
  
  _set(path, value) {
    let state = this.state;
    path.slice(0, path.length - 1).forEach(p => {
      state = state[p];
    });
    state[path[path.length - 1]] = value;
  }

  get(path) {
    let state = this.state;
    path.forEach(p => {
      state = state[p];
    });
    return state;
  }

  getPending(path, value) {
    if (_.isEqual(path, this.pendingChange.path)) {
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

}
