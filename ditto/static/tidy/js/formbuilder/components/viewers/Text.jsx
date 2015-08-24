import React, { PropTypes } from 'react';
import getID from '../../../lib/id';
import * as schema from '../../../lib/schema/schema';
import DelayedInput from '../../../lib/form/DelayedInput';
import ControlErrors from '../editors/renderer/ControlErrors';

export default class Text extends React.Component {
  constructor(props) {
    super(props);
    this.ID = getID();
    this.init(props);
  }

  init(props) {
    let value = new schema.ManagedObject(
      schema.string({
        // TODO decide on length vs chars
        maxLength: props.text.maxChars === null ? undefined : props.text.maxChars,
        isRequired: props.isRequired
      }),
      {
        onChange: () => this.forceUpdate()
      }
    );
    if (this.state) {
      value.managed.set(this.state.value.managed.get()
          // TODO not sure why I need this
          || '');
    }
    this.state = {
      value
    };
  }

  static propTypes = {
    question: PropTypes.string.isRequired,
    isRequired: PropTypes.bool,
    text: PropTypes.shape({
      maxChars: PropTypes.number,
      maxWords: PropTypes.number,
      isMultiline: PropTypes.bool
    })
  }

  componentWillReceiveProps(newProps) {
    this.init(newProps);
  }

  render() {
    console.log('errors', this.state.value.managed.errors, 'bound?', this.state.value.managed.isBound);
    let control = React.DOM.input;
    if (this.props.text.isMultiline) {
      control = React.DOM.textarea;
    }
    control = control(
      {
        id: this.ID,
        className: 'form-control',
        value: this.state.value.managed.get()
      }
    );
    return (
      <div className="form-group">
        <label htmlFor={this.ID}>
          {this.props.question}?{this.props.isRequired ? ' *' : ' '}
        </label>
        <DelayedInput
                immediate={this.state.value.managed.isBound}
                onChange={(v) => this.state.value.managed.set(v)}
                onPendingChange={(v) => this.state.value.managed.pend().set(v)}
                >
          {control}
        </DelayedInput>
        <ControlErrors errors={this.state.value.managed.errors}/>
      </div>
    );
  }
}
