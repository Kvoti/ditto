import { BaseCollectionManager } from './BaseCollectionManager';

export class ArrayManager extends BaseCollectionManager {
  constructor(question, parent, path, key, MemberManager, options) {
    super(question, parent, path, key, options);
    this.key = key;
    this.MemberManager = MemberManager;
    this.question.set(this.path, []);
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
    this._setIndex(array.length - 1, value);
    //this.question._validate();
    if (this.options.postAdd) {
      this.options.postAdd.call(this.question, this[array.length - 1], value);
    }
  }

  reorder(indices) {
    let reordered = [];
    indices.forEach((origIndex, index) => {
      reordered.push(this[origIndex].get());
      this[index].preRemove();
    });
    this.set(reordered);
    if (this.options.postReorder) {
      this.options.postReorder.call(this.question, indices);
    }
    //this.question._validate();
  }

  // private methods
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

  _remove(index) {
    // TODO details of storage should all live with Question as an array
    // _might_ be stored as a real Array or an ImmutableJS array or object
    // or something else entirely.
    let array = this.get();
    array.splice(index, 1);
    this[index].preRemove();
    this.set(array);
    this.errors = [];
    if (this.options.postRemove) {
      this.options.postRemove.call(this.question, index);
    }
    //this.question._validate();
  }

  canReorderItems() {
    return this.options.canReorder;
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
    this.question.set(this.path, []);
    values.forEach((v, i) => {
      this._setIndex(i, v);
    });
    return this.question;
  }

  _setIndex(i, v) {
    let path = this.path.concat([i]);
    if (this[i] === undefined) {
      // TODO init or set!
      this[i] = new this.MemberManager(this.question, this, path, i);
    }
    this[i].set(v);
  }

  get _memberKeys() {
    let keys = [];
    for (let k in this) {
      if (this.hasOwnProperty(k) && k !== 'parent' && this[k] && this[k].__isManager === true) {
        keys.push(k);
      }
    }
    keys.sort();
    return keys;
  }
}
