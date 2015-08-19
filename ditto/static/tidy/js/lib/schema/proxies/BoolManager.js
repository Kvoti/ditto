import { BaseItemManager } from './BaseItemManager';

export class BoolManager extends BaseItemManager {
  _checkValue(value) {
    if (typeof value !== 'boolean') {
      throw new Error(`Value must be a boolean: ${this._path} ${value}`);
    }
  }

  _validateBoundValue() {
    const value = this.get();
    let errors = [];
    if (this._options.isRequired && value === false) {
      errors.push('This field is required');
    }
    return errors;
  }

  isEmpty() {
    return !this.get();
  }

  valueIsEmpty(value) {
    return value;
  }
}
