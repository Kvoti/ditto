import React, { PropTypes } from 'react';
import classNames from 'classnames';

import getID from '../id.js';

export default class ValidationStatus extends React.Component {
  constructor(props) {
    super(props);
    this.id = getID();
  }

  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string)
  }

  render() {
    let validationStatus;
    if (this.props.errors !== null) {
      validationStatus = this.props.errors.length ? 'error' : 'success';
    }
    let wrapperClassNames = classNames(
      'form-group',
      {
        'has-feedback': validationStatus,
        [`has-${validationStatus}`]: validationStatus
      }
    );
    return (
      <div draggable={true} lassName={wrapperClassNames}>
        {this.props.children}
      </div>
    );
  }
}
