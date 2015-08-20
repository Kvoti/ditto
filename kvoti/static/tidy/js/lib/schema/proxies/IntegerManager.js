import { BaseItemManager } from './BaseItemManager';

export class IntegerManager extends BaseItemManager {
  _checkValue(value) {
    // if (typeof value !== 'integer') {
    //   throw new Error(`Value must be a integer: ${value}`);
    // }
  }

  _validateBoundValue() {
    let errors = super._validateBoundValue();
    let value = this.get();
    //console.log('value', value);
    if (this._options.isRequired && value === null) {
      errors.push('This field is required');
    }
    if (value !== null) {
      let parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) {
        errors.push('Please enter an integer');
      } else {
        if (this._options.max && value > this._options.max) {
          errors.push(`Maximum allowed value is ${this._options.max}`);
        }
      }
    }
    //console.log('errors', errors);
    return errors;
  }

  _isEmpty() {
    return this._valueIsEmpty(this.get());
  }

  _valueIsEmpty(value) {
    return value === null;
  }
}
