import _ from 'lodash';

import { BaseCollectionManager } from './BaseCollectionManager';
import { MemberManager } from './MemberManager';

export class ArrayManager extends BaseCollectionManager {
  constructor(question, chain, path, name, item, options, method) {
    super();
    this.question = question;
    this.chain = chain;
    this.path = path;
    this.name = name;
    this.item = item;
    this.options = options;
    this.question.set(this.path, [], method);
  }

  add(value) {
    if (value === undefined) {
      value = this.options.empty;
      if (value === undefined) {
        throw new Error("Can't add Array item with no 'empty' value");
      }
    }
    // TODO details of storage should all live with Question as an array
    // _might_ be stored as a real Array or an ImmutableJS array or object
    // or something else entirely.
    let array = this.get();
    array.push(undefined);
    if (array.length - 2 >= 0 && !this[array.length - 2].isBound) {
      this[array.length - 2].isBound = true;
    }
    this._setIndex(array.length - 1, value, 'set');
    if (this.options.postAdd) {
      this.options.postAdd.call(this.question, value);
    }
  }

  _remove(index) {
    // TODO details of storage should all live with Question as an array
    // _might_ be stored as a real Array or an ImmutableJS array or object
    // or something else entirely.
    let array = this.get();
    array.splice(index, 1);
    // TODO does this leave isBound and errors to clean up?
    this[index].preRemove();
    this.init(array);
    this.question._validate();
    debugger;
  }

  reorder(indices) {
    let reordered = [];
    indices.forEach((origIndex, index) => {
      reordered.push(this[origIndex].get());
      this[index].preRemove();
    });
    this.set(reordered);
  }

  canAdd() {
    if (this.options.canAdd === undefined) {
      return false;
    }
    if (this.options.maxLength === undefined) {
      return true;
    }
    let length = this.get().length;
    return length < this.options.maxLength;
  }

  // TODO maybe these 'can' methods are UI things?
  canRemoveItems() {
    if (this.options.canRemove === undefined) {
      return false;
    }
    let length = this.get().length;
    if (length &&
        (this.options.minLength === undefined ||
         this.options.minLength < length)) {
      return true;
    }
    return false;
  }

  canReorderItems() {
    return this.options.canReorder;
  }
  
  _set(values, method) {
    console.log('array._set method', method);
    try {
      if (values.push === undefined) {
        throw new Error();
      }
    } catch (e) {
      throw new Error(`Values must be iterable ${values}`);
    }
    this.question.set(this.path, [], method);
    values.forEach((v, i) => {
      this._setIndex(i, v, method);
    });
    return this.question;
  }

  _setIndex(i, v, method) {
    console.log('setindex method', method);
    let path = this.path.concat([i]);
    if (this[i] === undefined) {
      this[i] = new MemberManager(this.question, this, path, i, this.item, method);
    }
    this.chain[i] = this[i];
    this[i][method](v);
  }
  
  _validate() {
    for (let k in this) {
      if (k !== 'question' && k !== 'chain' && this.hasOwnProperty(k) && this[k]._validate) {
        this[k]._validate();
      }
    }
  }
  
  // _validate() {
  //   let errors = [];
  //   if (!this.options.unique) {
  //     return errors;
  //   }
  //   let others = this._getBoundOthers();
  //   for (let k in this) {
  //     if (k === 'chain') {
  //       continue;
  //     }
  //     if (this.hasOwnProperty(k) && this[k] instanceof MemberManager) {
  //       let item = this[k];
  //       for (let i = 0; i < others.length; i += 1) {
  //         if (i !== parseInt(k) && _.isEqual(item.get(), others[i])) {
  //           item.addError('Items must be unique');
  //           break;
  //         }
  //       }
  //     }
  //   }
  //   this.errors = errors;
  //   if (this.options.validate) {
  //     this.errors = this.errors.concat(this.options.validate.apply(this));
  //   }
  // }

  // _getBoundOthers() {
  //   let items = [];
  //   for (let k in this) {
  //     if (k === 'chain') {
  //       continue;
  //     }
  //     if (this.hasOwnProperty(k) && this[k] instanceof MemberManager) {
  //       this[k]._validate();
  //       if (this[k].isBound && this.isEmpty && !this.isEmpty()) {
  //         items.push(this[k].get());
  //       }
  //     }
  //   }
  //   return items;
  // }
}
