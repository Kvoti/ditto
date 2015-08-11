export default class MemberManager {
  constructor(question, chain, path, name, item) {
    this.question = question;
    this.chain = chain;
    this.path = path;
    this.item = item(question, this, path);
    this.name = name;
  }

  init(value) {
    return this.item.init(value);
  }

  set(value) {
    return this.item.set(value);
  }

  get() {
    return this.item.get();
  }

  getPending() {
    return this.item.getPending();
  }

  get isBound() {
    return this.item.isBound;
  }

  _validate() {
    return this.item._validate();
  }

  get errors() {
    return this.item.errors || []; // TODO not sure why need || clause here
  }
}
