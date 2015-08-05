import React, { PropTypes } from 'react';
import classNames from 'classnames';

import getID from '../id.js';

export default class ValidationStatus extends React.Component {
  constructor(props) {
    super(props);
    this.id = getID();
  }

  static propTypes = {
    label: PropTypes.string.isRequired,
    errors: PropTypes.arrayOf(PropTypes.string)
  }

  render() {
    let validationIcon;
    let validationStatus;
    if (this.props.errors !== null) {
      validationIcon = this.props.errors.length ? 'remove' : 'ok';
      validationStatus = this.props.errors.length ? 'error' : 'success';
    }
    let wrapperClassNames = classNames(
      'form-group',
      {
        'has-feedback': validationStatus,
        [`has-${validationStatus}`]: validationStatus
      }
    );
    let glyphClassNames = classNames(
      'glyphicon',
      'form-control-feedback',
      `glyphicon-${validationIcon}`
    );
    let aria = `inputStatus-${this.props.id}`;
    let clone = React.cloneElement(
      this.props.children,
      {
        'id': this.props.id,
        'aria-describedby': aria
      }
    );

    return (
      <div className={wrapperClassNames}>
        <label className="control-label" htmlFor={this.id}>{this.props.label}</label>
        {clone}
        {validationIcon ? <span className={glyphClassNames} aria-hidden="true"></span> : null}
        {validationIcon ? <span id={aria} className="sr-only">({validationStatus})</span> : null}
        {this.props.errors && this.props.errors.map((e) => <p key={e} className="help-block">{e}</p>)}
      </div>
    );
  }
}
