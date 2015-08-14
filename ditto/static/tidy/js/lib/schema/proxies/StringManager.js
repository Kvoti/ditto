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
    if (this.options.isRequired && value === '') {
      errors.push('This field is required');
    }
    if (this.options.maxLength !== undefined && value.length > this.options.maxLength) {
      errors.push('String is too long');
    }
    return errors;
  }

  isEmpty() {
    return this.valueIsEmpty(this.get());
  }

  valueIsEmpty(value) {
    return value === '';
  }
}
