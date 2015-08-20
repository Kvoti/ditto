import React, { PropTypes } from 'react';
import classNames from 'classnames';

export default class ControlValidationIcon extends React.Component {
  static propTypes = {
    controlID: PropTypes.string.isRequired,
    errors: PropTypes.oneOfType([
      null,
      PropTypes.arrayOf(PropTypes.string)
    ])
  }

  render() {
    let errors = this.props.errors;
    let validationIcon;
    let validationStatus;
    if (errors !== null) {
      validationIcon = errors.length ? 'remove' : 'ok';
      validationStatus = errors.length ? 'error' : 'success';
    }
    let glyphClassNames = classNames(
      'glyphicon',
      'form-control-feedback',
      `glyphicon-${validationIcon}`
    );
    let id = `inputStatus-${this.props.controlID}`;
    return (
      <span>
        {validationIcon ? <span className={glyphClassNames} aria-hidden="true"></span> : null}
        {validationIcon ? <span id={id} className="sr-only">({validationStatus})</span> : null}
      </span>
    );
  }
}
