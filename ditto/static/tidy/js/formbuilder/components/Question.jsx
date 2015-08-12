import React from 'react';
import Text from './viewers/Text';
import Choice from './viewers/Choice';
import ScoreGroup from './viewers/ScoreGroup';
import Editor from './editors/Editor';
import * as schemas from './editors/schemas';

export default class Question extends React.Component {
  static propTypes = {
    isEditable: React.PropTypes.bool
  }

  render() {
    const { text, choice, scoregroup } = this.props;
    const { isEditable, ...subProps } = this.props;
    let viewer;
    let editor;
    let schema;
    if (this.props.isEditable) {
      editor = Editor;
      if (text) {
        schema = schemas.textQuestion;
      } else if (choice) {
        schema = schemas.choiceQuestion;
      } else if (scoregroup) {
        schema = schemas.scoreGroupQuestion;
      }
    }
    if (text) {
      viewer = Text;
    } else if (choice) {
      viewer = Choice;
    } else if (scoregroup) {
      viewer = ScoreGroup;
    }
    if (editor) {
      return React.createElement(editor, {...subProps, schema: schema, viewer: viewer});
    } else {
      return React.createElement(viewer, {...subProps, schema: schema, viewer: viewer});
    }
  }
}
