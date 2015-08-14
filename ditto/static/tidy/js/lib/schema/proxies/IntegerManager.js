import { BaseItemManager } from './base';

export class IntegerManager extends BaseItemManager {
  _checkValue(value) {
    // if (typeof value !== 'integer') {
    //   throw new Error(`Value must be a integer: ${value}`);
    // }
  }

  _validateBoundValue() {
    let value = this.get();
    let errors = [];
    //console.log('value', value);
    if (this.options.isRequired && value === null) {
      errors.push('This field is required');
    }
    if (value !== null) {
      let parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) {
        errors.push('Please enter an integer');
      } else {
        if (this.options.max && value > this.options.max) {
          errors.push(`Maximum allowed value is ${this.options.max}`);
        }
      }
    }
    //console.log('errors', errors);
    return errors;
  }

  isEmpty() {
    return this.get() === null;
  }

}
