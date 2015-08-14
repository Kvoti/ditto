import BaseManager from './BaseManager';

export class BaseCollectionManager extends BaseManager {
  init(values) {
    return this._set(values, 'init');
  }

  set(values) {
    return this._set(values, 'set');
  }
  
  preRemove() {
    this.question._removeIsBound(this.path);
    for (let k in this) {
      if (k === 'chain') {
        continue;
      }
      if (this.hasOwnProperty(k) && this[k].preRemove) {
        this[k].preRemove();
      }
    }
  }
}
