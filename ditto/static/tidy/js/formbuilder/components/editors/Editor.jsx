// Generic component to wrap any edit component
//
// Handles save/confirm/cancel operations
//
import React, { PropTypes } from 'react';

export default class Editor extends React.Component {
  static propTypes = {
    editor: PropTypes.node.isRequired,
    viewer: PropTypes.node.isRequired,
    isValid: PropTypes.bool,
    isChanged: PropTypes.bool,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    showCancelOnChange: PropTypes.bool
  }

  state = {
      isCancelling: false
  };

  render() {
    let { viewer, editor } = this.props;
    return (
        <div className="well">
          <div className="row">
            {this._renderSave()} {this._renderCancel()}
          </div>
          <div className="row">
            <div className={'col-md-' + (viewer ? 9 : 6)}>
              {editor}
            </div>
            <div className="col-md-3">
              {viewer}
            </div>
          </div>
          <div className="row">
            {this._renderSave()} {this._renderCancel()}
          </div>
        </div>
    );
  }

  _renderSave() {
    if (this.state.isCancelling) {
      return null;
    }
    if (this.props.isChanged && this.props.isValid) {
      return (
        <button
                className="btn btn-success"
                onClick={this.props.onSave}
                >
          Save
        </button>
      );
    }
    return null;
  }

  _renderCancel() {
    if (this.props.showCancelOnChange && !this.props.isChanged) {
      return null;
    }
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
