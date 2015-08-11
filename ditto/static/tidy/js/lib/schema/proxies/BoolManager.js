import { BaseItemManager } from './base';

export class BoolManager extends BaseItemManager {
  _checkValue(value) {
    if (typeof value !== 'boolean') {
      throw new Error('Value must be a boolean');
    }
  }

  _validateBoundValue() {
    const value = this.get();
    let errors = [];
    if (this.options.isRequired && value === false) {
      errors.push('This field is required');
    }
    return errors;
  }
}
