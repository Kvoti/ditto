import React from 'react';

import getID from '../../../lib/id';
import ValidationStatus from '../../../lib/form/ValidationStatus';
import ValidatedControl from './ValidatedControl';

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
    let control = React.cloneElement(
      this.props.children[1],
      {
        id: this.id,
        className: 'form-control',
      }
    );
    return (
      <ValidationStatus
              errors={this.props.errors}
              >
        {label}
        <div className="col-md-8">
          <ValidatedControl
                  errors={this.props.errors}
                  >
            {control}
          </ValidatedControl>
        </div>
      </ValidationStatus>
    );
  }
}
