import MemberManager from './MemberManager';

export class ShapeManager {
  constructor(question, chain, path, name, args) {
    this.question = question;
    this.chain = chain;
    this.path = path;
    this.name = name;
    this.args = args;
    this.question.set(this.path, {});
  }

  init(values) {
    return this._set(values, 'init');
  }

  set(values) {
    return this._set(values, 'set');
  }

  _set(values, method) {
    this.question.set(this.path, {});
    for (let k in values) {
      if (values.hasOwnProperty(k)) {
        if (!this.args.hasOwnProperty(k)) {
          throw new Error(`Key '${k}' is not valid for object '${this.name}'`);
        }
        let path = this.path.concat([k]);
        if (this[k] === undefined) {
          this[k] = new MemberManager(this.question, this, path, k, this.args[k]);
        }
        this.chain[k] = this[k];
        this[k][method](values[k]);
      }
    }
  }

  _validate() {
    for (let k in this) {
      if (this.hasOwnProperty(k) && this[k] instanceof MemberManager && this[k].isBound) {
        this[k]._validate();
      }
    }
    this.errors = [];
  }
}
