import { BaseCollectionManager } from './BaseCollectionManager';

export class ArrayManager extends BaseCollectionManager {
  constructor(question, parent, path, MemberManager, options) {
    super(question, parent, path, options);
    this._MemberManager = MemberManager;
    this._object._set(this._path, []);
  }

  canAdd() {
    if (this._options.canAdd === undefined) {
      return false;
    }
    if (this._options.maxLength === undefined) {
      return true;
    }
    let length = this.get().length;
    return length < this._options.maxLength;
  }

  add(value, manager) {
    if (value === undefined) {
      value = this._options.empty;
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
    this._setIndex(array.length - 1, value, manager);
    //this._object._validate();
    if (this._options.postAdd) {
      this._options.postAdd.call(this._object.managed, this[array.length - 1], value);
    }
  }

  reorder(indices) {
    console.log('reordering', indices, this._path, this);
    let reordered = [];
    indices.forEach((origIndex, index) => {
      reordered.push(this[origIndex].get());
      this[index]._preRemove();
    });
    this.set(reordered);
    if (this._options.postReorder) {
      this._options.postReorder.call(this._object.managed, indices);
    }
    //this._object._validate();
  }

  // private methods
  // TODO maybe these 'can' methods are UI things?
  canRemoveItems() {
    if (this._options.canRemove === undefined) {
      return false;
    }
    let length = this.get().length;
    if (length &&
        (this._options.minLength === undefined ||
         this._options.minLength < length)) {
      return true;
    }
    return false;
  }

  _remove(index) {
    // TODO details of storage should all live with Question as an array
    // _might_ be stored as a real Array or an ImmutableJS array or object
    // or something else entirely.
    let array = this.get();
    array.splice(index, 1);
    this[index]._preRemove();
    this._removeMembers();
    this.set(array);
    this._errors = [];
    if (this._options.postRemove) {
      this._options.postRemove.call(this._object.managed, index);
    }
    //this._object._validate();
  }

  canReorderItems() {
    return this._options.canReorder;
  }

  _checkValue(values) {
    try {
      if (values.push === undefined) {
        throw new Error();
      }
    } catch (e) {
      throw new Error(`Values must be iterable ${values}`);
    }
  }

  _setCheckedValue(values) {
    this._object._set(this._path, []);
    values.forEach((v, i) => {
      this._setIndex(i, v);
    });
    return this._object;
  }

  _setIndex(i, v, Manager) {
    if (this._options.getMemberManager) {
      Manager = this._options.getMemberManager(v);
    } else if (Manager === undefined) {
      Manager = this._MemberManager;
    }
    let path = this._path.concat([i]);
    this[i] = new Manager(this._object, this, path, i);
    this[i].set(v);
  }

  get _memberKeys() {
    let keys = [];
    for (let k in this) {
      if (this.hasOwnProperty(k) && k !== '_parent' && this[k] && this[k].__isManager === true) {
        keys.push(k);
      }
    }
    keys.sort();
    return keys;
  }
}
