import React, { PropTypes } from 'react';
import getID from '../../../lib/id';
import DelayedInput from '../../../lib/form/DelayedInput';
import ControlErrors from '../editors/renderer/ControlErrors';

export default class Text extends React.Component {
  constructor(props) {
    super(props);
    this.ID = getID();
  }

  static propTypes = {
    question: PropTypes.string.isRequired,
    isRequired: PropTypes.bool,
    text: PropTypes.shape({
      maxChars: PropTypes.number,
      maxWords: PropTypes.number,
      isMultiline: PropTypes.bool
    }),
    value: PropTypes.string,
    errors: PropTypes.arrayOf(PropTypes.string), // TODO or null
    onChange: PropTypes.func.isRequired,
    onPendingChange: PropTypes.func.isRequired
  }

  render() {
    let control = React.DOM.input;
    if (this.props.text.isMultiline) {
      control = React.DOM.textarea;
    }
    control = control(
      {
        id: this.ID,
        className: 'form-control',
        value: this.props.value
      }
    );
    return (
      <div className="form-group">
        <label htmlFor={this.ID}>
          {this.props.question}?{this.props.isRequired ? ' *' : ' '}
        </label>
        <DelayedInput
                immediate={this.props.validateImmediately}
                onChange={this.props.onChange}
                onPendingChange={this.props.onPendingChange}
                >
          {control}
        </DelayedInput>
        <ControlErrors errors={this.props.errors}/>
      </div>
    );
  }
}
