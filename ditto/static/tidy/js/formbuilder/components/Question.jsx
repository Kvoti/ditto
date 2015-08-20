import React from 'react';
import Text from './viewers/Text';
import Choice from './viewers/Choice';
import ScoreGroup from './viewers/ScoreGroup';
import Editor from './editors/Editor';

export default class Question extends React.Component {
  static propTypes = {
    isEditable: React.PropTypes.bool
  }

  render() {
    const { question, isEditable, ...subProps } = this.props;
    const { text, choice, scoregroup } = question;
    let viewer;
    let editor;
    if (isEditable) {
      editor = Editor;
    }
    if (text) {
      viewer = Text;
    } else if (choice) {
      viewer = Choice;
    } else if (scoregroup) {
      viewer = ScoreGroup;
    }
    if (editor) {
      return React.createElement(editor, {...subProps, question: question, viewer: viewer});
    }
    return React.createElement(viewer, this.props.question.get());
  }
}
