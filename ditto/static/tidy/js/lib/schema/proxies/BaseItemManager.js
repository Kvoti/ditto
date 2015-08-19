import BaseManager from './BaseManager';
import { ArrayManager } from './ArrayManager';

export class BaseItemManager extends BaseManager {
  // private methods
  _setCheckedValue(value) {
    if (!this.question.pendNextChange) {
      if (this.options.isRequired || !this.valueIsEmpty(value)) {
        this.isBound = true;
      }
    }
    return this.question.set(this.path, value);
  }

  preRemove() {
    this.question._removeIsBound(this.path);
    this.question._removeErrors(this.path);
  }

  _validateBoundValue() {
    // TODO only relevant for array item?
    if (this.options.unique) {
      return this._validateUnique();
    }
    return [];
  }

  _validateUnique() {
    if (this.isEmpty()) {
      return [];
    }
    let value = this.get();
    let parent = this.parent;
    let others = [];
    for (;;) {
      if (parent instanceof ArrayManager) {
        break;
      }
      parent = parent.parent;
    }
    let index = this.path[parent.path.length];
    for (let k in parent._memberKeys) {
        if (parseInt(k, 10) !== index) {
          let sibling = this._getSibling(parent, k);
          if (sibling.isBound) {
            others.push(sibling.get());
          }
      }
    }

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
