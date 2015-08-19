import BaseManager from './BaseManager';

export class BaseCollectionManager extends BaseManager {
  get members() {
    let members = [];
    this._memberKeys.forEach(k => members.push([k, this[k]]));
    return members;
  }

  // private methods
  removeMembers() {
    this._memberKeys.forEach(k => {
      this[k].preRemove();
      delete this[k];
    });
  }

  preRemove() {
    this.question._removeIsBound(this.path);
    this.question._removeErrors(this.path);
    this._memberKeys.forEach(k => {
      if (this[k].preRemove) {
        this[k].preRemove();
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
