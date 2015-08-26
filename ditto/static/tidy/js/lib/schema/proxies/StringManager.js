import { BaseItemManager } from './BaseItemManager';

export class StringManager extends BaseItemManager {
  _checkValue(value) {
    if (typeof value !== 'string') {
      throw new Error(`Value must be a string: ${value}`);
    }
  }

  _validateBoundValue() {
    let errors = super._validateBoundValue();
    const value = this.get();
    if (this._options.isRequired && this._isEmpty()) {
      errors.push('This field is required');
    }
    if (this._options.maxLength !== undefined && value.length > this._options.maxLength) {
      errors.push('String is too long');
    }
    return errors;
  }

  _isEmpty() {
    return this._valueIsEmpty(this.get());
  }

  _valueIsEmpty(value) {
    return value === '' || value === undefined;
  }
}
