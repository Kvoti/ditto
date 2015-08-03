import React from 'react';
import Question from './Question';

export default class Form extends React.Component {
  state = {
    editing: null
  }
  
  render() {
    console.log(this.props);
    let editing = this.state.editing;
    console.log('editing', editing);
    return (
      <div>
        <h1>{this.props.title}</h1>
        {this.props.questions.map((q, i) => {
          return (
            <div>
            {this._renderQuestion(q, i, editing)}
            {this._renderEditButton(i, editing)}
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
              isEditable={editingIndex === index}
              {...question}
              onCancel={this._cancelEdit}
      />
    );
  }

  _renderEditButton(index, editingIndex) {
    if (editingIndex === null && editingIndex !== index) {
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
  
  _cancelEdit = () => {
    this.setState({editing: null});
  }
}
