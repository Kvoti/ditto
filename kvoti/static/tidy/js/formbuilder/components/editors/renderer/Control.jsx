import React, { PropTypes } from 'react';

import DelayedInput from '../../../../lib/form/DelayedInput';
import { Button, Glyphicon } from 'react-bootstrap';
import ControlValidationIcon from './ControlValidationIcon';

export default class Control extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['string', 'bool', 'integer']),
    errors: ControlValidationIcon.errors,
    validateImmediately: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onPendingChange: PropTypes.func,
    value: PropTypes.node.isRequired,
    onRemove: PropTypes.func
  }

  render() {
    // TODO the aria attr for validation status
    let inputType = this.props.type === 'bool' ? 'checkbox' : 'text';
    let value = {};
    if (this.props.type === 'bool') {
      value.checked = this.props.value;
    } else {
      value.value = this.props.value;
    }
    let control = (
      <div style={{position: 'relative'}}>
        <DelayedInput
		id={this.props.id}
		className="form-control"
                type={inputType}
                immediate={this.props.validateImmediately}
                onChange={this.props.onChange}
                onPendingChange={this.props.onPendingChange}
                {...value}
        />
	<ControlValidationIcon controlID={this.props.id} errors={this.props.errors}/>
      </div>
    );
    if (!this.props.onRemove) {
      return control;
    }
    return (
      <div className='input-group'>
	{control}
        <span className="input-group-btn">
          <Button onClick={this.props.onRemove}
                  bsStyle='danger'
                  ariaLabel={'Remove ' + this.props.name}
                  title={'Remove ' + this.props.name}
                  >
            <Glyphicon glyph="remove" />
          </Button>
        </span>
      </div>
    );
  }
}
