import React from 'react';
import _ from 'lodash';  // TODO switch to ImmutableJS?

import ValidatedControl from '../../../lib/form/ValidatedControl';
import TextEditor from './Text';
import ChoiceEditor from './Choice';
import ScoreGroupEditor from './ScoreGroup';
import * as state from '../../../lib/state';
import Row from './Row';

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
    }
    this.state.validation = this._initValidation();
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
        errors: this._optionErrors(),
        onAddOption: this._addOption,
        onRemoveOption: this._removeOption,
        onChangeOption: state.set.bind(this, ['config', 'choice', 'options']),
        onChangeOptionValidation: this._validateOption,
        onChangeIsMultiple: state.set.bind(this, ['config', 'choice', 'isMultiple']),
        onChangeHasOther: state.set.bind(this, ['config', 'choice', 'hasOther']),
        onChangeOtherText: state.set.bind(this, ['config', 'choice', 'otherText'])
      };
    } else if (this.state.config.scoregroup) {
      editor = ScoreGroupEditor;
      editorProps = {
            ...this.state.config.scoregroup,
        // TODO *infer* these callbacks from schema!?
        errors: this._scoreGroupErrors(),
        onAddLabel: this._addLabel,
        onRemoveLabel: this._removeLabel,
        onChangeLabel: state.set.bind(this, ['config', 'scoregroup', 'labels']),
        onAddItem: this._addItem,
        onRemoveItem: this._removeItem,
        onChangeItem: state.set.bind(this, ['config', 'scoregroup', 'items', state.Arg, 'text']),
        onChangeScore: state.set.bind(this, ['config', 'scoregroup', 'items', state.Arg, 'scores', state.Arg]),
        onChangeLabelValidation: this._validateLabel,
        onChangeItemValidation: this._validateItem,
        onChangeScoreValidation: this._validateScore
      };
    }
    let errors = this._questionErrors();
    return (
      <div style={{border: '1px solid black'}} className="form-horizontal">
        <Row errors={errors}>
          <label>Question text</label> 
          <ValidatedControl
                  validate={this._validateQuestion}
                  immediate={this.state.validation.question.validated || this.state.config.question}
                  >
            <input
                    autoFocus={true}
                    type="text"
                    value={this.state.config.question}
                    onChange={state.set.bind(this, ['config', 'question'])}
            />
          </ValidatedControl>
        </Row>
        <Row>
          <label>
            Is required?
          </label>
          <input
                  type="checkbox"
                  checked={this.state.config.isRequired}
                  onChange={state.set.bind(this, ['isRequired'])}
          />
        </Row>
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

  /* **********************************************************************
     // All the state changing and validation stuff here
     // Screaming to be refactored.
     //
     // In the limit could all be inferred from configuration like:
     //
     //     {
     //       question: {
     //         type: 'text',
     //         required: true,
     //         maxLength: 100,
     //       },
     //       isRequired: {
     //         type: boolean
     //       },
     //       options: {
     //         type: 'list',
     //         maxLength: 10,
     //         unique: true,
     //         item: {
     //           type: 'text',
     //           required: true
     //         }
     //       }
     //     }
   ********************************************************************** */
  _initValidation() {
    const validation = {
      question: {
        validated: this.props.question,
        required: false
      }
    };
    if (this.props.choice) {
      validation.options = this.props.choice.options.map(o => {
        return {
          validated: o,
          required: false,
          duplicated: false
        };
      });
    }
    if (this.props.scoregroup) {
      validation.labels = this.props.scoregroup.labels.map(o => {
        return {
          validated: o,
          required: false,
          duplicated: false
        };
      });
      validation.items = this.props.scoregroup.items.map(o => {
        return {
          validated: o,
          required: false,
          duplicated: false
        };
      });
      this.props.scoregroup.items.forEach((item, i) => {
        validation[`scores${i}`] = [];
        item.scores.forEach(score => {
          validation[`scores${i}`].push({
            validated: score === 0 || score,
            required: false,
            duplicated: false
          });
        });
      });
    }
    return validation;
  }

  _validateQuestion = () => {
    this.setState(state => {
      console.log(state.config.question);
      let change;
      if (!state.config.question) {
        change = {validation: {question: {
          required: {$set: true},
          validated: {$set: true}
        }}};
      } else {
        change = {validation: {question: {
          required: {$set: false},
          validated: {$set: true}
        }}};
      }
      return React.addons.update(state, change);
    });
  }

  _validateOption = (index) => {
    this._validateCollectionItem('choice', 'options', index);
  }
  
  _validateLabel = (index) => {
    this._validateCollectionItem('scoregroup', 'labels', index);
  }

  _validateItem = (index) => {
    this._validateCollectionItem('scoregroup', 'items', index, item => item.text);
  }

  _validateScore = (itemIndex, scoreIndex) => {
    console.log('validating score', itemIndex, scoreIndex);
    let validationKey = `scores${itemIndex}`;
    this.__validateScore('scoregroup', 'items', itemIndex, scoreIndex);
  }

  __validateScore = (item, collection, index, subIndex) => {
    console.log('updating validation', ...arguments);
    this.setState(state => {
      let change;
      let member = state.config[item][collection][index]['scores'][subIndex];
      if (member === undefined || member === null || member === '') {
        change = {validation: {[`scores${index}`]: {[subIndex]: {
          required: {$set: true},
          validated: {$set: true}
        }}}};
      } else {
        change = {validation: {[`scores${index}`]: {[subIndex]: {
          required: {$set: false},
          validated: {$set: true}
        }}}};
      }
      let seen = {};
      state.config[item][collection][index]['scores'].forEach((o, i) => {
        let validationKey = `scores${index}`;
        console.log('comparing', o, seen);
        if (!change.validation[validationKey][i]) {
          change.validation[validationKey][i] = {};
        }
        if (seen.hasOwnProperty(o)) {
          console.log('duped');
          change.validation[validationKey][i].duplicated = {$set: true};
        } else {
          change.validation[validationKey][i].duplicated = {$set: false};
        }
        seen[o] = 1;
      });
      console.log('updating validation', change);
      return React.addons.update(state, change);
    });
  }
  
  _validateCollectionItem = (item, collection, index, getter, validationKey) => {
    console.log('updating validation', ...arguments);
    this.setState(state => {
      if (validationKey === undefined) {
        validationKey = collection;
      }
      let change;
      let member = state.config[item][collection][index];
      console.log('member', item, collection, index, member);
      if (getter) {
        member = getter(member);
      }
      console.log('member', item, collection, index, member);
      if (member === undefined || member === null || member === '') {
        change = {validation: {[validationKey]: {[index]: {
          required: {$set: true},
          validated: {$set: true}
        }}}};
      } else {
        change = {validation: {[validationKey]: {[index]: {
          required: {$set: false},
          validated: {$set: true}
        }}}};
      }
      let seen = {};
      state.config[item][collection].forEach((o, i) => {
        if (getter) {
          o = getter(o);
        }
        console.log('comparing', o, seen);
        if (!change.validation[validationKey][i]) {
          change.validation[validationKey][i] = {};
        }
        if (seen.hasOwnProperty(o)) {
          console.log('duped');
          change.validation[validationKey][i].duplicated = {$set: true};
        } else {
          change.validation[validationKey][i].duplicated = {$set: false};
        }
        seen[o] = 1;
      });
      console.log('updating validation', change);
      return React.addons.update(state, change);
    });
  }

  _questionErrors() {
    let errors = [];
    if (this.state.validation.question.validated) {
      if (this.state.validation.question.required) {
        errors = ['This field is required'];
      }
    } else {
      errors = null;
    }
    return errors;
  }

  _optionErrors() {
    return this._collectionErrors('choice', 'options');
  }
  
  _scoreGroupErrors() {
    let errors = {
      labels: this._collectionErrors('labels'),
      items: this._collectionErrors('items')
    };
    this.state.config.scoregroup.labels.map((l, i) => {
      errors[`scores${i}`] = this._collectionErrors(`scores${i}`);
    });
    return errors;
  }
  
  _collectionErrors(collection) {
    console.log('collectionErrors', ...arguments);
    return this.state.validation[collection].map((o, index) => {
      let errors = this.state.validation[collection][index].validated ? [] : null;
      if (this.state.validation[collection][index].required) {
        errors.push('This field is required');
      }
      if (this.state.validation[collection][index].duplicated) {
        errors.push('Cannot have duplicates');
      }
      return errors;
    });
  }

  _isValid() {
    console.log(this.state.validation);
    return (
      this.state.validation.question.validated && !this.state.validation.question.required &&
      (this.state.validation.options && this.state.validation.options.every(o => o.validated && !(o.required || o.duplicated))) ||
      (this.state.validation.labels && this.state.validation.labels.every(o => o.validated && !(o.required || o.duplicated))) &&
      (this.state.validation.items && this.state.validation.items.every(o => o.validated && !(o.required || o.duplicated)))
    );
  }

  _addOption = () => {
    this._add('choice', 'options', '');
  }

  _removeOption = (index) => {
    this._remove('choice', 'options', index);
  }

  _addLabel = () => {
    this._add('scoregroup', 'labels', '');
  }

  _removeLabel = (index) => {
    this._remove('scoregroup', 'labels', index);
  }

  _addItem = () => {
    this._add('scoregroup', 'items', {
      text: '',
      scores: this.state.scoregroup.labels.map((l, i) => i)
    });
  }

  _removeItem = (index) => {
    this._remove('scoregroup', 'items', index);
  }
  
  _add = (item, collection, member) => {
    let change = {
      config: {[item]: {[collection]: {$push: [member]}}},
      validation: {[collection]: {$push: [{
        validated: false,
        required: false,
        duplicated: false
      }]}}
    };
    this.setState(state => React.addons.update(state, change));
  }

  _remove = (item, collection, index) => {
    let change = {
      config: {[item]: {[collection]: {$splice: [[index, 1]]}}},
      validation: {[collection]: {$splice: [[index, 1]]}}
    };
    this.setState(state => React.addons.update(state, change));
  }

}
