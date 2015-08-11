import React from 'react';

import getID from '../../../lib/id';
import ValidationStatus from '../../../lib/form/ValidationStatus';
// TODO fix for when we're wrapping select or textarea or something
import ValidatedInput from './ValidatedInput';

export default class Row extends React.Component {
  constructor(props) {
    super(props);
    this.id = getID();
  }
  
  static defaultProps = {
    errors: null
  }
  
  render() {
    let label = React.cloneElement(
      this.props.children[0],
      {
        className: 'control-label col-md-4',
        htmlFor: this.id
      }
    );
    let controlProps = {
      ...this.props.children[1].props,
      id: this.id,
      className: 'form-control',
      errors: this.props.errors
    };
    return (
      <ValidationStatus
              errors={this.props.errors}
              >
        {label}
        <div className="col-md-8">
          <ValidatedInput {...controlProps}/>
        </div>
      </ValidationStatus>
    );
  }
}
