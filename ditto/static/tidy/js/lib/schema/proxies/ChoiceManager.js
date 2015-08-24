import { BaseItemManager } from './BaseItemManager';

export class ChoiceManager extends BaseItemManager {
  constructor(managedObject, parent, path, choices, options) {
    super(managedObject, parent, path, options);
    this._choices = choices;
  }

  _checkValue(value) {
    // TODO
  }

  _validateBoundValue() {
    let errors = super._validateBoundValue();
    const value = this.get();
    if (this._options.isRequired && this._valueIsEmpty(value)) {
      errors.push('This field is required');
    }
    if (!this._isEmpty() && this._choices.indexOf(value) === -1) {
      errors.push(`Not a valid choice: ${value}`);
    }
    return errors;
  }

  _isEmpty() {
    return this._valueIsEmpty(this.get());
  }

  _valueIsEmpty(value) {
    return value === '';
  }
}
