import React from 'react';
import classNames from 'classnames';
import Tooltip from 'react-bootstrap/lib/Tooltip';

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
      <div className={wrapperClassNames} style={{position: 'relative'}}>
        {errors && errors.map((e) => <div style={{position: 'relative', top: -25}}><Tooltip placement="top" key={e}>{e}</Tooltip></div>)}
        <input
                className={props.type !== 'checkbox' ? 'form-control' : null}
                {...props}
                size={String(this.props.value).length}
        />
        <span>
          {validationIcon ? <span className={glyphClassNames} aria-hidden="true"></span> : null}
          {validationIcon ? <span id={id} className="sr-only">({validationStatus})</span> : null}
        </span>
      </div>
    );
  }
}
