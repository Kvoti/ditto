import React from 'react';
import _ from 'lodash';  // TODO switch to ImmutableJS?

import TextEditor from './Text';

export default class Question extends React.Component {
  static defaultProps = {
    question: '',
    isRequired: false
  }

  constructor(props) {
    super(props);
    this.state = {
      config: this._copyProps(),
      isCancelling: false
    };
  }

  _copyProps() {
    return _.cloneDeep(this.props);
  }

  render() {
    let editor;
    let editorProps;
    if (this.state.config.text) {
      editor = TextEditor;
      editorProps = {
        ...this.state.config.text,
        update: this._update.bind(this, 'text')
      };
    }
    return (
      <div style={{border: '1px solid black'}}>
        <div className="form-group">
          <label>
            Enter question text:
          </label>
          <input
                  className="form-control"
                  autoFocus={true}
                  type="text"
                  value={this.state.config.question}
                  onChange={this._update.bind(this, 'question')}
          />
        </div>
        <div className="form-group">
          <label>
            Is required?
          </label>
          <input
                  className="form-control"
                  type="checkbox"
                  value={this.state.config.isRequired}
                  onChange={this._update.bind(this, 'isRequired')}
          />
        </div>
        {editor ? React.createElement(editor, editorProps) : null}
        {this._renderSave()} {this._renderCancel()}
      </div>
    );
  }

  _renderSave() {
    if (this._isChanged()) { // TODO && isValid()!!
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
    this.props.onSave(this.state.config);
  }
  
  _renderCancel() {
    if (!this.state.isCancelling) {
      return (
        <button
                className="btn btn-default"
                onClick={this._cancelOrConfirm}
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
  
  _update() {
    let args = Array.from(arguments);
    let e = args.pop();
    let value;
    if (e.target.checked !== undefined) {
      value = e.target.checked;
    } else {
      value = e.target.value;
    }
    let change = {config: {}};
    let tmp = change.config;
    args.forEach(key => {
      tmp[key] = {};
      tmp = tmp[key];
    });
    tmp['$set'] = value;
    let newState = React.addons.update(this.state, change);
    this.setState(newState);
  }

  _cancelOrConfirm = () => {
    if (this._isChanged()) {
      let change = {isCancelling: {$set: true}};
      this.setState(
        React.addons.update(this.state, change)
      );
    } else {
      this._cancel();
    }
  }

  _isChanged() {
    return !_.isEqual(this.props, this.state.config);
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
