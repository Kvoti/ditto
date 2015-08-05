import React from 'react';
import _ from 'lodash';  // TODO switch to ImmutableJS?

import Validate from '../../../lib/form/Validate';
import TextEditor from './Text';
import ChoiceEditor from './Choice';
import ScoreGroupEditor from './ScoreGroup';
import * as state from '../../../lib/state';

export default class Question extends React.Component {
  static defaultProps = {
    question: '',
    isRequired: false
  }

  constructor(props) {
    super(props);
    this.state = {
      config: this._copyProps(),
      validation: {
        question: null,
        options: []
      },
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
        onChangeMaxChars: state.set.bind(this, ['config', 'text', 'maxChars']),
        onChangeMaxWords: state.set.bind(this, ['config', 'text', 'maxWords']),
        onChangeIsMultiline: state.set.bind(this, ['config', 'text', 'isMultiline'])
      };
    } else if (this.state.config.choice) {
      editor = ChoiceEditor;
      editorProps = {
        ...this.state.config.choice,
        onAddOption: state.add.bind(this, ['config', 'choice', 'options']),
        onRemoveOption: state.remove.bind(this, ['config', 'choice', 'options']),
        onChangeOption: state.set.bind(this, ['config', 'choice', 'options']),
        onChangeOptionValidation: state.set.bind(this, ['validation', 'options']),
        onChangeIsMultiple: state.set.bind(this, ['config', 'choice', 'isMultiple']),
        onChangeHasOther: state.set.bind(this, ['config', 'choice', 'hasOther']),
        onChangeOtherText: state.set.bind(this, ['config', 'choice', 'otherText'])
      };
    } else if (this.state.config.scoregroup) {
      editor = ScoreGroupEditor;
      editorProps = {
          ...this.state.config.scoregroup,
        // TODO *infer* these callbacks from schema!?
        onAddLabel: state.add.bind(this, ['config', 'scoregroup', 'labels']),
        onRemoveLabel: state.remove.bind(this, ['config', 'scoregroup', 'labels']),
        onChangeLabel: state.set.bind(this, ['config', 'scoregroup', 'labels']),
        onAddItem: state.add.bind(this, ['config', 'scoregroup', 'items']),
        onRemoveItem: state.remove.bind(this, ['config', 'scoregroup', 'items']),
        onChangeItem: state.set.bind(this, ['config', 'scoregroup', 'items', state.Arg, 'text']),
        onChangeScore: state.set.bind(this, ['config', 'scoregroup', 'items', state.Arg, 'scores'])
      };
    }
    return (
      <div style={{border: '1px solid black'}}>
        <div className="form-group">
          <label>
            Enter question text:
          </label>
          <Validate
                  isRequired={true}
                  onChange={state.set.bind(this, ['validation', 'question'])}
                  >
            <input
                    className="form-control"
                    autoFocus={true}
                    type="text"
                    value={this.state.config.question}
                    onChange={state.set.bind(this, ['config', 'question'])}
            />
          </Validate>
        </div>
        <div className="form-group">
          <label>
            Is required?
          </label>
          <input
                  className="form-control"
                  type="checkbox"
                  checked={this.state.config.isRequired}
                  onChange={state.set.bind(this, ['isRequired'])}
          />
        </div>
        {editor ? React.createElement(editor, editorProps) : null}
        {this._renderSave()} {this._renderCancel()}
      </div>
    );
  }

  _renderSave() {
    if (this._isChanged() && this._isValid()) {
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

  _isValid() {
    console.log(this.state.validation);
    return (
      this.state.validation.question &&
      this.state.validation.options.every(o => o)
    );
  }
}
