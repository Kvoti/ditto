import React from 'react';
import _ from 'lodash';  // TODO switch to ImmutableJS?

export default class Question extends React.Component {
  static defaultProps = {
    type: React.PropTypes.oneOf(['text', 'choice', 'scoregroup']),
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
    let { type, question, isRequired, ...editorProps } = this.props;
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
        {editor ? React.createElement(editor, this.editorProps) : null}
        {this._renderCancel()}
      </div>
    );
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
  
  _update(field, e) {
    let value = e.target.value;
    let change = {config: {[field]: {$set: value}}};
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
