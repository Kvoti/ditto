import React from 'react';

import Renderer from './editors/renderer/Renderer';
import ScoreGroup from './editors/scoregroup/ScoreGroup';
import Text from './viewers/Text';
import Choice from './viewers/Choice';
import ScoreGroupViewer from './viewers/ScoreGroup';
import Editor from './editors/Editor';

export default class Form extends React.Component {
  state = {
    editing: 0
  };

  render() {
    let editing = this.state.editing;
    let form = this.props.form;
    return (
      <div>
        <h1>{form.managed.title.get()}</h1>
        {form.managed.questions.members.map(([j, q], i) => {
          return (
            <div key={q.id.get()} className="row">
            <div className={editing === null ? 'col-md-6' : 'col-md-12'}>
            <div className={editing === null ? 'well' : ''}>
            {this._renderQuestion(q, i, editing, form.isChanged(), form.isValid())}
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
    let viewer = React.createElement(this._getViewComponent(question), question.get());
    if (editingIndex === index) {
      let editor = React.createElement(this._getEditComponent(question), { question });
      return React.createElement(
        Editor,
        {
          key: question.id.get(),
          question,
          viewer,
          editor,
          isChanged,
          isValid,
          onCancel: this._cancelEdit
        }
      );
    }
    return viewer;
  }

  _getViewComponent(question) {
    const { text, choice, scoregroup } = question;
    let viewer;
    if (text) {
      viewer = Text;
    } else if (choice) {
      viewer = Choice;
    } else if (scoregroup) {
      viewer = ScoreGroupViewer;
    }
    return viewer;
  }

  _getEditComponent(question) {
    if (question.scoregroup) {
      return ScoreGroup;
    } 
    return Renderer;
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

  _cancelEdit = () => {
    this.setState({editing: null});
  }
}
