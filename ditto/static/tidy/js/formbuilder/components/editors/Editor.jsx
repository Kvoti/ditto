import React from 'react';
import _ from 'lodash';  // TODO switch to ImmutableJS?

import { Question as QuestionSchema } from '../../../lib/schema/schema';
import Renderer from './Renderer';

export default class Question extends React.Component {
  constructor(props) {
    super(props);
    let questionConfig = new QuestionSchema(
      props.schema,
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
    let question = QuestionSchema.fromState(
      this.props.schema,
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
