import BaseManager from './BaseManager';
import { ArrayManager } from './ArrayManager';

export class BaseItemManager extends BaseManager {
  // private methods
  _setCheckedValue(value) {
    if (!this._object._pendNextChange) {
      if (this._options.isRequired || !this._valueIsEmpty(value)) {
        this.isBound = true;
      }
    }
    return this._object._set(this._path, value);
  }

  _preRemove() {
    this._object._removeIsBound(this._path);
    this._object._removeErrors(this._path);
  }

  _validateBoundValue() {
    // TODO only relevant for array item?
    if (this._options.unique) {
      return this._validateUnique();
    }
    return [];
  }

  _validateUnique() {
    if (this._isEmpty()) {
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
    let index = this._path[parent._path.length];
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
    let index = parent._path.length;
    let path = [...this._path];
    path[index] = i;
    path = path.slice(index);
    let sibling = parent;
    path.forEach(p => sibling = sibling[p]);
    return sibling;
  }
}
