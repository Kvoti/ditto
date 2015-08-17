import { BaseCollectionManager } from './BaseCollectionManager';

export class ShapeManager extends BaseCollectionManager {
  constructor(question, parent, path, key, MemberManagers) {
    super(question, parent, path, key);
    this.MemberManagers = MemberManagers;
    this.question.set(this.path, {});
    this.options = {};
  }

  _checkValue(values) {
    try {
      // TODO can we do a decent object check here?
      if (typeof values !== 'object') {
        throw new Error();
      }
    } catch (e) {
      throw new Error(`Values must be iterable ${values}`);
    }
  }
  
  _setCheckedValue(values) {
    this.question.set(this.path, {});
    for (let k in values) {
      if (values.hasOwnProperty(k)) {
        if (!this.MemberManagers.hasOwnProperty(k)) {
          throw new Error(`Key '${k}' is not valid for object '${this.name}'`);
        }
        let path = this.path.concat([k]);
        if (this[k] === undefined) {
          this[k] = new this.MemberManagers[k](this.question, this, path, k);
        }
        this[k].set(values[k]);
      }
    }
  }

  get _memberKeys() {
    let keys = [];
    for (let k in this) {
      if (this.hasOwnProperty(k) && k !== 'parent' && this[k].__isManager === true) {
        keys.push(k);
      }
    }
    return keys;
  }
}
