import React, { PropTypes } from 'react';
import classNames from 'classnames';

import getID from '../../../lib/id';

export default class ValidatedInput extends React.Component {
  constructor(props) {
    super(props);
    this.id = getID();
  }

  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.string)
  }

  render() {
    let { errors, ...inputProps } = this.props;
    let validationIcon;
    let validationStatus;
    if (this.props.errors !== null) {
      validationIcon = this.props.errors.length ? 'remove' : 'ok';
      validationStatus = this.props.errors.length ? 'error' : 'success';
    }
    let glyphClassNames = classNames(
      'glyphicon',
      'form-control-feedback',
      `glyphicon-${validationIcon}`
    );
    let aria = `inputStatus-${this.props.id}`;
    return (
      <div>
        {this.props.children}
        {validationIcon ? <span className={glyphClassNames} aria-hidden="true"></span> : null}
        {validationIcon ? <span id={aria} className="sr-only">({validationStatus})</span> : null}
        {this.props.errors && this.props.errors.map((e) => <p key={e} className="help-block">{e}</p>)}
      </div>
    );
  }
}
