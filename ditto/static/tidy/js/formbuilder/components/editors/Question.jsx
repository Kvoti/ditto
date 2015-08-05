import React from 'react';
import _ from 'lodash';  // TODO switch to ImmutableJS?

import Validate from '../../../lib/form/Validate';
import TextEditor from './Text';
import ChoiceEditor from './Choice';
import ScoreGroupEditor from './ScoreGroup';

const arg = '__arg__';

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
        onChangeMaxChars: this._set.bind(this, ['config', 'text', 'maxChars']),
        onChangeMaxWords: this._set.bind(this, ['config', 'text', 'maxWords']),
        onChangeIsMultiline: this._set.bind(this, ['config', 'text', 'isMultiline'])
      };
    } else if (this.state.config.choice) {
      editor = ChoiceEditor;
      editorProps = {
        ...this.state.config.choice,
        onAddOption: this._add.bind(this, ['config', 'choice', 'options']),
        onRemoveOption: this._remove.bind(this, ['config', 'choice', 'options']),
        onChangeOption: this._set.bind(this, ['config', 'choice', 'options']),
        onChangeOptionValidation: this._set.bind(this, ['validation', 'options']),
        onChangeIsMultiple: this._set.bind(this, ['config', 'choice', 'isMultiple']),
        onChangeHasOther: this._set.bind(this, ['config', 'choice', 'hasOther']),
        onChangeOtherText: this._set.bind(this, ['config', 'choice', 'otherText'])
      };
    } else if (this.state.config.scoregroup) {
      editor = ScoreGroupEditor;
      editorProps = {
          ...this.state.config.scoregroup,
        // TODO *ton* of callbacks to go here
        // TODO *infer* these callbacks from schema!?
        onAddLabel: this._add.bind(this, ['config', 'scoregroup', 'labels']),
        onRemoveLabel: this._remove.bind(this, ['config', 'scoregroup', 'labels']),
        onChangeLabel: this._set.bind(this, ['config', 'scoregroup', 'labels']),
        onAddItem: this._add.bind(this, ['config', 'scoregroup', 'items']),
        onRemoveItem: this._remove.bind(this, ['config', 'scoregroup', 'items']),
        onChangeItem: this._set.bind(this, ['config', 'scoregroup', 'items', arg, 'text']),
        onChangeScore: this._set.bind(this, ['config', 'scoregroup', 'items', arg, 'scores'])
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
                  onChange={this._set.bind(this, ['validation', 'question'])}
                  >
            <input
                    className="form-control"
                    autoFocus={true}
                    type="text"
                    value={this.state.config.question}
                    onChange={this._set.bind(this, ['config', 'question'])}
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
                  onChange={this._set.bind(this, ['isRequired'])}
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
      this.state.validation.options.every(v => v) &&
      this.state.validation.question
    );
  }

  // Generic state changing functions
  // Really these are linkState on steroids, allowing to update nested state on changes
  // Probably belong in library code as generic
  _set(...args) {
    let [path, e] = this._getChangePath(args);
    let value;
    if (!e.target) {
      value = e;
    } else if (e.target.type === 'checkbox' || e.target.type === 'radio') {
      value = e.target.checked;
    } else {
      value = e.target.value;
    }
    const change = this._getChangeSpec(path, '$set', value);
    console.log('change', change);
    this.setState((state) => {
      return React.addons.update(state, change);
    });
  }

  _add = (...args) => {
    let [path, value] = this._getChangePath(args);
    const change = this._getChangeSpec(path, '$push', [value]);
    const newState = React.addons.update(this.state, change);
    this.setState(newState);
  }

  _remove = (...args) => {
    let [path, index] = this._getChangePath(args);
    const change = this._getChangeSpec(path, '$splice', [[index, 1]]);
    const newState = React.addons.update(this.state, change);
    this.setState(newState);
  }

  // TODO toggle

  _getChangePath(args) {
    console.log('path', args);
    let path = args[0];
    const last = args.pop();
    const params = args.slice(1);
    console.log(path, params, last);
    path = this._replaceParamsInPath(path, params);
    return [path, last];
  }

  _replaceParamsInPath(path, params) {
    console.log('replacing', path, params);
    let replaced = path.map(part => {
      if (part === arg) {
        let replacement = params[0];
        params = params.slice(1);
        return replacement;
      }
      return part;
    });
    console.log('replaced', replaced, 'remaining', params);
    return replaced.concat(params);
  }
  
  _getChangeSpec(path, operation, value) {
    const change = {};
    let tmp = change;
    path.forEach(key => {
      tmp[key] = {};
      tmp = tmp[key];
    });
    tmp[operation] = value;
    console.log('change', change);
    return change;
  }
}
