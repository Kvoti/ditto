import { BaseItemManager } from './BaseItemManager';

export class MultiChoiceManager extends BaseItemManager {
  constructor(managedObject, parent, path, choices, options) {
    super(managedObject, parent, path, options);
    this._choices = choices;
    // TODO init([])?
    managedObject._setPathToValue(this._path, []);
  }

  add(value) {
    let values = this.get() || [];
    values.push(value);
    this.set(values);
  }

  // TODO fix superclass remove method causing problem here
  removeX(value) {
    let values = this.get() || [];
    values.splice(values.indexOf(value), 1);
    this.set(values);
  }

  _checkValue(value) {
    // TODO
  }

  _validateBoundValue() {
    let errors = super._validateBoundValue();
    const values = this.get();
    if (this._options.isRequired && this._valueIsEmpty(values)) {
      errors.push('This field is required');
    }
    values.forEach(value => {
      if (this._choices.indexOf(value) === -1) {
        errors.push(`Not a valid choice: ${value}`);
      }
    });
    return errors;
  }

  _isEmpty() {
    return this._valueIsEmpty(this.get());
  }

  _valueIsEmpty(value) {
    return !value || value.length === 0;
  }
}
