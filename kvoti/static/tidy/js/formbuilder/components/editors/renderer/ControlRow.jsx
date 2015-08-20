import React, { PropTypes } from 'react';
import classNames from 'classnames';

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
              className={this._rowClassNames(controlProps.errors)}
              >
        <label className="control-label col-md-4" htmlFor={controlProps.id}>
          <span>{this._toLabel(this.props.name)}</span>
        </label>
        <div className="col-md-8">
	  <Control {...controlProps} />
	  <ControlErrors errors={controlProps.errors} />
	</div>
      </div>
    );
  }

  _rowClassNames(errors) {
    let validationStatus;
    if (errors !== null) {
      validationStatus = errors.length ? 'error' : 'success';
    }
    return classNames(
      'form-group',
      {
        'has-feedback': validationStatus,
        [`has-${validationStatus}`]: validationStatus
      }
    );
  }

  _toLabel(name) {
    name = name.replace(/([A-Z])/, (m, p1) => ' ' + p1.toLowerCase());
    name = name.replace(/^([a-z])/, (m, p1) => ' ' + p1.toUpperCase());
    return name;
  }
}
