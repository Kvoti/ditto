import React from 'react';
import _ from 'lodash';  // TODO switch to ImmutableJS?

import DelayedControl from '../../../lib/form/DelayedControl';
import TextEditor from './Text';
/* import ChoiceEditor from './Choice';
   import ScoreGroupEditor from './ScoreGroup'; */
import Row from './Row';
import * as schema from '../../../lib/schema/schema';

const textSchema = {
  question: schema.string({isRequired: true}),
  isRequired: schema.bool(),
  text: schema.shape({
    isMultiline: schema.bool(),
    maxChars: schema.integer({max: 100}),
    maxWords: schema.integer({
      validate: function validateMaxWords() {
        let errors = [];
        if (!this.question.text.isMultiline.get() && this.get()) {
          errors.push("Can't specify max words if question is not multiline");
        }
        return errors;
      }
    })
  })
};

export default class Question extends React.Component {
  static defaultProps = {
    question: '',
    isRequired: false
  }

  constructor(props) {
    super(props);
    let questionConfig = new schema.Question(
      textSchema,
      {
        data: this.props
      }
    );
    this.state = {
      origSpec: questionConfig.toState().questionSpec,
      config: questionConfig.toState(),
      isCancelling: false
    };
  }

  _copyProps() {
    return _.cloneDeep(this.props);
  }

  render() {
    let editor;
    let editorProps;
    console.log('unpacking from state');
    let questionConfig = schema.Question.fromState(
      textSchema,
      this.state.config,
      (newState) => {
        this.setState({config: newState});
        }
    );
    if (this.state.config.questionSpec.text) {
      editor = TextEditor;
      editorProps = {
            ...this.state.config.questionSpec.text, // TODO question.get()!
        onChangeMaxChars: (v) => questionConfig.text.maxChars.set(v),
        onChangeMaxWords: (v) => questionConfig.text.maxWords.set(v),
        onChangeIsMultiline: (v) => {
          console.log('clicked!');
          questionConfig.text.isMultiline.set(v);
        },
        errors: {
          maxChars: questionConfig.text.maxChars.errors,
          maxWords: questionConfig.text.maxWords.errors
        }
      };
    } else {
      return null;
    }
    console.log('question errors', questionConfig.question.errors);
    return (
      <div style={{border: '1px solid black'}} className="form-horizontal">
        <Row errors={questionConfig.question.errors}>
          <label>Question text</label> 
          <DelayedControl
                  immediate={questionConfig.question.isBound}
                  onChange={(v) => questionConfig.question.set(v)}
                  onPendingChange={(v) => questionConfig.pend().question.set(v)}
                  >
            <input
                    autoFocus={true}
                    type="text"
                    value={questionConfig.question.getPendingOrCurrent()}
            />
          </DelayedControl>
        </Row>
        <Row>
          <label>
            Is required?
          </label>
          <input
                  type="checkbox"
                  checked={questionConfig.isRequired.get()}
                  onChange={(e) => questionConfig.isRequired.set(e.target.checked)}
          />
        </Row>
        {editor ? React.createElement(editor, editorProps) : null}
        {this._renderSave(questionConfig)} {this._renderCancel(questionConfig)}
      </div>
    );
  }

  _renderSave(questionConfig) {
    if (questionConfig.isChanged(this.state.origSpec) && questionConfig.isValid()) {
      return (
        <button
                className="btn btn-success"
                onClick={this._save}
                >
          Save
        </button>
      );
    }
    return null;
  }

  _save = () => {
    this.props.onSave(this.state.config.questionSpec);
  }
  
  _renderCancel(questionConfig) {
    if (!this.state.isCancelling) {
      return (
        <button
                className="btn btn-default"
                onClick={questionConfig.isChanged(this.state.origSpec) ? this._confirmCancel : this._cancel}
                >
          Cancel
        </button>
      );
    }
    return (
      <div>
        <p>You have unsaved changes, are you sure you want to cancel?</p>
        <button
                className="btn btn-danger"
                onClick={this._cancel}
                >
          Yes
        </button>
        {' '}
        <button
                className="btn btn-success"
                onClick={this._cancelCancel}
                >
          No
        </button>
      </div>
    );
  }

  _confirmCancel = () => {
    let change = {isCancelling: {$set: true}};
    this.setState(
      React.addons.update(this.state, change)
    );
  }

  _cancel = () => {
    this.props.onCancel();
    this._cancelCancel();
  }

  _cancelCancel = () => {
    let change = {isCancelling: {$set: false}};
    this.setState(
      React.addons.update(this.state, change)
    );
  }
}
