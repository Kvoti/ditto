import React from 'react';

// needed? import { ManagedObject } from '../../../lib/schema/schema';
import Renderer from './renderer/Renderer';
import ScoreGroup from './scoregroup/ScoreGroup';

export default class Question extends React.Component {
  state = {
      isCancelling: false
  };

  render() {
    let question = this.props.question;
    let renderer = question.scoregroup ? ScoreGroup : Renderer;
    let viewer = React.createElement(this.props.viewer, question.get());
    return (
        <div className="well">
          <div className="row">
            <div className={'col-md-' + (question.scoregroup ? 9 : 6)}>
              {React.createElement(renderer, {question: question})}
            </div>
            <div className="col-md-3">
              {viewer}
            </div>
          </div>
          <div className="row">
            {this._renderSave(question)} {this._renderCancel(question)}
          </div>
        </div>
    );
  }

  _renderSave(question) {
    if (this.props.isChanged && this.props.isValid) {
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

  _renderCancel(question) {
    if (!this.state.isCancelling) {
      return (
        <button
                className="btn btn-default"
                onClick={this.props.isChanged ? this._confirmCancel : this._cancel}
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
    this.props.onSave(this.state.config._objectSpec);
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
