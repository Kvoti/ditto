import React from 'react';

export default class Editor extends React.Component {
  state = {
      isCancelling: false
  };

  render() {
    let { question, viewer, editor } = this.props;
    return (
        <div className="well">
          <div className="row">
            <div className={'col-md-' + (question.scoregroup ? 9 : 6)}>
              {editor}
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

  _renderSave() {
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

  _renderCancel() {
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
