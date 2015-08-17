export class MemberManager {
  constructor(question, chain, path, name, item, method) {
    this.question = question;
    this.chain = chain;
    this.path = path;
    this.item = item(question, this, path, method);
    this.name = name;
    this.options = this.item.options;
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
  
  set isBound(value) {
    this.item.isBound = value;
  }

  _validate() {
    return this.item._validate();
  }

  get errors() {
    return this.item.errors || []; // TODO not sure why need || clause here
  }

  addError(e) {
    this.item.addError(e);
  }

  preRemove() {
    this.item.preRemove();
  }

  add(value) {
    this.item.add(value);
  }

  isEmpty(value) {
    return this.item.isEmpty();
  }
  
  // canReorder() {
  //   debugger;
  //   return (this.chain &&
  //           this.chain.canReorderItems &&
  //           this.chain.canReorderItems());
  // }
  
}
