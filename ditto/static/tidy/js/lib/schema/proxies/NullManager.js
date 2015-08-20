import { BaseItemManager } from './BaseItemManager';

export class NullManager extends BaseItemManager {
  _checkValue(value) {
    if (typeof value === 'null') {
      throw new Error(`Value must be null: ${value}`);
    }
  }

  _validateBoundValue() {
    return [];
  }

  _isEmpty() {
    return this._valueIsEmpty(this.get());
  }

  _valueIsEmpty(value) {
    return value === null;
  }
}
