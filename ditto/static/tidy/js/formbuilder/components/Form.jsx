import React from 'react';
import Sortable from 'react-components/Sortable';

import Renderer from './editors/renderer/Renderer';
import ScoreGroup from './editors/scoregroup/ScoreGroup';
import Text from './viewers/Text';
import Choice from './viewers/Choice';
import ScoreGroupViewer from './viewers/ScoreGroup';
import Editor from './editors/Editor';

export default class Form extends React.Component {
  state = {
    editing: null
  };

  render() {
    let editing = this.state.editing;
    let form = this.props.form;
    let questionRows = form.managed.questions.members.map(([j, q], i) => {
      return (
        <div
                key={q.id.get()}
                draggable={true}
                orderingIndex={i}
                className="row"
                >
          <div className={editing === null ? 'col-md-6' : 'col-md-12'}>
            <div className={editing === null ? 'well' : ''}>
              {this._renderQuestion(q, i, editing, this.props.isChanged, this.props.isValid)}
              {this._renderEditButton(i)} {this._renderRemoveButton(q)}
            </div>
          </div>
        </div>
      );
    });
    if (editing === null) {
      questionRows = (
        <Sortable
                components={questionRows}
                onReorder={this.props.onReorder}
        />
      );
    }
    return (
      <div>
        <h1>{form.managed.title.get()}</h1>
        {editing === null ?
        <div className="form-group">
        </div>
        : null }
        {questionRows}
         <select
                 className="form-control"
                 onChange={this._add}
                 >
           <option value="">-- Select new question --</option>
           <option value="text">Text</option>
           <option value="choice">Choice</option>
           <option value="scoregroup">Score group</option>
         </select>
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
          onCancel: this._cancelEdit,
          onSave: this._save
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

  _renderRemoveButton(question) {
    if (this.state.editing === null) {
      return (
        <button
                className="btn btn-danger"
                onClick={question.remove}
                >
          Remove
        </button>
      );
    }
    return null;
  }

  _add = (e) => {
    this.props.onAddQuestion(e);
    this.setState({editing: this.props.form.managed.questions.members.length - 1});
  }

  _editQuestion(index) {
    this.setState({editing: index});
  }

  _save = () => {
    this.setState({editing: null});
    this.props.onSave();
  }

  _cancelEdit = () => {
    this.setState({editing: null});
    this.props.onCancelEdit();
  }
}
