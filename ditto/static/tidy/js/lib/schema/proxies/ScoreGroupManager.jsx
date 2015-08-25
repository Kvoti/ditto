// TODO _possibly_ this could be implemented out of CompositionManager
import { BaseItemManager } from './BaseItemManager';

export class ScoreGroupManager extends BaseItemManager {
  constructor(managedObject, parent, path, labels, noOfItems, options) {
    super(managedObject, parent, path, options);
    this._labels = labels;
    this._noOfItems = noOfItems;
    // TODO init([])?
    let empty = [];
    managedObject._setPathToValue(this._path, empty);
  }

  setChoice(i, value) {
    let values = this.get();
    values[i] = value;
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
    values.forEach(v => {
      if (this._labels.indexOf(v) === -1) {
        errors.push(`Not a valid choice: ${v}`);
      }
    });
    return errors;
  }

  _isEmpty() {
    return this._valueIsEmpty(this.get());
  }

  _valueIsEmpty(value) {
    return value.every(v => v === '');
  }
}
