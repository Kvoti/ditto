import BaseManager from './BaseManager';

export class BaseCollectionManager extends BaseManager {
  get members() {
    let members = [];
    this._memberKeys.forEach(k => members.push([k, this[k]]));
    return members;
  }

  // private methods
  _removeMembers() {
    this._memberKeys.forEach(k => {
      this[k]._preRemove();
      delete this[k];
    });
  }

  _preRemove() {
    this._object._removeIsBound(this._path);
    this._object._removeErrors(this._path);
    this._memberKeys.forEach(k => {
      if (this[k]._preRemove) {
        this[k]._preRemove();
      }
    });
  }

  _validate() {
    this._memberKeys.forEach(k => {
      this[k]._validate();
    });
    this.errors = [];
  }
}
