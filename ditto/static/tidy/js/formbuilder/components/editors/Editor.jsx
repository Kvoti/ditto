import React from 'react';
import _ from 'lodash';  // TODO switch to ImmutableJS?

import Renderer from './Renderer';

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
    let question = schema.Question.fromState(
      textSchema,
      this.state.config,
      (newState) => {
        this.setState({config: newState});
      }
    );
    return (
      <div className="well form-horizontal">
        <Renderer question={question} />
        {this._renderSave(question)} {this._renderCancel(question)}
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

  _save = () => {
    this.props.onSave(this.state.config.questionSpec);
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
