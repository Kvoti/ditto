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
    let formSpec = this.props.form;
    let questionRows = formSpec.managed.questions.members.map(([j, q], i) => {
     return (
        <div
                key={q.id.get()}
                draggable={true}
                orderingIndex={i}
                className="row"
                >
          <div className={editing === null ? 'well' : ''}>
            {this._renderQuestion(q, i, editing, this.props.isChanged, this.props.isValid)}
            {this._renderEditButton(i)} {this._renderRemoveButton(q)}
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
    let form = (
      <div>
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
    if (editing === null) {
      form = React.createElement(
        Editor,
        {
          editor: form,
          isValid: this.props.isValid,
          isChanged: this.props.isChanged,
          showCancelOnChange: true,
          onSave: this.props.onSave,
          onCancel: this.props.onCancelEdit
        }
      );
    }
    return (
      <div>
        <h1>{formSpec.managed.title.get()}</h1>
        {form}
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
