import React from 'react';
import Question from './Question';
import _ from 'lodash';  // TODO switch to ImmutableJS?

export default class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: 2,
      config: _.cloneDeep(this.props)
    };
  }
  
  render() {
    let editing = this.state.editing;
    return (
      <div>
        <h1>{this.state.config.title}</h1>
        {this.state.config.questions.map((q, i) => {
          return (
            <div key={q.id}>
            {this._renderQuestion(q, i, editing)}
            {this._renderEditButton(i)}
            </div>
          );
         })}
      </div>
    );
  }

  _renderQuestion(question, index, editingIndex) {
    return (
      <Question
              key={question.id}
              {...question}
              isEditable={editingIndex === index}
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
