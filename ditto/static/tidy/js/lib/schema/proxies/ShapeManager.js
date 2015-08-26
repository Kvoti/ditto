import { BaseCollectionManager } from './BaseCollectionManager';

export class ShapeManager extends BaseCollectionManager {
  constructor(managedObject, parent, path, MemberManagers) {
    super(managedObject, parent, path);
    this._MemberManagers = MemberManagers;
    this._object._set(this._path, {});
    for (let k in MemberManagers) {
      if (MemberManagers.hasOwnProperty(k)) {
        if (this[k] !== undefined) {
          throw new Error(`Cannot have property named '${k}'`);
        }
        let path = this._path.concat([k]);
        this[k] = new this._MemberManagers[k](this._object, this, path, k);
      }
    }
  }

  _checkValue(value) {
    try {
      // TODO can we do a decent object check here?
      if (typeof value !== 'object') {
        throw new Error();
      }
    } catch (e) {
      throw new Error(`Value must be an object ${value}`);
    }
  }

  _setCheckedValue(values) {
    this._object._set(this._path, {});
    for (let k in values) {
      if (values.hasOwnProperty(k)) {
        if (!this._MemberManagers.hasOwnProperty(k)) {
//          debugger;
          throw new Error(`Key '${k}' is not valid for object '${this._path}'`);
        } else {
          this[k].set(values[k]);
        }
      }
    }
  }

  get _memberKeys() {
    let keys = [];
    for (let k in this) {
      if (this.hasOwnProperty(k) && k !== 'parent' && this[k] && this[k].__isManager === true) {
        keys.push(k);
      }
    }
    return keys;
  }
}
