import React from 'react';
import Question from './Question';
import { ManagedObject } from '../../lib/schema/schema';
import * as schemas from './editors/schemas.js';

export default class Form extends React.Component {
  constructor(props) {
    super(props);
    let formSpec = new ManagedObject(schemas.form);
    props.questions.forEach(q => formSpec.managed.questions.add(
      ...this._getQuestionDataAndManager(q)
    ));
    formSpec.managed.title.set(this.props.title);
    formSpec.managed.slug.set(this.props.slug);
    this.state = {
      origFormSpec: formSpec.get(),
      editing: 0,
      config: formSpec.toState()
    };
  }

  _getQuestionDataAndManager(question) {
    const { text, choice, scoregroup } = question;
    let schema;
    if (text) {
      schema = schemas.textQuestion;
    }
    if (choice) {
      schema = schemas.choiceQuestion;
    }
    if (scoregroup) {
      schema = schemas.scoreGroupQuestion;
    }
    // TODO this is a quirk of the API. Each question should just have a type
    // and not these null valued fields
    ['text', 'choice', 'scoregroup'].forEach(p => {
      if (question[p] === null) {
        delete question[p];
      }
    });
    //////////////////////////////////////////////////////////////////////
    return [question, schema];
  }
  
  render() {
    let editing = this.state.editing;
    // TODO not sure about this fromState/toState stuff
    let form = new ManagedObject(schemas.form);
    this.state.config.managedObject.questions.forEach(q => form.managed.questions.add(
      ...this._getQuestionDataAndManager(q)
    ));
    form.managed.title.set(this.state.config.managedObject.title);
    form.managed.slug.set(this.state.config.managedObject.slug);
    form._onChange = newState => this.setState({config: newState});
    //////////////////////////////////////////////////////////////////////
    let isChanged = form.isChanged(this.state.origFormSpec);
    let isValid = form.isValid();
    return (
      <div>
        <h1>{form.managed.title.get()}</h1>
        {form.managed.questions.members.map(([key, q], i) => {
          return (
            <div key={q.id.get()} className="row">
            <div className={editing === null ? 'col-md-6' : 'col-md-12'}>
            <div className={editing === null ? 'well' : ''}>
            {this._renderQuestion(q, i, editing, isChanged, isValid)}
            {this._renderEditButton(i)}
            </div>
            </div>
            </div>
          );
         })}
      </div>
    );
  }
  
  _renderQuestion(question, index, editingIndex, isChanged, isValid) {
    return (
      <Question
              key={question.id.get()}
              question={question}
              isEditable={editingIndex === index}
              isChanged={isChanged}
              isValid={isValid}
              onSave={this._saveQuestion}
              onCancel={this._cancelEdit}
      />
    );
  }

  _renderEditButton(index) {
    if (this.state.editing === null) {
      return (
        <button
                className="btn btn-default"
                onClick={this._editQuestion.bind(this, index)}
                >
          Edit
        </button>
      );
    }
    return null;
  }
  
  _editQuestion(index) {
    this.setState({editing: index});
  }

  _saveQuestion = (newConfig) => {
    var change = {
      config: {questions: {[this.state.editing]: {$set: newConfig}}},
      editing: {$set: null}
    };
    this.setState(React.addons.update(this.state, change));
  }
  
  _cancelEdit = () => {
    this.setState({editing: null});
  }
}
