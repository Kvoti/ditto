import React, { PropTypes } from 'react';
import getID from '../../../lib/id';
import DelayedInput from '../../../lib/form/DelayedInput';
import ControlErrors from '../editors/renderer/ControlErrors';
import ControlValidationIcon from '../editors/renderer/ControlValidationIcon';
import { controlRowErrorClassNames } from '../editors/renderer/utils';

export default class Text extends React.Component {
  constructor(props) {
    super(props);
    this.ID = getID();
  }

  render() {
    let question = this.props.question;
    let answer = this.props.value;
    let control = React.DOM.input;
    if (question.text.isMultiline.get()) {
      control = React.DOM.textarea;
    }
    control = control(
      {
        id: this.ID,
        className: 'form-control',
        value: answer.get()
      }
    );
    // TODO use ControlRow here? Same markup, just need ControlRow to be able to wrap a control
    return (
      <div
              className={controlRowErrorClassNames(answer.errors, {'form-group': true})}
              >
        <label
                htmlFor={this.ID}
                className='control-label'
                >
          {question.question.get()}?{question.isRequired.get() ? ' *' : ' '}
        </label>
        <div style={{position: 'relative'}}>
          <DelayedInput
                  immediate={answer.isBound}
                  onChange={(v) => answer.set(v)}
                  onPendingChange={(v) => answer.pend().set(v)}
                  >
            {control}
          </DelayedInput>
          <ControlValidationIcon controlID={this.ID} errors={answer.errors} />
        </div>
        <ControlErrors errors={answer.errors} />
      </div>
    );
  }
}
