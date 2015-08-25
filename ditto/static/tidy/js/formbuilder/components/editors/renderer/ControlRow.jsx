import React, { PropTypes } from 'react';
import { controlRowErrorClassNames } from './utils';

import Control from './Control';
import ControlErrors from './ControlErrors';

export default class ControlRow extends React.Component {
  static propTypes = {
      ...Control.PropTypes,
    orderingIndex: PropTypes.number
  }

  render() {
    let { orderingIndex, ...controlProps } = this.props;
    return (
      <div
              draggable={orderingIndex !== undefined}
              className={controlRowErrorClassNames(controlProps.errors, {'form-group': true})}
              >
        <label className="control-label col-md-4" htmlFor={controlProps.id}>
          <span>
            {this._toLabel(this.props.name)}
            {this.props.isRequired ? ' *' : null}
          </span>
        </label>
        <div className="col-md-8">
          <Control {...controlProps} />
          <ControlErrors errors={controlProps.errors} />
        </div>
      </div>
    );
  }

  _toLabel(name) {
    name = name.replace(/([A-Z])/, (m, p1) => ' ' + p1.toLowerCase());
    name = name.replace(/^([a-z])/, (m, p1) => ' ' + p1.toUpperCase());
    return name;
  }
}
