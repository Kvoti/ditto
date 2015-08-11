import MemberManager from './MemberManager';

export class ArrayManager {
  constructor(question, chain, path, name, item, options) {
    this.question = question;
    this.chain = chain;
    this.path = path;
    this.name = name;
    this.item = item;
    this.options = options;
    this.question.set(this.path, []);
  }

  init(values) {
    return this._set(values, 'init');
  }

  set(values) {
    return this._set(values, 'set');
  }
    
  _set(values, method) {
    try {
      if (values.push === undefined) {
        throw new Error();
      }
    } catch (e) {
      throw new Error(`Values must be iterable ${values}`);
    }
    this.question.set(this.path, []);
    values.forEach((v, i) => {
      let path = this.path.concat([i]);
      if (this[i] === undefined) {
        this[i] = new MemberManager(this.question, this, path, i, this.item);
      }
      this.chain[i] = this[i];
      this[i][method](v);
    });
    return this.question;
  }

  _validate() {
    let errors = [];
    for (let k in this) {
      if (this.hasOwnProperty(k) && this[k] instanceof MemberManager && this[k].isBound) {
        let item = this[k];
        // TODO should gather items first, then do uniqueness check
        item._validate();
        let others = this._getBoundOthers(item.name);
        for (let i = 0; i < others.length; i += 1) {
          if (_.isEqual(item.get(), others[i])) {
            errors.push('Items must be unique');
            break;
          }
        }
      }
    }
    this.errors = errors;
  }

  _getBoundOthers(index) {
    let items = [];
    for (let i = 0; i < index; i += 1) {
      this[i]._validate();
      if (this[i].isBound && this[i].errors.length === 0) {
        items.push(this[i].get());
      }
    }
    console.log('others', index, items);
    return items;
  }
}
