import React from 'react';
import classNames from 'classnames';

export default class Input extends React.Component {
  render() {
    let { errors, ...props } = this.props;
    let validationStatus;
    let validationIcon;
    if (errors !== null) {
      validationStatus = this.props.errors.length ? 'error' : 'success';
      validationIcon = errors.length ? 'remove' : 'ok';
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
    let id = `inputStatus-${this.props.controlID}`;
    return (
      <div className={wrapperClassNames}>
        <input
                className={props.type !== 'checkbox' ? 'form-control' : null}
                {...props}
        />
        <span>
          {validationIcon ? <span className={glyphClassNames} aria-hidden="true"></span> : null}
          {validationIcon ? <span id={id} className="sr-only">({validationStatus})</span> : null}
        </span>
	{errors && errors.map((e) => <p key={e} className="help-block">{e}</p>)}
      </div>
    );
  }
}
