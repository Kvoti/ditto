import BaseManager from './BaseManager';
import { MemberManager } from './MemberManager';
import { ArrayManager } from './ArrayManager';

export class BaseItemManager extends BaseManager {
  constructor(question, chain, path, options) {
    super();
    this.chain = chain;
    this.question = question;
    this.path = path;
    this.options = options;
  }

  init(value) {
    this._set(value);
  }

  set(value) {
    if (!this.question.pendNextChange) {
      if (this.options.isRequired || !this.valueIsEmpty(value)) {
        console.log(this.path, 'setting bound', value);
        this.isBound = true;
      }
    }
    return this._set(value);
  }

  preRemove() {
    this.question._removeIsBound(this.path);
  }

  _validateBoundValue() {
    // TODO only relevant for array item?
    if (this.options.unique) {
      return this._validateUnique();
    }
    return [];
  }

  _validateUnique() {
    let value = this.get();
    let parent = this.chain;
    let others = [];
    for (;;) {
      if (parent instanceof ArrayManager) {
        break;
      }
      parent = parent.chain;
    }
    let index = this.path[parent.path.length];
    for (let k in parent) {
      if (parent.chain.hasOwnProperty(k) && parent.chain[k] instanceof MemberManager) {
        if (parseInt(k, 10) !== index) {
          let sibling = this._getSibling(parent, k);
          if (sibling.isBound) {
            others.push(sibling.get());
          }
        }
      }
    }
    console.log('others', others, this.isBound);
    let duplicates = [for (o of others) if (o === value) o];
    if (duplicates.length) {
      return ['This is a duplicate value'];
    }
    return [];
  }

  _getSibling(parent, i) {
    let index = parent.path.length;
    let path = [...this.path];
    path[index] = i;
    path = path.slice(index);
    let sibling = parent;
    path.forEach(p => sibling = sibling[p]);
    return sibling;
  }
}
