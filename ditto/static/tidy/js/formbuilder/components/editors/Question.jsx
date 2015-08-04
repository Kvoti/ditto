import React from 'react';
import _ from 'lodash';  // TODO switch to ImmutableJS?

import Validate from '../../../lib/form/Validate';
import TextEditor from './Text';
import ChoiceEditor from './Choice';
import ScoreGroupEditor from './ScoreGroup';

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
        onChangeMaxChars: this._set.bind(this, 'text', 'maxChars'),
        onChangeMaxWords: this._set.bind(this, 'text', 'maxChars'),
        onToggleIsMultiline: this._set.bind(this, 'text', 'isMultiline')
      };
    } else if (this.state.config.choice) {
      editor = ChoiceEditor;
      editorProps = {
        ...this.state.config.choice,
        onAddOption: this._add.bind(this, 'choice', 'option'),
        onRemoveOption: this._remove.bind(this, 'choice', 'option'),
        onChangeOption: this._setOption, // TODO
        onChangeOptionValidation: this._updateOptionValidation,
        onToggleIsMultiple: this._toggleIsMultiple, // TODO this.toggle('isMultiple')
        onToggleHasOther: this._toggleHasOther,
        onChangeOtherText: this._set.bind(this, 'choice', 'otherText')
      };
    } else if (this.state.config.scoregroup) {
      editor = ScoreGroupEditor;
      editorProps = {
          ...this.state.config.scoregroup,
        // TODO *ton* of callbacks to go here
        // TODO *infer* these callbacks from schema!?
        onAddLabel: this._add.bind(this, 'scoregroup', 'labels'),
        onRemoveLabel: this._remove.bind(this, 'scoregroup', 'labels'),
        onChangeLabel: this._set.bind(this, 'scoregroup', 'labels'),
        onAddItem: this._add.bind(this, 'scoregroup', 'items'),
        onRemoveItem: this._remove.bind(this, 'scoregroup', 'items'),
        onChangeItem: this._set.bind(this, 'scoregroup', 'items.text')
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
                  onChange={this._updateQuestionValidation}
                  >
            <input
                    className="form-control"
                    autoFocus={true}
                    type="text"
                    value={this.state.config.question}
                    onChange={this._set.bind(this, 'question')}
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
                  onChange={this._set.bind(this, 'isRequired')}
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
    return (
      this.state.validation.options.every(v => v) &&
      this.state.validation.question
    );
  }

  _updateQuestionValidation = (isValid) => {
    this.setState(state => {
      let changes = {validation: {question: {$set: isValid}}};
      return React.addons.update(state, changes);
    });
  }

  // Handlers for Choice options
  // Feels wrong to put them here as the Choice component should surely
  // know how to manage the options state?
  // But letting Choice change this component's state feels wrong. Though
  // you could argue Choice is really just a private component so it's fine.
  // See this is where a base class would work well as Choice would inherit
  // the management of the common 'question' and 'isRequired' fields and add
  // its own management of the options. Not really sure how to do the equivalent
  // cleanly with composition as you have state in two places.
  // Going the Flux(redux) route really just means moving these functions to
  // a store(reducer), though it does bring the state back to one place and
  // possibly nullifies the argument for inheritance?
  _toggleIsMultiple = () => {
    const isMultiple = !this.state.config.choice.isMultiple;
    const changes = {config: {choice: {isMultiple: {$set: isMultiple}}}};
    this.setState(React.addons.update(this.state, changes));
  }

  _toggleHasOther = () => {
    const hasOther = !this.state.config.choice.hasOther;
    const changes = {config: {choice: {hasOther: {$set: hasOther}}}};
    this.setState(React.addons.update(this.state, changes));
  }
  
  _updateOptionValidation = (index, isValid) => {
    let changes = {validation: {options: {[index]: {$set: isValid}}}};
    this.setState(state => {
      return React.addons.update(state, changes);
    });
  }
  /* ---------------------------------------------------------------------- */

  // Generic state changing functions
  _set(...args) {
    let [path, e] = this._getChangePath(args);
    let value;
    if (e.target.type === 'checkbox' || e.target.type === 'radio') {
      value = e.target.checked;
    } else {
      value = e.target.value;
    }
    let secondLast = path[path.length - 2];
    if (secondLast.includes && secondLast.includes('.')) {
      // hack needing generalised here
      let [before, after] = secondLast.split('.');
      path[path.length - 2] = before;
      path.push(after);
    }
    const change = this._getChangeSpec(path, '$set', value);
    const newState = React.addons.update(this.state, change);
    this.setState(newState);
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
    const last = args.pop();
    return [args, last];
  }

  _getChangeSpec(path, operation, value) {
    const change = {config: {}};
    let tmp = change.config;
    path.forEach(key => {
      tmp[key] = {};
      tmp = tmp[key];
    });
    tmp[operation] = value;
    return change;
  }
}
