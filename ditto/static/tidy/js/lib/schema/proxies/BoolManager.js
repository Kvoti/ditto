import { BaseItemManager } from './BaseItemManager';

export class BoolManager extends BaseItemManager {
  _checkValue(value) {
    if (typeof value !== 'boolean') {
      throw new Error(`Value must be a boolean: ${this._path} ${value}`);
    }
  }

  _validateBoundValue() {
    let errors = [];
    if (this._options.isRequired && this._isEmpty()) {
      errors.push('This field is required');
    }
    return errors;
  }

  _isEmpty() {
    return !this.get();
  }

  _valueIsEmpty(value) {
    return value;
  }
}
