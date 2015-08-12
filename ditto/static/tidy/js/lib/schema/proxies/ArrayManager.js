import _ from 'lodash';

import { MemberManager } from './MemberManager';

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
        this[i] = new MemberManager(this.question, this, path, i, this.item);
      }
      this.chain[i] = this[i];
      this[i][method](v);
    });
    return this.question;
  }

  _validate() {
    let errors = [];
    let others = this._getBoundOthers();
    for (let k in this) {
      if (k === 'chain') {
        continue;
      }
      if (this.hasOwnProperty(k) && this[k] instanceof MemberManager) {
        let item = this[k];
        //console.log('comparing', this[k].get(), others);
        for (let i = 0; i < others.length; i += 1) {
          if (i !== parseInt(k) && _.isEqual(item.get(), others[i])) {
            item.addError('Items must be unique');
            break;
          }
        }
      }
    }
    this.errors = errors;
  }
  
  set errors(errors) {
    return this.question._setErrors(this.path, errors);

  }
  
  get errors() {
    return this.question._getErrors(this.path);
  }

  _getBoundOthers() {
    let items = [];
    for (let k in this) {
      if (k === 'chain') {
        continue;
      }
      if (this.hasOwnProperty(k) && this[k] instanceof MemberManager) {
        this[k]._validate();
//        console.log('validating', this.path, k);
//        if (this[k].isBound && this[k].errors.length === 0) {
          items.push(this[k].get());
  //      }
      }
    }
    return items;
  }
}
